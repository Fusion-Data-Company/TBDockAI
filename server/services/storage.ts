import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

class StorageService {
  private uploadDir: string;
  private baseURL: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseURL = process.env.BASE_URL || 'http://localhost:5000';
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Generate a unique filename with timestamp and hash
   */
  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
    return `${baseName}_${timestamp}_${randomHash}${ext}`;
  }

  /**
   * Upload a file to local storage
   */
  async uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadedFile> {
    const filename = this.generateFilename(originalName);
    const filePath = path.join(this.uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    return {
      filename,
      originalName,
      mimeType,
      size: buffer.length,
      path: filePath,
      url: `${this.baseURL}/uploads/${filename}`
    };
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file ${filename}:`, error);
      throw new Error('File deletion failed');
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(filename: string): Promise<{ exists: boolean; size?: number }> {
    const filePath = path.join(this.uploadDir, filename);
    try {
      const stats = await fs.stat(filePath);
      return { exists: true, size: stats.size };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Read file as buffer
   */
  async readFile(filename: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, filename);
    return await fs.readFile(filePath);
  }

  /**
   * Get upload directory path
   */
  getUploadDir(): string {
    return this.uploadDir;
  }
}

export const storageService = new StorageService();
