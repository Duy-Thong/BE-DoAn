/**
 * Cache utility functions
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  checkPeriod?: number; // Check period for expired items
}

export interface CacheItem<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export class CacheUtils<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private options: Required<CacheOptions>;
  private checkInterval?: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize || 1000,
      checkPeriod: options.checkPeriod || 60 * 1000, // 1 minute
    };

    this.startCleanup();
  }

  /**
   * Set cache item
   */
  set(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.options.ttl);
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.options.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  /**
   * Get cache item
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache item
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
  } {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.missCount / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate,
      missRate,
    };
  }

  private hitCount = 0;
  private missCount = 0;

  /**
   * Get with hit/miss tracking
   */
  getWithStats(key: string): T | null {
    const value = this.get(key);
    if (value !== null) {
      this.hitCount++;
    } else {
      this.missCount++;
    }
    return value;
  }

  /**
   * Evict oldest item
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start cleanup process
   */
  private startCleanup(): void {
    this.checkInterval = setInterval(() => {
      this.cleanup();
    }, this.options.checkPeriod);
  }

  /**
   * Stop cleanup process
   */
  stopCleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Destroy cache instance
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

// Global cache instances
export const userCache = new CacheUtils({ ttl: 10 * 60 * 1000, maxSize: 500 }); // 10 minutes
export const jobCache = new CacheUtils({ ttl: 5 * 60 * 1000, maxSize: 1000 }); // 5 minutes
export const companyCache = new CacheUtils({ ttl: 15 * 60 * 1000, maxSize: 200 }); // 15 minutes
export const cvCache = new CacheUtils({ ttl: 10 * 60 * 1000, maxSize: 500 }); // 10 minutes
export const aiCache = new CacheUtils({ ttl: 30 * 60 * 1000, maxSize: 100 }); // 30 minutes

// Cache decorator for methods
export function Cacheable(cache: CacheUtils, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}_${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      cache.set(key, result);
      
      return result;
    };
  };
}

// Cache utility functions
export class CacheHelper {
  /**
   * Generate cache key
   */
  static generateKey(prefix: string, ...parts: any[]): string {
    return `${prefix}:${parts.map(part => 
      typeof part === 'object' ? JSON.stringify(part) : String(part)
    ).join(':')}`;
  }

  /**
   * Cache with TTL
   */
  static async cacheWithTTL<T>(
    cache: CacheUtils<T>,
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fetcher();
    cache.set(key, result, ttl);
    return result;
  }

  /**
   * Cache with fallback
   */
  static async cacheWithFallback<T>(
    cache: CacheUtils<T>,
    key: string,
    fetcher: () => Promise<T>,
    fallback: T,
    ttl?: number
  ): Promise<T> {
    try {
      return await this.cacheWithTTL(cache, key, fetcher, ttl);
    } catch (error) {
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }
      return fallback;
    }
  }

  /**
   * Invalidate cache by pattern
   */
  static invalidateByPattern(cache: CacheUtils, pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cache.delete(key));
  }

  /**
   * Warm up cache
   */
  static async warmUpCache<T>(
    cache: CacheUtils<T>,
    keys: string[],
    fetcher: (key: string) => Promise<T>,
    ttl?: number
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!cache.has(key)) {
        try {
          const value = await fetcher(key);
          cache.set(key, value, ttl);
        } catch (error) {
          console.warn(`Failed to warm up cache for key: ${key}`, error);
        }
      }
    });

    await Promise.all(promises);
  }
}
