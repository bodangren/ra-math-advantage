# Track: Danielson App Import

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: `vinext-oxc-toolchain_20261114` (Phases S1 and S2);
`prod-deploy-pipeline_20261114` (Phase S3 only)

## Overview

This track imports the Danielson Framework professional development site
(`github.com/bodangren/hdkwa-danielson`) into this repository as `apps/danielson`, with its
git history. It moves the open Measure tracks of the source into the root Measure registry,
and it removes the nested Measure folder and the other duplicates. It moves the app to the
toolchain of this repository: vinext 1.x with no `next`, oxlint, oxfmt, tsrs, and vitest.
Then it deploys the app as the Cloudflare Worker `danielson` on workers.dev, through the
local deploy pipeline.

Sprint goal: `apps/danielson` builds with the repository toolchain, keeps the source history,
and serves each route and each technique image from the Worker `danielson`.

## Current System (checked 2026-11-14)

- **Source:** `github.com/bodangren/hdkwa-danielson`, branch `main`, HEAD
  `c047df1186e9cba458407b6f7be9c6293a9d40fd` (71 commits). The local clone is
  `/home/daniebo/Desktop/hdkwa-danielson`. Its `origin/main` is `c047df1`. Its local `main`
  has one more commit, `2f85ed9`, which the import does not need. Never write in that clone.
- **Stack:** a static Next.js site.
  - `next.config.ts`: `output: 'export'`, `trailingSlash: true`, `images.unoptimized`,
    `turbopack.root`, and `basePath: '/hdkwa-danielson'` in production.
  - `package.json` (name `temp_setup`): `next` 16.2.6, `react` and `react-dom` 19.2.4,
    `lucide-react` ^1.16.0, Tailwind 4 (`@tailwindcss/postcss`), `vitest` ^4.1.7, ESLint 9
    with `eslint-config-next`, `typescript` ^5, `@types/node` ^20, and the macOS-only
    devDependency `@rolldown/binding-darwin-arm64`. The app has its own
    `package-lock.json`.
  - Data: TypeScript files under `src/data/`. The app keeps user state in `localStorage`
    only. It has no server code and no account.
- **Files:** 229 tracked files: 60 under `measure/` and 169 others. `public/` has 70 files;
  62 are under `public/technique-images/`.
- **Routes:** `/`, `/domains`, `/domains/[id]`, `/references`, `/report`, and
  `/strategy/[slug]`. The two dynamic pages use `generateStaticParams`.
- **Base path:** `src/lib/imagePath.ts` has `publicPath()`, which puts
  `process.env.__NEXT_ROUTER_BASEPATH` before a public path. 2 files use it.
- **Deploy:** `.github/workflows/deploy.yml` deploys to GitHub Pages on each push to `main`.
- **Image script:** `scripts/generate-technique-images.mjs` renders the technique images
  from `src/data/techniques.ts` into `public/technique-images/` with `sharp`, with no
  network call. `package.json` does not list `sharp`.
- **Nested Measure:** `measure/` has `product.md`, `product-guidelines.md`, `tech-stack.md`,
  `workflow.md`, `tech-debt.md`, `lessons-learned.md`, `archive/`, `generated/`, and five
  open tracks:
  - `gamification_badge_system_20260527` (`[ ]`)
  - `domain_4_content_hub_20260527` (`[ ]`)
  - `implementation_report_export_20260527` (`[~]`, in progress)
  - `search_discovery_engine_20260605` (`[ ]`)
  - `teacher_onboarding_first_run_20260622` (`[ ]`)
- **Duplicates:** the root of the source has `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`,
  `README.md` (the `create-next-app` text), and `LICENSE` (GNU AGPL 3.0). The `README.md` of
  this repository says "Proprietary - All rights reserved".
- **This repository:** the root `package.json` has `"workspaces": ["apps/*", "packages/*"]`.
  The lockfile holds `react` 19.2.7, `lucide-react` 1.17.0, `tailwindcss` 4.3.0, and
  `vitest` 4.1.8 today. `git` is 2.53.0; `git filter-repo` is not installed.
- **vinext static export** (vinext documentation and the example
  `examples/static-export`, read 2026-11-14): vinext supports `output: 'export'`.
  `vinext build` writes the site to `dist/client/`. On Cloudflare, a static export deploys
  `dist/client` as Workers Static Assets with no Worker entry. `trailingSlash: true` pairs
  with `html_handling: "force-trailing-slash"`, and `not_found_handling: "404-page"` keeps
  the generated 404 page.
- **Cloud:** no Worker `danielson` exists. The Convex project `danielson` (`2841695`) exists
  and stays for later; this track does not use it.

## Decisions (defaults of 2026-11-14)

- **D1 Import with history:** the import copies the source into a new temporary clone under
  `/tmp`, at `c047df1`. In that clone, `git filter-branch --index-filter` moves each file of
  each commit under `apps/danielson/`. Then this repository fetches the rewritten branch and
  merges it with `git merge --allow-unrelated-histories --no-ff`. So `git log -- apps/danielson`
  lists the source commits, with their authors, dates, and messages, under new SHAs. The
  local clone in `/home/daniebo/Desktop/hdkwa-danielson` does not change.
- **D2 Measure artifacts:** each open track of the source moves to
  `measure/tracks/danielson-<old id>/` and keeps its status marks (`[~]` stays `[~]`). Its
  `metadata.json` gets the new `track_id`. Its `spec.md` gets one first line: "Imported from
  hdkwa-danielson on 2026-11-14. Paths are relative to `apps/danielson/`." The root
  `measure/tracks.md` gets a section "Danielson App" with one entry for each moved track.
  Each entry says that the track starts after this track closes.
- **D3 Product documents:** `measure/product.md` of the source moves to
  `apps/danielson/product.md`, and `measure/product-guidelines.md` moves to
  `apps/danielson/product-guidelines.md`. `apps/danielson/DESIGN.md` stays. The root
  `measure/index.md` gets Danielson rows in "Product Definition", "Product Guidelines", and
  "Design Definitions". `AGENTS.md` Scope and "Where to Look" name `apps/danielson/`.
- **D4 Removals:** after D2 and D3, the import removes `apps/danielson/measure/` (the rest),
  `apps/danielson/AGENTS.md`, `apps/danielson/CLAUDE.md`, `apps/danielson/package-lock.json`,
  and `apps/danielson/.github/`. The git history keeps them. `apps/danielson/LICENSE` and
  `apps/danielson/README.md` stay.
- **D5 Workspace and dependencies (approved by the orchestrator, 2026-11-14):** the app joins
  the `apps/*` workspaces. Its `package.json` loses the `name` field, as the other apps do.
  It removes `next`, `eslint`, `eslint-config-next`, and `@rolldown/binding-darwin-arm64`. It
  adds `vinext` with the range of `apps/math`. It takes the ranges of `apps/math` for
  `react`, `react-dom`, `lucide-react`, `tailwindcss`, `@tailwindcss/postcss`, `vitest`,
  `typescript`, and `@types/node`. It uses the root `oxlint`, `oxfmt`, and `tsrs`. This
  change comes in Phase S1, before the first `npm install`, because the lockfile must never
  hold `next` again (`vinext-oxc-toolchain_20261114`).
- **D6 Toolchain:** the app uses the script names, the config files, and the gate commands
  that `apps/math` uses after `vinext-oxc-toolchain_20261114`. `next.config.ts` keeps
  `output: 'export'`, `trailingSlash: true`, and `images.unoptimized`, and loses `basePath`
  and `turbopack`. If `vinext build` cannot make the static export, the app uses the vinext
  Worker build of `apps/math`, keeps `trailingSlash`, and the evidence file records the
  error.
- **D7 No base path:** the app serves from the root of its host. `src/lib/imagePath.ts`
  goes away, and its two callers use plain public paths.
- **D8 Worker:** `apps/danielson/wrangler.jsonc` has `"name": "danielson"`, the
  `compatibility_date` of `apps/math`, and `"assets": { "directory": "./dist/client",
  "html_handling": "force-trailing-slash", "not_found_handling": "404-page" }`, with no
  `main`. Phase S3 deploys it with `npm run deploy:app -- danielson` of
  `prod-deploy-pipeline_20261114`, which has no Convex step for this app.
- **D9 CI:** `.github/workflows/ci.yml` gets a `danielson` job with the lint, typecheck,
  test, and build steps of the `bm2` job. The root `package.json` gets `ws:danielson:*`
  scripts in the pattern of the other apps.
- **D10 License facts:** the app keeps and shows the Danielson Framework text (domains,
  components, and descriptors) under the license of the school. License holder: the school
  (Daniel, 2026-11-14: "Yes. We have that through the school.").
- **D11 Graph data:** the app data stays TypeScript in `apps/danielson/src/data/`. The
  Danielson graph domain in mastery-advantage can start, but this repository reads it only
  after its release, in a later track.
- **D12 Image script:** the import keeps `scripts/generate-technique-images.mjs` and does not
  run it. The committed images stay.

## Stories

### Story S1: Import the app with its history
**As a** developer
**I want** the Danielson app in `apps/danielson` with its source history and its open tracks in the root registry
**So that** the app is one more app of this repository, with one Measure registry

**Acceptance Criteria:**
- Given the repository after S1, When `git log --oneline -- apps/danielson` runs, Then it lists 71 source commits and the merge commit.
- Given the local clone, When S1 is complete, Then `git -C /home/daniebo/Desktop/hdkwa-danielson status --short` and its `HEAD` are the same as before S1.
- Given the root registry, When S1 is complete, Then `measure/tracks.md` lists the five moved tracks under "Danielson App", and `danielson-implementation_report_export_20260527` keeps `[~]`.
- Given `apps/danielson`, When S1 is complete, Then it has no `measure/`, `AGENTS.md`, `CLAUDE.md`, `package-lock.json`, or `.github/`, and it has `product.md`, `product-guidelines.md`, and `DESIGN.md`.
- Given `npm ls next`, When it runs after the S1 `npm install`, Then it shows no `next` package.

**Estimate:** M
**Priority:** Must

### Story S2: Repository toolchain
**As a** developer
**I want** the Danielson app on vinext 1.x, oxlint, oxfmt, tsrs, and vitest
**So that** each app of the repository has the same gates

**Acceptance Criteria:**
- Given the app, When the lint, typecheck, test, and build gates run, Then each gate passes.
- Given `npm run build --workspace=apps/danielson`, When it runs, Then `dist/client/` holds an `index.html` for each route of the source, each `/domains/<id>/`, and each `/strategy/<slug>/`, and each file of `public/technique-images/`.
- Given the app source, When `git grep -n -E "basePath|__NEXT_ROUTER_BASEPATH|publicPath" -- apps/danielson` runs, Then it finds no match.
- Given `.github/workflows/ci.yml`, When `node scripts/validate-ci.mjs` runs, Then it passes, and the workflow has a `danielson` job.

**Estimate:** M
**Priority:** Must

### Story S3: Deploy to the Worker danielson
**As a** teacher
**I want** the Danielson site at a workers.dev URL
**So that** I can use it after the GitHub Pages site closes

**Acceptance Criteria:**
- Given `npm run deploy:app -- danielson`, When it runs, Then the Worker `danielson` serves the site on workers.dev, and the smoke test passes.
- Given the deployed site, When the route check requests each route of `dist/client/` and each file of `public/technique-images/`, Then each request gives HTTP 200.
- Given an unknown path, When it is requested, Then the site gives the generated 404 page with HTTP 404.

**Estimate:** S
**Priority:** Must

## Non-Functional Requirements

- Never write in `/home/daniebo/Desktop/hdkwa-danielson`. Use a new temporary clone for the
  history rewrite.
- No dependency change outside D5.
- No change to the app behavior other than the base path (D7).
- No account, no Convex, and no observation feature.
- The track changes no cloud resource except the new Worker `danielson` in Phase S3.
- Shared packages do not import from `apps/`.
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: `apps/danielson` holds the app with the 71 source commits in `git log -- apps/danielson`.
- AC2: The root registry holds the five open tracks of the source; the nested Measure folder
  and the duplicates are gone.
- AC3: The app builds with vinext 1.x and no `next`, and each gate passes.
- AC4: The app has no base path.
- AC5: The Worker `danielson` serves each route and each technique image with HTTP 200.
- AC6: `measure/index.md` and `AGENTS.md` name `apps/danielson`.

## External Dependencies

- **Source shutdown:** after Phase S3, the PM orchestrator owns the shutdown of the source
  repository and of its GitHub Pages site. This track does not change the source.

## Out of Scope

- Accounts, Convex, and observation features. A later track adds teacher accounts (Convex
  Auth v2) and observation workflows.
- The Danielson graph domain (D11).
- The work of the five moved tracks.
- A change of the license line in `README.md`.
- The Convex project `danielson`.
