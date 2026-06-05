# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`
>
> _(No standing structural-audit report. A prior reference to `measure/reports/structural-audit_20260526.md` was removed on 2026-06-05 — that file never existed in git.)_

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Basic glob in `scripts/extract-skill-inventory.ts` | Low | Open | Simple wildcard glob; replace with `fast-glob` for robustness and `**` support. |
| PreCalc skill extraction incomplete | Medium | Open | PreCalc uses a different lesson format without explicit objective headings; needs dedicated adapter in T12 rollout. |
| IM1 missing seed_standards.ts (77 placeholder std nodes) | Medium | Open | IM1 has no competency standard definitions; 77 placeholder standard nodes created without descriptions. |
| IM2 standards gap (41 missing definitions) | Medium | Open | IM2 seed_standards.ts has 48 definitions but lesson-standards reference 91 unique codes. |
| IM3 M1 generator coverage (3/16 skills = 18.75%) | Medium | Open | Only 3 lesson-level skills have deterministic generators. Remaining 13 need implementation. |
| IM3 M1 concept-level blueprint coverage incomplete | Medium | Open | ALEKS concept nodes have independentPracticeReady and generators but no blueprints authored. |
| math-content package lint gate missing | Medium | Open | `npm run lint --workspace=packages/math-content` fails; no ESLint flat config. 23 pre-existing violations. |
| PreCalc standards alignment missing | Medium | Open | PreCalc was out of scope for T4 (standards alignment). 158 worked_example nodes have no aligned_to_standard edges. |
| SRS contract type drift (ISO string vs v.number()) | High | Open | Intentional adapter pattern: contract uses ISO string, Convex stores number. Schema alignment deferred. |
| Cross-track: placement ↔ KST Track 1 integration unverified | High | Open | Adaptive Placement (`adaptive-placement_20260521`) seeds a `getKnowledgeState` that does not exist yet. Whoever implements `wire-kst-pipeline` (KST Track 1) MUST wire placement output into `getKnowledgeState` and add the deferred end-to-end test; do not close the placement track until then. In-track gaps live in that track's plan "Known Gaps" section. |
| Measure tooling gap: `generate.sh` / `doctor.sh` referenced but absent | Medium | Open | Multiple track plans reference `measure/generate.sh` / `measure/doctor.sh`; neither exists and no `npm run generate`/`doctor` script exists. Substitute the real tooling: `node scripts/check-monorepo-boundaries.mjs` + per-app `npm run ws:<app>:lint`/`:test` + `tsc --noEmit`. Fix new plans to cite these directly. |
