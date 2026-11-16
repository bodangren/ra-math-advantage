# Q37 parent reproduction gates

## Result

All requested gates passed in `/tmp/precalc-q37-unit6-surface.NWwlxi`.

The root `node_modules/@math-platform` directory contains 21 package links. The `math-content` and `activity-components` links resolve to the candidate package directories.

## Commands and logs

Run from `packages/math-content`:

```text
npx vitest run src/schemas/__tests__/interval-classification-public-export.test.ts
```

Result: 1 test passed in 1 file.

Log: `/tmp/precalc-q37-parent-gate-math-content.log`

Run from `packages/activity-components`:

```text
npx vitest run src/__tests__/interval-classification-public-export.test.tsx src/__tests__/interval-classification-schema.test.ts src/__tests__/interval-classification-activity.test.tsx
```

Result: 14 tests passed in 3 files.

Log: `/tmp/precalc-q37-parent-gate-activity-components.log`

Run from `apps/pre-calculus`:

```text
npx vitest run __tests__/app/api/teacher/course/topic11-exposure-route.test.ts __tests__/app/api/teacher/course/topic11-surface-real-flow.test.ts __tests__/app/teacher/topic11-dashboard.test.tsx __tests__/components/course/Topic11ExposureForm.test.tsx
```

Result: 16 tests passed in 4 files.

Log: `/tmp/precalc-q37-parent-gate-teacher-surface.log`

Run from `apps/pre-calculus`:

```text
npm run lint
```

Result: passed with no warnings.

Log: `/tmp/precalc-q37-parent-gate-app-lint.log`

Run from `apps/pre-calculus`:

```text
npm run build
```

Result: passed. The output includes `/api/teacher/course`.

Log: `/tmp/precalc-q37-parent-gate-app-build.log`

Run from `apps/pre-calculus` after the build:

```text
npx tsc --noEmit --incremental false
```

Result: passed with no output.

Log: `/tmp/precalc-q37-parent-gate-app-post-build-tsc.log`

No source file, candidate patch, package link, or main worktree file was changed.
