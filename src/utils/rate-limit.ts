/**
 * Rate limiting utility functions
 */

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: any) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip successful requests
  skipFailedRequests?: boolean; // Skip failed requests
  message?: string; // Custom error message
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      keyGenerator: options.keyGenerator || ((req: any) => req.ip || 'unknown'),
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
      message: options.message || 'Too many requests',
      ...options,
    };
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): { allowed: boolean; info: RateLimitInfo } {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    // Get or create request history for this key
    let requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if under limit
    const allowed = requests.length < this.options.maxRequests;
    
    if (allowed) {
      // Add current request
      requests.push(now);
      this.requests.set(key, requests);
    }
    
    const reset = now + this.options.windowMs;
    const remaining = Math.max(0, this.options.maxRequests - requests.length);
    const retryAfter = allowed ? undefined : Math.ceil((reset - now) / 1000);
    
    return {
      allowed,
      info: {
        limit: this.options.maxRequests,
        remaining,
        reset,
        retryAfter,
      },
    };
  }

  /**
   * Get rate limit info without consuming a request
   */
  getInfo(key: string): RateLimitInfo {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    const reset = now + this.options.windowMs;
    const remaining = Math.max(0, this.options.maxRequests - validRequests.length);
    
    return {
      limit: this.options.maxRequests,
      remaining,
      reset,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }

  /**
   * Get all keys
   */
  getKeys(): string[] {
    return Array.from(this.requests.keys());
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalKeys: number;
    totalRequests: number;
    averageRequestsPerKey: number;
  } {
    const totalKeys = this.requests.size;
    let totalRequests = 0;
    
    for (const requests of this.requests.values()) {
      totalRequests += requests.length;
    }
    
    const averageRequestsPerKey = totalKeys > 0 ? totalRequests / totalKeys : 0;
    
    return {
      totalKeys,
      totalRequests,
      averageRequestsPerKey,
    };
  }
}

// Global rate limiters
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  message: 'Too many API requests',
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
  message: 'Too many file uploads',
});

export const emailRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 emails per hour
  message: 'Too many email requests',
});

export const aiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 AI requests per minute
  message: 'Too many AI requests',
});

// Rate limit utility functions
export class RateLimitHelper {
  /**
   * Create rate limiter middleware
   */
  static createMiddleware(rateLimiter: RateLimiter) {
    return (req: any, res: any, next: any) => {
      const key = rateLimiter['options'].keyGenerator(req);
      const result = rateLimiter.isAllowed(key);
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': result.info.limit.toString(),
        'X-RateLimit-Remaining': result.info.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.info.reset).toISOString(),
      });
      
      if (result.info.retryAfter) {
        res.set('Retry-After', result.info.retryAfter.toString());
      }
      
      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          error: rateLimiter['options'].message,
          retryAfter: result.info.retryAfter,
        });
      }
      
      next();
    };
  }

  /**
   * Create user-specific rate limiter
   */
  static createUserRateLimiter(options: RateLimitOptions): RateLimiter {
    return new RateLimiter({
      ...options,
      keyGenerator: (req: any) => `user:${req.user?.id || req.ip}`,
    });
  }

  /**
   * Create IP-based rate limiter
   */
  static createIPRateLimiter(options: RateLimitOptions): RateLimiter {
    return new RateLimiter({
      ...options,
      keyGenerator: (req: any) => `ip:${req.ip || 'unknown'}`,
    });
  }

  /**
   * Create endpoint-specific rate limiter
   */
  static createEndpointRateLimiter(options: RateLimitOptions): RateLimiter {
    return new RateLimiter({
      ...options,
      keyGenerator: (req: any) => `endpoint:${req.method}:${req.path}`,
    });
  }

  /**
   * Create combined rate limiter
   */
  static createCombinedRateLimiter(options: RateLimitOptions): RateLimiter {
    return new RateLimiter({
      ...options,
      keyGenerator: (req: any) => `combined:${req.user?.id || req.ip}:${req.method}:${req.path}`,
    });
  }

  /**
   * Check rate limit without consuming request
   */
  static checkRateLimit(rateLimiter: RateLimiter, key: string): RateLimitInfo {
    return rateLimiter.getInfo(key);
  }

  /**
   * Get rate limit status
   */
  static getRateLimitStatus(rateLimiter: RateLimiter, key: string): {
    allowed: boolean;
    info: RateLimitInfo;
  } {
    return rateLimiter.isAllowed(key);
  }

  /**
   * Reset rate limit for key
   */
  static resetRateLimit(rateLimiter: RateLimiter, key: string): void {
    rateLimiter.reset(key);
  }

  /**
   * Clean up all rate limiters
   */
  static cleanupAll(): void {
    authRateLimiter.cleanup();
    apiRateLimiter.cleanup();
    uploadRateLimiter.cleanup();
    emailRateLimiter.cleanup();
    aiRateLimiter.cleanup();
  }

  /**
   * Get all rate limiter statistics
   */
  static getAllStats(): Record<string, any> {
    return {
      auth: authRateLimiter.getStats(),
      api: apiRateLimiter.getStats(),
      upload: uploadRateLimiter.getStats(),
      email: emailRateLimiter.getStats(),
      ai: aiRateLimiter.getStats(),
    };
  }

  /**
   * Start cleanup process
   */
  static startCleanup(intervalMs: number = 5 * 60 * 1000): NodeJS.Timeout {
    return setInterval(() => {
      this.cleanupAll();
    }, intervalMs);
  }
}

// Sliding window rate limiter
export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      keyGenerator: options.keyGenerator || ((req: any) => req.ip || 'unknown'),
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
      message: options.message || 'Too many requests',
      ...options,
    };
  }

  /**
   * Check if request is allowed with sliding window
   */
  isAllowed(key: string): { allowed: boolean; info: RateLimitInfo } {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    let requests = this.requests.get(key) || [];
    
    // Remove old requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    const allowed = requests.length < this.options.maxRequests;
    
    if (allowed) {
      requests.push(now);
      this.requests.set(key, requests);
    }
    
    const reset = now + this.options.windowMs;
    const remaining = Math.max(0, this.options.maxRequests - requests.length);
    const retryAfter = allowed ? undefined : Math.ceil((reset - now) / 1000);
    
    return {
      allowed,
      info: {
        limit: this.options.maxRequests,
        remaining,
        reset,
        retryAfter,
      },
    };
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}
