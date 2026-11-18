# ESLint to Oxlint Parity Report

## Review-Fix Update

This track is not ready for manual completion.

- The expanded fixture set contains 1,324 cases.
- The harness validates a diagnostic-producing case for 642 newly covered active policy entries.
- Nine React Compiler policy entries have explicit pending exceptions. They are recorded in `scripts/architecture/fixtures/oxlint-migration/review-exceptions.json`.
- The package-test override now keeps `ban-ts-comment` and TypeScript unused-variable checks active for normal packages. The documented shared-package exceptions remain narrow.
- The six authentication-page source workarounds are reverted in commit `71ef05c9`.
- The three affected application lint commands now report `nextjs/no-html-link-for-pages`. No source workaround is approved in this track.
- Bus Math 2 typecheck remains Red. Application tests remain incomplete or failing in the dirty worktree. No owner approval is recorded for these variances.
- The browser check remains unavailable because `browser-harness-js` is not installed.

The approval guard in the migration harness is Red until an owner approves the
nine explicit exceptions. Manual-verification tasks remain pending.

2026-11-18: the PM approved the nine exceptions and accepted the application variances as pre-existing.

## Result

The blocking lint engine is Oxlint 1.79.0. The migration preserves the recorded
rule policy across six applications and 20 packages. The temporary dual-engine
comparison is complete.

- Start commit: 45c95cec58b68a6bf2daf1ae1d829e758eaab335.
- Final implementation commit: f304f670.
- Documentation commit: ebd0b29d.
- Plan checkpoint commit: 6f675ff8.
- Controlled cases: 700 passed through both engines with zero mismatches.
- Clean-baseline workspace scopes: 26 legacy exit 0 and Oxlint exit 0.
- Root package Oxlint dispatcher: exit 0 in 13.83 seconds.

The records below describe the initial implementation before the review-fix
pass. They are retained for history and are not completion evidence.

The temporary adapter ran outside the repository and was deleted. It normalized
the two React Hooks legacy rule-code aliases. It used a fixture-only script-mode
parser override for no-octal because the legacy TypeScript parser rejects that
syntax before the configured rule can run. The final configuration has no such
override.

## Verification Gates

| Gate | Result |
|---|---|
| Migration harness | 9 passed |
| Focused dependency audits | 95 passed |
| Architecture contract suite | 28 passed |
| Root and CI quality parity | exit 0 |
| Monorepo boundaries | exit 0; 391 imports; acyclic package graph |
| Package lint, test, typecheck, build | exit 0 for all governed packages |
| Root npx tsc --noEmit | exit 0 |
| Application lint | exit 0 for all six applications |
| Application builds | exit 0 for all six applications |
| Application typecheck | exit 0 for five applications; Bus Math 2 retains the recorded problemFamilyId Red state |
| Application tests | Pre-existing dirty-worktree failures and timeouts; Bus Math 2 and Integrated Math 3 exceeded the baseline timeout and were stopped |
| Generate | pass in a disposable mirror; build-graph CLI was unavailable and generation skipped that optional step |
| Doctor | exit 0 in the disposable mirror |
| Anti-slop | exit 1 with the existing backlog; informational and non-blocking |

## Dependency and Security Result

The root manifest has no direct ESLint engine or configuration dependency. The
approved compatibility plugins are oxlint-plugin-eslint@1.79.0,
eslint-plugin-react@7.37.5, and eslint-plugin-react-hooks@7.1.1.

The retained ESLint 9.39.5 package is a peer resolution for the two approved
ESLint compatibility plugins. No final command or test invokes the ESLint
binary or API. npm ls --workspaces --depth=0 exits 0. The final audit reports
1 low, 1 moderate, 14 high, and 0 critical advisories. No audit fix was run.

## Native Rule Mappings

The following table records every native policy record. The normative source is
scripts/architecture/fixtures/oxlint-migration/legacy-policy.json.

| Policy ID | Profile | Legacy rule | Oxlint rule | Provider | Severity |
|---|---|---|---|---|---|
| app-production:react/display-name | app-production | react/display-name | react/display-name | native | error |
| app-production:react/jsx-key | app-production | react/jsx-key | react/jsx-key | native | error |
| app-production:react/jsx-no-comment-textnodes | app-production | react/jsx-no-comment-textnodes | react/jsx-no-comment-textnodes | native | error |
| app-production:react/jsx-no-duplicate-props | app-production | react/jsx-no-duplicate-props | react/jsx-no-duplicate-props | native | error |
| app-production:react/jsx-no-undef | app-production | react/jsx-no-undef | react/jsx-no-undef | native | error |
| app-production:react/no-children-prop | app-production | react/no-children-prop | react/no-children-prop | native | error |
| app-production:react/no-danger-with-children | app-production | react/no-danger-with-children | react/no-danger-with-children | native | error |
| app-production:react/no-direct-mutation-state | app-production | react/no-direct-mutation-state | react/no-direct-mutation-state | native | error |
| app-production:react/no-find-dom-node | app-production | react/no-find-dom-node | react/no-find-dom-node | native | error |
| app-production:react/no-is-mounted | app-production | react/no-is-mounted | react/no-is-mounted | native | error |
| app-production:react/no-render-return-value | app-production | react/no-render-return-value | react/no-render-return-value | native | error |
| app-production:react/no-string-refs | app-production | react/no-string-refs | react/no-string-refs | native | error |
| app-production:react/no-unescaped-entities | app-production | react/no-unescaped-entities | react/no-unescaped-entities | native | error |
| app-production:react/require-render-return | app-production | react/require-render-return | react/require-render-return | native | error |
| app-production:react/rules-of-hooks | app-production | react/rules-of-hooks | react/rules-of-hooks | native | error |
| app-production:react/exhaustive-deps | app-production | react/exhaustive-deps | react/exhaustive-deps | native | warning |
| app-production:@next/next/google-font-display | app-production | @next/next/google-font-display | nextjs/google-font-display | native | warning |
| app-production:@next/next/google-font-preconnect | app-production | @next/next/google-font-preconnect | nextjs/google-font-preconnect | native | warning |
| app-production:@next/next/next-script-for-ga | app-production | @next/next/next-script-for-ga | nextjs/next-script-for-ga | native | warning |
| app-production:@next/next/no-async-client-component | app-production | @next/next/no-async-client-component | nextjs/no-async-client-component | native | warning |
| app-production:@next/next/no-before-interactive-script-outside-document | app-production | @next/next/no-before-interactive-script-outside-document | nextjs/no-before-interactive-script-outside-document | native | warning |
| app-production:@next/next/no-css-tags | app-production | @next/next/no-css-tags | nextjs/no-css-tags | native | warning |
| app-production:@next/next/no-head-element | app-production | @next/next/no-head-element | nextjs/no-head-element | native | warning |
| app-production:@next/next/no-html-link-for-pages | app-production | @next/next/no-html-link-for-pages | nextjs/no-html-link-for-pages | native | error |
| app-production:@next/next/no-img-element | app-production | @next/next/no-img-element | nextjs/no-img-element | native | warning |
| app-production:@next/next/no-page-custom-font | app-production | @next/next/no-page-custom-font | nextjs/no-page-custom-font | native | warning |
| app-production:@next/next/no-styled-jsx-in-document | app-production | @next/next/no-styled-jsx-in-document | nextjs/no-styled-jsx-in-document | native | warning |
| app-production:@next/next/no-sync-scripts | app-production | @next/next/no-sync-scripts | nextjs/no-sync-scripts | native | error |
| app-production:@next/next/no-title-in-document-head | app-production | @next/next/no-title-in-document-head | nextjs/no-title-in-document-head | native | warning |
| app-production:@next/next/no-typos | app-production | @next/next/no-typos | nextjs/no-typos | native | warning |
| app-production:@next/next/no-unwanted-polyfillio | app-production | @next/next/no-unwanted-polyfillio | nextjs/no-unwanted-polyfillio | native | warning |
| app-production:@next/next/inline-script-id | app-production | @next/next/inline-script-id | nextjs/inline-script-id | native | error |
| app-production:@next/next/no-assign-module-variable | app-production | @next/next/no-assign-module-variable | nextjs/no-assign-module-variable | native | error |
| app-production:@next/next/no-document-import-in-page | app-production | @next/next/no-document-import-in-page | nextjs/no-document-import-in-page | native | error |
| app-production:@next/next/no-duplicate-head | app-production | @next/next/no-duplicate-head | nextjs/no-duplicate-head | native | error |
| app-production:@next/next/no-head-import-in-document | app-production | @next/next/no-head-import-in-document | nextjs/no-head-import-in-document | native | error |
| app-production:@next/next/no-script-component-in-head | app-production | @next/next/no-script-component-in-head | nextjs/no-script-component-in-head | native | error |
| app-production:import/no-anonymous-default-export | app-production | import/no-anonymous-default-export | import/no-anonymous-default-export | native | warning |
| app-production:jsx-a11y/alt-text | app-production | jsx-a11y/alt-text | jsx-a11y/alt-text | native | warning |
| app-production:jsx-a11y/aria-props | app-production | jsx-a11y/aria-props | jsx-a11y/aria-props | native | warning |
| app-production:jsx-a11y/aria-proptypes | app-production | jsx-a11y/aria-proptypes | jsx-a11y/aria-proptypes | native | warning |
| app-production:jsx-a11y/aria-unsupported-elements | app-production | jsx-a11y/aria-unsupported-elements | jsx-a11y/aria-unsupported-elements | native | warning |
| app-production:jsx-a11y/role-has-required-aria-props | app-production | jsx-a11y/role-has-required-aria-props | jsx-a11y/role-has-required-aria-props | native | warning |
| app-production:jsx-a11y/role-supports-aria-props | app-production | jsx-a11y/role-supports-aria-props | jsx-a11y/role-supports-aria-props | native | warning |
| app-production:no-var | app-production | no-var | no-var | native | error |
| app-production:prefer-const | app-production | prefer-const | prefer-const | native | error |
| app-production:prefer-rest-params | app-production | prefer-rest-params | prefer-rest-params | native | error |
| app-production:prefer-spread | app-production | prefer-spread | prefer-spread | native | error |
| app-production:@typescript-eslint/ban-ts-comment | app-production | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | error |
| app-production:@typescript-eslint/no-array-constructor | app-production | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| app-production:@typescript-eslint/no-duplicate-enum-values | app-production | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| app-production:@typescript-eslint/no-empty-object-type | app-production | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| app-production:@typescript-eslint/no-explicit-any | app-production | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | error |
| app-production:@typescript-eslint/no-extra-non-null-assertion | app-production | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| app-production:@typescript-eslint/no-misused-new | app-production | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| app-production:@typescript-eslint/no-namespace | app-production | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| app-production:@typescript-eslint/no-non-null-asserted-optional-chain | app-production | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| app-production:@typescript-eslint/no-require-imports | app-production | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| app-production:@typescript-eslint/no-this-alias | app-production | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| app-production:@typescript-eslint/no-unnecessary-type-constraint | app-production | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| app-production:@typescript-eslint/no-unsafe-declaration-merging | app-production | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| app-production:@typescript-eslint/no-unsafe-function-type | app-production | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| app-production:@typescript-eslint/no-unused-expressions | app-production | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | warning |
| app-production:@typescript-eslint/no-unused-vars | app-production | @typescript-eslint/no-unused-vars | no-unused-vars | native | warning |
| app-production:@typescript-eslint/no-wrapper-object-types | app-production | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| app-production:@typescript-eslint/prefer-as-const | app-production | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| app-production:@typescript-eslint/prefer-namespace-keyword | app-production | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| app-production:@typescript-eslint/triple-slash-reference | app-production | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| app-test:react/display-name | app-test | react/display-name | react/display-name | native | error |
| app-test:react/jsx-key | app-test | react/jsx-key | react/jsx-key | native | error |
| app-test:react/jsx-no-comment-textnodes | app-test | react/jsx-no-comment-textnodes | react/jsx-no-comment-textnodes | native | error |
| app-test:react/jsx-no-duplicate-props | app-test | react/jsx-no-duplicate-props | react/jsx-no-duplicate-props | native | error |
| app-test:react/jsx-no-undef | app-test | react/jsx-no-undef | react/jsx-no-undef | native | error |
| app-test:react/no-children-prop | app-test | react/no-children-prop | react/no-children-prop | native | error |
| app-test:react/no-danger-with-children | app-test | react/no-danger-with-children | react/no-danger-with-children | native | error |
| app-test:react/no-direct-mutation-state | app-test | react/no-direct-mutation-state | react/no-direct-mutation-state | native | error |
| app-test:react/no-find-dom-node | app-test | react/no-find-dom-node | react/no-find-dom-node | native | error |
| app-test:react/no-is-mounted | app-test | react/no-is-mounted | react/no-is-mounted | native | error |
| app-test:react/no-render-return-value | app-test | react/no-render-return-value | react/no-render-return-value | native | error |
| app-test:react/no-string-refs | app-test | react/no-string-refs | react/no-string-refs | native | error |
| app-test:react/no-unescaped-entities | app-test | react/no-unescaped-entities | react/no-unescaped-entities | native | error |
| app-test:react/require-render-return | app-test | react/require-render-return | react/require-render-return | native | error |
| app-test:react/rules-of-hooks | app-test | react/rules-of-hooks | react/rules-of-hooks | native | error |
| app-test:react/exhaustive-deps | app-test | react/exhaustive-deps | react/exhaustive-deps | native | warning |
| app-test:@next/next/google-font-display | app-test | @next/next/google-font-display | nextjs/google-font-display | native | warning |
| app-test:@next/next/google-font-preconnect | app-test | @next/next/google-font-preconnect | nextjs/google-font-preconnect | native | warning |
| app-test:@next/next/next-script-for-ga | app-test | @next/next/next-script-for-ga | nextjs/next-script-for-ga | native | warning |
| app-test:@next/next/no-async-client-component | app-test | @next/next/no-async-client-component | nextjs/no-async-client-component | native | warning |
| app-test:@next/next/no-before-interactive-script-outside-document | app-test | @next/next/no-before-interactive-script-outside-document | nextjs/no-before-interactive-script-outside-document | native | warning |
| app-test:@next/next/no-css-tags | app-test | @next/next/no-css-tags | nextjs/no-css-tags | native | warning |
| app-test:@next/next/no-head-element | app-test | @next/next/no-head-element | nextjs/no-head-element | native | warning |
| app-test:@next/next/no-html-link-for-pages | app-test | @next/next/no-html-link-for-pages | nextjs/no-html-link-for-pages | native | error |
| app-test:@next/next/no-img-element | app-test | @next/next/no-img-element | nextjs/no-img-element | native | warning |
| app-test:@next/next/no-page-custom-font | app-test | @next/next/no-page-custom-font | nextjs/no-page-custom-font | native | warning |
| app-test:@next/next/no-styled-jsx-in-document | app-test | @next/next/no-styled-jsx-in-document | nextjs/no-styled-jsx-in-document | native | warning |
| app-test:@next/next/no-sync-scripts | app-test | @next/next/no-sync-scripts | nextjs/no-sync-scripts | native | error |
| app-test:@next/next/no-title-in-document-head | app-test | @next/next/no-title-in-document-head | nextjs/no-title-in-document-head | native | warning |
| app-test:@next/next/no-typos | app-test | @next/next/no-typos | nextjs/no-typos | native | warning |
| app-test:@next/next/no-unwanted-polyfillio | app-test | @next/next/no-unwanted-polyfillio | nextjs/no-unwanted-polyfillio | native | warning |
| app-test:@next/next/inline-script-id | app-test | @next/next/inline-script-id | nextjs/inline-script-id | native | error |
| app-test:@next/next/no-assign-module-variable | app-test | @next/next/no-assign-module-variable | nextjs/no-assign-module-variable | native | error |
| app-test:@next/next/no-document-import-in-page | app-test | @next/next/no-document-import-in-page | nextjs/no-document-import-in-page | native | error |
| app-test:@next/next/no-duplicate-head | app-test | @next/next/no-duplicate-head | nextjs/no-duplicate-head | native | error |
| app-test:@next/next/no-head-import-in-document | app-test | @next/next/no-head-import-in-document | nextjs/no-head-import-in-document | native | error |
| app-test:@next/next/no-script-component-in-head | app-test | @next/next/no-script-component-in-head | nextjs/no-script-component-in-head | native | error |
| app-test:import/no-anonymous-default-export | app-test | import/no-anonymous-default-export | import/no-anonymous-default-export | native | warning |
| app-test:jsx-a11y/alt-text | app-test | jsx-a11y/alt-text | jsx-a11y/alt-text | native | warning |
| app-test:jsx-a11y/aria-props | app-test | jsx-a11y/aria-props | jsx-a11y/aria-props | native | warning |
| app-test:jsx-a11y/aria-proptypes | app-test | jsx-a11y/aria-proptypes | jsx-a11y/aria-proptypes | native | warning |
| app-test:jsx-a11y/aria-unsupported-elements | app-test | jsx-a11y/aria-unsupported-elements | jsx-a11y/aria-unsupported-elements | native | warning |
| app-test:jsx-a11y/role-has-required-aria-props | app-test | jsx-a11y/role-has-required-aria-props | jsx-a11y/role-has-required-aria-props | native | warning |
| app-test:jsx-a11y/role-supports-aria-props | app-test | jsx-a11y/role-supports-aria-props | jsx-a11y/role-supports-aria-props | native | warning |
| app-test:no-var | app-test | no-var | no-var | native | error |
| app-test:prefer-const | app-test | prefer-const | prefer-const | native | error |
| app-test:prefer-rest-params | app-test | prefer-rest-params | prefer-rest-params | native | error |
| app-test:prefer-spread | app-test | prefer-spread | prefer-spread | native | error |
| app-test:@typescript-eslint/ban-ts-comment | app-test | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | error |
| app-test:@typescript-eslint/no-array-constructor | app-test | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| app-test:@typescript-eslint/no-duplicate-enum-values | app-test | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| app-test:@typescript-eslint/no-empty-object-type | app-test | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| app-test:@typescript-eslint/no-extra-non-null-assertion | app-test | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| app-test:@typescript-eslint/no-misused-new | app-test | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| app-test:@typescript-eslint/no-namespace | app-test | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| app-test:@typescript-eslint/no-non-null-asserted-optional-chain | app-test | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| app-test:@typescript-eslint/no-require-imports | app-test | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| app-test:@typescript-eslint/no-this-alias | app-test | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| app-test:@typescript-eslint/no-unnecessary-type-constraint | app-test | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| app-test:@typescript-eslint/no-unsafe-declaration-merging | app-test | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| app-test:@typescript-eslint/no-unsafe-function-type | app-test | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| app-test:@typescript-eslint/no-unused-expressions | app-test | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | warning |
| app-test:@typescript-eslint/no-unused-vars | app-test | @typescript-eslint/no-unused-vars | no-unused-vars | native | warning |
| app-test:@typescript-eslint/no-wrapper-object-types | app-test | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| app-test:@typescript-eslint/prefer-as-const | app-test | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| app-test:@typescript-eslint/prefer-namespace-keyword | app-test | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| app-test:@typescript-eslint/triple-slash-reference | app-test | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| im3-test:react/display-name | im3-test | react/display-name | react/display-name | native | error |
| im3-test:react/jsx-key | im3-test | react/jsx-key | react/jsx-key | native | error |
| im3-test:react/jsx-no-comment-textnodes | im3-test | react/jsx-no-comment-textnodes | react/jsx-no-comment-textnodes | native | error |
| im3-test:react/jsx-no-duplicate-props | im3-test | react/jsx-no-duplicate-props | react/jsx-no-duplicate-props | native | error |
| im3-test:react/jsx-no-undef | im3-test | react/jsx-no-undef | react/jsx-no-undef | native | error |
| im3-test:react/no-children-prop | im3-test | react/no-children-prop | react/no-children-prop | native | error |
| im3-test:react/no-danger-with-children | im3-test | react/no-danger-with-children | react/no-danger-with-children | native | error |
| im3-test:react/no-direct-mutation-state | im3-test | react/no-direct-mutation-state | react/no-direct-mutation-state | native | error |
| im3-test:react/no-find-dom-node | im3-test | react/no-find-dom-node | react/no-find-dom-node | native | error |
| im3-test:react/no-is-mounted | im3-test | react/no-is-mounted | react/no-is-mounted | native | error |
| im3-test:react/no-render-return-value | im3-test | react/no-render-return-value | react/no-render-return-value | native | error |
| im3-test:react/no-string-refs | im3-test | react/no-string-refs | react/no-string-refs | native | error |
| im3-test:react/no-unescaped-entities | im3-test | react/no-unescaped-entities | react/no-unescaped-entities | native | error |
| im3-test:react/require-render-return | im3-test | react/require-render-return | react/require-render-return | native | error |
| im3-test:react/rules-of-hooks | im3-test | react/rules-of-hooks | react/rules-of-hooks | native | error |
| im3-test:react/exhaustive-deps | im3-test | react/exhaustive-deps | react/exhaustive-deps | native | warning |
| im3-test:@next/next/google-font-display | im3-test | @next/next/google-font-display | nextjs/google-font-display | native | warning |
| im3-test:@next/next/google-font-preconnect | im3-test | @next/next/google-font-preconnect | nextjs/google-font-preconnect | native | warning |
| im3-test:@next/next/next-script-for-ga | im3-test | @next/next/next-script-for-ga | nextjs/next-script-for-ga | native | warning |
| im3-test:@next/next/no-async-client-component | im3-test | @next/next/no-async-client-component | nextjs/no-async-client-component | native | warning |
| im3-test:@next/next/no-before-interactive-script-outside-document | im3-test | @next/next/no-before-interactive-script-outside-document | nextjs/no-before-interactive-script-outside-document | native | warning |
| im3-test:@next/next/no-css-tags | im3-test | @next/next/no-css-tags | nextjs/no-css-tags | native | warning |
| im3-test:@next/next/no-head-element | im3-test | @next/next/no-head-element | nextjs/no-head-element | native | warning |
| im3-test:@next/next/no-html-link-for-pages | im3-test | @next/next/no-html-link-for-pages | nextjs/no-html-link-for-pages | native | error |
| im3-test:@next/next/no-img-element | im3-test | @next/next/no-img-element | nextjs/no-img-element | native | warning |
| im3-test:@next/next/no-page-custom-font | im3-test | @next/next/no-page-custom-font | nextjs/no-page-custom-font | native | warning |
| im3-test:@next/next/no-styled-jsx-in-document | im3-test | @next/next/no-styled-jsx-in-document | nextjs/no-styled-jsx-in-document | native | warning |
| im3-test:@next/next/no-sync-scripts | im3-test | @next/next/no-sync-scripts | nextjs/no-sync-scripts | native | error |
| im3-test:@next/next/no-title-in-document-head | im3-test | @next/next/no-title-in-document-head | nextjs/no-title-in-document-head | native | warning |
| im3-test:@next/next/no-typos | im3-test | @next/next/no-typos | nextjs/no-typos | native | warning |
| im3-test:@next/next/no-unwanted-polyfillio | im3-test | @next/next/no-unwanted-polyfillio | nextjs/no-unwanted-polyfillio | native | warning |
| im3-test:@next/next/inline-script-id | im3-test | @next/next/inline-script-id | nextjs/inline-script-id | native | error |
| im3-test:@next/next/no-assign-module-variable | im3-test | @next/next/no-assign-module-variable | nextjs/no-assign-module-variable | native | error |
| im3-test:@next/next/no-document-import-in-page | im3-test | @next/next/no-document-import-in-page | nextjs/no-document-import-in-page | native | error |
| im3-test:@next/next/no-duplicate-head | im3-test | @next/next/no-duplicate-head | nextjs/no-duplicate-head | native | error |
| im3-test:@next/next/no-head-import-in-document | im3-test | @next/next/no-head-import-in-document | nextjs/no-head-import-in-document | native | error |
| im3-test:@next/next/no-script-component-in-head | im3-test | @next/next/no-script-component-in-head | nextjs/no-script-component-in-head | native | error |
| im3-test:import/no-anonymous-default-export | im3-test | import/no-anonymous-default-export | import/no-anonymous-default-export | native | warning |
| im3-test:jsx-a11y/alt-text | im3-test | jsx-a11y/alt-text | jsx-a11y/alt-text | native | warning |
| im3-test:jsx-a11y/aria-props | im3-test | jsx-a11y/aria-props | jsx-a11y/aria-props | native | warning |
| im3-test:jsx-a11y/aria-proptypes | im3-test | jsx-a11y/aria-proptypes | jsx-a11y/aria-proptypes | native | warning |
| im3-test:jsx-a11y/aria-unsupported-elements | im3-test | jsx-a11y/aria-unsupported-elements | jsx-a11y/aria-unsupported-elements | native | warning |
| im3-test:jsx-a11y/role-has-required-aria-props | im3-test | jsx-a11y/role-has-required-aria-props | jsx-a11y/role-has-required-aria-props | native | warning |
| im3-test:jsx-a11y/role-supports-aria-props | im3-test | jsx-a11y/role-supports-aria-props | jsx-a11y/role-supports-aria-props | native | warning |
| im3-test:no-var | im3-test | no-var | no-var | native | error |
| im3-test:prefer-const | im3-test | prefer-const | prefer-const | native | error |
| im3-test:prefer-rest-params | im3-test | prefer-rest-params | prefer-rest-params | native | error |
| im3-test:prefer-spread | im3-test | prefer-spread | prefer-spread | native | error |
| im3-test:@typescript-eslint/ban-ts-comment | im3-test | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | error |
| im3-test:@typescript-eslint/no-array-constructor | im3-test | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| im3-test:@typescript-eslint/no-duplicate-enum-values | im3-test | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| im3-test:@typescript-eslint/no-empty-object-type | im3-test | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| im3-test:@typescript-eslint/no-extra-non-null-assertion | im3-test | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| im3-test:@typescript-eslint/no-misused-new | im3-test | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| im3-test:@typescript-eslint/no-namespace | im3-test | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| im3-test:@typescript-eslint/no-non-null-asserted-optional-chain | im3-test | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| im3-test:@typescript-eslint/no-require-imports | im3-test | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| im3-test:@typescript-eslint/no-this-alias | im3-test | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| im3-test:@typescript-eslint/no-unnecessary-type-constraint | im3-test | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| im3-test:@typescript-eslint/no-unsafe-declaration-merging | im3-test | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| im3-test:@typescript-eslint/no-unsafe-function-type | im3-test | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| im3-test:@typescript-eslint/no-unused-expressions | im3-test | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | warning |
| im3-test:@typescript-eslint/no-unused-vars | im3-test | @typescript-eslint/no-unused-vars | no-unused-vars | native | warning |
| im3-test:@typescript-eslint/no-wrapper-object-types | im3-test | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| im3-test:@typescript-eslint/prefer-as-const | im3-test | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| im3-test:@typescript-eslint/prefer-namespace-keyword | im3-test | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| im3-test:@typescript-eslint/triple-slash-reference | im3-test | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| package-production:for-direction | package-production | for-direction | for-direction | native | error |
| package-production:no-async-promise-executor | package-production | no-async-promise-executor | no-async-promise-executor | native | error |
| package-production:no-case-declarations | package-production | no-case-declarations | no-case-declarations | native | error |
| package-production:no-compare-neg-zero | package-production | no-compare-neg-zero | no-compare-neg-zero | native | error |
| package-production:no-cond-assign | package-production | no-cond-assign | no-cond-assign | native | error |
| package-production:no-constant-binary-expression | package-production | no-constant-binary-expression | no-constant-binary-expression | native | error |
| package-production:no-constant-condition | package-production | no-constant-condition | no-constant-condition | native | error |
| package-production:no-control-regex | package-production | no-control-regex | no-control-regex | native | error |
| package-production:no-debugger | package-production | no-debugger | no-debugger | native | error |
| package-production:no-delete-var | package-production | no-delete-var | no-delete-var | native | error |
| package-production:no-dupe-else-if | package-production | no-dupe-else-if | no-dupe-else-if | native | error |
| package-production:no-duplicate-case | package-production | no-duplicate-case | no-duplicate-case | native | error |
| package-production:no-empty | package-production | no-empty | no-empty | native | error |
| package-production:no-empty-character-class | package-production | no-empty-character-class | no-empty-character-class | native | error |
| package-production:no-empty-pattern | package-production | no-empty-pattern | no-empty-pattern | native | error |
| package-production:no-empty-static-block | package-production | no-empty-static-block | no-empty-static-block | native | error |
| package-production:no-ex-assign | package-production | no-ex-assign | no-ex-assign | native | error |
| package-production:no-extra-boolean-cast | package-production | no-extra-boolean-cast | no-extra-boolean-cast | native | error |
| package-production:no-fallthrough | package-production | no-fallthrough | no-fallthrough | native | error |
| package-production:no-global-assign | package-production | no-global-assign | no-global-assign | native | error |
| package-production:no-invalid-regexp | package-production | no-invalid-regexp | no-invalid-regexp | native | error |
| package-production:no-irregular-whitespace | package-production | no-irregular-whitespace | no-irregular-whitespace | native | error |
| package-production:no-loss-of-precision | package-production | no-loss-of-precision | no-loss-of-precision | native | error |
| package-production:no-misleading-character-class | package-production | no-misleading-character-class | no-misleading-character-class | native | error |
| package-production:no-nonoctal-decimal-escape | package-production | no-nonoctal-decimal-escape | no-nonoctal-decimal-escape | native | error |
| package-production:no-prototype-builtins | package-production | no-prototype-builtins | no-prototype-builtins | native | error |
| package-production:no-regex-spaces | package-production | no-regex-spaces | no-regex-spaces | native | error |
| package-production:no-self-assign | package-production | no-self-assign | no-self-assign | native | error |
| package-production:no-shadow-restricted-names | package-production | no-shadow-restricted-names | no-shadow-restricted-names | native | error |
| package-production:no-sparse-arrays | package-production | no-sparse-arrays | no-sparse-arrays | native | error |
| package-production:no-unassigned-vars | package-production | no-unassigned-vars | no-unassigned-vars | native | error |
| package-production:no-unexpected-multiline | package-production | no-unexpected-multiline | no-unexpected-multiline | native | error |
| package-production:no-unsafe-finally | package-production | no-unsafe-finally | no-unsafe-finally | native | error |
| package-production:no-unsafe-optional-chaining | package-production | no-unsafe-optional-chaining | no-unsafe-optional-chaining | native | error |
| package-production:no-unused-labels | package-production | no-unused-labels | no-unused-labels | native | error |
| package-production:no-unused-private-class-members | package-production | no-unused-private-class-members | no-unused-private-class-members | native | error |
| package-production:no-useless-assignment | package-production | no-useless-assignment | no-useless-assignment | native | error |
| package-production:no-useless-backreference | package-production | no-useless-backreference | no-useless-backreference | native | error |
| package-production:no-useless-catch | package-production | no-useless-catch | no-useless-catch | native | error |
| package-production:no-useless-escape | package-production | no-useless-escape | no-useless-escape | native | error |
| package-production:preserve-caught-error | package-production | preserve-caught-error | preserve-caught-error | native | error |
| package-production:require-yield | package-production | require-yield | require-yield | native | error |
| package-production:use-isnan | package-production | use-isnan | use-isnan | native | error |
| package-production:valid-typeof | package-production | valid-typeof | valid-typeof | native | error |
| package-production:no-var | package-production | no-var | no-var | native | error |
| package-production:prefer-const | package-production | prefer-const | prefer-const | native | error |
| package-production:prefer-rest-params | package-production | prefer-rest-params | prefer-rest-params | native | error |
| package-production:prefer-spread | package-production | prefer-spread | prefer-spread | native | error |
| package-production:@typescript-eslint/ban-ts-comment | package-production | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | error |
| package-production:@typescript-eslint/no-array-constructor | package-production | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| package-production:@typescript-eslint/no-duplicate-enum-values | package-production | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| package-production:@typescript-eslint/no-empty-object-type | package-production | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| package-production:@typescript-eslint/no-explicit-any | package-production | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | error |
| package-production:@typescript-eslint/no-extra-non-null-assertion | package-production | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| package-production:@typescript-eslint/no-misused-new | package-production | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| package-production:@typescript-eslint/no-namespace | package-production | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| package-production:@typescript-eslint/no-non-null-asserted-optional-chain | package-production | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| package-production:@typescript-eslint/no-require-imports | package-production | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| package-production:@typescript-eslint/no-this-alias | package-production | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| package-production:@typescript-eslint/no-unnecessary-type-constraint | package-production | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| package-production:@typescript-eslint/no-unsafe-declaration-merging | package-production | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| package-production:@typescript-eslint/no-unsafe-function-type | package-production | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| package-production:@typescript-eslint/no-unused-expressions | package-production | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | error |
| package-production:@typescript-eslint/no-unused-vars | package-production | @typescript-eslint/no-unused-vars | no-unused-vars | native | error |
| package-production:@typescript-eslint/no-wrapper-object-types | package-production | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| package-production:@typescript-eslint/prefer-as-const | package-production | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| package-production:@typescript-eslint/prefer-namespace-keyword | package-production | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| package-production:@typescript-eslint/triple-slash-reference | package-production | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| package-test:for-direction | package-test | for-direction | for-direction | native | error |
| package-test:no-async-promise-executor | package-test | no-async-promise-executor | no-async-promise-executor | native | error |
| package-test:no-case-declarations | package-test | no-case-declarations | no-case-declarations | native | error |
| package-test:no-compare-neg-zero | package-test | no-compare-neg-zero | no-compare-neg-zero | native | error |
| package-test:no-cond-assign | package-test | no-cond-assign | no-cond-assign | native | error |
| package-test:no-constant-binary-expression | package-test | no-constant-binary-expression | no-constant-binary-expression | native | error |
| package-test:no-constant-condition | package-test | no-constant-condition | no-constant-condition | native | error |
| package-test:no-control-regex | package-test | no-control-regex | no-control-regex | native | error |
| package-test:no-debugger | package-test | no-debugger | no-debugger | native | error |
| package-test:no-delete-var | package-test | no-delete-var | no-delete-var | native | error |
| package-test:no-dupe-else-if | package-test | no-dupe-else-if | no-dupe-else-if | native | error |
| package-test:no-duplicate-case | package-test | no-duplicate-case | no-duplicate-case | native | error |
| package-test:no-empty | package-test | no-empty | no-empty | native | error |
| package-test:no-empty-character-class | package-test | no-empty-character-class | no-empty-character-class | native | error |
| package-test:no-empty-pattern | package-test | no-empty-pattern | no-empty-pattern | native | error |
| package-test:no-empty-static-block | package-test | no-empty-static-block | no-empty-static-block | native | error |
| package-test:no-ex-assign | package-test | no-ex-assign | no-ex-assign | native | error |
| package-test:no-extra-boolean-cast | package-test | no-extra-boolean-cast | no-extra-boolean-cast | native | error |
| package-test:no-fallthrough | package-test | no-fallthrough | no-fallthrough | native | error |
| package-test:no-global-assign | package-test | no-global-assign | no-global-assign | native | error |
| package-test:no-invalid-regexp | package-test | no-invalid-regexp | no-invalid-regexp | native | error |
| package-test:no-irregular-whitespace | package-test | no-irregular-whitespace | no-irregular-whitespace | native | error |
| package-test:no-loss-of-precision | package-test | no-loss-of-precision | no-loss-of-precision | native | error |
| package-test:no-misleading-character-class | package-test | no-misleading-character-class | no-misleading-character-class | native | error |
| package-test:no-nonoctal-decimal-escape | package-test | no-nonoctal-decimal-escape | no-nonoctal-decimal-escape | native | error |
| package-test:no-prototype-builtins | package-test | no-prototype-builtins | no-prototype-builtins | native | error |
| package-test:no-regex-spaces | package-test | no-regex-spaces | no-regex-spaces | native | error |
| package-test:no-self-assign | package-test | no-self-assign | no-self-assign | native | error |
| package-test:no-shadow-restricted-names | package-test | no-shadow-restricted-names | no-shadow-restricted-names | native | error |
| package-test:no-sparse-arrays | package-test | no-sparse-arrays | no-sparse-arrays | native | error |
| package-test:no-unassigned-vars | package-test | no-unassigned-vars | no-unassigned-vars | native | error |
| package-test:no-unexpected-multiline | package-test | no-unexpected-multiline | no-unexpected-multiline | native | error |
| package-test:no-unsafe-finally | package-test | no-unsafe-finally | no-unsafe-finally | native | error |
| package-test:no-unsafe-optional-chaining | package-test | no-unsafe-optional-chaining | no-unsafe-optional-chaining | native | error |
| package-test:no-unused-labels | package-test | no-unused-labels | no-unused-labels | native | error |
| package-test:no-unused-private-class-members | package-test | no-unused-private-class-members | no-unused-private-class-members | native | error |
| package-test:no-useless-assignment | package-test | no-useless-assignment | no-useless-assignment | native | error |
| package-test:no-useless-backreference | package-test | no-useless-backreference | no-useless-backreference | native | error |
| package-test:no-useless-catch | package-test | no-useless-catch | no-useless-catch | native | error |
| package-test:no-useless-escape | package-test | no-useless-escape | no-useless-escape | native | error |
| package-test:preserve-caught-error | package-test | preserve-caught-error | preserve-caught-error | native | error |
| package-test:require-yield | package-test | require-yield | require-yield | native | error |
| package-test:use-isnan | package-test | use-isnan | use-isnan | native | error |
| package-test:valid-typeof | package-test | valid-typeof | valid-typeof | native | error |
| package-test:no-var | package-test | no-var | no-var | native | error |
| package-test:prefer-const | package-test | prefer-const | prefer-const | native | error |
| package-test:prefer-rest-params | package-test | prefer-rest-params | prefer-rest-params | native | error |
| package-test:prefer-spread | package-test | prefer-spread | prefer-spread | native | error |
| package-test:@typescript-eslint/ban-ts-comment | package-test | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | error |
| package-test:@typescript-eslint/no-array-constructor | package-test | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| package-test:@typescript-eslint/no-duplicate-enum-values | package-test | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| package-test:@typescript-eslint/no-empty-object-type | package-test | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| package-test:@typescript-eslint/no-extra-non-null-assertion | package-test | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| package-test:@typescript-eslint/no-misused-new | package-test | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| package-test:@typescript-eslint/no-namespace | package-test | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| package-test:@typescript-eslint/no-non-null-asserted-optional-chain | package-test | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| package-test:@typescript-eslint/no-require-imports | package-test | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| package-test:@typescript-eslint/no-this-alias | package-test | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| package-test:@typescript-eslint/no-unnecessary-type-constraint | package-test | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| package-test:@typescript-eslint/no-unsafe-declaration-merging | package-test | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| package-test:@typescript-eslint/no-unsafe-function-type | package-test | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| package-test:@typescript-eslint/no-unused-expressions | package-test | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | error |
| package-test:@typescript-eslint/no-unused-vars | package-test | @typescript-eslint/no-unused-vars | no-unused-vars | native | error |
| package-test:@typescript-eslint/no-wrapper-object-types | package-test | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| package-test:@typescript-eslint/prefer-as-const | package-test | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| package-test:@typescript-eslint/prefer-namespace-keyword | package-test | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| package-test:@typescript-eslint/triple-slash-reference | package-test | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| package-shared-production:for-direction | package-shared-production | for-direction | for-direction | native | error |
| package-shared-production:no-async-promise-executor | package-shared-production | no-async-promise-executor | no-async-promise-executor | native | error |
| package-shared-production:no-case-declarations | package-shared-production | no-case-declarations | no-case-declarations | native | error |
| package-shared-production:no-compare-neg-zero | package-shared-production | no-compare-neg-zero | no-compare-neg-zero | native | error |
| package-shared-production:no-cond-assign | package-shared-production | no-cond-assign | no-cond-assign | native | error |
| package-shared-production:no-constant-binary-expression | package-shared-production | no-constant-binary-expression | no-constant-binary-expression | native | error |
| package-shared-production:no-constant-condition | package-shared-production | no-constant-condition | no-constant-condition | native | error |
| package-shared-production:no-control-regex | package-shared-production | no-control-regex | no-control-regex | native | error |
| package-shared-production:no-debugger | package-shared-production | no-debugger | no-debugger | native | error |
| package-shared-production:no-delete-var | package-shared-production | no-delete-var | no-delete-var | native | error |
| package-shared-production:no-dupe-else-if | package-shared-production | no-dupe-else-if | no-dupe-else-if | native | error |
| package-shared-production:no-duplicate-case | package-shared-production | no-duplicate-case | no-duplicate-case | native | error |
| package-shared-production:no-empty | package-shared-production | no-empty | no-empty | native | error |
| package-shared-production:no-empty-character-class | package-shared-production | no-empty-character-class | no-empty-character-class | native | error |
| package-shared-production:no-empty-pattern | package-shared-production | no-empty-pattern | no-empty-pattern | native | error |
| package-shared-production:no-empty-static-block | package-shared-production | no-empty-static-block | no-empty-static-block | native | error |
| package-shared-production:no-ex-assign | package-shared-production | no-ex-assign | no-ex-assign | native | error |
| package-shared-production:no-extra-boolean-cast | package-shared-production | no-extra-boolean-cast | no-extra-boolean-cast | native | error |
| package-shared-production:no-fallthrough | package-shared-production | no-fallthrough | no-fallthrough | native | error |
| package-shared-production:no-global-assign | package-shared-production | no-global-assign | no-global-assign | native | error |
| package-shared-production:no-invalid-regexp | package-shared-production | no-invalid-regexp | no-invalid-regexp | native | error |
| package-shared-production:no-irregular-whitespace | package-shared-production | no-irregular-whitespace | no-irregular-whitespace | native | error |
| package-shared-production:no-loss-of-precision | package-shared-production | no-loss-of-precision | no-loss-of-precision | native | error |
| package-shared-production:no-misleading-character-class | package-shared-production | no-misleading-character-class | no-misleading-character-class | native | error |
| package-shared-production:no-nonoctal-decimal-escape | package-shared-production | no-nonoctal-decimal-escape | no-nonoctal-decimal-escape | native | error |
| package-shared-production:no-prototype-builtins | package-shared-production | no-prototype-builtins | no-prototype-builtins | native | error |
| package-shared-production:no-regex-spaces | package-shared-production | no-regex-spaces | no-regex-spaces | native | error |
| package-shared-production:no-self-assign | package-shared-production | no-self-assign | no-self-assign | native | error |
| package-shared-production:no-shadow-restricted-names | package-shared-production | no-shadow-restricted-names | no-shadow-restricted-names | native | error |
| package-shared-production:no-sparse-arrays | package-shared-production | no-sparse-arrays | no-sparse-arrays | native | error |
| package-shared-production:no-unassigned-vars | package-shared-production | no-unassigned-vars | no-unassigned-vars | native | error |
| package-shared-production:no-unexpected-multiline | package-shared-production | no-unexpected-multiline | no-unexpected-multiline | native | error |
| package-shared-production:no-unsafe-finally | package-shared-production | no-unsafe-finally | no-unsafe-finally | native | error |
| package-shared-production:no-unsafe-optional-chaining | package-shared-production | no-unsafe-optional-chaining | no-unsafe-optional-chaining | native | error |
| package-shared-production:no-unused-labels | package-shared-production | no-unused-labels | no-unused-labels | native | error |
| package-shared-production:no-unused-private-class-members | package-shared-production | no-unused-private-class-members | no-unused-private-class-members | native | error |
| package-shared-production:no-useless-assignment | package-shared-production | no-useless-assignment | no-useless-assignment | native | error |
| package-shared-production:no-useless-backreference | package-shared-production | no-useless-backreference | no-useless-backreference | native | error |
| package-shared-production:no-useless-catch | package-shared-production | no-useless-catch | no-useless-catch | native | error |
| package-shared-production:preserve-caught-error | package-shared-production | preserve-caught-error | preserve-caught-error | native | error |
| package-shared-production:require-yield | package-shared-production | require-yield | require-yield | native | error |
| package-shared-production:use-isnan | package-shared-production | use-isnan | use-isnan | native | error |
| package-shared-production:valid-typeof | package-shared-production | valid-typeof | valid-typeof | native | error |
| package-shared-production:no-var | package-shared-production | no-var | no-var | native | error |
| package-shared-production:prefer-const | package-shared-production | prefer-const | prefer-const | native | error |
| package-shared-production:prefer-rest-params | package-shared-production | prefer-rest-params | prefer-rest-params | native | error |
| package-shared-production:prefer-spread | package-shared-production | prefer-spread | prefer-spread | native | error |
| package-shared-production:@typescript-eslint/ban-ts-comment | package-shared-production | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | error |
| package-shared-production:@typescript-eslint/no-array-constructor | package-shared-production | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| package-shared-production:@typescript-eslint/no-duplicate-enum-values | package-shared-production | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| package-shared-production:@typescript-eslint/no-empty-object-type | package-shared-production | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| package-shared-production:@typescript-eslint/no-explicit-any | package-shared-production | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | error |
| package-shared-production:@typescript-eslint/no-extra-non-null-assertion | package-shared-production | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| package-shared-production:@typescript-eslint/no-misused-new | package-shared-production | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| package-shared-production:@typescript-eslint/no-namespace | package-shared-production | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| package-shared-production:@typescript-eslint/no-non-null-asserted-optional-chain | package-shared-production | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| package-shared-production:@typescript-eslint/no-require-imports | package-shared-production | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| package-shared-production:@typescript-eslint/no-this-alias | package-shared-production | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| package-shared-production:@typescript-eslint/no-unnecessary-type-constraint | package-shared-production | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| package-shared-production:@typescript-eslint/no-unsafe-declaration-merging | package-shared-production | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| package-shared-production:@typescript-eslint/no-unsafe-function-type | package-shared-production | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| package-shared-production:@typescript-eslint/no-unused-expressions | package-shared-production | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | error |
| package-shared-production:@typescript-eslint/no-unused-vars | package-shared-production | @typescript-eslint/no-unused-vars | no-unused-vars | native | error |
| package-shared-production:@typescript-eslint/no-wrapper-object-types | package-shared-production | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| package-shared-production:@typescript-eslint/prefer-as-const | package-shared-production | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| package-shared-production:@typescript-eslint/prefer-namespace-keyword | package-shared-production | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| package-shared-production:@typescript-eslint/triple-slash-reference | package-shared-production | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| lesson-renderer-test:for-direction | lesson-renderer-test | for-direction | for-direction | native | error |
| lesson-renderer-test:no-async-promise-executor | lesson-renderer-test | no-async-promise-executor | no-async-promise-executor | native | error |
| lesson-renderer-test:no-case-declarations | lesson-renderer-test | no-case-declarations | no-case-declarations | native | error |
| lesson-renderer-test:no-compare-neg-zero | lesson-renderer-test | no-compare-neg-zero | no-compare-neg-zero | native | error |
| lesson-renderer-test:no-cond-assign | lesson-renderer-test | no-cond-assign | no-cond-assign | native | error |
| lesson-renderer-test:no-constant-binary-expression | lesson-renderer-test | no-constant-binary-expression | no-constant-binary-expression | native | error |
| lesson-renderer-test:no-constant-condition | lesson-renderer-test | no-constant-condition | no-constant-condition | native | error |
| lesson-renderer-test:no-control-regex | lesson-renderer-test | no-control-regex | no-control-regex | native | error |
| lesson-renderer-test:no-debugger | lesson-renderer-test | no-debugger | no-debugger | native | error |
| lesson-renderer-test:no-delete-var | lesson-renderer-test | no-delete-var | no-delete-var | native | error |
| lesson-renderer-test:no-dupe-else-if | lesson-renderer-test | no-dupe-else-if | no-dupe-else-if | native | error |
| lesson-renderer-test:no-duplicate-case | lesson-renderer-test | no-duplicate-case | no-duplicate-case | native | error |
| lesson-renderer-test:no-empty | lesson-renderer-test | no-empty | no-empty | native | error |
| lesson-renderer-test:no-empty-character-class | lesson-renderer-test | no-empty-character-class | no-empty-character-class | native | error |
| lesson-renderer-test:no-empty-pattern | lesson-renderer-test | no-empty-pattern | no-empty-pattern | native | error |
| lesson-renderer-test:no-empty-static-block | lesson-renderer-test | no-empty-static-block | no-empty-static-block | native | error |
| lesson-renderer-test:no-ex-assign | lesson-renderer-test | no-ex-assign | no-ex-assign | native | error |
| lesson-renderer-test:no-extra-boolean-cast | lesson-renderer-test | no-extra-boolean-cast | no-extra-boolean-cast | native | error |
| lesson-renderer-test:no-fallthrough | lesson-renderer-test | no-fallthrough | no-fallthrough | native | error |
| lesson-renderer-test:no-global-assign | lesson-renderer-test | no-global-assign | no-global-assign | native | error |
| lesson-renderer-test:no-invalid-regexp | lesson-renderer-test | no-invalid-regexp | no-invalid-regexp | native | error |
| lesson-renderer-test:no-irregular-whitespace | lesson-renderer-test | no-irregular-whitespace | no-irregular-whitespace | native | error |
| lesson-renderer-test:no-loss-of-precision | lesson-renderer-test | no-loss-of-precision | no-loss-of-precision | native | error |
| lesson-renderer-test:no-misleading-character-class | lesson-renderer-test | no-misleading-character-class | no-misleading-character-class | native | error |
| lesson-renderer-test:no-nonoctal-decimal-escape | lesson-renderer-test | no-nonoctal-decimal-escape | no-nonoctal-decimal-escape | native | error |
| lesson-renderer-test:no-prototype-builtins | lesson-renderer-test | no-prototype-builtins | no-prototype-builtins | native | error |
| lesson-renderer-test:no-regex-spaces | lesson-renderer-test | no-regex-spaces | no-regex-spaces | native | error |
| lesson-renderer-test:no-self-assign | lesson-renderer-test | no-self-assign | no-self-assign | native | error |
| lesson-renderer-test:no-shadow-restricted-names | lesson-renderer-test | no-shadow-restricted-names | no-shadow-restricted-names | native | error |
| lesson-renderer-test:no-sparse-arrays | lesson-renderer-test | no-sparse-arrays | no-sparse-arrays | native | error |
| lesson-renderer-test:no-unassigned-vars | lesson-renderer-test | no-unassigned-vars | no-unassigned-vars | native | error |
| lesson-renderer-test:no-unexpected-multiline | lesson-renderer-test | no-unexpected-multiline | no-unexpected-multiline | native | error |
| lesson-renderer-test:no-unsafe-finally | lesson-renderer-test | no-unsafe-finally | no-unsafe-finally | native | error |
| lesson-renderer-test:no-unsafe-optional-chaining | lesson-renderer-test | no-unsafe-optional-chaining | no-unsafe-optional-chaining | native | error |
| lesson-renderer-test:no-unused-labels | lesson-renderer-test | no-unused-labels | no-unused-labels | native | error |
| lesson-renderer-test:no-unused-private-class-members | lesson-renderer-test | no-unused-private-class-members | no-unused-private-class-members | native | error |
| lesson-renderer-test:no-useless-assignment | lesson-renderer-test | no-useless-assignment | no-useless-assignment | native | error |
| lesson-renderer-test:no-useless-backreference | lesson-renderer-test | no-useless-backreference | no-useless-backreference | native | error |
| lesson-renderer-test:no-useless-catch | lesson-renderer-test | no-useless-catch | no-useless-catch | native | error |
| lesson-renderer-test:no-useless-escape | lesson-renderer-test | no-useless-escape | no-useless-escape | native | error |
| lesson-renderer-test:preserve-caught-error | lesson-renderer-test | preserve-caught-error | preserve-caught-error | native | error |
| lesson-renderer-test:require-yield | lesson-renderer-test | require-yield | require-yield | native | error |
| lesson-renderer-test:use-isnan | lesson-renderer-test | use-isnan | use-isnan | native | error |
| lesson-renderer-test:valid-typeof | lesson-renderer-test | valid-typeof | valid-typeof | native | error |
| lesson-renderer-test:no-var | lesson-renderer-test | no-var | no-var | native | error |
| lesson-renderer-test:prefer-const | lesson-renderer-test | prefer-const | prefer-const | native | error |
| lesson-renderer-test:prefer-rest-params | lesson-renderer-test | prefer-rest-params | prefer-rest-params | native | error |
| lesson-renderer-test:prefer-spread | lesson-renderer-test | prefer-spread | prefer-spread | native | error |
| lesson-renderer-test:@typescript-eslint/ban-ts-comment | lesson-renderer-test | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | error |
| lesson-renderer-test:@typescript-eslint/no-array-constructor | lesson-renderer-test | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| lesson-renderer-test:@typescript-eslint/no-duplicate-enum-values | lesson-renderer-test | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| lesson-renderer-test:@typescript-eslint/no-empty-object-type | lesson-renderer-test | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| lesson-renderer-test:@typescript-eslint/no-extra-non-null-assertion | lesson-renderer-test | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| lesson-renderer-test:@typescript-eslint/no-misused-new | lesson-renderer-test | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| lesson-renderer-test:@typescript-eslint/no-namespace | lesson-renderer-test | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| lesson-renderer-test:@typescript-eslint/no-non-null-asserted-optional-chain | lesson-renderer-test | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| lesson-renderer-test:@typescript-eslint/no-require-imports | lesson-renderer-test | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| lesson-renderer-test:@typescript-eslint/no-this-alias | lesson-renderer-test | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| lesson-renderer-test:@typescript-eslint/no-unnecessary-type-constraint | lesson-renderer-test | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| lesson-renderer-test:@typescript-eslint/no-unsafe-declaration-merging | lesson-renderer-test | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| lesson-renderer-test:@typescript-eslint/no-unsafe-function-type | lesson-renderer-test | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| lesson-renderer-test:@typescript-eslint/no-unused-expressions | lesson-renderer-test | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | error |
| lesson-renderer-test:@typescript-eslint/no-unused-vars | lesson-renderer-test | @typescript-eslint/no-unused-vars | no-unused-vars | native | error |
| lesson-renderer-test:@typescript-eslint/no-wrapper-object-types | lesson-renderer-test | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| lesson-renderer-test:@typescript-eslint/prefer-as-const | lesson-renderer-test | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| lesson-renderer-test:@typescript-eslint/prefer-namespace-keyword | lesson-renderer-test | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| lesson-renderer-test:@typescript-eslint/triple-slash-reference | lesson-renderer-test | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| math-content-production:for-direction | math-content-production | for-direction | for-direction | native | error |
| math-content-production:no-async-promise-executor | math-content-production | no-async-promise-executor | no-async-promise-executor | native | error |
| math-content-production:no-case-declarations | math-content-production | no-case-declarations | no-case-declarations | native | error |
| math-content-production:no-compare-neg-zero | math-content-production | no-compare-neg-zero | no-compare-neg-zero | native | error |
| math-content-production:no-cond-assign | math-content-production | no-cond-assign | no-cond-assign | native | error |
| math-content-production:no-constant-binary-expression | math-content-production | no-constant-binary-expression | no-constant-binary-expression | native | error |
| math-content-production:no-constant-condition | math-content-production | no-constant-condition | no-constant-condition | native | error |
| math-content-production:no-control-regex | math-content-production | no-control-regex | no-control-regex | native | error |
| math-content-production:no-debugger | math-content-production | no-debugger | no-debugger | native | error |
| math-content-production:no-delete-var | math-content-production | no-delete-var | no-delete-var | native | error |
| math-content-production:no-dupe-else-if | math-content-production | no-dupe-else-if | no-dupe-else-if | native | error |
| math-content-production:no-duplicate-case | math-content-production | no-duplicate-case | no-duplicate-case | native | error |
| math-content-production:no-empty | math-content-production | no-empty | no-empty | native | error |
| math-content-production:no-empty-character-class | math-content-production | no-empty-character-class | no-empty-character-class | native | error |
| math-content-production:no-empty-pattern | math-content-production | no-empty-pattern | no-empty-pattern | native | error |
| math-content-production:no-empty-static-block | math-content-production | no-empty-static-block | no-empty-static-block | native | error |
| math-content-production:no-ex-assign | math-content-production | no-ex-assign | no-ex-assign | native | error |
| math-content-production:no-extra-boolean-cast | math-content-production | no-extra-boolean-cast | no-extra-boolean-cast | native | error |
| math-content-production:no-fallthrough | math-content-production | no-fallthrough | no-fallthrough | native | error |
| math-content-production:no-global-assign | math-content-production | no-global-assign | no-global-assign | native | error |
| math-content-production:no-invalid-regexp | math-content-production | no-invalid-regexp | no-invalid-regexp | native | error |
| math-content-production:no-irregular-whitespace | math-content-production | no-irregular-whitespace | no-irregular-whitespace | native | error |
| math-content-production:no-loss-of-precision | math-content-production | no-loss-of-precision | no-loss-of-precision | native | error |
| math-content-production:no-misleading-character-class | math-content-production | no-misleading-character-class | no-misleading-character-class | native | error |
| math-content-production:no-nonoctal-decimal-escape | math-content-production | no-nonoctal-decimal-escape | no-nonoctal-decimal-escape | native | error |
| math-content-production:no-prototype-builtins | math-content-production | no-prototype-builtins | no-prototype-builtins | native | error |
| math-content-production:no-regex-spaces | math-content-production | no-regex-spaces | no-regex-spaces | native | error |
| math-content-production:no-self-assign | math-content-production | no-self-assign | no-self-assign | native | error |
| math-content-production:no-shadow-restricted-names | math-content-production | no-shadow-restricted-names | no-shadow-restricted-names | native | error |
| math-content-production:no-sparse-arrays | math-content-production | no-sparse-arrays | no-sparse-arrays | native | error |
| math-content-production:no-unassigned-vars | math-content-production | no-unassigned-vars | no-unassigned-vars | native | error |
| math-content-production:no-unexpected-multiline | math-content-production | no-unexpected-multiline | no-unexpected-multiline | native | error |
| math-content-production:no-unsafe-finally | math-content-production | no-unsafe-finally | no-unsafe-finally | native | error |
| math-content-production:no-unsafe-optional-chaining | math-content-production | no-unsafe-optional-chaining | no-unsafe-optional-chaining | native | error |
| math-content-production:no-unused-labels | math-content-production | no-unused-labels | no-unused-labels | native | error |
| math-content-production:no-unused-private-class-members | math-content-production | no-unused-private-class-members | no-unused-private-class-members | native | error |
| math-content-production:no-useless-backreference | math-content-production | no-useless-backreference | no-useless-backreference | native | error |
| math-content-production:no-useless-catch | math-content-production | no-useless-catch | no-useless-catch | native | error |
| math-content-production:preserve-caught-error | math-content-production | preserve-caught-error | preserve-caught-error | native | error |
| math-content-production:require-yield | math-content-production | require-yield | require-yield | native | error |
| math-content-production:use-isnan | math-content-production | use-isnan | use-isnan | native | error |
| math-content-production:valid-typeof | math-content-production | valid-typeof | valid-typeof | native | error |
| math-content-production:no-var | math-content-production | no-var | no-var | native | error |
| math-content-production:prefer-const | math-content-production | prefer-const | prefer-const | native | error |
| math-content-production:prefer-rest-params | math-content-production | prefer-rest-params | prefer-rest-params | native | error |
| math-content-production:prefer-spread | math-content-production | prefer-spread | prefer-spread | native | error |
| math-content-production:@typescript-eslint/ban-ts-comment | math-content-production | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | error |
| math-content-production:@typescript-eslint/no-array-constructor | math-content-production | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| math-content-production:@typescript-eslint/no-duplicate-enum-values | math-content-production | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| math-content-production:@typescript-eslint/no-empty-object-type | math-content-production | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| math-content-production:@typescript-eslint/no-explicit-any | math-content-production | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | error |
| math-content-production:@typescript-eslint/no-extra-non-null-assertion | math-content-production | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| math-content-production:@typescript-eslint/no-misused-new | math-content-production | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| math-content-production:@typescript-eslint/no-namespace | math-content-production | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| math-content-production:@typescript-eslint/no-non-null-asserted-optional-chain | math-content-production | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| math-content-production:@typescript-eslint/no-require-imports | math-content-production | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| math-content-production:@typescript-eslint/no-this-alias | math-content-production | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| math-content-production:@typescript-eslint/no-unnecessary-type-constraint | math-content-production | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| math-content-production:@typescript-eslint/no-unsafe-declaration-merging | math-content-production | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| math-content-production:@typescript-eslint/no-unsafe-function-type | math-content-production | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| math-content-production:@typescript-eslint/no-unused-expressions | math-content-production | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | error |
| math-content-production:@typescript-eslint/no-unused-vars | math-content-production | @typescript-eslint/no-unused-vars | no-unused-vars | native | error |
| math-content-production:@typescript-eslint/no-wrapper-object-types | math-content-production | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| math-content-production:@typescript-eslint/prefer-as-const | math-content-production | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| math-content-production:@typescript-eslint/prefer-namespace-keyword | math-content-production | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| math-content-production:@typescript-eslint/triple-slash-reference | math-content-production | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| math-content-test:for-direction | math-content-test | for-direction | for-direction | native | error |
| math-content-test:no-async-promise-executor | math-content-test | no-async-promise-executor | no-async-promise-executor | native | error |
| math-content-test:no-case-declarations | math-content-test | no-case-declarations | no-case-declarations | native | error |
| math-content-test:no-compare-neg-zero | math-content-test | no-compare-neg-zero | no-compare-neg-zero | native | error |
| math-content-test:no-cond-assign | math-content-test | no-cond-assign | no-cond-assign | native | error |
| math-content-test:no-constant-binary-expression | math-content-test | no-constant-binary-expression | no-constant-binary-expression | native | error |
| math-content-test:no-constant-condition | math-content-test | no-constant-condition | no-constant-condition | native | error |
| math-content-test:no-control-regex | math-content-test | no-control-regex | no-control-regex | native | error |
| math-content-test:no-debugger | math-content-test | no-debugger | no-debugger | native | error |
| math-content-test:no-delete-var | math-content-test | no-delete-var | no-delete-var | native | error |
| math-content-test:no-dupe-else-if | math-content-test | no-dupe-else-if | no-dupe-else-if | native | error |
| math-content-test:no-duplicate-case | math-content-test | no-duplicate-case | no-duplicate-case | native | error |
| math-content-test:no-empty | math-content-test | no-empty | no-empty | native | error |
| math-content-test:no-empty-character-class | math-content-test | no-empty-character-class | no-empty-character-class | native | error |
| math-content-test:no-empty-pattern | math-content-test | no-empty-pattern | no-empty-pattern | native | error |
| math-content-test:no-empty-static-block | math-content-test | no-empty-static-block | no-empty-static-block | native | error |
| math-content-test:no-ex-assign | math-content-test | no-ex-assign | no-ex-assign | native | error |
| math-content-test:no-extra-boolean-cast | math-content-test | no-extra-boolean-cast | no-extra-boolean-cast | native | error |
| math-content-test:no-fallthrough | math-content-test | no-fallthrough | no-fallthrough | native | error |
| math-content-test:no-global-assign | math-content-test | no-global-assign | no-global-assign | native | error |
| math-content-test:no-invalid-regexp | math-content-test | no-invalid-regexp | no-invalid-regexp | native | error |
| math-content-test:no-irregular-whitespace | math-content-test | no-irregular-whitespace | no-irregular-whitespace | native | error |
| math-content-test:no-loss-of-precision | math-content-test | no-loss-of-precision | no-loss-of-precision | native | error |
| math-content-test:no-misleading-character-class | math-content-test | no-misleading-character-class | no-misleading-character-class | native | error |
| math-content-test:no-nonoctal-decimal-escape | math-content-test | no-nonoctal-decimal-escape | no-nonoctal-decimal-escape | native | error |
| math-content-test:no-prototype-builtins | math-content-test | no-prototype-builtins | no-prototype-builtins | native | error |
| math-content-test:no-regex-spaces | math-content-test | no-regex-spaces | no-regex-spaces | native | error |
| math-content-test:no-self-assign | math-content-test | no-self-assign | no-self-assign | native | error |
| math-content-test:no-shadow-restricted-names | math-content-test | no-shadow-restricted-names | no-shadow-restricted-names | native | error |
| math-content-test:no-sparse-arrays | math-content-test | no-sparse-arrays | no-sparse-arrays | native | error |
| math-content-test:no-unassigned-vars | math-content-test | no-unassigned-vars | no-unassigned-vars | native | error |
| math-content-test:no-unexpected-multiline | math-content-test | no-unexpected-multiline | no-unexpected-multiline | native | error |
| math-content-test:no-unsafe-finally | math-content-test | no-unsafe-finally | no-unsafe-finally | native | error |
| math-content-test:no-unsafe-optional-chaining | math-content-test | no-unsafe-optional-chaining | no-unsafe-optional-chaining | native | error |
| math-content-test:no-unused-labels | math-content-test | no-unused-labels | no-unused-labels | native | error |
| math-content-test:no-unused-private-class-members | math-content-test | no-unused-private-class-members | no-unused-private-class-members | native | error |
| math-content-test:no-useless-backreference | math-content-test | no-useless-backreference | no-useless-backreference | native | error |
| math-content-test:no-useless-catch | math-content-test | no-useless-catch | no-useless-catch | native | error |
| math-content-test:preserve-caught-error | math-content-test | preserve-caught-error | preserve-caught-error | native | error |
| math-content-test:require-yield | math-content-test | require-yield | require-yield | native | error |
| math-content-test:use-isnan | math-content-test | use-isnan | use-isnan | native | error |
| math-content-test:valid-typeof | math-content-test | valid-typeof | valid-typeof | native | error |
| math-content-test:no-var | math-content-test | no-var | no-var | native | error |
| math-content-test:prefer-const | math-content-test | prefer-const | prefer-const | native | error |
| math-content-test:prefer-rest-params | math-content-test | prefer-rest-params | prefer-rest-params | native | error |
| math-content-test:prefer-spread | math-content-test | prefer-spread | prefer-spread | native | error |
| math-content-test:@typescript-eslint/no-array-constructor | math-content-test | @typescript-eslint/no-array-constructor | no-array-constructor | native | error |
| math-content-test:@typescript-eslint/no-duplicate-enum-values | math-content-test | @typescript-eslint/no-duplicate-enum-values | typescript/no-duplicate-enum-values | native | error |
| math-content-test:@typescript-eslint/no-empty-object-type | math-content-test | @typescript-eslint/no-empty-object-type | typescript/no-empty-object-type | native | error |
| math-content-test:@typescript-eslint/no-extra-non-null-assertion | math-content-test | @typescript-eslint/no-extra-non-null-assertion | typescript/no-extra-non-null-assertion | native | error |
| math-content-test:@typescript-eslint/no-misused-new | math-content-test | @typescript-eslint/no-misused-new | typescript/no-misused-new | native | error |
| math-content-test:@typescript-eslint/no-namespace | math-content-test | @typescript-eslint/no-namespace | typescript/no-namespace | native | error |
| math-content-test:@typescript-eslint/no-non-null-asserted-optional-chain | math-content-test | @typescript-eslint/no-non-null-asserted-optional-chain | typescript/no-non-null-asserted-optional-chain | native | error |
| math-content-test:@typescript-eslint/no-require-imports | math-content-test | @typescript-eslint/no-require-imports | typescript/no-require-imports | native | error |
| math-content-test:@typescript-eslint/no-this-alias | math-content-test | @typescript-eslint/no-this-alias | typescript/no-this-alias | native | error |
| math-content-test:@typescript-eslint/no-unnecessary-type-constraint | math-content-test | @typescript-eslint/no-unnecessary-type-constraint | typescript/no-unnecessary-type-constraint | native | error |
| math-content-test:@typescript-eslint/no-unsafe-declaration-merging | math-content-test | @typescript-eslint/no-unsafe-declaration-merging | typescript/no-unsafe-declaration-merging | native | error |
| math-content-test:@typescript-eslint/no-unsafe-function-type | math-content-test | @typescript-eslint/no-unsafe-function-type | typescript/no-unsafe-function-type | native | error |
| math-content-test:@typescript-eslint/no-unused-expressions | math-content-test | @typescript-eslint/no-unused-expressions | no-unused-expressions | native | error |
| math-content-test:@typescript-eslint/no-wrapper-object-types | math-content-test | @typescript-eslint/no-wrapper-object-types | typescript/no-wrapper-object-types | native | error |
| math-content-test:@typescript-eslint/prefer-as-const | math-content-test | @typescript-eslint/prefer-as-const | typescript/prefer-as-const | native | error |
| math-content-test:@typescript-eslint/prefer-namespace-keyword | math-content-test | @typescript-eslint/prefer-namespace-keyword | typescript/prefer-namespace-keyword | native | error |
| math-content-test:@typescript-eslint/triple-slash-reference | math-content-test | @typescript-eslint/triple-slash-reference | typescript/triple-slash-reference | native | error |
| app-test:@typescript-eslint/no-explicit-any | app-test | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | off |
| im3-test:@typescript-eslint/no-explicit-any | im3-test | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | off |
| package-test:@typescript-eslint/no-explicit-any | package-test | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | off |
| package-test:shared:@typescript-eslint/ban-ts-comment | package-test | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | off |
| package-test:shared:@typescript-eslint/no-unused-vars | package-test | @typescript-eslint/no-unused-vars | no-unused-vars | native | off |
| package-shared-production:no-useless-escape | package-shared-production | no-useless-escape | no-useless-escape | native | off |
| lesson-renderer-test:@typescript-eslint/no-explicit-any | lesson-renderer-test | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | off |
| math-content-production:no-useless-assignment | math-content-production | no-useless-assignment | no-useless-assignment | native | off |
| math-content-production:no-useless-escape | math-content-production | no-useless-escape | no-useless-escape | native | off |
| math-content-test:@typescript-eslint/ban-ts-comment | math-content-test | @typescript-eslint/ban-ts-comment | typescript/ban-ts-comment | native | off |
| math-content-test:@typescript-eslint/no-explicit-any | math-content-test | @typescript-eslint/no-explicit-any | typescript/no-explicit-any | native | off |
| math-content-test:@typescript-eslint/no-unused-vars | math-content-test | @typescript-eslint/no-unused-vars | no-unused-vars | native | off |
| math-content-test:no-useless-assignment | math-content-test | no-useless-assignment | no-useless-assignment | native | off |
| math-content-test:no-useless-escape | math-content-test | no-useless-escape | no-useless-escape | native | off |

## Compatibility Rule Mappings

| Policy ID | Profile | Legacy rule | Oxlint rule | Provider | Severity |
|---|---|---|---|---|---|
| app-production:react/no-deprecated | app-production | react/no-deprecated | react-js/no-deprecated | react-js | error |
| app-production:react-hooks/static-components | app-production | react-hooks/static-components | react-hooks-js/static-components | react-hooks-js | error |
| app-production:react-hooks/use-memo | app-production | react-hooks/use-memo | react-hooks-js/use-memo | react-hooks-js | error |
| app-production:react-hooks/preserve-manual-memoization | app-production | react-hooks/preserve-manual-memoization | react-hooks-js/preserve-manual-memoization | react-hooks-js | error |
| app-production:react-hooks/incompatible-library | app-production | react-hooks/incompatible-library | react-hooks-js/incompatible-library | react-hooks-js | warning |
| app-production:react-hooks/immutability | app-production | react-hooks/immutability | react-hooks-js/immutability | react-hooks-js | error |
| app-production:react-hooks/globals | app-production | react-hooks/globals | react-hooks-js/globals | react-hooks-js | error |
| app-production:react-hooks/refs | app-production | react-hooks/refs | react-hooks-js/refs | react-hooks-js | error |
| app-production:react-hooks/set-state-in-effect | app-production | react-hooks/set-state-in-effect | react-hooks-js/set-state-in-effect | react-hooks-js | error |
| app-production:react-hooks/error-boundaries | app-production | react-hooks/error-boundaries | react-hooks-js/error-boundaries | react-hooks-js | error |
| app-production:react-hooks/purity | app-production | react-hooks/purity | react-hooks-js/purity | react-hooks-js | error |
| app-production:react-hooks/set-state-in-render | app-production | react-hooks/set-state-in-render | react-hooks-js/set-state-in-render | react-hooks-js | error |
| app-production:react-hooks/unsupported-syntax | app-production | react-hooks/unsupported-syntax | react-hooks-js/unsupported-syntax | react-hooks-js | warning |
| app-production:react-hooks/config | app-production | react-hooks/config | react-hooks-js/config | react-hooks-js | error |
| app-production:react-hooks/gating | app-production | react-hooks/gating | react-hooks-js/gating | react-hooks-js | error |
| app-test:react/no-deprecated | app-test | react/no-deprecated | react-js/no-deprecated | react-js | error |
| app-test:react-hooks/static-components | app-test | react-hooks/static-components | react-hooks-js/static-components | react-hooks-js | error |
| app-test:react-hooks/use-memo | app-test | react-hooks/use-memo | react-hooks-js/use-memo | react-hooks-js | error |
| app-test:react-hooks/preserve-manual-memoization | app-test | react-hooks/preserve-manual-memoization | react-hooks-js/preserve-manual-memoization | react-hooks-js | error |
| app-test:react-hooks/incompatible-library | app-test | react-hooks/incompatible-library | react-hooks-js/incompatible-library | react-hooks-js | warning |
| app-test:react-hooks/immutability | app-test | react-hooks/immutability | react-hooks-js/immutability | react-hooks-js | error |
| app-test:react-hooks/globals | app-test | react-hooks/globals | react-hooks-js/globals | react-hooks-js | error |
| app-test:react-hooks/refs | app-test | react-hooks/refs | react-hooks-js/refs | react-hooks-js | error |
| app-test:react-hooks/set-state-in-effect | app-test | react-hooks/set-state-in-effect | react-hooks-js/set-state-in-effect | react-hooks-js | error |
| app-test:react-hooks/error-boundaries | app-test | react-hooks/error-boundaries | react-hooks-js/error-boundaries | react-hooks-js | error |
| app-test:react-hooks/purity | app-test | react-hooks/purity | react-hooks-js/purity | react-hooks-js | error |
| app-test:react-hooks/set-state-in-render | app-test | react-hooks/set-state-in-render | react-hooks-js/set-state-in-render | react-hooks-js | error |
| app-test:react-hooks/unsupported-syntax | app-test | react-hooks/unsupported-syntax | react-hooks-js/unsupported-syntax | react-hooks-js | warning |
| app-test:react-hooks/config | app-test | react-hooks/config | react-hooks-js/config | react-hooks-js | error |
| app-test:react-hooks/gating | app-test | react-hooks/gating | react-hooks-js/gating | react-hooks-js | error |
| im3-test:react/no-deprecated | im3-test | react/no-deprecated | react-js/no-deprecated | react-js | error |
| im3-test:react-hooks/static-components | im3-test | react-hooks/static-components | react-hooks-js/static-components | react-hooks-js | error |
| im3-test:react-hooks/use-memo | im3-test | react-hooks/use-memo | react-hooks-js/use-memo | react-hooks-js | error |
| im3-test:react-hooks/preserve-manual-memoization | im3-test | react-hooks/preserve-manual-memoization | react-hooks-js/preserve-manual-memoization | react-hooks-js | error |
| im3-test:react-hooks/incompatible-library | im3-test | react-hooks/incompatible-library | react-hooks-js/incompatible-library | react-hooks-js | warning |
| im3-test:react-hooks/immutability | im3-test | react-hooks/immutability | react-hooks-js/immutability | react-hooks-js | error |
| im3-test:react-hooks/globals | im3-test | react-hooks/globals | react-hooks-js/globals | react-hooks-js | error |
| im3-test:react-hooks/refs | im3-test | react-hooks/refs | react-hooks-js/refs | react-hooks-js | error |
| im3-test:react-hooks/set-state-in-effect | im3-test | react-hooks/set-state-in-effect | react-hooks-js/set-state-in-effect | react-hooks-js | error |
| im3-test:react-hooks/error-boundaries | im3-test | react-hooks/error-boundaries | react-hooks-js/error-boundaries | react-hooks-js | error |
| im3-test:react-hooks/purity | im3-test | react-hooks/purity | react-hooks-js/purity | react-hooks-js | error |
| im3-test:react-hooks/set-state-in-render | im3-test | react-hooks/set-state-in-render | react-hooks-js/set-state-in-render | react-hooks-js | error |
| im3-test:react-hooks/unsupported-syntax | im3-test | react-hooks/unsupported-syntax | react-hooks-js/unsupported-syntax | react-hooks-js | warning |
| im3-test:react-hooks/config | im3-test | react-hooks/config | react-hooks-js/config | react-hooks-js | error |
| im3-test:react-hooks/gating | im3-test | react-hooks/gating | react-hooks-js/gating | react-hooks-js | error |
| package-production:no-octal | package-production | no-octal | eslint-js/no-octal | eslint-js | error |
| package-test:no-octal | package-test | no-octal | eslint-js/no-octal | eslint-js | error |
| package-shared-production:no-octal | package-shared-production | no-octal | eslint-js/no-octal | eslint-js | error |
| lesson-renderer-test:no-octal | lesson-renderer-test | no-octal | eslint-js/no-octal | eslint-js | error |
| math-content-production:no-octal | math-content-production | no-octal | eslint-js/no-octal | eslint-js | error |
| math-content-test:no-octal | math-content-test | no-octal | eslint-js/no-octal | eslint-js | error |

## Obsolete Rule Removals

| Policy ID | Profile | Legacy rule | Disposition |
|---|---|---|---|
| app-production:react/jsx-uses-react | app-production | react/jsx-uses-react | remove-obsolete |
| app-production:react/jsx-uses-vars | app-production | react/jsx-uses-vars | remove-obsolete |
| app-test:react/jsx-uses-react | app-test | react/jsx-uses-react | remove-obsolete |
| app-test:react/jsx-uses-vars | app-test | react/jsx-uses-vars | remove-obsolete |
| im3-test:react/jsx-uses-react | im3-test | react/jsx-uses-react | remove-obsolete |
| im3-test:react/jsx-uses-vars | im3-test | react/jsx-uses-vars | remove-obsolete |

## Cutover Conditions

- No governed eslint.config.* file remains.
- No active workspace lint script starts ESLint or next lint.
- No application or package declares a direct ESLint dependency.
- Standard lint and anti-slop configurations are separate.
- Warnings remain blocking through --max-warnings 0.
- TypeScript remains a separate blocking tsc --noEmit gate.
- Historical ESLint statements remain only in historical records or migration evidence.
