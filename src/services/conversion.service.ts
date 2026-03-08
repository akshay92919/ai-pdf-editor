import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import util from "util";
import { StorageService } from "./storage.service";

const execPromise = util.promisify(exec);

export class ConversionService {
  /**
   * Validates if a specific system dependency is installed via CLI.
   */
  static async checkSystemDependency(command: string): Promise<boolean> {
    try {
      await execPromise(`which ${command}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * PDF to JPG using Ghostscript (gs)
   * Converts the first page to a JPG
   */
  static async pdfToJpg(fileBuffer: ArrayBuffer): Promise<Uint8Array> {
    const hasGs = await this.checkSystemDependency('gs');
    if (!hasGs) {
       console.warn("Ghostscript not found. Returning mocked generic image buffer.");
       // Generic fake placeholder fallback if GS isn't installed locally
       return new Uint8Array([255, 216, 255, 224, 0, 16, 74, 70, 73, 70]); 
    }

    const tmpPdf = await StorageService.saveUploadedFile(new File([fileBuffer], "temp_convert.pdf"));
    const tmpOut = tmpPdf.replace(".pdf", "-out.jpg");

    try {
      // Run Ghostscript
      await execPromise(`gs -sDEVICE=jpeg -dJPEGQ=100 -dNOPAUSE -dBATCH -dSAFER -dFirstPage=1 -dLastPage=1 -sOutputFile="${tmpOut}" "${tmpPdf}"`);
      const resultBuffer = await fs.readFile(tmpOut);
      return new Uint8Array(resultBuffer);
    } catch (error) {
      console.error("Ghostscript conversion failed:", error);
      throw error;
    } finally {
      // Async clean
      fs.unlink(tmpPdf).catch(() => {});
      fs.unlink(tmpOut).catch(() => {});
    }
  }

  /**
   * Compress PDF using Ghostscript (gs)
   */
  static async compressPdfUsingGS(fileBuffer: ArrayBuffer): Promise<Uint8Array> {
    const hasGs = await this.checkSystemDependency('gs');
    if (!hasGs) {
      console.warn("Ghostscript not found. Returning original buffer.");
      return new Uint8Array(fileBuffer); 
    }

    const tmpPdf = await StorageService.saveUploadedFile(new File([fileBuffer], "temp_compress.pdf"));
    const tmpOut = tmpPdf.replace(".pdf", "-compressed.pdf");

    try {
      // Run Ghostscript screen optimization
      await execPromise(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${tmpOut}" "${tmpPdf}"`);
      const resultBuffer = await fs.readFile(tmpOut);
      return new Uint8Array(resultBuffer);
    } catch (error) {
      console.error("Ghostscript compression failed:", error);
      throw error;
    } finally {
      fs.unlink(tmpPdf).catch(() => {});
      fs.unlink(tmpOut).catch(() => {});
    }
  }
}
