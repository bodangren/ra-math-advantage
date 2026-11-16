import { spawnSync } from 'node:child_process';
import { createPasswordCredential } from './password-hash.mjs';

const temporaryPassword = process.env.DANIELSON_ADMIN_TEMP_PASSWORD
  || (await import('node:crypto')).randomBytes(18).toString('base64url');
const credential = await createPasswordCredential(temporaryPassword);

const args = {
  organizationSlug: process.env.DANIELSON_ORGANIZATION_SLUG || 'school',
  organizationName: process.env.DANIELSON_ORGANIZATION_NAME || 'School',
  username: process.env.DANIELSON_ADMIN_USERNAME || 'admin',
  displayName: process.env.DANIELSON_ADMIN_DISPLAY_NAME || 'System Administrator',
  ...credential,
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
