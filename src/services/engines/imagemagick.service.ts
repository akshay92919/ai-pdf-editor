import { exec } from "child_process";
import fs from "fs/promises";
import util from "util";
import { StorageService } from "../storage.service";

const execPromise = util.promisify(exec);

export class ImagemagickService {
  static async checkSystemDependency(): Promise<boolean> {
    try {
      await execPromise(`which convert`); // Depending on IM version, could be `magick`
      return true;
    } catch {
      return false;
    }
  }

  /**
   * JPG/PNG to PDF using ImageMagick
   */
  static async imagesToPdf(fileBuffers: ArrayBuffer[], originalNames: string[]): Promise<Uint8Array> {
    const hasIm = await this.checkSystemDependency();
    if (!hasIm) throw new Error("ImageMagick (convert) is not installed on this system.");

    const tempPaths: string[] = [];
    
    // Save all uploaded image files
    for (let i = 0; i < fileBuffers.length; i++) {
      const ext = originalNames[i].includes(".png") ? ".png" : ".jpg";
      const fakeFile = new File([fileBuffers[i]], `input_${i}${ext}`);
      const saved = await StorageService.saveUploadedFile(fakeFile);
      tempPaths.push(saved);
    }

    const tmpOut = `/tmp/output/im_output_${Date.now()}.pdf`;

    try {
      // Execute ImageMagick convert. E.g. `convert input1.jpg input2.png output.pdf`
      const inputs = tempPaths.map(p => `"${p}"`).join(" ");
      await execPromise(`convert ${inputs} "${tmpOut}"`);
      const resultBuffer = await fs.readFile(tmpOut);
      return new Uint8Array(resultBuffer);
    } catch (error) {
      console.error("ImageMagick conversion failed:", error);
      throw new Error("Failed to process images into PDF using ImageMagick.");
    } finally {
      // Cleanup
      for (const p of tempPaths) fs.unlink(p).catch(() => {});
      fs.unlink(tmpOut).catch(() => {});
    }
  }
}
