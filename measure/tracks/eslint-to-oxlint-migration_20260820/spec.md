# Specification: ESLint to Oxlint Migration

## Overview

Replace ESLint with Oxlint for every blocking lint command in the monorepo.
Preserve the current lint policy, file scope, warning policy, and inline
suppression behavior. Use native Oxlint rules when Oxlint supplies the required
behavior. Use an Oxlint JavaScript plugin only for a verified compatibility gap.

Keep the 15 anti-slop rules in a separate, non-blocking command. Do not include
the anti-slop backlog in this migration.

This track is a lint-engine migration. It is not a source-code cleanup track.

## Definitions

### Standard lint gate

The standard lint gate is the blocking lint policy for application and package
source. Every workspace `lint` script and every Continuous Integration (CI)
lint step uses this gate. Warnings fail this gate.

### Anti-slop gate

The anti-slop gate is the existing local 15-rule plugin in
`tools/oxlint/anti-slop/`. It runs through `npm run lint:anti-slop`. It is
informational during this track. Its existing findings do not block this
migration.

### Complete engine cutover

The cutover is complete only when all of these statements are true:

1. No repository script or final test starts the ESLint executable.
2. No `eslint.config.*` file remains.
3. `scripts/architecture/eslint.package.config.mjs` does not remain.
4. No application or package declares ESLint engine or configuration packages
   as direct dependencies.
5. The root package does not declare an ESLint engine or configuration package
   as a direct dependency.
6. A root `eslint` package can remain only as a peer dependency that an approved
   Oxlint JavaScript plugin requires.
7. Any peer-only exception names the plugin and explains the requirement in
   `measure/tech-stack.md`.
8. The peer-only exception can exist in `package-lock.json` and `node_modules`.
   It cannot be a root manifest dependency or override.
9. The peer-only exception does not permit an ESLint command, configuration, or
   API call.

## Current State

### Command surface

- Root `npm run lint` dispatches the 20 package lint scripts through
  `scripts/architecture/run-workspace-quality.mjs`.
- Six application workspaces have a blocking `lint` script.
- Twenty package workspaces have a blocking `lint` script.
- All 26 blocking workspace scripts start ESLint.
- `packages/_template/package.json` has a no-operation lint message. It is not
  one of the 26 blocking lint commands.
- Root `npm run lint:oxlint` runs the anti-slop configuration over the complete
  repository.

### ESLint configuration surface

The migration removes these 23 files:

#### Application configurations

1. `apps/bus-math-v2/eslint.config.mjs`
2. `apps/danielson/eslint.config.mjs`
3. `apps/integrated-math-1/eslint.config.mjs`
4. `apps/integrated-math-2/eslint.config.mjs`
5. `apps/integrated-math-3/eslint.config.mjs`
6. `apps/pre-calculus/eslint.config.mjs`

#### Package configurations

1. `packages/activity-runtime/eslint.config.mjs`
2. `packages/ai-tutoring/eslint.config.mjs`
3. `packages/component-approval/eslint.config.mjs`
4. `packages/core-auth/eslint.config.mjs`
5. `packages/core-convex/eslint.config.mjs`
6. `packages/efficacy-core/eslint.config.mjs`
7. `packages/graphing-core/eslint.config.mjs`
8. `packages/knowledge-space-core/eslint.config.mjs`
9. `packages/knowledge-space-practice/eslint.config.mjs`
10. `packages/lesson-renderer/eslint.config.mjs`
11. `packages/math-content/eslint.config.mjs`
12. `packages/practice-core/eslint.config.mjs`
13. `packages/srs-engine/eslint.config.mjs`
14. `packages/study-hub-core/eslint.config.mjs`
15. `packages/teacher-reporting-core/eslint.config.mjs`
16. `packages/workbook-pipeline/eslint.config.mjs`

#### Shared configuration

1. `scripts/architecture/eslint.package.config.mjs`

The following packages use the shared configuration:

- `packages/activity-components`
- `packages/app-shell`
- `packages/practice-test-engine`
- `packages/rate-limiter`

### Existing policy profiles

The migration must represent these profiles in the root Oxlint configuration:

| Profile | Scope | Required policy |
|---|---|---|
| `app-production` | Six application workspaces | Current Next.js Core Web Vitals, TypeScript, React, import, and JSX accessibility policy |
| `app-test` | `**/__tests__/**/*.ts` and `**/__tests__/**/*.tsx` in applications | `no-explicit-any` is off |
| `im3-test` | Integrated Math 3 test files | `no-explicit-any` is off; TypeScript unused variables are warnings; `_` arguments are allowed |
| `package-production` | Package `src` trees | JavaScript recommended and TypeScript recommended policy; TypeScript unused variables are errors; `_` arguments are allowed |
| `package-shared-production` | Four packages that use the shared config | Package production policy; `no-useless-escape` is off; unused suppression comments do not fail lint |
| `package-test` | Package test files | `no-explicit-any` is off |
| `lesson-renderer-test` | Lesson renderer test files | TypeScript unused variables are off |
| `math-content-production` | Math content source | `no-useless-assignment` and `no-useless-escape` are off |
| `math-content-test` | Math content test files | `ban-ts-comment`, `no-explicit-any`, TypeScript unused variables, and `no-useless-escape` are off |

The `ai-tutoring`, `efficacy-core`, `knowledge-space-core`,
`knowledge-space-practice`, `teacher-reporting-core`, and
`workbook-pipeline` test override applies to `*.ts` test files. The other
package test overrides also apply to `*.tsx` test files.

### Required ignore behavior

All profiles ignore generated and dependency output that the current command
does not lint. The root standard configuration must preserve these differences:

| Workspace group | Required ignored paths |
|---|---|
| All applications | `**/.next/**`, `node_modules/**`, `dist/**`, `convex/_generated/**` |
| Bus Math 2 and Integrated Math 3 | All common application paths and `playwright-report/**` |
| Danielson | All common application paths and `**/.convex/**`, `**/coverage/**` |
| All packages | `dist/**`, `node_modules/**` |
| Repository tooling | Agent-tooling directories and `tools/oxlint/anti-slop/**` in the standard gate |

## Rule Disposition Contract

Create these schema and data files before the cutover:

- `scripts/architecture/fixtures/oxlint-migration/legacy-policy.schema.json`
- `scripts/architecture/fixtures/oxlint-migration/legacy-policy.json`
- `scripts/architecture/fixtures/oxlint-migration/cases.schema.json`
- `scripts/architecture/fixtures/oxlint-migration/cases.json`

Use JSON Schema draft 2020-12. Set `additionalProperties` to `false` for the root
object and each record. Require `schemaVersion` with value `1`.

Use one legacy-policy entry for each unique `(legacyRule, profile)` pair. Add a
separate entry when one rule has a different severity, option, file glob, or
workspace glob. Include explicit `off` entries for an override that changes the
inherited policy.

Each legacy-policy entry must have this shape:

```json
{
  "id": "im3-test:@typescript-eslint/no-unused-vars",
  "profile": "im3-test",
  "workspaceGlobs": ["apps/integrated-math-3/**"],
  "fileGlobs": ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx"],
  "sourceConfigs": ["apps/integrated-math-3/eslint.config.mjs"],
  "legacyRule": "@typescript-eslint/no-unused-vars",
  "targetRule": "typescript/no-unused-vars",
  "severity": "warning",
  "options": [{ "argsIgnorePattern": "^_" }],
  "provider": "native",
  "disposition": "native"
}
```

The legacy-policy root object has these required fields:

| Field | JSON type | Constraint |
|---|---|---|
| `$schema` | string | `./legacy-policy.schema.json` |
| `schemaVersion` | integer | constant `1` |
| `entries` | array | At least one entry; each `id` is unique |

Each legacy-policy entry has these required fields:

| Field | JSON type | Constraint |
|---|---|---|
| `id` | string | Non-empty; unique in `entries` |
| `profile` | string | One allowed profile enum |
| `workspaceGlobs` | array of strings | At least one unique non-empty string |
| `fileGlobs` | array of strings | At least one unique non-empty string |
| `sourceConfigs` | array of strings | At least one unique repository-relative path |
| `legacyRule` | string | Non-empty legacy rule ID |
| `targetRule` | string or null | Non-empty target rule ID, except an obsolete rule uses null |
| `severity` | string | One allowed severity enum |
| `options` | array | Zero or more JSON values in ESLint option order |
| `provider` | string | One allowed provider enum |
| `disposition` | string | One allowed disposition enum |

Require these string enums:

- `profile`: one of the nine profiles in the Existing policy profiles table.
- `severity`: `off`, `warning`, or `error`.
- `provider`: `native`, `eslint-js`, `react-js`, `react-hooks-js`, or `none`.
- `disposition`: `native`, `javascript-plugin`, or `remove-obsolete`.

Use `targetRule: null`, `provider: none`, and `severity: off` only for a
`remove-obsolete` entry. Use an empty `options` array when a rule has no options.

Each behavior case must have this shape:

```json
{
  "id": "im3-test-unused-argument-warning",
  "policyId": "im3-test:@typescript-eslint/no-unused-vars",
  "profile": "im3-test",
  "legacyRule": "@typescript-eslint/no-unused-vars",
  "targetRule": "typescript/no-unused-vars",
  "severity": "warning",
  "provider": "native",
  "purpose": "violation",
  "relativePath": "__tests__/unused-argument.ts",
  "source": "export function f(value: string): void {}\n",
  "expectedDiagnostic": true,
  "expectedLine": 1
}
```

The cases root object has these required fields:

| Field | JSON type | Constraint |
|---|---|---|
| `$schema` | string | `./cases.schema.json` |
| `schemaVersion` | integer | constant `1` |
| `cases` | array | At least one case; each `id` is unique |

Each case has these required fields:

| Field | JSON type | Constraint |
|---|---|---|
| `id` | string | Non-empty; unique in `cases` |
| `policyId` | string | Existing legacy-policy `id` |
| `profile` | string | Equal to the referenced policy profile |
| `legacyRule` | string | Equal to the referenced legacy rule |
| `targetRule` | string or null | Equal to the referenced target rule |
| `severity` | string | Equal to the referenced severity |
| `provider` | string | Equal to the referenced provider |
| `purpose` | string | One allowed purpose enum |
| `relativePath` | string | Non-empty relative path with no `..` segment |
| `source` | string | Non-empty complete fixture source |
| `expectedDiagnostic` | boolean | Expected target-diagnostic presence |
| `expectedLine` | integer or null | Positive integer for an expected diagnostic; otherwise null |

Require `purpose` to be `violation`, `valid`, `ignore`, or `suppression`.
Require `expectedLine` when `expectedDiagnostic` is true. Permit a null
`expectedLine` only when `expectedDiagnostic` is false. Require `policyId` to
reference one entry in `legacy-policy.json`.

Only these dispositions are valid:

- `native`: Oxlint supplies the rule in Rust.
- `javascript-plugin`: Oxlint loads an approved JavaScript rule.
- `remove-obsolete`: The automatic JSX transform makes the rule obsolete.

Do not use an `unsupported` disposition. Stop if a retained rule has no approved
implementation.

### Native Oxlint rules

Use the native Oxlint core, TypeScript, React, import, JSX accessibility, and
Next.js plugins. Preserve the current rule severity and rule options. Map rule
names to the native namespace when Oxlint uses a different namespace. Examples
include these mappings:

| Legacy rule | Oxlint rule |
|---|---|
| `@typescript-eslint/no-explicit-any` | `typescript/no-explicit-any` |
| `@typescript-eslint/no-unused-vars` | `typescript/no-unused-vars` |
| `@typescript-eslint/ban-ts-comment` | `typescript/ban-ts-comment` |
| `@next/next/no-img-element` | `nextjs/no-img-element` |
| Other `@next/next/*` rules | Corresponding `nextjs/*` rules after a behavior proof |
| Supported `react/*` rules | Corresponding native `react/*` rules |
| `import/no-anonymous-default-export` | Native `import/no-anonymous-default-export` |
| Supported `jsx-a11y/*` rules | Corresponding native `jsx-a11y/*` rules |

Use the installed Oxlint rule list and a controlled behavior fixture as the
authority. Do not use a rule-name match as the only parity proof.

### Approved JavaScript plugin gaps

Use JavaScript plugins only for these verified gaps:

| Legacy rule group | Required provider | Required Oxlint alias |
|---|---|---|
| `no-octal` when native parity is absent | `oxlint-plugin-eslint` | `eslint-js` |
| `react/no-deprecated` | `eslint-plugin-react` | `react-js` |
| React Compiler rules without native per-rule parity | `eslint-plugin-react-hooks` | `react-hooks-js` |

Map `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` to their native
Oxlint React rules. Map the other 14 named rules in the React Hooks severities
table to `react-hooks-js`. Treat a failed native parity fixture as a stop
condition. Do not change the provider without owner approval. Keep every current
React Hooks rule and severity from `eslint-config-next/core-web-vitals`. Do not
configure native `react/react-compiler` in this track. The combined rule cannot
preserve the current per-rule severities.

Use these exact classic-rule mappings:

| Legacy rule | Native Oxlint rule |
|---|---|
| `react-hooks/rules-of-hooks` | `react/rules-of-hooks` |
| `react-hooks/exhaustive-deps` | `react/exhaustive-deps` |

Oxlint JavaScript plugins are an alpha interface. Pin or constrain their
versions through the existing dependency policy. Test every configured
JavaScript-plugin rule with real JSON lint output. `oxlint --print-config` is a
secondary check only. Oxlint 1.79.0 can omit configured JavaScript-plugin rules
from that output.

### Obsolete rules

Remove only these rules:

- `react/jsx-uses-react`
- `react/jsx-uses-vars`

The automatic JSX transform makes these rules obsolete. The behavior suite must
prove that a JSX file without a `React` import passes.

### React Hooks severities

Preserve these current severities:

| Rule | Severity |
|---|---|
| `react-hooks/config` | error |
| `react-hooks/error-boundaries` | error |
| `react-hooks/exhaustive-deps` | warning |
| `react-hooks/gating` | error |
| `react-hooks/globals` | error |
| `react-hooks/immutability` | error |
| `react-hooks/incompatible-library` | warning |
| `react-hooks/preserve-manual-memoization` | error |
| `react-hooks/purity` | error |
| `react-hooks/refs` | error |
| `react-hooks/rules-of-hooks` | error |
| `react-hooks/set-state-in-effect` | error |
| `react-hooks/set-state-in-render` | error |
| `react-hooks/static-components` | error |
| `react-hooks/unsupported-syntax` | warning |
| `react-hooks/use-memo` | error |

## Functional Requirements

### FR-1: Root standard configuration

Create one root standard Oxlint configuration. Use JSON or JSON with comments so
the blocking configuration does not depend on experimental TypeScript config
loading. Reference `node_modules/oxlint/configuration_schema.json` for editor and
test validation.

Disable category defaults that enable a rule outside `legacy-policy.json`.
Enable each retained rule explicitly. This requirement prevents an Oxlint
default from expanding the accepted ESLint policy during the engine cutover.

Enable these native plugins explicitly:

- `typescript`
- `react`
- `import`
- `jsx-a11y`
- `nextjs`

Configure React version 19. Define all policy profiles with root-relative
overrides. Do not enable anti-slop rules in this configuration.

### FR-2: Separate anti-slop configuration

Rename the current `lint:oxlint` command to `lint:anti-slop`. Move or rename the
current anti-slop configuration so its purpose is clear. Keep all 15 anti-slop
rules at error severity. Keep this command outside the blocking standard lint
gate.

Do not record a diagnostic-count baseline. The current count includes active
user work and generated output. The count is not a stable contract.

### FR-3: Workspace commands

Keep all existing `lint` script names. Change the 26 implementations as follows:

- Each application runs Oxlint on `.` with the root standard configuration.
- Each package runs Oxlint on `src` with the root standard configuration.
- Each command uses `--max-warnings 0` or an equivalent zero-warning option.
- Each command fails for an unmatched required source path.
- No command adds `--quiet`.

Do not change the root package dispatcher. Do not change CI command names when
the current names can remain stable.

### FR-4: Behavioral parity proof

Before ESLint removal, create a temporary dual-run harness. Run each controlled
fixture with both engines. Normalize only the rule aliases in
`legacy-policy.json`. Require equal pass or fail behavior and equal severity.

Delete the temporary ESLint runner before final acceptance. Retain the policy
matrix and the Oxlint-only behavior tests.

### FR-5: Inline suppression compatibility

Keep the existing `eslint-disable` spelling unless a dedicated fixture proves
that a specific directive does not work. Test next-line, same-line, block, and
enable forms. Test the existing TypeScript, Next.js, and React Hooks namespaces.
Do not add suppressions as part of the migration.

### FR-6: Dependency cleanup

Remove direct declarations that exist only for ESLint execution or ESLint
configuration. This includes applicable declarations of:

- `eslint`
- `@eslint/js`
- `@eslint/eslintrc`
- `eslint-config-next`
- `typescript-eslint`

Remove the root ESLint version override. Add only the approved compatibility
plugin dependencies that the rule matrix requires. Update `package-lock.json`
with the repository package manager.

At track creation, the registry versions are `oxlint-plugin-eslint` 1.79.0,
`eslint-plugin-react` 7.37.5, and `eslint-plugin-react-hooks` 7.1.1.
`eslint-plugin-react` 7.37.5 accepts ESLint through version 9. Its peer range does
not accept ESLint 10. `eslint-plugin-react-hooks` 7.1.1 accepts ESLint 10. Use a
peer resolution that satisfies both plugins. Do not restore the current ESLint
10 override. Stop if the dependency tree cannot resolve without an invalid peer.

The implementer must obtain explicit dependency-change approval immediately
before the first install, uninstall, or lockfile command. The approved migration
design does not remove this repository guardrail.

### FR-7: Audit and architecture contracts

Replace audit assertions that require ESLint 10, `@eslint/js`, or
`eslint-config-next`. Add durable assertions for the Oxlint engine and the
complete cutover definition. Preserve independent Next.js and TypeScript version
contracts.

Inspect and update these tests:

- `scripts/audit/__tests__/framework-wave-w4.test.ts`
- `scripts/audit/__tests__/framework-wave-w4-audit.test.ts`
- `scripts/audit/__tests__/in-range-wave-w3.test.ts`
- `scripts/audit/__tests__/remaining-majors-w5.test.ts`

Do not change the existing W3, W4, or W5 JSON fixtures in
`scripts/audit/__tests__/fixtures/`. They are historical evidence. Convert an
obsolete live-lockfile assertion in a historical test to an assertion against
its existing historical fixture. Put the new live Oxlint dependency and command
contract only in `scripts/architecture/__tests__/oxlint-migration.test.mjs`.

Preserve the architecture manifest command names when the script names remain
stable. Run the existing architecture tests. Regenerate Measure facts. Review
all generated differences. Do not add a hash, checksum, or new audit manifest.

### FR-8: Documentation

Update live documentation that says the standard lint gate uses ESLint or
`vinext lint`. At minimum, inspect these files:

- `README.md`
- `INTEGRATION.md`
- `measure/tech-stack.md`
- `measure/tech-specs.md`
- `measure/product-guidelines.md`
- `apps/integrated-math-2/product-guidelines.md`
- `apps/integrated-math-3/product-guidelines.md`
- `measure/automation-supervisor.py`

Keep `npm run lint` documentation when the command name remains correct. Use the
term `lint suppression comment` when the text does not need the exact directive
syntax. Do not modify `measure/automation-supervisor.py` unless the command must
change. A change to that peer-reviewed file requires its separate review and
audit protocol.

## Non-Functional Requirements

1. Preserve or increase every retained rule severity.
2. Preserve a zero-warning blocking policy.
3. Do not add a suppression, broad ignore, or source-code workaround to make the
   migration pass.
4. Do not change application or package runtime behavior.
5. Do not replace `tsc --noEmit` with Oxlint.
6. Do not enable Oxlint type-aware mode in this track.
7. Preserve the previous application and package lint scopes.
8. Preserve all unrelated user work in the dirty worktree.
9. Start implementation from a clean worktree or an isolated worktree at one
   recorded Git commit.
10. Use exact-path or exact-hunk staging. Do not use `git add .` or `git add -A`.
11. Record `git diff -- <target>` before an edit to a target that was dirty at
    track creation.
12. Follow the Measure task, commit, Git note, plan update, and phase checkpoint
    protocol in `measure/workflow.md`.
13. Stop after two unsuccessful repair attempts for one verification gate.

## Acceptance Criteria

1. The retained `legacy-policy.json` has one disposition for every enabled
   legacy rule and no unsupported disposition.
2. The Oxlint behavior suite passes for every retained rule.
3. The behavior suite proves warning failure, file scopes, ignores, profile
   overrides, and inline suppression behavior.
4. A temporary dual-run proves parity before ESLint removal.
5. No final test or command starts ESLint.
6. All six application and all 20 package lint scripts run Oxlint and pass.
7. The root standard configuration contains no anti-slop rule.
8. `npm run lint:anti-slop` loads all 15 anti-slop rules. Its repository finding
   count is not a completion gate.
9. All 23 ESLint configuration files are absent.
10. No application or package has a direct ESLint engine or configuration
    dependency.
11. The root has no direct ESLint engine or configuration dependency, except a
    documented peer-only `eslint` package in the lockfile when an approved
    plugin requires it.
12. `npm ls` has no invalid, missing, or extraneous dependency.
13. Architecture tests and focused dependency-audit tests pass.
14. Root lint, test, typecheck, build, boundary, generation, and doctor gates
    pass or match an owner-approved pre-existing baseline.
15. Each application lint, test, TypeScript, and build gate passes or matches an
    owner-approved pre-existing baseline.
16. Documentation describes Oxlint as the standard lint engine and identifies
    anti-slop as a separate non-blocking gate.
17. The final diff contains no unrelated source fix, severity reduction, broad
    ignore, new suppression, or audit hash.

## Stop Conditions

Stop work and ask for owner direction when one of these conditions occurs:

1. Dependency-change approval is not explicit before an install or removal.
2. A retained ESLint rule has no native or approved JavaScript-plugin behavior.
3. A JavaScript plugin does not load or changes the configured severity.
4. React Hooks compatibility requires a different plugin, ESLint peer version,
   or React Compiler policy.
5. A fixture produces different behavior after approved alias normalization.
6. A workspace command scans outside its old scope or skips old source.
7. Passing requires a new suppression, broader ignore, lower severity,
   `--quiet`, or a higher warning limit.
8. A focused dependency-audit test fails for a reason outside this migration.
9. A dirty target cannot be merged without overwriting user work.
10. `package-lock.json` contains concurrent changes that a clean lockfile update
    cannot preserve.
11. The standard blocking gate includes the current anti-slop backlog.
12. A clean `npm ci` fails.
13. A non-lint quality gate is Red and the clean baseline does not prove that it
    was Red before the migration.
14. Two repair attempts do not make one gate Green.

For a rule-parity stop, record the legacy rule, target rule, source file,
profile, severity, minimal example, command, and observed output.

## Out of Scope

- Fixing existing anti-slop findings.
- Enabling the optional anti-slop Effect rule.
- Porting an ESLint rule to a new native Rust Oxlint rule.
- Replacing TypeScript type checking.
- Enabling `oxlint-tsgolint`, type-aware lint, or experimental type checking.
- Changing source behavior to satisfy a new lint result.
- Resolving the open Integrated Math 3 React Hooks violations.
- Resolving open Integrated Math 1, Integrated Math 2, or Precalculus quality
  debt that predates the migration.
- Adopting Oxfmt.
- Restructuring CI jobs whose stable `npm run lint` command can remain.
- Changing the application design systems, curriculum, Convex code, or runtime
  dependencies.
- Adding hashes, checksums, provenance manifests, or new audit machinery.

## Implementation References

- [Oxlint migration guide](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint)
- [Oxlint JavaScript plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins)
- [Oxlint built-in plugins](https://oxc.rs/docs/guide/usage/linter/plugins)
- [Oxlint configuration reference](https://oxc.rs/docs/guide/usage/linter/config-file-reference)
- [Oxlint inline comments](https://oxc.rs/docs/guide/usage/linter/ignore-comments)
- Local schema: `node_modules/oxlint/configuration_schema.json`
