import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import { createPasswordCredential } from './password-hash.mjs';

export const DEMO_USERNAMES = [
  'demo.sysadmin',
  'demo.slt',
  'demo.head',
  'demo.hod.math',
  'demo.coach.primary',
  'demo.teacher.new',
  'demo.teacher.developing',
  'demo.teacher.experienced',
  'demo.teacher.pip',
  'demo.teacher.growth',
];

/** @param {Record<string, string | undefined>} [env] @param {string | null} [envFileText] */
export function requireDemoPassword(env = process.env, envFileText = null) {
  const fileValues = envFileText === null ? readLocalEnvFile() : parseEnv(envFileText);
  const password = env.DANIELSON_DEMO_PASSWORD || fileValues.DANIELSON_DEMO_PASSWORD;
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('DANIELSON_DEMO_PASSWORD is required');
  }
  return password;
}

export function isLocalConvexUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:'
      && (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]' || url.hostname === '::1');
  } catch {
    return false;
  }
}

function readLocalEnvFile() {
  try {
    return parseEnv(readFileSync(new URL('../.env.local', import.meta.url), 'utf8'));
  } catch {
    return {};
  }
}

/** @param {Record<string, string | undefined>} [env] @param {string | null} [envFileText] */
export function readConvexUrl(env = process.env, envFileText = null) {
  const fileValues = envFileText === null
    ? readLocalEnvFile()
    : parseEnv(envFileText);
  const value = env.NEXT_PUBLIC_CONVEX_URL || fileValues.NEXT_PUBLIC_CONVEX_URL;
  if (!value || !isLocalConvexUrl(value)) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL must be a local Convex URL');
  }
  return value;
}

export function buildSeedCommand({ convexUrl, payload = undefined, npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx' }) {
  const args = ['convex', 'run', 'demo:seedLocalDemo'];
  if (payload) args.push(JSON.stringify(payload));
  args.push('--url', convexUrl);
  return { command: npxCommand, args };
}

export async function createCredentialPayloads(usernames, password) {
  return Promise.all(usernames.map(async (username) => ({
    username,
    ...(await createPasswordCredential(password)),
    mustChangePassword: false,
  })));
}

export function formatSeedOutput(result, _password) {
  return JSON.stringify({
    kind: result.kind,
    ...(result.reason ? { reason: result.reason } : {}),
    usernames: result.kind === 'conflict' ? [] : result.usernames,
  }, null, 2);
}

export function seedResultExitCode(kind) {
  return kind === 'created' || kind === 'already_seeded' ? 0 : 1;
}

async function main() {
  const password = requireDemoPassword();
  const convexUrl = readConvexUrl();
  const credentials = await createCredentialPayloads(DEMO_USERNAMES, password);
  const payload = {
    organizationSlug: 'danielson-school',
    organizationName: 'Danielson School',
    referenceTime: Date.now(),
    credentials,
  };
  const command = buildSeedCommand({ convexUrl, payload });
  const result = spawnSync(command.command, command.args, {
    stdio: ['ignore', 'pipe', 'inherit'],
    encoding: 'utf8',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  const parsed = JSON.parse(result.stdout.trim());
  const output = formatSeedOutput({
    kind: parsed.kind,
    ...(parsed.reason ? { reason: parsed.reason } : {}),
    usernames: DEMO_USERNAMES,
  }, password);
  process.stdout.write(`${output}\n`);
  process.exitCode = seedResultExitCode(parsed.kind);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
