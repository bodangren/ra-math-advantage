// Runs the package provider inside workerd against a local mock OpenRouter server.
// Exits 0 when the worker returns "probe-ok", and 1 otherwise.

import { spawn } from "node:child_process";
import http from "node:http";
import { setTimeout as delay } from "node:timers/promises";

const MOCK_PORT = 4299;
const PROBE_PORT = 4298;
const PROBE_URL = `http://127.0.0.1:${PROBE_PORT}/`;

const mock = http.createServer((req, res) => {
  if (req.url !== "/api/v1/chat/completions") {
    res.writeHead(404);
    res.end();
    return;
  }
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        id: "probe-1",
        created: 1,
        model: "probe/model",
        object: "chat.completion",
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "probe-ok" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
    );
  });
});

function stopGroup(child) {
  if (!child || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      // Already stopped.
    }
  }
}

async function main() {
  await new Promise((resolve, reject) => {
    mock.once("error", reject);
    mock.listen(MOCK_PORT, "127.0.0.1", resolve);
  });

  const wrangler = spawn(
    "npx",
    [
      "wrangler",
      "dev",
      "--config",
      "workerd-probe/wrangler.jsonc",
      "--port",
      String(PROBE_PORT),
      "--local",
      "--var",
      "OPENROUTER_API_KEY:probe-key",
      "--var",
      "OPENROUTER_API_BASE:http://127.0.0.1:4299/api/v1",
    ],
    { stdio: ["ignore", "pipe", "pipe"], detached: true },
  );
  let log = "";
  wrangler.stdout.on("data", (chunk) => {
    log += chunk.toString();
  });
  wrangler.stderr.on("data", (chunk) => {
    log += chunk.toString();
  });

  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (wrangler.exitCode !== null) break;
      try {
        await fetch(PROBE_URL);
        ready = true;
        break;
      } catch {
        await delay(1000);
      }
    }
    if (!ready) {
      console.error("workerd probe: wrangler dev did not become ready");
      console.error(log.slice(-4000));
      process.exitCode = 1;
      return;
    }

    const response = await fetch(PROBE_URL);
    const body = await response.text();
    if (response.ok && body.trim() === "probe-ok") {
      console.log("workerd probe: probe-ok");
    } else {
      console.error(`workerd probe: unexpected response ${response.status} ${body.slice(0, 200)}`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("workerd probe failed:", error);
    process.exitCode = 1;
  } finally {
    stopGroup(wrangler);
    await new Promise((resolve) => mock.close(resolve));
  }
}

main();
