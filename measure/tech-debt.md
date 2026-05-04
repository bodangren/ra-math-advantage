# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Pre-existing lint errors block `npm run lint` | Medium | Open | 12 errors across `apps/integrated-math-3`: unused vars in schema validators (`graphingExplorerPropsValidator`, `stepByStepSolverPropsValidator`, `comprehensionQuizPropsValidator`, `fillInTheBlankPropsValidator`, `rateOfChangeCalculatorPropsValidator`, `discriminantAnalyzerPropsValidator`), `any` types in `convex/study.ts` and `e2e/accessibility.spec.ts`, `BrowserContext` unused import + `react-hooks/rules-of-hooks` violations in `e2e/fixtures.ts`, unused `fullPath` in `scripts/validate-seed-integrity.mjs` |
