import crypto from 'crypto';

/**
 * Cryptographic utility functions
 */

export class CryptoUtils {
  /**
   * Generate random bytes
   */
  static randomBytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Generate random string
   */
  static randomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate random UUID
   */
  static randomUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Hash string with SHA-256
   */
  static sha256(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Hash string with SHA-512
   */
  static sha512(input: string): string {
    return crypto.createHash('sha512').update(input).digest('hex');
  }

  /**
   * Hash string with MD5
   */
  static md5(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex');
  }

  /**
   * Create HMAC
   */
  static hmac(algorithm: string, data: string, secret: string): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Create HMAC-SHA256
   */
  static hmacSha256(data: string, secret: string): string {
    return this.hmac('sha256', data, secret);
  }

  /**
   * Create HMAC-SHA512
   */
  static hmacSha512(data: string, secret: string): string {
    return this.hmac('sha512', data, secret);
  }

  /**
   * Encrypt data with AES-256-GCM
   */
  static encrypt(data: string, secret: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', secret);
    cipher.setAAD(Buffer.from('additional-data', 'utf8'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt data with AES-256-GCM
   */
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, secret: string): string {
    const decipher = crypto.createDecipher('aes-256-gcm', secret);
    decipher.setAAD(Buffer.from('additional-data', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate password hash with salt
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: actualSalt };
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return testHash === hash;
  }

  /**
   * Generate JWT token
   */
  static generateJWT(payload: any, secret: string, expiresIn: string = '1h'): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = this.hmacSha256(`${encodedHeader}.${encodedPayload}`, secret);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify JWT token
   */
  static verifyJWT(token: string, secret: string): { valid: boolean; payload?: any; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [header, payload, signature] = parts;
      const expectedSignature = this.hmacSha256(`${header}.${payload}`, secret);
      
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      // Check expiration
      if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload: decodedPayload };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  }

  /**
   * Generate API key
   */
  static generateApiKey(prefix: string = 'ak'): string {
    const randomPart = this.randomString(32);
    return `${prefix}_${randomPart}`;
  }

  /**
   * Generate secure token for email verification
   */
  static generateEmailVerificationToken(): string {
    return this.randomString(64);
  }

  /**
   * Generate secure token for password reset
   */
  static generatePasswordResetToken(): string {
    return this.randomString(64);
  }

  /**
   * Generate secure token for session
   */
  static generateSessionToken(): string {
    return this.randomString(128);
  }

  /**
   * Generate secure token for file upload
   */
  static generateFileUploadToken(): string {
    return this.randomString(32);
  }

  /**
   * Create checksum for file
   */
  static createFileChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create checksum for string
   */
  static createStringChecksum(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  /**
   * Generate secure random number
   */
  static secureRandom(min: number = 0, max: number = 1000000): number {
    const range = max - min;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const randomBytes = crypto.randomBytes(bytesNeeded);
    const randomValue = randomBytes.readUIntBE(0, bytesNeeded);
    return min + (randomValue % range);
  }

  /**
   * Generate secure random float
   */
  static secureRandomFloat(min: number = 0, max: number = 1): number {
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32BE(0);
    return min + (randomValue / 0xffffffff) * (max - min);
  }

  /**
   * Generate secure random boolean
   */
  static secureRandomBoolean(): boolean {
    const randomBytes = crypto.randomBytes(1);
    return randomBytes[0] < 128;
  }

  /**
   * Generate secure random choice from array
   */
  static secureRandomChoice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Array cannot be empty');
    }
    const index = this.secureRandom(0, array.length);
    return array[index];
  }

  /**
   * Generate secure random shuffle of array
   */
  static secureRandomShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.secureRandom(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
