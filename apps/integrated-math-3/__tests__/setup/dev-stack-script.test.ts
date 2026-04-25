import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('dev-stack script', () => {
  it('starts Convex from the app root without shell invocation', async () => {
    const scriptPath = path.resolve(process.cwd(), 'scripts/dev-stack.mjs');
    const script = await import(scriptPath);
    const processes = script.createProcesses(process.cwd());

    expect(processes).toEqual([
      {
        name: 'convex',
        command: 'npx',
        args: ['convex', 'dev', '--local'],
        cwd: process.cwd(),
      },
      {
        name: 'frontend',
        command: 'npx',
        args: ['vinext', 'dev'],
        cwd: process.cwd(),
      },
    ]);

    const source = fs.readFileSync(scriptPath, 'utf8');
    expect(source).not.toContain('shell: true');
  });

  it('waits for Convex readiness from process output instead of probing port 3210', async () => {
    const scriptPath = path.resolve(process.cwd(), 'scripts/dev-stack.mjs');
    const script = await import(scriptPath);
    const source = fs.readFileSync(scriptPath, 'utf8');

    expect(script.CONVEX_READY_PATTERN.test('Convex functions ready')).toBe(true);
    expect(source).toContain('waitForOutput');
    expect(source).not.toContain('Timeout waiting for port 3210');
  });
});
