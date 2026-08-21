# Verification

Date: 2026-08-21

## Automated checks

- Focused demo, projection, graph, component, report, and acceptance tests passed: 60 tests.
- Full Danielson test suite passed: 332 tests in 49 files.
- Coverage passed: 83.68 percent statements overall.
- Danielson lint passed.
- Danielson TypeScript passed.
- Convex TypeScript passed.
- Danielson production build passed.
- Monorepo boundary check passed.
- Quality parity check passed.
- Measure Doctor passed.
- `git diff --check` passed.

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
