import { ref, uploadBytes, getDownloadURL, deleteObject, getBytes } from 'firebase/storage';
import { storage } from '../config/firebase.js';
import logger from '../utils/logger.js';

export class FirebaseStorageService {
  /**
   * Upload file to Firebase Storage
   */
  static async uploadFile(
    file: Express.Multer.File,
    path: string,
    metadata?: { [key: string]: string }
  ): Promise<string> {
    try {
      // Create a reference to the file location
      const storageRef = ref(storage, path);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file.buffer, {
        contentType: file.mimetype,
        customMetadata: metadata
      });
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      logger.info(`File uploaded successfully: ${path}`);
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading file to Firebase Storage:', error);
      throw new Error('Failed to upload file to Firebase Storage');
    }
  }

  /**
   * Delete file from Firebase Storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      logger.info(`File deleted successfully: ${filePath}`);
    } catch (error) {
      logger.error('Error deleting file from Firebase Storage:', error);
      throw new Error('Failed to delete file from Firebase Storage');
    }
  }

  /**
   * Download file content as string from Firebase Storage
   */
  static async downloadString(downloadURL: string): Promise<string> {
    try {
      // Extract file path from download URL
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
      if (!pathMatch) {
        throw new Error('Invalid Firebase Storage URL');
      }
      
      const filePath = decodeURIComponent(pathMatch[1]);
      const fileRef = ref(storage, filePath);
      
      // Download file as bytes
      const bytes = await getBytes(fileRef);
      
      // Convert bytes to string
      const content = new TextDecoder('utf-8').decode(bytes);
      
      logger.info(`File downloaded successfully: ${filePath}`);
      return content;
    } catch (error) {
      logger.error('Error downloading file from Firebase Storage:', error);
      throw new Error('Failed to download file from Firebase Storage');
    }
  }

  /**
   * Upload string content to Firebase Storage
   */
  static async uploadString(
    content: string,
    path: string,
    contentType: string = 'text/plain'
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const bytes = new TextEncoder().encode(content);
      
      const snapshot = await uploadBytes(storageRef, bytes, {
        contentType,
      });
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      logger.info(`String content uploaded successfully: ${path}`);
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading string to Firebase Storage:', error);
      throw new Error('Failed to upload string to Firebase Storage');
    }
  }

  /**
   * Upload buffer to Firebase Storage
   */
  static async uploadBuffer(
    buffer: Buffer,
    path: string,
    contentType: string
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      
      const snapshot = await uploadBytes(storageRef, buffer, {
        contentType,
      });
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      logger.info(`Buffer uploaded successfully: ${path}`);
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading buffer to Firebase Storage:', error);
      throw new Error('Failed to upload buffer to Firebase Storage');
    }
  }

  /**
   * Generate unique file path for avatar
   */
  static generateAvatarPath(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `avatars/${userId}/${timestamp}.${extension}`;
  }

  /**
   * Generate unique file path for CV
   */
  static generateCVPath(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `cvs/${userId}/${timestamp}.${extension}`;
  }

  /**
   * Generate unique file path for company logo
   */
  static generateLogoPath(companyId: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `logos/${companyId}/${timestamp}.${extension}`;
  }
}
