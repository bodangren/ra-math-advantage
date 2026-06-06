/**
 * Browser download mock for jsdom.
 *
 * jsdom does not implement `URL.createObjectURL`/`URL.revokeObjectURL` or
 * `HTMLAnchorElement.prototype.click` in a way that lets us assert on
 * filenames. The IM3 export panel triggers a client-side download via
 * `Blob` + `URL.createObjectURL` + a synthetic `<a download>` click.
 *
 * This helper installs spies on those APIs and exposes a typed handle so
 * tests can assert on:
 *   - the `Blob` payload (CSV/JSON content)
 *   - the `<a download="...">` filename
 *   - the call to `URL.revokeObjectURL` for cleanup
 *
 * The recipe mirrors the existing `downloadGradebookCsv` function in
 * `lib/teacher/gradebook-export.ts:5`, which is the canonical client-download
 * pattern in IM3.
 */
import { afterEach, beforeEach, vi, type MockInstance } from 'vitest';

export interface CapturedDownload {
  filename: string;
  mimeType: string;
  blobText: string;
  objectUrl: string;
  revoked: boolean;
}

export interface BrowserDownloadHandle {
  createObjectURL: MockInstance<typeof URL.createObjectURL>;
  revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;
  Blob: MockInstance<typeof Blob>;
  anchorClick: MockInstance<HTMLAnchorElement['click']>;
  getCapturedDownloads: () => CapturedDownload[];
  clear: () => void;
}

let activeHandle: BrowserDownloadHandle | null = null;

export function getActiveDownloadHandle(): BrowserDownloadHandle | null {
  return activeHandle;
}

export function installBrowserDownloadMock(): BrowserDownloadHandle {
  const captured: CapturedDownload[] = [];

  const createObjectURL = vi.fn<typeof URL.createObjectURL>().mockImplementation(() => {
    return `blob:mock-${captured.length}-${Date.now()}`;
  });
  const revokeObjectURL = vi.fn<typeof URL.revokeObjectURL>().mockImplementation(() => {
    const last = captured[captured.length - 1];
    if (last) last.revoked = true;
  });

  const originalBlob = globalThis.Blob;
  const BlobCtor = (function (this: unknown, parts?: BlobPart[], options?: BlobPropertyBag) {
    const joined = (parts ?? [])
      .map((part) => (typeof part === 'string' ? part : '[binary]'))
      .join('');
    BlobCtor.__captured.push({ text: joined, type: options?.type ?? '' });
    return new originalBlob(parts ?? [], options);
  }) as unknown as typeof Blob & {
    __captured: { text: string; type: string }[];
  };
  BlobCtor.__captured = [];
  const trackedBlob = BlobCtor;
  (trackedBlob as unknown as { __captured: { text: string; type: string }[] }).__captured =
    BlobCtor.__captured;

  const anchorClick = vi.fn<HTMLAnchorElement['click']>().mockImplementation(function (this: HTMLAnchorElement) {
    const download = this.getAttribute('download') ?? '';
    const href = this.getAttribute('href') ?? '';
    const last = BlobCtor.__captured[BlobCtor.__captured.length - 1];
    captured.push({
      filename: download,
      mimeType: last?.type ?? '',
      blobText: last?.text ?? '',
      objectUrl: href,
      revoked: false,
    });
  });

  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: revokeObjectURL,
  });
  Object.defineProperty(globalThis, 'Blob', {
    configurable: true,
    writable: true,
    value: trackedBlob,
  });
  HTMLAnchorElement.prototype.click = anchorClick;

  const handle: BrowserDownloadHandle = {
    createObjectURL,
    revokeObjectURL,
    Blob: trackedBlob as unknown as MockInstance<typeof Blob>,
    anchorClick,
    getCapturedDownloads: () => captured.slice(),
    clear: () => {
      captured.length = 0;
      BlobCtor.__captured.length = 0;
    },
  };

  activeHandle = handle;
  return handle;
}

export function uninstallBrowserDownloadMock(): void {
  if (!activeHandle) return;
  activeHandle = null;
  delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL;
  delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
}

export function useBrowserDownloadMock(): BrowserDownloadHandle {
  let handle: BrowserDownloadHandle | null = null;
  beforeEach(() => {
    handle = installBrowserDownloadMock();
  });
  afterEach(() => {
    handle?.clear();
    uninstallBrowserDownloadMock();
  });
  return handle!;
}
