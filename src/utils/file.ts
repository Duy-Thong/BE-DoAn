import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

/**
 * File utility functions
 */

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  extension: string;
  mimeType: string;
  createdAt: Date;
  modifiedAt: Date;
}

export class FileUtils {
  /**
   * Check if file exists
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if directory exists
   */
  static async isDirectory(dirPath: string): Promise<boolean> {
    try {
      const stats = await stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  static async ensureDir(dirPath: string): Promise<void> {
    if (!(await this.isDirectory(dirPath))) {
      await mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Read file content
   */
  static async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    return readFile(filePath, encoding);
  }

  /**
   * Read file as buffer
   */
  static async readFileBuffer(filePath: string): Promise<Buffer> {
    return readFile(filePath);
  }

  /**
   * Write file content
   */
  static async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    return writeFile(filePath, content);
  }

  /**
   * Delete file
   */
  static async deleteFile(filePath: string): Promise<void> {
    if (await this.exists(filePath)) {
      await unlink(filePath);
    }
  }

  /**
   * Delete directory
   */
  static async deleteDir(dirPath: string): Promise<void> {
    if (await this.isDirectory(dirPath)) {
      await rmdir(dirPath, { recursive: true });
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      const stats = await stat(filePath);
      const ext = path.extname(filePath);
      const mimeType = this.getMimeType(ext);

      return {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        extension: ext,
        mimeType,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get file size
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Get file extension
   */
  static getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
  }

  /**
   * Get file name without extension
   */
  static getFileNameWithoutExtension(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * Get MIME type from extension
   */
  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Check if file is image
   */
  static isImage(filePath: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'];
    return imageExtensions.includes(this.getFileExtension(filePath));
  }

  /**
   * Check if file is video
   */
  static isVideo(filePath: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.includes(this.getFileExtension(filePath));
  }

  /**
   * Check if file is audio
   */
  static isAudio(filePath: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'];
    return audioExtensions.includes(this.getFileExtension(filePath));
  }

  /**
   * Check if file is document
   */
  static isDocument(filePath: string): boolean {
    const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
    return documentExtensions.includes(this.getFileExtension(filePath));
  }

  /**
   * Check if file is archive
   */
  static isArchive(filePath: string): boolean {
    const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    return archiveExtensions.includes(this.getFileExtension(filePath));
  }

  /**
   * Generate unique filename
   */
  static generateUniqueFileName(originalName: string): string {
    const ext = this.getFileExtension(originalName);
    const nameWithoutExt = this.getFileNameWithoutExtension(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${nameWithoutExt}_${timestamp}_${random}${ext}`;
  }

  /**
   * Sanitize filename
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Get directory contents
   */
  static async getDirectoryContents(dirPath: string): Promise<string[]> {
    try {
      return await readdir(dirPath);
    } catch {
      return [];
    }
  }

  /**
   * Copy file
   */
  static async copyFile(sourcePath: string, destPath: string): Promise<void> {
    const content = await this.readFileBuffer(sourcePath);
    await this.writeFile(destPath, content);
  }

  /**
   * Move file
   */
  static async moveFile(sourcePath: string, destPath: string): Promise<void> {
    await this.copyFile(sourcePath, destPath);
    await this.deleteFile(sourcePath);
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if file size is within limits
   */
  static isFileSizeValid(fileSize: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  }

  /**
   * Get file hash
   */
  static async getFileHash(filePath: string, algorithm: string = 'sha256'): Promise<string> {
    const crypto = await import('crypto');
    const content = await this.readFileBuffer(filePath);
    return crypto.createHash(algorithm).update(content).digest('hex');
  }

  /**
   * Create temporary file
   */
  static async createTempFile(content: string | Buffer, extension: string = '.tmp'): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    await this.ensureDir(tempDir);
    
    const fileName = this.generateUniqueFileName(`temp${extension}`);
    const filePath = path.join(tempDir, fileName);
    
    await this.writeFile(filePath, content);
    return filePath;
  }

  /**
   * Clean up temporary files
   */
  static async cleanupTempFiles(maxAgeInHours: number = 24): Promise<void> {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!(await this.isDirectory(tempDir))) return;

    const files = await this.getDirectoryContents(tempDir);
    const now = Date.now();
    const maxAge = maxAgeInHours * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const fileInfo = await this.getFileInfo(filePath);
      
      if (fileInfo && (now - fileInfo.createdAt.getTime()) > maxAge) {
        await this.deleteFile(filePath);
      }
    }
  }
}
