import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPRESENTATIVE_ROUTES, A11Y_ROUTES } from './a11y-routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_ROOT = resolve(__dirname, '../../app');

function resolveRoutePath(route: string): string {
  // Dynamic segments like [lessonSlug] are represented literally in the file tree.
  const filePath = route.replace(/^\//, '').replace(/\/$/, '') + '/page.tsx';
  return resolve(APP_ROOT, filePath);
}

describe('REPRESENTATIVE_ROUTES', () => {
  it('has exactly six routes', () => {
    expect(REPRESENTATIVE_ROUTES.length).toBe(6);
  });

  it('every route resolves to a real app/.../page.tsx', () => {
    for (const route of REPRESENTATIVE_ROUTES) {
      expect(existsSync(resolveRoutePath(route))).toBe(true);
    }
  });

  it('covers all four Phase 1 risk categories', () => {
    const allCategories = A11Y_ROUTES.flatMap((r) => r.riskCategories);
    const uniqueCategories = new Set(allCategories);

    expect(uniqueCategories.has('form')).toBe(true);
    expect(uniqueCategories.has('landmark')).toBe(true);
    expect(uniqueCategories.has('activity')).toBe(true);
    expect(uniqueCategories.has('color-state')).toBe(true);
  });
});
