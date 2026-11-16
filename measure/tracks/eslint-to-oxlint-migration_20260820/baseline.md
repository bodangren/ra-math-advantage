# ESLint to Oxlint Migration Baseline

## Preflight

- Start commit: `45c95cec58b68a6bf2daf1ae1d829e758eaab335`
- Worktree: main worktree, branch `master`
- Node.js: `v24.18.0`
- npm: `11.16.0`
- Oxlint: `1.79.0`
- ESLint: `10.4.1`
- Workspace dependency tree: exit 0 from `npm ls --workspaces --depth=0`
- Audit: exit 1 because advisories exist; counts are 0 info, 1 low, 1 moderate,
  15 high, 0 critical, 17 total.
- `npm audit fix` was not run.

## Concurrent Worktree State

The worktree contained 135 changes before this track started. The changes are
owned by other live agents. They include application source and tests, two
application manifests, `package-lock.json`, generated architecture data,
`scripts/architecture/architecture.manifest.json`, and Measure records.

The following migration targets were already dirty:

- `apps/bus-math-v2/package.json`
- `apps/pre-calculus/package.json`
- `package-lock.json`
- `measure/generated/architecture.json`
- `scripts/architecture/architecture.manifest.json`
- `measure/tracks.md`

Do not use the dirty worktree as clean ESLint-to-Oxlint parity evidence. Use the
recorded start commit and review the pre-existing diff before each edit to a
dirty target. Preserve all unrelated hunks.

## Governed Workspace Inventory

The architecture manifest contains six application workspaces and 20 package
workspaces. `packages/_template` is excluded from the 26 governed lint scripts.

## Quality Gate Baseline

The full package and application test, typecheck, build, and lint baselines are
not yet recorded. The current dirty worktree contains concurrent source and
manifest changes, so those commands must not be used as migration parity
evidence until the concurrent changes have a recorded commit boundary.

The current lint commands are diagnostic only. The package dispatcher and all
six application lint aliases exited 0 in the dirty worktree.

The diagnostic script completed the package test, typecheck, and build gates
with exit 0. It entered the Bus Math 2 application test gate and ran for more
than eight minutes without an exit status. The process was stopped. The
remaining application test, typecheck, and build gates were not captured.
This is an incomplete dirty-worktree baseline, not migration parity evidence.

The later application diagnostics recorded these results:

| Command group | Bus Math 2 | Danielson | Integrated Math 1 | Integrated Math 2 | Integrated Math 3 | Precalculus |
|---|---:|---:|---:|---:|---:|---:|
| `lint` | 0 | 0 | 0 | 0 | 0 | 0 |
| `typecheck` | 2 | 0 | 0 | 0 | 0 | 0 |
| `build` | 0 | 0 | 0 | 0 | 0 | 0 |
| `test` | stopped after 8 minutes | 1 | 1 | 1 | 1 | 1 |

The application test failures are pre-existing dirty-worktree failures. The
reported failures include Danielson 6 files and 8 tests, Integrated Math 1 2
files and 1 test, Integrated Math 2 3 files and 45 tests, Integrated Math 3 24
files and 70 tests, and Precalculus 7 files and 20 tests. The Bus Math 2 test
did not produce a result before the diagnostic timeout. Do not repair these
failures in this migration.

## Rule Inventory Findings

Oxlint 1.79.0 registers the JSX accessibility plugin as `jsx-a11y`. Its rule
inventory reports the internal scope as `jsx_a11y`; the policy uses the public
`jsx-a11y/*` configuration namespace for the six active rules.

Oxlint 1.79.0 does not register native TypeScript names for three retained
rules. Controlled TypeScript probes in the package workspace matched the
legacy behavior and severity through these native core aliases:

- `@typescript-eslint/no-array-constructor` → `no-array-constructor`
- `@typescript-eslint/no-unused-expressions` → `no-unused-expressions`
- `@typescript-eslint/no-unused-vars` → `no-unused-vars`

The final parity harness must verify these aliases with JSON diagnostics before
the migration can proceed.

The current `packages/lesson-renderer/eslint.config.mjs` print-config result
sets `@typescript-eslint/no-unused-vars` to error in test files because its
later global rule overrides its earlier test override. The track specification
requires this rule to be off in `lesson-renderer-test`. This is a policy
discrepancy. The parity harness must report it rather than hide it.

## Compatibility Dependency Contract

Registry metadata at track start recorded these approved candidates:

| Package | Version | Peer range |
|---|---:|---|
| `oxlint-plugin-eslint` | `1.79.0` | No peer range returned by the registry query |
| `eslint-plugin-react` | `7.37.5` | ESLint `^3` through `^9.7` |
| `eslint-plugin-react-hooks` | `7.1.1` | ESLint `^3` through `^10` |

The React plugin 7.37.5 peer range does not accept ESLint 10. The final
cutover must not retain an ESLint 10 root override. Any retained ESLint package
must exist only as a peer resolution required by an approved compatibility
plugin. The dependency operation was approved by the repository owner and
completed in the cutover commit.

## Dual-Engine Parity Verification

A temporary dual-run adapter used the pre-cutover ESLint 10.4.1 configurations
and the final Oxlint 1.79.0 configuration. The adapter and its dependency
installation were outside the repository.

- 700 controlled cases ran through both engines.
- The cases produced zero behavior, rule-identity, severity, or line-number
  mismatches.
- The six application scopes and 20 package scopes from the start commit each
  returned exit 0 under both engines.
- The adapter normalized the two React Hooks legacy rule-code aliases recorded
  by the policy contract.
- The `no-octal` fixture used a temporary script-mode parser override because
  the legacy TypeScript parser rejects octal syntax before the configured rule
  can run. The final repository configuration has no such override.
- The final root package Oxlint dispatcher completed in 13.83 seconds.

The temporary adapter and all test-owned fixture directories were removed after
the comparison.
