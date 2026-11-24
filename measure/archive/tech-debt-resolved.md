# Resolved Tech Debt Archive

> Rows moved from `measure/tech-debt.md`. Prune date: 2026-11-24.
> This file is history for closed rows. Do not add open items here.

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| IM3 auth wrapper inline duplication | Medium | Resolved | Resolved (FR-14) — IM3 server composes `@math-platform/core-auth` request-guards; mirrors BM2 (`code-review-remediation_20260609` Phase 5). Inline `getCookieValueFromHeader` + 401/403/503 builders removed. `parent-server-guards.ts` refactor deferred. |
