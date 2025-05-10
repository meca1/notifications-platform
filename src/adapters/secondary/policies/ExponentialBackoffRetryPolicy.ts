import { IRetryPolicy } from '../../../core/ports/output/IRetryPolicy';
import { httpConfig } from '../../../config/http';

export class ExponentialBackoffRetryPolicy implements IRetryPolicy {
  private readonly maxRetries: number;
  private readonly baseDelay: number = 1000; // 1 segundo

  constructor() {
    this.maxRetries = httpConfig.maxRetries;
  }

  shouldRetry(attempt: number): boolean {
    return attempt < this.maxRetries;
  }

  getDelay(attempt: number): number {
    return this.baseDelay * Math.pow(2, attempt); // Backoff exponencial: 1s, 2s, 4s
  }
}