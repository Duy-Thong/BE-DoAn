import { prisma } from '../../loaders/prisma.js';
import { createNotFoundError, createAuthError } from '../../utils/error.js';

/**
 * Base service class for CV-related operations
 * Provides common functionality for all CV submodules
 */
export abstract class BaseCVService {
  /**
   * Verify that a CV belongs to the specified user
   * @param cvId - CV ID to verify
   * @param userId - User ID to check ownership
   * @returns The CV if found and owned by user
   * @throws NotFoundError if CV not found or not owned by user
   */
  protected async verifyCVOwnership(cvId: string, userId: string) {
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId
      }
    });

    if (!cv) {
      throw createNotFoundError('CV');
    }

    return cv;
  }

  /**
   * Verify that a CV exists and is accessible by the user
   * @param cvId - CV ID to verify
   * @param userId - User ID to check access
   * @returns The CV if accessible
   * @throws NotFoundError if CV not found or not accessible
   */
  protected async verifyCVAccess(cvId: string, userId: string) {
    return this.verifyCVOwnership(cvId, userId);
  }

  /**
   * Check if user has permission to modify CV
   * @param cvId - CV ID to check
   * @param userId - User ID to check permission
   * @returns The CV if user has permission
   * @throws AuthError if user doesn't have permission
   */
  protected async verifyCVPermission(cvId: string, userId: string) {
    const cv = await this.verifyCVOwnership(cvId, userId);
    
    // Additional permission checks can be added here
    // For example: check if CV is locked, user role, etc.
    
    return cv;
  }

  /**
   * Get CV with basic information
   * @param cvId - CV ID
   * @param userId - User ID
   * @returns CV basic information
   */
  protected async getCVBasicInfo(cvId: string, userId: string) {
    return this.verifyCVOwnership(cvId, userId);
  }
}
