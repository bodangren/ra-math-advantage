# Track: Project Documents for the New Direction

Type: Chore
Spec format: Story-shaped (one story)
Depends on: each track of the 2026-11-14 queue exists in `measure/tracks.md`

## Overview

On 2026-11-14 the orchestrator and Daniel set a new direction for this repository: one
math app, Convex Auth v2, the mastery-advantage graph, OpenRouter, vinext 1.x with the Oxc
tools, local deploys to Cloudflare Workers, and the PM rules for shared work. The tracks of
that direction exist, but the project documents still describe the old plan, and some of
their instructions are wrong today.

This track rewrites the project documents. Each document keeps the current state and the
direction apart: the current state is what the repository holds now, and each direction
item is marked as planned, with its track.

Sprint goal: an agent that reads `README.md`, `AGENTS.md`, and `measure/index.md` gets the
current state, the planned direction with its tracks, and no wrong instruction.

## Current System (checked 2026-11-14 on `c38243a3`)

- **Apps:** `apps/integrated-math-3` (active), `apps/integrated-math-1`,
  `apps/integrated-math-2`, and `apps/pre-calculus` (each with its own Convex schema and
  curriculum), and `apps/bus-math-v2`. Each app has a `wrangler.jsonc`.
- **Stack today:** vinext 0.0.55 with `next` 16.2.7, React 19.2.7, Convex 1.40.0,
  TypeScript 6.0.3, Tailwind CSS 4.3.0, Vite 8.0.16, Vitest 4.1.8, Playwright 1.60.0,
  wrangler 4.98.0, and ESLint. The root `package.json` has no `engines` field.
- **Auth today:** the custom JWT auth of `packages/core-auth` (cookie `bm_session`, 12-hour
  TTL, `AUTH_JWT_SECRET`).
- **AI today:** `packages/ai-tutoring` calls `https://openrouter.ai/api/v1` with `fetch`
  and `OPENROUTER_API_KEY`, with the default model `openrouter/free`.
- **Graph today:** each math app has graph files under `curriculum/skill-graph/`. The
  contract is the in-repo copy `kst-srs.v2/SPECIFICATION.md`.
- **Deploy today:** Cloudflare Workers `integrated-math-3` and `bus-math-v2` exist on
  workers.dev with no traffic. `.github/workflows/cloudflare-deploy.yml` is a dispatched
  workflow. No deploy ran from this repository.
- **Wrong instructions in documents (examples):**
  - `measure/tech-stack.md` and `measure/tech-specs.md` name "Vercel (primary)" as the
    deploy platform.
  - `INTEGRATION.md` names root scripts `ws:lint`, `ws:typecheck`, `ws:test`, and
    `ws:build`, which do not exist. It gives the package test command
    `npm run ws --workspace=...`, the command `npx convex schema push`, and
    "Cloudflare Pages".
  - `measure/monorepo-ops.md` gives `npx convex run seed.ts`, and says that IM3
    `npm run dev` starts Convex.
  - `measure/current_directive.md` gives the 2026-06-09 directive.
  - `measure/product.md` lists three math apps (no AP Precalculus) and asks for namespaced
    competency codes (`IM1.A.REI.B.3`).
- **Tests that read documents:**
  - `packages/knowledge-space-core/src/__tests__/docs-reconciliation.test.ts` and
    `phase-1-adversarial.test.ts`: `measure/index.md` has the row "Knowledge Space
    Contract" and the text `SPECIFICATION.md`. `measure/knowledge-space.md` links to
    `kst-srs.v2/SPECIFICATION.md` and does not contain "source of truth".
  - `apps/bus-math-v2/__tests__/config/cloudflare-launch-hardening.test.ts` checks
    `measure/architecture.md` only when it names `cloudflare-launch-checklist`.
- **License facts (Daniel, 2026-11-14):** the school holds the Danielson Framework license
  ("Yes. We have that through the school."). The curriculum content is reproducible
  material from various publishers. The repository stays public ("Public is fine.").

## Decisions (defaults of 2026-11-14)

- **W1 Planned marker:** a direction item in a document has the marker
  `(planned: <track id>)`, for example `(planned: math-app-base_20261114)`. The track that
  completes the item removes the marker and writes the current state. `AGENTS.md` states
  this rule.
- **W2 Facts:** each new fact comes from the repository, the lockfile, or a track of the
  queue. Commands are quoted exactly. The dev commands stay as they are today. No document
  names a hard-coded model ID, except `openrouter/free` as the dev default of today.
- **W3 Direction items:** the documents give these items, each with its track:
  1. One math app `apps/math` with IM1, IM2, IM3, and AP Precalculus as course data; AP
     Calculus and AP Statistics later; the old apps retire with no redirects; BM2 stays a
     separate app; `apps/danielson` comes in by import (`math-app-base_20261114`, the
     course imports, `math-app-retire-old-apps_20261114`, `danielson-app-import_20261114`).
  2. One student account and history across years, and licenses for each seat and year
     (`math-app-student-history_20261114`, `math-app-seat-licensing_20261114`).
  3. Convex Auth v2 in the math app and in BM2; the custom JWT auth retires
     (`math-app-base_20261114`, `bm2-convex-auth-v2_20261114`).
  4. The graph source is mastery-advantage
     (`github.com/Reading-Advantage-Thailand/mastery-advantage`), contract kst-srs.v3.2
     (`kst-v32-runtime_20261114`, `math-graph-consume_20261114`).
  5. AI through OpenRouter with `@openrouter/sdk`: one model variable for each role,
     `openrouter/free` for dev only, structured output for the evaluation roles, no PII in
     prompts, zero data retention only where a role needs it, decision models later
     (`openrouter-sdk-ai-layer_20261114`).
  6. vinext 1.x with no `next`, oxlint, oxfmt, and tsrs; Node 22 or later; the repository
     is a test bed for the Oxc tools (`vinext-oxc-toolchain_20261114`).
  7. Cloudflare Workers and Convex, not Vercel. Local deploys with the OAuth logins of
     `wrangler` and `convex`; deploy keys piped into `wrangler secret put`; the orchestrator
     runs prod deploys and the cloud cleanup (Daniel, 2026-11-14), and reports each first
     deploy of an app to the PM (`prod-deploy-pipeline_20261114`).
  8. All work through Measure tracks: a checkpoint at the end of each phase, a sync with
     origin at the end of each track, and the track order of `measure/tracks.md`.
  9. Cross-project rules: the PM orchestrator (project advantage-pr) is the only
     coordinator; no write in another repository; read-only questions are allowed.
  10. Shared machine rules: run `~/Desktop/advantage-pr/scripts/jobs/slot check` before a
      role; heavy runs go through `~/Desktop/advantage-pr/scripts/jobs/heavy-run.sh`, one
      at a time; role models come from `~/Desktop/advantage-pr/scripts/jobs/ra-quota pick
      <role>`; paid spend needs Daniel's word; the full rules are in
      `~/Desktop/advantage-pr/measure/pm-working-rules.md`.
- **W4 File groups:** the track changes these files, one task for each group:
  1. `README.md`. The license line stays "Proprietary - All rights reserved".
  2. `AGENTS.md`. `CLAUDE.md` stays `@AGENTS.md`.
  3. `measure/index.md`, `measure/product.md`, `measure/architecture.md`,
     `measure/tech-stack.md`, `measure/knowledge-space.md`, and
     `measure/current_directive.md`.
  4. The other `measure/*.md` files: only a sentence that gives a wrong instruction today
     changes. The evidence file lists each file that stays as it is.
  5. `INTEGRATION.md`: only a contradiction with the current state or the direction
     changes. The evidence file lists the other old sections for
     `math-app-retire-old-apps_20261114`.
  6. `measure/tracks/math-app-retire-old-apps_20261114/{spec,plan}.md`: its document tasks
     also change each planned marker of the math app items into current-state text.
- **W5 Test constraints:** `measure/index.md` keeps the row "Knowledge Space Contract" with
  `SPECIFICATION.md`. `measure/knowledge-space.md` keeps the link to
  `kst-srs.v2/SPECIFICATION.md` and does not contain "source of truth".
  `measure/architecture.md` does not name `cloudflare-launch-checklist`.
  `kst-v32-runtime_20261114` changes these links later.
- **W6 License facts:** `README.md` and `measure/product.md` record the license facts of
  "Current System". The license line of `README.md` does not change.
- **W7 Out of these files:** `measure/workflow.md`, `measure/tracks.md` (except this track
  entry), `measure/lessons-learned.md`, `measure/tech-debt.md`, the archive, and the
  audit reports do not change. `prod-deploy-pipeline_20261114` owns the Deployment
  section of `measure/workflow.md`.

## Stories

### Story S1: Documents give the current state and the planned direction
**As an** agent or a developer
**I want** documents that separate the current state from the planned direction
**So that** I follow no wrong instruction and I find the track of each planned item

**Acceptance Criteria:**
- Given `README.md`, `AGENTS.md`, and the group 3 files, When an agent reads them, Then each direction item of W3 has a `(planned: <track id>)` marker, and each current-state fact matches the repository.
- Given the wrong instructions of "Current System", When the track is complete, Then no document of the groups gives them.
- Given `README.md`, When the track is complete, Then its license line is "Proprietary - All rights reserved", and it records the license facts.
- Given the test constraints of W5, When the track is complete, Then each constraint holds.
- Given the evidence file, When the track is complete, Then it lists the `measure/*.md` files that stay as they are and the old sections of `INTEGRATION.md` for the retire track.

**Estimate:** M
**Priority:** Must

## Non-Functional Requirements

- Docs only. No code, test, config, or dependency change.
- Mark a task `[~]` before its first edit and `[x]` after its commit. Make one commit for
  each file group.
- No archive step for this track.
- Write all new prose in ASD-STE100. Quote commands, paths, and source text exactly.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.

## Acceptance Criteria

- AC1: The six file groups of W4 are complete, each in its own commit.
- AC2: Each W3 direction item appears with its planned marker in `README.md` or
  `AGENTS.md`, and in the group 3 files where it applies.
- AC3: The W5 constraints hold.
- AC4: The evidence file lists the unchanged files and the old `INTEGRATION.md` sections.

## Out of Scope

- The content changes that the other tracks own (each planned item).
- `measure/workflow.md`, `measure/lessons-learned.md`, `measure/tech-debt.md`, the archive,
  and the audit reports.
- The license line of `README.md`.
