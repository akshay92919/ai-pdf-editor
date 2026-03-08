import { exec } from "child_process";
import fs from "fs/promises";
import util from "util";
import { StorageService } from "../storage.service";
import path from "path";

const execPromise = util.promisify(exec);

export class TesseractService {
  /**
   * Run OCR on a PDF by first converting it to an image (via pdftoppm or gs) and then extracting.
   * Modern Tesseract CLI can sometimes read PDFs, but extracting to image first is safer.
   * `tesseract image.png output -l eng pdf`
   */
  static async ocrPdf(fileBuffer: ArrayBuffer): Promise<Uint8Array> {
    try {
      await execPromise(`which tesseract`);
    } catch {
      throw new Error("Tesseract OCR is not installed on this system.");
    }

    const tmpPdf = await StorageService.saveUploadedFile(new File([fileBuffer], "temp_ocr.pdf"));
    const imgPrefix = `/tmp/output/ocr_img_${Date.now()}`;
    const txtOutPrefix = `/tmp/output/ocr_out_${Date.now()}`;
    
    try {
      // 1. Convert first page of PDF to image using Ghostscript (more universal than Poppler)
      await execPromise(`gs -sDEVICE=png16m -dFirstPage=1 -dLastPage=1 -r300 -o "${imgPrefix}.png" "${tmpPdf}"`);
      
      // 2. Run Tesseract to generate a searchable PDF overlay or text
      // We'll generate a searchable PDF output (tesseract appends .pdf automatically)
      await execPromise(`tesseract "${imgPrefix}.png" "${txtOutPrefix}" -l eng pdf`);
      
      const finalPdfPath = `${txtOutPrefix}.pdf`;
      const resultBuffer = await fs.readFile(finalPdfPath);
      
      // Cleanup
      fs.unlink(finalPdfPath).catch(() => {});
      fs.unlink(`${imgPrefix}.png`).catch(() => {});
      fs.unlink(tmpPdf).catch(() => {});
      
      return new Uint8Array(resultBuffer);
    } catch (error) {
      console.error("OCR computation failed:", error);
      throw new Error("Failed to process OCR via Tesseract. Make sure Ghostscript and Tesseract are installed.");
    }
  }
}
