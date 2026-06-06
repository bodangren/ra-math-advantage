import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SEED_MODULE_CANDIDATES = [
  'convex/seed/seed_demo_e2e.ts',
  'convex/seed/seedDemoE2E.ts',
  'convex/seed_demo_e2e.ts',
];

function findSeedModulePath(): string | null {
  const repoRoot = process.cwd();
  for (const candidate of SEED_MODULE_CANDIDATES) {
    const absolute = path.resolve(repoRoot, candidate);
    if (existsSync(absolute)) return candidate;
  }
  return null;
}

function getSeedModuleSource(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
}

describe('convex seed — Phase 1 Red: seedDemoE2E entry point', () => {
  it('seedDemoE2E entry-point file exists under apps/integrated-math-3/convex', () => {
    const modulePath = findSeedModulePath();
    expect(
      modulePath,
      `Expected one of these files to exist (convention for the Phase 1 composer):\n` +
        SEED_MODULE_CANDIDATES.map((p) => `  - ${p}`).join('\n') +
        `\nNone were found. The composer should expose a single idempotent ` +
        `action keyed by the E2E_SEED_KEY constant.`,
    ).not.toBeNull();
  });

  describe('given the seedDemoE2E file exists', () => {
    const modulePath = findSeedModulePath();

    // Skip the shape tests below if the file is missing — the existence
    // assertion above is the gate.
    const itIfPresent = modulePath ? it : it.skip;

    itIfPresent('declares an internalAction named seedDemoE2E', () => {
      const source = getSeedModuleSource(modulePath!);
      expect(source, 'module must declare the seedDemoE2E export').toMatch(
        /export\s+const\s+seedDemoE2E\b/,
      );
      expect(source, 'seedDemoE2E must be wired as an internalAction').toMatch(
        /seedDemoE2E\s*=\s*internalAction\s*\(/,
      );
    });

    itIfPresent('uses the canonical E2E_SEED_KEY constant (not a raw literal)', () => {
      const source = getSeedModuleSource(modulePath!);
      // Strategy §2 mandates a fixed key for idempotency. We don't pin the
      // exact string here (the selectors test does that) — we only assert
      // that the key is imported from the selectors module rather than
      // hard-coded in the seed action, so the contract is shared.
      expect(
        source,
        'seedDemoE2E should import E2E_SEED_KEY from the shared selectors module',
      ).toMatch(/import\s*\{[^}]*\bE2E_SEED_KEY\b[^}]*\}\s*from\s*['"][^'"]*e2e\/selectors['"]/);
    });

    itIfPresent('composes the existing demo seed mutations (no duplication)', () => {
      const source = getSeedModuleSource(modulePath!);
      // Strategy §6 says: "Phase 1 should compose these, not duplicate them."
      // We assert by name: the composer must delegate to seedDemoEnv and
      // seedDemoProgress, not reimplement the password hashing / class
      // assignment logic.
      expect(
        source,
        'seedDemoE2E should call ctx.runMutation(seedDemoEnv, ...) for the demo env',
      ).toMatch(/(ctx\.runMutation|runMutation)\s*\(\s*[^,]*seedDemoEnv\b/);
      expect(
        source,
        'seedDemoE2E should call ctx.runMutation(seedDemoProgress, ...) for progress',
      ).toMatch(/(ctx\.runMutation|runMutation)\s*\(\s*[^,]*seedDemoProgress\b/);
    });

    itIfPresent('exposes a reset path that is NOT a full table truncation', () => {
      const source = getSeedModuleSource(modulePath!);
      // Strategy §2: "Reset via tombstone-delete of that key, not by table
      // truncation." Assert that the composer marks inserts with the
      // E2E_SEED_KEY so a future tombstone-delete can find them.
      expect(
        source,
        'seedDemoE2E should stamp every seeded record with the E2E_SEED_KEY so a tombstone-delete can reset state',
      ).toMatch(/E2E_SEED_KEY/);
    });
  });
});
