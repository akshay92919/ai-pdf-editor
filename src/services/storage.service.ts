import fs from "fs/promises";
import path from "path";
import os from "os";

export class StorageService {
  private static UPLOADS_DIR = "/tmp/uploads";
  private static OUTPUT_DIR = "/tmp/output";

  static async init() {
    try {
      await fs.mkdir(this.UPLOADS_DIR, { recursive: true });
      await fs.mkdir(this.OUTPUT_DIR, { recursive: true });
    } catch (error) {
      console.error("Failed to initialize storage directories", error);
    }
  }

  static async saveUploadedFile(file: File): Promise<string> {
    await this.init();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Add timestamp to prevent accidental overwrites
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`;
    const filePath = path.join(this.UPLOADS_DIR, uniqueName);
    
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  static async saveProcessedFile(buffer: Uint8Array, extension: string): Promise<string> {
    await this.init();
    const uniqueName = `processed-${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
    const filePath = path.join(this.OUTPUT_DIR, uniqueName);
    
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  static async readProcessedFile(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath);
  }

  static async cleanupOldFiles(maxAgeHours = 1) {
    await this.init();
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    
    const dirsToClean = [this.UPLOADS_DIR, this.OUTPUT_DIR];
    
    for (const dirPath of dirsToClean) {
      try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);
          if (now - stats.mtimeMs > maxAgeMs) {
            await fs.unlink(filePath).catch(console.error);
          }
        }
      } catch (err) {
        console.error(`Failed to clean directory ${dirPath}`, err);
      }
    }
  }
}
