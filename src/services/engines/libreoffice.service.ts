import { exec } from "child_process";
import fs from "fs/promises";
import util from "util";
import { StorageService } from "../storage.service";
import path from "path";

const execPromise = util.promisify(exec);

export class LibreOfficeService {
  static async checkSystemDependency(): Promise<boolean> {
    try {
      await execPromise(`soffice --version`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert Word/Excel/PPT to PDF using LibreOffice Headless
   */
  static async documentToPdf(fileBuffer: ArrayBuffer, originalExt: string): Promise<Uint8Array> {
    const hasSoffice = await this.checkSystemDependency();
    if (!hasSoffice) throw new Error("LibreOffice (soffice) is not installed or not in PATH.");

    const safeExt = originalExt.startsWith(".") ? originalExt : `.${originalExt}`;
    const tmpInput = await StorageService.saveUploadedFile(new File([fileBuffer], `input_file${safeExt}`));
    const outDir = "/tmp/output";
    
    // soffice strips extension and replaces with .pdf in outdir
    const baseName = path.basename(tmpInput, safeExt);
    const expectedOutput = path.join(outDir, `${baseName}.pdf`);

    try {
      // Execute LibreOffice headless conversion
      await execPromise(`soffice --headless --convert-to pdf --outdir "${outDir}" "${tmpInput}"`);
      
      const resultBuffer = await fs.readFile(expectedOutput);
      return new Uint8Array(resultBuffer);
    } catch (error) {
      console.error("LibreOffice conversion failed:", error);
      throw new Error(`Failed to convert ${originalExt} to PDF using LibreOffice.`);
    } finally {
      // Cleanup
      fs.unlink(tmpInput).catch(() => {});
      fs.unlink(expectedOutput).catch(() => {});
    }
  }
}
