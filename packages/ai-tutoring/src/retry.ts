/**
 * Shared HTTP retry wrapper for AI provider calls.
 *
 * Provides exponential backoff with jitter for transient failures
 * (429 rate limits, 5xx server errors, network errors).
 * Non-retryable errors (4xx, aborts) are thrown immediately.
 */

export class EmptyResponseError extends Error {
  constructor() {
    super('Empty response from AI provider');
    this.name = 'EmptyResponseError';
  }
}

export interface RetryOptions {
  /** Maximum number of retry attempts. Default: 2 */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff. Default: 500 */
  baseDelayMs?: number;
  /** Maximum delay cap in ms. Default: 8000 */
  maxDelayMs?: number;
  /** AbortSignal to cancel retries */
  signal?: AbortSignal;
}

/**
 * Check if an HTTP status code is retryable.
 *
 * Retryable: 429 (rate limit) and 5xx (server errors).
 * Not retryable: 2xx, 3xx, 4xx (except 429).
 */
export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Checks if an error is retryable based on error type and message patterns.
 * @param error - Error to check
 * @returns True if the error should trigger a retry
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof EmptyResponseError) {
    return true;
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return false;
  }

  if (error instanceof Error) {
    const message = error.message;
    const statusMatch = message.match(/\((\d{3})\)/);
    if (statusMatch) {
      return isRetryableStatus(parseInt(statusMatch[1], 10));
    }
    const altMatch = message.match(/error:\s*(\d{3})/);
    if (altMatch) {
      return isRetryableStatus(parseInt(altMatch[1], 10));
    }
    const directStatusMatch = message.match(/^(\d{3})(?:\s|$)/);
    if (directStatusMatch) {
      return isRetryableStatus(parseInt(directStatusMatch[1], 10));
    }
    const networkPatterns = ['fetch failed', 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'network'];
    if (networkPatterns.some(p => message.includes(p))) {
      return true;
    }
    return false;
  }

  return false;
}

/**
 * Resolves an AbortSignal-aware delay with cleanup on abort.
 * @param ms - Delay duration in milliseconds
 * @param signal - Optional AbortSignal to cancel the delay
 * @returns Promise that resolves after ms or rejects on abort
 * @throws {DOMException} Rejects with AbortError if signal is aborted
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Wrap an async function with retry logic and exponential backoff.
 *
 * Retries on transient failures (429, 5xx, network errors).
 * Throws immediately on non-retryable errors (4xx except 429, aborts).
 * Supports AbortSignal for cancellation.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 2,
    baseDelayMs = 500,
    maxDelayMs = 8000,
    signal,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('Aborted', 'AbortError');
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error)) {
        throw error;
      }

      if (attempt >= maxRetries) {
        throw error;
      }

      const baseDelay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const jitter = baseDelay * (0.5 + Math.random() * 0.5);
      await sleep(Math.round(jitter), signal);
    }
  }

  throw lastError;
}