import { createRequire } from "node:module";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

export function createProcesses() {
  const require = createRequire(import.meta.url);
  const convexRoot = path.dirname(require.resolve("convex/package.json"));
  return [
    {
      name: "convex",
      command: process.execPath,
      args: [path.join(convexRoot, "bin/main.js"), "dev", "--start", "npm run dev"],
    },
  ];
}

export function runDevStack(processes = createProcesses()) {
  const children = new Set();
  let shuttingDown = false;

  function stopChildren(signal = "SIGTERM") {
    for (const child of children) {
      if (child.killed) {
        continue;
      }

      if (process.platform !== "win32" && typeof child.pid === "number") {
        try {
          process.kill(-child.pid, signal);
          continue;
        } catch {
          // Fall through to direct child termination when the process group no longer exists.
        }
      }

      child.kill(signal);
    }
  }

  function exitWith(code) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    stopChildren("SIGTERM");
    setTimeout(() => stopChildren("SIGKILL"), 3000).unref();
    process.exit(code);
  }

  for (const processConfig of processes) {
    const child = spawn(processConfig.command, processConfig.args, {
      stdio: "inherit",
      env: process.env,
      detached: process.platform !== "win32",
    });

    children.add(child);

    child.on("exit", (code, signal) => {
      children.delete(child);

      if (shuttingDown) {
        return;
      }

      if (signal) {
        exitWith(1);
        return;
      }

      exitWith(code ?? 1);
    });

    child.on("error", (error) => {
      console.error(`[dev:stack] Failed to start ${processConfig.name}:`, error);
      exitWith(1);
    });
  }

  process.on("SIGINT", () => exitWith(130));
  process.on("SIGTERM", () => exitWith(143));
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  runDevStack();
}
