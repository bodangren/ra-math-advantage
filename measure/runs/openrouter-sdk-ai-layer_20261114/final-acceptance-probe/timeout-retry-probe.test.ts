// Final acceptance probe. Audit script. It reports facts and asserts nothing about the answer.
// It compares the structured-output path (structured.ts) with the chat path (providers.ts)
// against two local mock servers:
//   hang:  a server that accepts a request and never answers. A request timeout shows as a
//          second request after about 15 s. No timeout shows as one request.
//   reset: a server that destroys each socket. Retries show as 3 requests (1 + 2 retries).
// The probe writes one line that starts with PROBE-RESULT for each scenario.
import http from "node:http";
import type { AddressInfo, Socket } from "node:net";
import { describe, it } from "vitest";
import { z } from "zod";

import { createOpenRouterProviderWithMessages } from "../../../../packages/ai-tutoring/src/providers";
import { resolveStructuredProviderFromEnv } from "../../../../packages/ai-tutoring/src/structured";

type Mode = "hang" | "reset";

interface MockServer {
  url: string;
  count: () => number;
  stop: () => Promise<void>;
}

function startServer(mode: Mode): Promise<MockServer> {
  const sockets = new Set<Socket>();
  let requests = 0;
  const server = http.createServer((req) => {
    requests += 1;
    req.resume();
    if (mode === "reset") {
      req.socket.destroy();
    }
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}/api/v1`,
        count: () => requests,
        stop: () =>
          new Promise<void>((done) => {
            for (const socket of sockets) socket.destroy();
            server.close(() => done());
          }),
      });
    });
  });
}

const KEY = "probe-key-probe-key";
const SCHEMA = z.strictObject({ a: z.string() });
const MESSAGES = [{ role: "user" as const, content: "probe" }];

function structuredProvider(baseUrl: string) {
  process.env.OPENROUTER_API_KEY = KEY;
  process.env.OPENROUTER_API_BASE = baseUrl;
  process.env.OPENROUTER_MODEL_SPREADSHEET_EVAL = "vendor/probe";
  const provider = resolveStructuredProviderFromEnv("spreadsheetEval");
  if (!provider) throw new Error("structured provider is null");
  return provider;
}

function chatProvider(baseUrl: string) {
  return createOpenRouterProviderWithMessages({
    apiKey: KEY,
    model: "vendor/probe",
    role: "studentTutor",
    baseUrl,
  });
}

function report(scenario: string, data: Record<string, unknown>) {
  process.stdout.write(`PROBE-RESULT ${JSON.stringify({ scenario, ...data })}\n`);
}

describe("final acceptance probe", () => {
  it("hang: the server never answers (observe 20 s)", async () => {
    const structuredServer = await startServer("hang");
    const chatServer = await startServer("hang");
    const structuredAbort = new AbortController();
    const chatAbort = new AbortController();

    let structuredState: unknown = "pending";
    let chatState: unknown = "pending";
    const structured = structuredProvider(structuredServer.url);
    const structuredPromise = structured({
      schemaName: "probe",
      schema: SCHEMA,
      messages: MESSAGES,
      abortSignal: structuredAbort.signal,
    }).then((value) => {
      structuredState = value;
    });
    const chat = chatProvider(chatServer.url);
    const chatPromise = chat(MESSAGES, chatAbort.signal).then(
      (value) => {
        chatState = { resolved: value };
      },
      (error: Error) => {
        chatState = { rejected: error.name };
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 20000));
    report("hang", {
      observed_seconds: 20,
      structured_requests_seen: structuredServer.count(),
      structured_state: structuredState,
      chat_requests_seen: chatServer.count(),
      chat_state: chatState,
    });

    structuredAbort.abort();
    chatAbort.abort();
    await Promise.allSettled([structuredPromise, chatPromise]);
    await structuredServer.stop();
    await chatServer.stop();
  });

  it("reset: the server destroys each socket", async () => {
    const structuredServer = await startServer("reset");
    const chatServer = await startServer("reset");

    const structured = structuredProvider(structuredServer.url);
    const structuredResult = await structured({
      schemaName: "probe",
      schema: SCHEMA,
      messages: MESSAGES,
    });
    const chat = chatProvider(chatServer.url);
    let chatOutcome: unknown;
    try {
      chatOutcome = { resolved: await chat(MESSAGES) };
    } catch (error) {
      chatOutcome = { rejected: (error as Error).message.slice(0, 60) };
    }

    report("reset", {
      structured_requests_seen: structuredServer.count(),
      structured_result: structuredResult,
      chat_requests_seen: chatServer.count(),
      chat_outcome: chatOutcome,
    });
    await structuredServer.stop();
    await chatServer.stop();
  });
});
