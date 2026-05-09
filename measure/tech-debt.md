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
