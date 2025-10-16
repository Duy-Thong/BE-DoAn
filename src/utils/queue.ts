/**
 * Queue utility functions
 */

export interface QueueOptions {
  concurrency?: number;
  delay?: number;
  retries?: number;
  retryDelay?: number;
}

export interface QueueItem<T = any> {
  id: string;
  data: T;
  priority?: number;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  scheduledAt?: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

export class Queue<T = any> {
  private items: QueueItem<T>[] = [];
  private processing: Set<string> = new Set();
  private completed: Set<string> = new Set();
  private failed: Set<string> = new Set();
  private options: Required<QueueOptions>;
  private processor?: (item: QueueItem<T>) => Promise<void>;
  private isProcessing = false;

  constructor(options: QueueOptions = {}) {
    this.options = {
      concurrency: options.concurrency || 1,
      delay: options.delay || 0,
      retries: options.retries || 3,
      retryDelay: options.retryDelay || 1000,
    };
  }

  /**
   * Add item to queue
   */
  add(data: T, options: { priority?: number; delay?: number; maxAttempts?: number } = {}): string {
    const id = this.generateId();
    const item: QueueItem<T> = {
      id,
      data,
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.options.retries,
      createdAt: Date.now(),
      scheduledAt: options.delay ? Date.now() + options.delay : undefined,
    };

    this.items.push(item);
    this.sortByPriority();

    if (!this.isProcessing) {
      this.process();
    }

    return id;
  }

  /**
   * Set processor function
   */
  process(processor: (item: QueueItem<T>) => Promise<void>): void {
    this.processor = processor;
    if (!this.isProcessing) {
      this.process();
    }
  }

  /**
   * Start processing queue
   */
  private async process(): Promise<void> {
    if (this.isProcessing || !this.processor) {
      return;
    }

    this.isProcessing = true;

    while (this.items.length > 0 && this.processing.size < this.options.concurrency) {
      const item = this.getNextItem();
      if (!item) {
        break;
      }

      this.processing.add(item.id);
      this.processItem(item);
    }

    this.isProcessing = false;
  }

  /**
   * Get next item to process
   */
  private getNextItem(): QueueItem<T> | null {
    const now = Date.now();
    
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      
      if (!item.scheduledAt || item.scheduledAt <= now) {
        return this.items.splice(i, 1)[0];
      }
    }

    return null;
  }

  /**
   * Process individual item
   */
  private async processItem(item: QueueItem<T>): Promise<void> {
    try {
      await this.processor!(item);
      this.completed.add(item.id);
      this.processing.delete(item.id);
    } catch (error) {
      item.attempts++;
      
      if (item.attempts < item.maxAttempts) {
        // Retry with delay
        item.scheduledAt = Date.now() + this.options.retryDelay * item.attempts;
        this.items.push(item);
        this.sortByPriority();
      } else {
        // Max attempts reached
        this.failed.add(item.id);
      }
      
      this.processing.delete(item.id);
    }

    // Continue processing
    if (this.items.length > 0) {
      this.process();
    }
  }

  /**
   * Sort items by priority (higher priority first)
   */
  private sortByPriority(): void {
    this.items.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      pending: this.items.length,
      processing: this.processing.size,
      completed: this.completed.size,
      failed: this.failed.size,
      total: this.items.length + this.processing.size + this.completed.size + this.failed.size,
    };
  }

  /**
   * Clear completed and failed items
   */
  clear(): void {
    this.completed.clear();
    this.failed.clear();
  }

  /**
   * Get pending items
   */
  getPending(): QueueItem<T>[] {
    return [...this.items];
  }

  /**
   * Get processing items
   */
  getProcessing(): string[] {
    return Array.from(this.processing);
  }

  /**
   * Get completed items
   */
  getCompleted(): string[] {
    return Array.from(this.completed);
  }

  /**
   * Get failed items
   */
  getFailed(): string[] {
    return Array.from(this.failed);
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0 && this.processing.size === 0;
  }

  /**
   * Check if queue is idle
   */
  isIdle(): boolean {
    return this.items.length === 0 && this.processing.size === 0;
  }

  /**
   * Wait for queue to be idle
   */
  async waitForIdle(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.isIdle()) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
}

// Global queue instances
export const emailQueue = new Queue({ concurrency: 5, delay: 1000 });
export const aiQueue = new Queue({ concurrency: 3, delay: 2000 });
export const fileQueue = new Queue({ concurrency: 2, delay: 500 });
export const notificationQueue = new Queue({ concurrency: 10, delay: 100 });

// Queue utility functions
export class QueueHelper {
  /**
   * Create queue with processor
   */
  static createQueue<T>(
    processor: (item: QueueItem<T>) => Promise<void>,
    options: QueueOptions = {}
  ): Queue<T> {
    const queue = new Queue<T>(options);
    queue.process(processor);
    return queue;
  }

  /**
   * Add job to queue with error handling
   */
  static async addJob<T>(
    queue: Queue<T>,
    data: T,
    options: { priority?: number; delay?: number; maxAttempts?: number } = {}
  ): Promise<string> {
    try {
      return queue.add(data, options);
    } catch (error) {
      console.error('Failed to add job to queue:', error);
      throw error;
    }
  }

  /**
   * Process queue with monitoring
   */
  static async processQueue<T>(
    queue: Queue<T>,
    processor: (item: QueueItem<T>) => Promise<void>,
    onError?: (error: Error, item: QueueItem<T>) => void
  ): Promise<void> {
    queue.process(async (item) => {
      try {
        await processor(item);
      } catch (error) {
        if (onError) {
          onError(error as Error, item);
        }
        throw error;
      }
    });
  }

  /**
   * Get queue health status
   */
  static getQueueHealth(queue: Queue): {
    healthy: boolean;
    stats: QueueStats;
    issues: string[];
  } {
    const stats = queue.getStats();
    const issues: string[] = [];

    if (stats.failed > stats.completed * 0.1) {
      issues.push('High failure rate');
    }

    if (stats.pending > 1000) {
      issues.push('Queue backlog too large');
    }

    if (stats.processing > 0 && stats.pending === 0) {
      issues.push('Items stuck in processing');
    }

    return {
      healthy: issues.length === 0,
      stats,
      issues,
    };
  }

  /**
   * Monitor queue performance
   */
  static startQueueMonitoring(queue: Queue, intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => {
      const health = this.getQueueHealth(queue);
      if (!health.healthy) {
        console.warn('Queue health issues:', health.issues, health.stats);
      }
    }, intervalMs);
  }

  /**
   * Batch process items
   */
  static async batchProcess<T>(
    queue: Queue<T>,
    batchSize: number = 10,
    processor: (items: QueueItem<T>[]) => Promise<void>
  ): Promise<void> {
    const items: QueueItem<T>[] = [];
    
    for (let i = 0; i < batchSize; i++) {
      const item = queue.getPending()[i];
      if (item) {
        items.push(item);
      }
    }

    if (items.length > 0) {
      await processor(items);
    }
  }
}
