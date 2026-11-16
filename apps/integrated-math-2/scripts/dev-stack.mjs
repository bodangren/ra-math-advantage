import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const APP_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const CONVEX_READY_PATTERN = /functions ready/i;
export function createProcesses(appRoot = APP_ROOT) {
  return [
    {
      name: "convex",
      command: "npx",
      args: [
        "--no-install",
        "convex",
        "dev",
        "--local-cloud-port",
        "3222",
        "--local-site-port",
        "3223",
      ],
      cwd: appRoot,
    },
    {
      name: "frontend",
      command: "npx",
      args: ["--no-install", "vinext", "dev", "--port", "3002"],
      cwd: appRoot,
    },
  ];
}
export function waitForOutput(
  proc,
  pattern = CONVEX_READY_PATTERN,
  timeout = 120000,
) {
  return new Promise((resolve, reject) => {
    let output = "";
    const cleanup = () => {
      clearTimeout(timer);
      proc.stdout?.off("data", onData);
      proc.stderr?.off("data", onData);
      proc.off("exit", onExit);
      proc.off("error", onError);
    };
    const onData = (data) => {
      output = (output + data.toString()).slice(-8192);
      if (pattern.test(output)) {
        cleanup();
        resolve();
      }
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`Process exited before readiness (${code})`));
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Process readiness timed out"));
    }, timeout);
    proc.stdout?.on("data", onData);
    proc.stderr?.on("data", onData);
    proc.on("exit", onExit);
    proc.on("error", onError);
  });
}
function stopChild(child, signal) {
  if (process.platform !== "win32" && child.pid) {
    try {
      process.kill(-child.pid, signal);
      return;
    } catch {
      /* The group has already stopped. */
    }
  }
  if (child.exitCode === null && child.signalCode === null) child.kill(signal);
}
export async function runDevStack(processes = createProcesses()) {
  const localEnv = parse(readFileSync(path.join(APP_ROOT, ".env.local")));
  if (!/^(anonymous|local):/.test(localEnv.CONVEX_DEPLOYMENT ?? ""))
    throw new Error(
      "Select an IM2 local Convex deployment before starting this stack.",
    );
  const childEnv = {
    ...process.env,
    ...localEnv,
    CONVEX_AGENT_MODE: localEnv.CONVEX_DEPLOYMENT.startsWith("anonymous:")
      ? "anonymous"
      : process.env.CONVEX_AGENT_MODE,
  };
  const children = [];
  let shuttingDown = false;
  const shutdown = async (code) => {
    if (shuttingDown) return;
    shuttingDown = true;
    process.exitCode = code;
    await Promise.all(
      children.map(
        (child) =>
          new Promise((resolve) => {
            if (child.exitCode !== null || child.signalCode !== null) {
              resolve();
              return;
            }
            const timer = setTimeout(() => {
              stopChild(child, "SIGKILL");
              resolve();
            }, 3000);
            child.once("exit", () => {
              clearTimeout(timer);
              resolve();
            });
            stopChild(child, "SIGTERM");
          }),
      ),
    );
  };
  process.once("SIGINT", () => void shutdown(130));
  process.once("SIGTERM", () => void shutdown(143));
  for (const config of processes) {
    if (shuttingDown) return;
    const child = spawn(config.command, config.args, {
      cwd: config.cwd,
      env: childEnv,
      stdio: "pipe",
      detached: process.platform !== "win32",
    });
    children.push(child);
    const ready = waitForOutput(
      child,
      config.name === "convex"
        ? CONVEX_READY_PATTERN
        : /Local:\s+http:\/\/(?:localhost|127\.0\.0\.1):3002/,
    );
    child.stdout.on("data", (data) =>
      process.stdout.write(`[${config.name}] ${data}`),
    );
    child.stderr.on("data", (data) =>
      process.stderr.write(`[${config.name}] ${data}`),
    );
    child.on("exit", (code) => {
      if (!shuttingDown) void shutdown(code || 1);
    });
    try {
      await ready;
    } catch (error) {
      console.error(error.message);
      await shutdown(1);
      return;
    }
  }
  console.log("IM2 is ready at http://localhost:3002. Convex uses port 3222.");
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  runDevStack().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
