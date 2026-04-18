import { spawn } from 'child_process';
import { createServer } from 'net';

const CONVEX_PORT = 3210;
const DEV_PORT = 3000;

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
        // Port is in use, service is ready
        resolve();
      });
    };
    
    check();
  });
}

function runCommand(command, args, label, env = {}) {
  const proc = spawn(command, args, {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, ...env },
  });

  proc.stdout.on('data', (data) => {
    process.stdout.write(`[${label}] ${data}`);
  });

  proc.stderr.on('data', (data) => {
    process.stderr.write(`[${label}] ${data}`);
  });

  proc.on('close', (code) => {
    console.log(`[${label}] exited with code ${code}`);
  });

  return proc;
}

async function main() {
  console.log('🚀 Starting development stack...\n');

  // Start Convex dev server
  console.log('📦 Starting Convex dev server...');
  const convex = runCommand('npx', ['convex', 'dev'], 'convex', {
    SENTRY_DSN: '',
    CONVEX_TELEMETRY: 'off',
    CONVEX_DISABLE_TELEMETRY: '1',
  });

  // Wait for Convex to be ready
  try {
    await waitForPort(CONVEX_PORT);
    console.log('✅ Convex is ready on port', CONVEX_PORT);
  } catch (err) {
    console.error('❌ Failed to start Convex:', err.message);
    convex.kill();
    process.exit(1);
  }

  // Start the frontend dev server
  console.log('🌐 Starting frontend dev server...');
  const frontend = runCommand('vinext', ['dev'], 'frontend');

  // Wait for frontend to be ready
  try {
    await waitForPort(DEV_PORT);
    console.log('\n✅ Development stack is ready!');
    console.log(`   - Convex: http://127.0.0.1:${CONVEX_PORT}`);
    console.log(`   - Frontend: http://localhost:${DEV_PORT}`);
    console.log('\nPress Ctrl+C to stop both servers.\n');
  } catch {
    console.error('⚠️  Frontend may still be starting...');
  }

  // Handle shutdown gracefully
  const shutdown = () => {
    console.log('\n🛑 Shutting down...');
    convex.kill();
    frontend.kill();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
