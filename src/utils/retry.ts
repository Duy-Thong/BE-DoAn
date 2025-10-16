/**
 * Retry utility functions
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxAttemptsReached?: (error: Error) => void;
}

export class RetryUtils {
  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
      jitter = true,
      retryCondition = () => true,
      onRetry,
      onMaxAttemptsReached,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry
        if (!retryCondition(lastError)) {
          throw lastError;
        }

        // If this is the last attempt, don't wait
        if (attempt === maxAttempts - 1) {
          if (onMaxAttemptsReached) {
            onMaxAttemptsReached(lastError);
          }
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );

        // Add jitter to prevent thundering herd
        const finalDelay = jitter ? delay + Math.random() * 0.1 * delay : delay;

        // Call onRetry callback
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, finalDelay));
      }
    }

    throw lastError!;
  }

  /**
   * Retry with linear backoff
   */
  static async retryLinear<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      increment = 1000,
      retryCondition = () => true,
      onRetry,
      onMaxAttemptsReached,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!retryCondition(lastError)) {
          throw lastError;
        }

        if (attempt === maxAttempts - 1) {
          if (onMaxAttemptsReached) {
            onMaxAttemptsReached(lastError);
          }
          throw lastError;
        }

        const delay = Math.min(baseDelay + (attempt * increment), maxDelay);

        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Retry with fixed delay
   */
  static async retryFixed<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      retryCondition = () => true,
      onRetry,
      onMaxAttemptsReached,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!retryCondition(lastError)) {
          throw lastError;
        }

        if (attempt === maxAttempts - 1) {
          if (onMaxAttemptsReached) {
            onMaxAttemptsReached(lastError);
          }
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        await new Promise(resolve => setTimeout(resolve, baseDelay));
      }
    }

    throw lastError!;
  }

  /**
   * Retry for database operations
   */
  static async retryDatabase<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const defaultOptions: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryCondition: (error: Error) => {
        // Retry on connection errors, timeouts, and deadlocks
        const retryableErrors = [
          'ECONNREFUSED',
          'ETIMEDOUT',
          'ENOTFOUND',
          'deadlock',
          'timeout',
          'connection',
        ];
        return retryableErrors.some(keyword => 
          error.message.toLowerCase().includes(keyword)
        );
      },
      onRetry: (attempt, error) => {
        console.warn(`Database retry attempt ${attempt}: ${error.message}`);
      },
    };

    return this.retry(fn, { ...defaultOptions, ...options });
  }

  /**
   * Retry for API calls
   */
  static async retryApi<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const defaultOptions: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryCondition: (error: Error) => {
        // Retry on network errors and 5xx status codes
        const retryableErrors = [
          'ECONNREFUSED',
          'ETIMEDOUT',
          'ENOTFOUND',
          'network',
          'timeout',
        ];
        return retryableErrors.some(keyword => 
          error.message.toLowerCase().includes(keyword)
        );
      },
      onRetry: (attempt, error) => {
        console.warn(`API retry attempt ${attempt}: ${error.message}`);
      },
    };

    return this.retry(fn, { ...defaultOptions, ...options });
  }

  /**
   * Retry for file operations
   */
  static async retryFile<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const defaultOptions: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 500,
      maxDelay: 5000,
      backoffMultiplier: 2,
      retryCondition: (error: Error) => {
        // Retry on file system errors
        const retryableErrors = [
          'EBUSY',
          'EMFILE',
          'ENFILE',
          'EAGAIN',
          'EINTR',
          'ENOENT', // File not found (might be created)
        ];
        return retryableErrors.some(keyword => 
          error.message.includes(keyword)
        );
      },
      onRetry: (attempt, error) => {
        console.warn(`File operation retry attempt ${attempt}: ${error.message}`);
      },
    };

    return this.retry(fn, { ...defaultOptions, ...options });
  }

  /**
   * Retry with circuit breaker pattern
   */
  static async retryWithCircuitBreaker<T>(
    fn: () => Promise<T>,
    options: RetryOptions & {
      failureThreshold?: number;
      recoveryTimeout?: number;
    } = {}
  ): Promise<T> {
    const {
      failureThreshold = 5,
      recoveryTimeout = 60000,
      ...retryOptions
    } = options;

    // Simple in-memory circuit breaker state
    const circuitBreakerState = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED' as 'CLOSED' | 'OPEN' | 'HALF_OPEN',
    };

    const isCircuitOpen = () => {
      if (circuitBreakerState.state === 'OPEN') {
        const now = Date.now();
        if (now - circuitBreakerState.lastFailureTime > recoveryTimeout) {
          circuitBreakerState.state = 'HALF_OPEN';
          return false;
        }
        return true;
      }
      return false;
    };

    const recordSuccess = () => {
      circuitBreakerState.failures = 0;
      circuitBreakerState.state = 'CLOSED';
    };

    const recordFailure = () => {
      circuitBreakerState.failures++;
      circuitBreakerState.lastFailureTime = Date.now();
      
      if (circuitBreakerState.failures >= failureThreshold) {
        circuitBreakerState.state = 'OPEN';
      }
    };

    if (isCircuitOpen()) {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await this.retry(fn, retryOptions);
      recordSuccess();
      return result;
    } catch (error) {
      recordFailure();
      throw error;
    }
  }
}
