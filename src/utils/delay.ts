/**
 * Delay utility functions
 */

export class DelayUtils {
  /**
   * Sleep for specified milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sleep for specified seconds
   */
  static async sleepSeconds(seconds: number): Promise<void> {
    return this.sleep(seconds * 1000);
  }

  /**
   * Sleep for specified minutes
   */
  static async sleepMinutes(minutes: number): Promise<void> {
    return this.sleep(minutes * 60 * 1000);
  }

  /**
   * Create a delay with exponential backoff
   */
  static async exponentialBackoff(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    multiplier: number = 2
  ): Promise<void> {
    const delay = Math.min(baseDelay * Math.pow(multiplier, attempt), maxDelay);
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    await this.sleep(delay + jitter);
  }

  /**
   * Create a delay with linear backoff
   */
  static async linearBackoff(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    increment: number = 1000
  ): Promise<void> {
    const delay = Math.min(baseDelay + (attempt * increment), maxDelay);
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    await this.sleep(delay + jitter);
  }

  /**
   * Create a delay with fixed interval
   */
  static async fixedDelay(delay: number): Promise<void> {
    await this.sleep(delay);
  }

  /**
   * Create a delay with random interval between min and max
   */
  static async randomDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await this.sleep(delay);
  }

  /**
   * Create a delay that respects rate limits
   */
  static async rateLimitDelay(
    requestsPerSecond: number,
    currentRequestCount: number
  ): Promise<void> {
    if (currentRequestCount >= requestsPerSecond) {
      const delay = 1000; // Wait 1 second
      await this.sleep(delay);
    }
  }

  /**
   * Create a delay for retry with circuit breaker pattern
   */
  static async circuitBreakerDelay(
    failureCount: number,
    maxFailures: number = 5,
    baseDelay: number = 1000
  ): Promise<void> {
    if (failureCount >= maxFailures) {
      // Circuit is open, wait longer
      await this.sleep(baseDelay * 10);
    } else {
      // Circuit is closed or half-open, normal delay
      await this.sleep(baseDelay);
    }
  }

  /**
   * Create a delay for batch processing
   */
  static async batchProcessingDelay(
    batchSize: number,
    currentBatchCount: number,
    delayBetweenBatches: number = 1000
  ): Promise<void> {
    if (currentBatchCount > 0 && currentBatchCount % batchSize === 0) {
      await this.sleep(delayBetweenBatches);
    }
  }

  /**
   * Create a delay for polling operations
   */
  static async pollingDelay(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    backoffMultiplier: number = 1.5
  ): Promise<void> {
    const delay = Math.min(
      baseDelay * Math.pow(backoffMultiplier, attempt),
      maxDelay
    );
    await this.sleep(delay);
  }

  /**
   * Create a delay for database operations
   */
  static async databaseDelay(
    operationType: 'read' | 'write' | 'delete',
    retryCount: number = 0
  ): Promise<void> {
    const delays = {
      read: 100,
      write: 200,
      delete: 300,
    };

    const baseDelay = delays[operationType];
    const delay = baseDelay + (retryCount * 100); // Increase delay with retries
    await this.sleep(delay);
  }

  /**
   * Create a delay for API calls
   */
  static async apiDelay(
    endpoint: string,
    retryCount: number = 0,
    baseDelay: number = 1000
  ): Promise<void> {
    // Different delays for different endpoints
    const endpointDelays: Record<string, number> = {
      '/api/ai/embeddings': 2000,
      '/api/ai/recommendations': 1500,
      '/api/search': 500,
      '/api/uploads': 1000,
    };

    const endpointDelay = endpointDelays[endpoint] || baseDelay;
    const delay = endpointDelay + (retryCount * 500); // Increase delay with retries
    await this.sleep(delay);
  }
}
