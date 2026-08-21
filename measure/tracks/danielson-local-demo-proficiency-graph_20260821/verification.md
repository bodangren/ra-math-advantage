# Verification

Date: 2026-08-21

## Automated checks

- Focused review-fix demo, projection, graph, component, report, and acceptance tests passed: 66 tests.
- Full Danielson test suite passed: 338 tests in 49 files.
- Coverage passed: 84.17 percent statements, 72.57 percent branches, 90.51 percent functions, and 89.38 percent lines overall.
- Danielson lint passed.
- Danielson TypeScript passed.
- Convex TypeScript passed.
- Danielson production build passed.
- Monorepo boundary check passed.
- Quality parity check passed.
- Measure Doctor passed.
- `git diff --check` passed.

## Review-fix checks

- Seeded attention summaries are written for all seven demo teachers.
- Noah's seeded summary retains ratings 1, 2, and 2 for his three observed techniques.
- Formal Q4 component evidence covers all 22 components for the experienced scenarios.
- Portfolio and teacher reports use the existing formal component projection and preserve the 22-component rule.
- Report, graph, and walkthrough queue priority overlays use the same PIP and GBF rules.
- The SVG exposes a named group and keeps its node buttons in the accessibility tree.
- Seed conflicts preserve their reason and return a failing process status.
- The documented `.env.local` password path is covered by the seed-script tests.
- The Danielson-local installer residue and duplicate app guidance files were removed.

## Local Convex checks

- `npx convex dev --configure new --dev-deployment local --once` could not run in the non-interactive shell because the Convex CLI requested a project name.
- The existing local deployment started with `npx convex dev --once`.
- `DANIELSON_DEMO_PASSWORD=<local value> node scripts/seed-demo.mjs` returned `created`.
- The same command returned `already_seeded` on the second run.
- `npm run dev:stack` started Convex and the application at `http://localhost:3000/`.

## Browser check

- The local sign-in page loaded at `http://localhost:3000/auth/login`.
- The authenticated graph path was not entered in the browser because the demo password was not typed into the browser session.
- Automated component and report tests cover graph expansion, keyboard selection, evidence detail, zoom, pan, full screen, privacy, and the detailed companion list.
- Direct browser verification confirmed the page title `Danielson Teacher Growth`, visible username and password fields, and a visible sign-in button.
- Direct browser verification reported no console warnings or errors on the sign-in page.

## Second review verification

Date: 2026-08-21

- Focused second-review tests passed: 45 tests in 6 files.
- Full Danielson test suite passed: 344 tests in 50 files.
- Coverage passed: 84.68 percent statements, 73.77 percent branches, 91.37 percent functions, and 89.95 percent lines overall.
- The new formal evidence projection reached 87.09 percent statement coverage in its focused coverage run.
- Danielson lint passed.
- Danielson TypeScript passed.
- Convex TypeScript passed.
- Danielson production build passed.
- Measure facts generation passed.
- Measure Doctor passed.
- Monorepo boundary check passed.
- Quality parity check passed.
- `git diff --check` passed.

The second-review implementation fixes the organization-wide observation scan, shared effective formal evidence projection, legacy seed detection, SVG screen transforms, due labels, database-backed sales acceptance coverage, and environment-file parsing. The sign-in page is verified. The authenticated sales path remains open because the combined local stack requested a Convex deployment link.
