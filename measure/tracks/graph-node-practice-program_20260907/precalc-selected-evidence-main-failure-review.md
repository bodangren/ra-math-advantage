# Precalculus Q20 parent failure review

## Result

Only the route fixture failure belongs to the Q20 integration surface. The minimum correction is to keep the positive fixture at `kstApplied: false` and add a negative `kstApplied: true` case. The current main test now has this exact correction.

The other four failures are not caused by the Q20 reconciliation patch. They come from pre-existing pending curriculum and projection changes in main.

## Route contract

The public `precalculus-pilot` evidence route has a strict safe response contract. It requires `kstApplied === false`. The selected Q18 consumer does not apply a Knowledge Space Theory update. The current later-topic handlers routed through this endpoint also return `kstApplied: false`; their stored receipt schema is broad for compatibility, but no current production result claims `true`.

A positive fixture with `kstApplied: true` must receive HTTP 500. Changing the route to accept it would weaken the public response contract.

The valid test repair is:

- set `SAFE_APPLIED_RESULT.kstApplied` to `false`;
- retain the HTTP 200 and private-field projection assertions;
- add one explicit server-result fixture with `kstApplied: true`;
- assert HTTP 500 and no private response data.

Current main now implements this repair in `submission-authority.red.test.ts`. It does not bypass production validation.

## Unrelated curriculum failures

The Q20 reconciliation patch contains only the hyphenated evidence module, generated API declaration, public evidence route, and selected route/evidence tests. It does not contain a curriculum topic file, graph catalog, projection artifact, or curriculum test.

The two `curriculum-depth.test.ts` failures come from the pending Topic 1.1 source rewrite. The current file has 63 lines and no string that satisfies the old FRQ or AP-exam signal assertion. Q20 does not read or write this content.

The `planning-structure.test.ts` failure also comes from the pending Topic 1.1 source rewrite. The test still requires the old boilerplate phrase `Learning-objective family: \`1.1.A\``. Q20 does not change this file or assertion. The source correction track must decide whether to restore truthful equivalent content or update the stale boilerplate test from the actual source contract.

The `graph-integrity.test.ts` projection mismatch comes from pending graph and SRS projection changes. Q20 changes no graph input or projection JSON. Rebuild or correct that projection only in the owning graph task. Do not regenerate it as part of Q20.

## Disposition

The route fixture correction is safe and necessary. It does not change production code. The four curriculum failures must remain assigned to their existing source and graph work. They are not Q20 regressions and must not broaden the Q20 commit.
