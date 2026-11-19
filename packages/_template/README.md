# @math-platform/template

Starter template for creating new packages in the `ra-integrated-math-3` monorepo.

## Usage

To create a new package, copy this directory and update:

```bash
cp -r packages/_template packages/<your-package-name>
```

## Required Files

| File | Purpose |
|------|---------|
| `package.json` | Package metadata, name, exports, dependencies |
| `tsconfig.json` | TypeScript config (extends root `tsconfig.json`) |
| `vitest.config.ts` | Test runner configuration |
| `src/index.ts` | Public API entry point |
| `src/__tests__/` | Test files |
| `README.md` | This file |

## Setup Steps

### 1. Update `package.json`

```json
{
  "name": "@math-platform/<your-package-name>",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    }
  },
  "scripts": {
    "typecheck": "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 src",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 2. Update `tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### 3. Create `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

### 4. Write public API in `src/index.ts`

```typescript
// Export all public APIs
export { functionA, functionB } from './function-a';
export type { TypeA, TypeB } from './types';
```

## Structure

```
packages/<your-package>/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts              # Public API (re-export everything here)
│   ├── __tests__/
│   │   └── *.test.ts         # Unit tests
│   ├── function-a.ts
│   └── types.ts
└── README.md
```

## Testing Requirements

Every exported public function and type must have tests:

```typescript
// src/__tests__/function-a.test.ts
import { describe, it, expect } from 'vitest';
import { functionA } from '../function-a';

describe('functionA', () => {
  it('should do X when Y', () => {
    expect(functionA(input)).toBe(expected);
  });
});
```

Run tests:
```bash
npm run ws --workspace=@math-platform/<your-package-name> test
```

## Boundary Rules (Non-Negotiable)

This package MUST NOT:
- Import from `apps/*` (IM3 or BM2 app code)
- Import from `convex/_generated/*` (generated Convex APIs)
- Contain business-domain code (accounting, spreadsheets, simulations)
- Contain curriculum data (question banks, glossary terms, lesson content)
- Contain asset files (images, fonts, `.xlsx` workbooks)

If you need Convex access, use injected adapter interfaces.

## Verification

Before committing, run:

```bash
# Typecheck
npm run ws --workspace=@math-platform/<your-package-name> typecheck

# Test
npm run ws --workspace=@math-platform/<your-package-name> test

# Full app gates (after adoption in IM3 and BM2)
cd apps/integrated-math-3 && npm run lint && npm test && npm run typecheck && npm run build
cd apps/bus-math-v2 && npm run lint && npm test && npm run build && npm run typecheck
```

## Publishing

Packages are workspace-internal. No npm publish needed for local development.

## See Also

- [Root INTEGRATION.md](../../INTEGRATION.md) — Full monorepo integration guide