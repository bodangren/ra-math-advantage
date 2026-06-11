interface AssetFetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface CloudflareBindings {
  ASSETS: AssetFetcher;
}

interface ExecutionContextLike {
  waitUntil?(promise: Promise<unknown>): void;
}

type VinextHandler = (
  request: Request,
  env?: CloudflareBindings,
  ctx?: ExecutionContextLike,
) => Response | Promise<Response>;

let cachedHandlerPromise: Promise<VinextHandler> | null = null;

/**
 * Loads and caches the Vinext request handler from the built server output,
 * returning it on subsequent calls without re-importing.
 *
 * @returns A promise that resolves to the Vinext request handler function.
 * @throws {TypeError} If the module does not export a function as default.
 */
async function loadVinextHandler(): Promise<VinextHandler> {
  cachedHandlerPromise ??= import('../dist/server/index.js').then((module) => {
    if (typeof module.default !== 'function') {
      throw new TypeError(
        'Expected dist/server/index.js to export the built Vinext request handler.',
      );
    }

    return module.default as unknown as VinextHandler;
  });

  return cachedHandlerPromise;
}

const worker = {
  async fetch(
    request: Request,
    env: CloudflareBindings,
    ctx?: ExecutionContextLike,
  ): Promise<Response> {
    try {
      const handleRequest = await loadVinextHandler();
      return await handleRequest(request, env, ctx);
    } catch {
      return env.ASSETS.fetch(request);
    }
  },
};

export default worker;
