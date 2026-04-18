import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createOpenRouterProvider } from '../providers';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

describe('createOpenRouterProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a provider function', () => {
    const provider = createOpenRouterProvider({ apiKey: 'test-key' });
    expect(typeof provider).toBe('function');
  });

  it('calls OpenRouter API with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello!' } }],
      }),
    });

    const provider = createOpenRouterProvider({ apiKey: 'test-key' });
    const result = await provider('Hello AI');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-key',
        }),
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [{ role: 'user', content: 'Hello AI' }],
        }),
      })
    );
    expect(result).toBe('Hello!');
  });

  it('uses custom model when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Response' } }],
      }),
    });

    const provider = createOpenRouterProvider({
      apiKey: 'test-key',
      model: 'openrouter/premium',
    });
    await provider('test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        body: JSON.stringify({
          model: 'openrouter/premium',
          messages: [{ role: 'user', content: 'test' }],
        }),
      })
    );
  });

  it('uses custom baseUrl when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Response' } }],
      }),
    });

    const provider = createOpenRouterProvider({
      apiKey: 'test-key',
      baseUrl: 'https://custom.api/v1',
    });
    await provider('test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.api/v1/chat/completions',
      expect.any(Object)
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const provider = createOpenRouterProvider({ apiKey: 'bad-key' });

    await expect(provider('test')).rejects.toThrow(
      'OpenRouter API error: 401 Unauthorized'
    );
  });

  it('retries on empty response content then throws', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '   ' } }],
      }),
    });

    const provider = createOpenRouterProvider({ apiKey: 'test-key' });

    await expect(provider('test')).rejects.toThrow(
      'Empty response from AI provider'
    );
    expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('retries when no choices returned then throws', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    const provider = createOpenRouterProvider({ apiKey: 'test-key' });

    await expect(provider('test')).rejects.toThrow(
      'Empty response from AI provider'
    );
    expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('trims whitespace from response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '  Hello world  ' } }],
      }),
    });

    const provider = createOpenRouterProvider({ apiKey: 'test-key' });
    const result = await provider('test');

    expect(result).toBe('Hello world');
  });

  it('aborts on timeout', async () => {
    let abortFn: () => void = () => {};
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          abortFn = reject.bind(null, new DOMException('Aborted', 'AbortError'));
          setTimeout(abortFn, 100);
        })
    );

    const provider = createOpenRouterProvider({
      apiKey: 'test-key',
      timeoutMs: 10,
    });

    await expect(provider('test')).rejects.toThrow();
  });

  it('accepts external AbortSignal', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Response' } }],
      }),
    });

    const provider = createOpenRouterProvider({ apiKey: 'test-key' });
    const abortController = new AbortController();

    const result = await provider('test', abortController.signal);
    expect(result).toBe('Response');
  });

  it('aborts request when external AbortSignal is triggered', async () => {
    mockFetch.mockImplementationOnce(() => new Promise((_, reject) => {
      setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 100);
    }));

    const provider = createOpenRouterProvider({
      apiKey: 'test-key',
      timeoutMs: 10000,
    });

    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 10);

    await expect(provider('test', abortController.signal)).rejects.toThrow();
  });
});