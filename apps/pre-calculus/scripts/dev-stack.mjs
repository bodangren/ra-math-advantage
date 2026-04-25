import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEV_PORT = 3000;

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONVEX_READY_PATTERN = /functions ready/i;

export function createProcesses(appRoot = APP_ROOT) {
  return [
    {
      name: 'convex',
      command: 'npx',
      args: ['convex', 'dev', '--local'],
      cwd: appRoot,
    },
    {
      name: 'frontend',
      command: 'npx',
      args: ['vinext', 'dev'],
      cwd: appRoot,
    },
  ];
}

function waitForPort(port, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for port ${port}`));
        return;
      }

      const socket = new createServer();
      socket.listen(port, () => {
        socket.close();
        setTimeout(check, 500);
      });
      socket.on('error', () => {
        resolve();
      });
    };

    check();
  });
}

export function waitForOutput(proc, pattern = CONVEX_READY_PATTERN, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      proc.stdout?.off('data', onData);
      proc.stderr?.off('data', onData);
    };

    const onData = (data) => {
      if (pattern.test(data.toString())) {
        cleanup();
        resolve();
      }
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout waiting for Convex readiness output'));
    }, timeout);

    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onData);
  });
}

function runProcess(processConfig, env = process.env) {
  const child = spawn(processConfig.command, processConfig.args, {
    stdio: 'pipe',
    cwd: processConfig.cwd,
    env: {
      ...env,
      SENTRY_DSN: '',
      CONVEX_TELEMETRY: 'off',
      CONVEX_DISABLE_TELEMETRY: '1',
    },
    detached: process.platform !== 'win32',
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${processConfig.name}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${processConfig.name}] ${data}`);
  });

  child.on('close', (code) => {
    console.log(`[${processConfig.name}] exited with code ${code}`);
  });

  return child;
}

function stopChild(child, signal = 'SIGTERM') {
  if (child.killed) {
    return;
  }

  if (process.platform !== 'win32' && typeof child.pid === 'number') {
    try {
      process.kill(-child.pid, signal);
      return;
    } catch {
      // Fall through to direct child termination when the process group is gone.
    }
  }

  child.kill(signal);
}

export async function runDevStack(processes = createProcesses()) {
  console.log('Starting development stack...\n');

  const children = new Set();
  let shuttingDown = false;

  const shutdown = (code = 0) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log('\nShutting down...');
    for (const child of children) {
      stopChild(child, 'SIGTERM');
    }
    setTimeout(() => {
      for (const child of children) {
        stopChild(child, 'SIGKILL');
      }
    }, 3000).unref();
    process.exit(code);
  };

  const convexConfig = processes.find((processConfig) => processConfig.name === 'convex');
  const frontendConfig = processes.find((processConfig) => processConfig.name === 'frontend');

  if (!convexConfig || !frontendConfig) {
    throw new Error('dev-stack requires convex and frontend process configs');
  }

  console.log('Starting Convex dev server...');
  const convex = runProcess(convexConfig);
  children.add(convex);

  try {
    await waitForOutput(convex);
    console.log('Convex is ready!');
  } catch (err) {
    console.error('Failed to start Convex:', err.message);
    shutdown(1);
  }

  console.log('Starting frontend dev server...');
  const frontend = runProcess(frontendConfig);
  children.add(frontend);

  try {
    await waitForPort(DEV_PORT);
    console.log('\nDevelopment stack is ready!');
    console.log(`   - Convex: http://127.0.0.1:3210`);
    console.log(`   - Frontend: http://localhost:${DEV_PORT}`);
    console.log('\nPress Ctrl+C to stop both servers.\n');
  } catch {
    console.error('Frontend may still be starting...');
  }

  process.on('SIGINT', () => shutdown(130));
  process.on('SIGTERM', () => shutdown(143));
}

const isDirectExecution =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  runDevStack().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
}
