import { describe, expect, it } from 'vitest';

import { DEMO_USERNAMES } from '../../lib/demo/scenarios';
import {
  buildSeedCommand,
  createCredentialPayloads,
  formatSeedOutput,
  isLocalConvexUrl,
  readConvexUrl,
  requireDemoPassword,
  seedResultExitCode,
} from '../../scripts/seed-demo.mjs';

describe('local demo seed command boundary', () => {
  it('requires the demo password', () => {
    expect(() => requireDemoPassword({})).toThrow('DANIELSON_DEMO_PASSWORD is required');
    expect(requireDemoPassword({ DANIELSON_DEMO_PASSWORD: 'demo-secret' })).toBe('demo-secret');
    expect(requireDemoPassword({}, 'DANIELSON_DEMO_PASSWORD=from-file')).toBe('from-file');
  });

  it.each([
    'http://localhost:3210',
    'http://127.0.0.1:3210',
    'http://[::1]:3210',
  ])('accepts loopback Convex URL %s', (url) => {
    expect(isLocalConvexUrl(url)).toBe(true);
  });

  it.each([
    'https://example.convex.cloud',
    'https://danielson-school.convex.cloud',
    'file:///tmp/convex',
  ])('rejects non-local Convex URL %s', (url) => {
    expect(isLocalConvexUrl(url)).toBe(false);
  });

  it('builds an internal local command without a production flag', () => {
    const command = buildSeedCommand({
      convexUrl: 'http://127.0.0.1:3210',
      npxCommand: 'npx',
    });

    expect(command).toEqual({
      command: 'npx',
      args: ['convex', 'run', 'demo:seedLocalDemo', '--url', 'http://127.0.0.1:3210'],
    });
    expect(command.args).not.toContain('--prod');
    expect(command.args.join(' ')).not.toContain('demo-secret');
  });

  it('creates one unique salted credential for each stable username', async () => {
    const credentials = await createCredentialPayloads([...DEMO_USERNAMES], 'demo-secret');

    expect(credentials).toHaveLength(10);
    expect(new Set(credentials.map((credential) => credential.username)).size).toBe(10);
    expect(new Set(credentials.map((credential) => credential.passwordSalt)).size).toBe(10);
    expect(credentials.every((credential) => credential.mustChangePassword === false)).toBe(true);
  });

  it('prints the result and usernames without the password', () => {
    const output = formatSeedOutput(
      { kind: 'created', usernames: [...DEMO_USERNAMES] },
      'demo-secret',
    );

    expect(output).toContain('created');
    expect(output).toContain('demo.slt');
    expect(output).not.toContain('demo-secret');
  });

  it('reads the local Convex URL from the environment file', () => {
    expect(readConvexUrl({}, 'NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210'))
      .toBe('http://127.0.0.1:3210');
  });

  it('preserves a seed conflict reason and returns a failing exit code', () => {
    const output = formatSeedOutput({
      kind: 'conflict',
      reason: 'unrelated_organization_exists',
    }, 'demo-secret');

    expect(output).toContain('unrelated_organization_exists');
    expect(seedResultExitCode('conflict')).toBe(1);
    expect(seedResultExitCode('created')).toBe(0);
    expect(seedResultExitCode('already_seeded')).toBe(0);
  });
});
