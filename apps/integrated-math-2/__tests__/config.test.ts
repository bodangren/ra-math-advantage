import { describe, it, expect } from 'vitest';

describe('Config', () => {
  it('package.json has required scripts', async () => {
    const pkg = await import('../package.json');
    expect(pkg.default.scripts.dev).toBeDefined();
    expect(pkg.default.scripts.build).toBeDefined();
    expect(pkg.default.scripts.lint).toBeDefined();
    expect(pkg.default.scripts.test).toBeDefined();
    expect(pkg.default.scripts.typecheck).toBeDefined();
  });

  it('package.json has workspace dependencies', async () => {
    const pkg = await import('../package.json');
    const deps = pkg.default.dependencies;
    expect(deps['@math-platform/core-auth']).toBeDefined();
    expect(deps['@math-platform/core-convex']).toBeDefined();
  });
});
