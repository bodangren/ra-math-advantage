# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Basic glob in `scripts/extract-skill-inventory.ts` | Low | Open | Simple wildcard glob; replace with `fast-glob` for robustness and `**` support. |
| PreCalc skill extraction incomplete | Medium | Open | PreCalc uses a different lesson format without explicit objective headings; needs dedicated adapter in T12 rollout. Currently outputs 0 skill nodes. |
| IM1 missing seed_standards.ts (77 placeholder std nodes) | Medium | Open | IM1 has no competency standard definitions; 77 placeholder standard nodes created without descriptions. Backfill needed. |
| IM2 standards gap (41 missing definitions) | Medium | Open | IM2 seed_standards.ts has 48 definitions but lesson-standards reference 91 unique codes; 41 placeholder standard nodes created. |
| IM1 problem families missing | Low | Open | No problem-family data exists for IM1; no medium-confidence family-objective alignments possible. |
| Standards alignment regex parser in script | Low | Open | `scripts/align-standards.ts` uses regex to extract standards from TS seed files; fragile against format changes. Consider a TS compiler approach for robustness. |
| IM3 M1 generator coverage (3/16 skills = 18.75%) | Medium | Open | Only 3 lesson-level skills have deterministic generators. Remaining 13 need implementation before projections can replace runtime activity maps. Deferred to T11 rollout track. |
| IM3 M1 concept-level blueprint coverage incomplete | Medium | Open | ALEKS concept nodes have independentPracticeReady and generators but no blueprints authored. Only 6/31 concepts have blueprints. Concept→skill mapping needs explicit design decisions. |
| IM3 M1 dev pilot harness page missing | Low | Open | No interactive dev-only pilot harness page exists yet — only test-based validation. A React component rendering graph-derived blueprints would enable manual smoke testing. |
| `rate-of-change-calculator` renderer node in graph but no graph-derived component mapping | Low | Open | Renderer node exists but component registry mapping isn't exercised in the graph pipeline yet. |
