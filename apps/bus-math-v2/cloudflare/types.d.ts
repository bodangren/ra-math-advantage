declare module '../dist/server/index.js' {
  const handler: (
    request: Request,
    env?: unknown,
    ctx?: { waitUntil?: (promise: Promise<unknown>) => void },
  ) => Response | Promise<Response>;
  export default handler;
}
