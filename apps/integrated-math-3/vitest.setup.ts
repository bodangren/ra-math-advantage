import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(() => undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

class ResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback(
      [
        {
          contentRect: {
            width: (target as HTMLElement).clientWidth || 600,
            height: (target as HTMLElement).clientHeight || 400
          }
        } as ResizeObserverEntry
      ],
      this
    );
  }

  unobserve() {
    // no-op
  }

  disconnect() {
    // no-op
  }
}

(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = ResizeObserver;

// Minimal jsdom polyfill for HTMLDialogElement so Dialog component works in tests.
// jsdom does not implement showModal()/close()/open natively.
if (typeof HTMLDialogElement !== 'undefined') {
  const dialogProto = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
  if (typeof dialogProto.showModal !== 'function') {
    dialogProto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
      (this as unknown as { open: boolean }).open = true;
    };
  }
  if (typeof dialogProto.close !== 'function') {
    dialogProto.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      (this as unknown as { open: boolean }).open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
}
