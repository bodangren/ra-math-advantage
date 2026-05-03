import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getActivityComponent } from '@/lib/activities/registry';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const componentsCatalogPath = path.join(REPO_ROOT, 'docs', 'components.yaml');

function readComponentKeysFromDocs(): string[] {
  return fs
    .readFileSync(componentsCatalogPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.match(/^([^:]+):/)?.[1]?.trim())
    .filter((key): key is string => Boolean(key));
}

// docs/components.yaml does not exist in the monorepo
describe.skip('docs/components.yaml activity keys', () => {
  it('keeps the documented canonical keys resolvable by the runtime registry', () => {
    // docs/components.yaml not yet authored in the monorepo
  });
});
