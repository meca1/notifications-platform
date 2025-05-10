export interface IRetryPolicy {
    shouldRetry(attempt: number): boolean;
    getDelay(attempt: number): number;
}