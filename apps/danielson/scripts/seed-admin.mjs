import { randomBytes, webcrypto } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const iterations = 120_000;
const temporaryPassword = process.env.DANIELSON_ADMIN_TEMP_PASSWORD
  || randomBytes(18).toString('base64url');
const salt = randomBytes(16).toString('base64url');
const key = await webcrypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(temporaryPassword),
  'PBKDF2',
  false,
  ['deriveBits'],
);
const derived = await webcrypto.subtle.deriveBits({
  name: 'PBKDF2',
  hash: 'SHA-256',
  salt: new TextEncoder().encode(salt),
  iterations,
}, key, 256);

const args = {
  organizationSlug: process.env.DANIELSON_ORGANIZATION_SLUG || 'school',
  organizationName: process.env.DANIELSON_ORGANIZATION_NAME || 'School',
  username: process.env.DANIELSON_ADMIN_USERNAME || 'admin',
  displayName: process.env.DANIELSON_ADMIN_DISPLAY_NAME || 'System Administrator',
  passwordHash: Buffer.from(derived).toString('base64url'),
  passwordSalt: salt,
  passwordHashIterations: iterations,
};
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, [
  'convex',
  'run',
  'foundation:bootstrapFirstSysadmin',
  JSON.stringify(args),
  '--prod',
], { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });

if (result.status !== 0) process.exit(result.status ?? 1);
const output = result.stdout.trim();
process.stdout.write(`${output}\n`);
if (output.includes('"created"')) {
  process.stdout.write(`Temporary administrator password: ${temporaryPassword}\n`);
  process.stdout.write('The administrator must change this password at first sign-in.\n');
}
