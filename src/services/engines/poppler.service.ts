import { exec } from "child_process";
import fs from "fs/promises";
import util from "util";
import { StorageService } from "../storage.service";

const execPromise = util.promisify(exec);

export class PopplerService {
  static async checkSystemDependency(): Promise<boolean> {
    try {
      await execPromise(`which pdftoppm`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert PDF to JPG (extracts 1st page or all pages stitched into zip ideally, for now 1st page array)
   */
  static async pdfToFormat(fileBuffer: ArrayBuffer, format: "jpeg" | "png"): Promise<Uint8Array> {
    const hasPoppler = await this.checkSystemDependency();
    if (!hasPoppler) throw new Error("Poppler (pdftoppm) is not installed on this system.");

    const tmpPdf = await StorageService.saveUploadedFile(new File([fileBuffer], "temp_poppler.pdf"));
    const prefix = `/tmp/output/poppler_out_${Date.now()}`;
    
    // pdftoppm outputs files like prefix-1.jpg
    const suffix = format === "jpeg" ? "jpg" : "png";

    try {
      // Run Poppler
      // -jpeg or -png flag, -f 1 -l 1 means first page to last page 1
      await execPromise(`pdftoppm -${format} -f 1 -l 1 "${tmpPdf}" "${prefix}"`);
      
      const expectedOutputFile = `${prefix}-1.${suffix}`;
      // Read output
      const resultBuffer = await fs.readFile(expectedOutputFile);
      
      fs.unlink(expectedOutputFile).catch(() => {});
      return new Uint8Array(resultBuffer);
    } catch (error) {
      console.error(`Poppler PDF to ${format} failed:`, error);
      throw new Error(`Failed to convert PDF to ${format}.`);
    } finally {
      fs.unlink(tmpPdf).catch(() => {});
    }
  }
}
