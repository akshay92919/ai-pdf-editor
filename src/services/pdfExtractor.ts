import { PDFParse } from 'pdf-parse';

export class PDFExtractor {
  
  /**
   * Extracts clean text from a PDF Buffer
   */
  static async extractTextFromPDF(fileBuffer: ArrayBuffer | Buffer): Promise<string> {
    try {
      const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      await parser.destroy();
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error("No readable text found in PDF. It might be a scanned image without OCR.");
      }
      
      return data.text.trim();
    } catch (error: any) {
      console.error("Error extracting text from PDF:", error);
      throw new Error(error.message || "Could not parse text from the uploaded PDF document.");
    }
  }
}
