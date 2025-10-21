import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
