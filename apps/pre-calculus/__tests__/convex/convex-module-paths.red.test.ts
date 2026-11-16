import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const APP_DIRECTORY = process.cwd().endsWith(join('apps', 'pre-calculus'))
  ? process.cwd()
  : resolve(process.cwd(), 'apps', 'pre-calculus');
const CONVEX_DIRECTORY = join(APP_DIRECTORY, 'convex');
const GENERATED_API_PATH = join(CONVEX_DIRECTORY, '_generated', 'api.d.ts');
const EVIDENCE_ROUTE_PATH = join(
  APP_DIRECTORY,
  'app/api/learning-evidence/precalculus-pilot/route.ts',
);

async function listConvexSourceModules(
  directory = CONVEX_DIRECTORY,
  prefix = '',
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const modules: string[] = [];

  for (const entry of entries) {
    if (entry.name === '_generated') continue;
    const relativePath = `${prefix}${entry.name}`;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      modules.push(...await listConvexSourceModules(absolutePath, `${relativePath}/`));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      modules.push(relativePath);
    }
  }

  return modules;
}

describe('AP Precalculus Convex deployment module paths', () => {
  it('keeps every source Convex module path free of hyphens', async () => {
    const modules = await listConvexSourceModules();
    const hyphenatedModules = modules.filter((modulePath) => modulePath.includes('-'));

    expect(hyphenatedModules).toEqual([]);
  });

  it('requires regenerated API types to expose learningEvidence and no stale hyphenated module', async () => {
    const generatedApi = await readFile(GENERATED_API_PATH, 'utf8');

    expect(generatedApi).toContain('import type * as learningEvidence from "../learningEvidence.js";');
    expect(generatedApi).toContain('  learningEvidence: typeof learningEvidence;');
    expect(generatedApi).not.toContain('learning-evidence');
  });

  it('uses only the generated internal.learningEvidence.submit reference in the public evidence route', async () => {
    const routeSource = await readFile(EVIDENCE_ROUTE_PATH, 'utf8');

    expect(routeSource).toContain('internal.learningEvidence.submit');
    expect(routeSource).not.toContain("internalApi['learning-evidence']");
    expect(routeSource).not.toContain("'learning-evidence'?:");
    expect(routeSource).not.toContain('?? internalApi');
  });
});
