# @math-platform/template

Starter template for creating new packages in the math-platform monorepo.

## Usage

To create a new package, copy this directory and update:

1. Update `package.json`:
   - Change `name` to your package name (e.g., `@math-platform/practice-core`)
   - Update `main` and `types` if your entry point differs
   - Add your package's dependencies

2. Update `tsconfig.json` if needed

3. Add your package code in `src/`

4. Export public APIs from `src/index.ts`

## Structure

```
packages/<your-package>/
├── package.json       # Package metadata and scripts
├── tsconfig.json      # TypeScript config (extends root)
├── src/
│   └── index.ts       # Public API entry point
└── README.md          # This file
```

## Workspace Integration

After creating your package:
1. Add it to the `workspaces` array in root `package.json` (if not using `apps/*` or `packages/*` pattern)
2. Run `npm install` to link the package
3. Verify with `npm run --workspace=@math-platform/<your-package> typecheck`
