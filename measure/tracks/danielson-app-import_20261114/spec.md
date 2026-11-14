# Track: Danielson App Import

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: `vinext-oxc-toolchain_20261114` (Phases S1 and S2);
`prod-deploy-pipeline_20261114` (Phase S3 only)

## Overview

This track imports the Danielson Framework professional development site
(`github.com/bodangren/hdkwa-danielson`) into this repository as `apps/danielson`. The
import is one snapshot commit of `c047df1`, without the source history. Before that commit,
own-word paraphrases and labels replace the Danielson Framework text (section "Licence
Decision"). The track moves the open Measure tracks of the source into the root Measure
registry, and it removes the nested Measure folder and the other duplicates. It moves the app
to the toolchain of this repository: vinext 1.x with no `next`, oxlint, oxfmt, tsrs, and
vitest. Then it deploys the app as the Cloudflare Worker `danielson` on workers.dev, through
the local deploy pipeline.

Sprint goal: `apps/danielson` builds with the repository toolchain, holds no exact Danielson
Framework text (only own-word paraphrases, own-word labels, and the element IDs), and serves
each route and each technique image from the Worker `danielson`.

## Current System (checked 2026-11-14)

- **Source:** `github.com/bodangren/hdkwa-danielson`, branch `main`, HEAD
  `c047df1186e9cba458407b6f7be9c6293a9d40fd` (71 commits). The PM made the repository
  private on 2026-11-14 at 21:55. The local clone is `/home/daniebo/Desktop/hdkwa-danielson`.
  Its `origin/main` is `c047df1`. Its local `main` has one more commit, `2f85ed9`, which the
  import does not need. Never write in that clone.
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
  network call. Each image shows the technique title, the domain number, a short theme
  label, and the component name, which the script takes from the `alignment` field.
  `package.json` does not list `sharp`, and `node_modules/sharp` of this repository does not
  exist.
- **Framework text** (a probe of 2026-11-14 that recorded counts only, and no source text):
  - `src/data/danielson.ts` exports `DANIELSON_FRAMEWORK`: 4 domains (`1` to `4`) and 22
    components (`1a` to `1f`, `2a` to `2e`, `3a` to `3e`, `4a` to `4f`). Each element has a
    `title` and a `proficientDescriptor`: 26 titles and 26 descriptors, 52 text fields. Each
    title has 2 to 6 words.
  - Outside `danielson.ts`, a run of 6 or more words of this text occurs only in
    `src/data/techniques.ts` (2 runs).
  - A whole source title occurs in 57 files under `src/`: in 52 of the 63 files of
    `src/data/techniques/` (the `alignment` field, in the form `"<id>: <component title>"`),
    and in `src/data/techniques.ts`, `src/data/articleSections.ts`,
    `src/data/implementationGuides.ts`, `src/app/page.tsx`, and
    `src/app/references/page.tsx`.
  - Outside `src/`, a whole source title occurs in `measure/product.md`,
    `measure/product-guidelines.md`, `measure/tracks/domain_4_content_hub_20260527/spec.md`,
    and one archive file that D4 removes.
  - `src/app/domains/page.tsx` and `src/app/domains/[id]/page.tsx` read
    `DANIELSON_FRAMEWORK` and show its text.
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
  `vitest` 4.1.8 today. `git` is 2.53.0. This repository holds no Danielson Framework text
  today.
- **vinext static export** (vinext documentation and the example
  `examples/static-export`, read 2026-11-14): vinext supports `output: 'export'`.
  `vinext build` writes the site to `dist/client/`. On Cloudflare, a static export deploys
  `dist/client` as Workers Static Assets with no Worker entry. `trailingSlash: true` pairs
  with `html_handling: "force-trailing-slash"`, and `not_found_handling: "404-page"` keeps
  the generated 404 page.
- **Cloud:** no Worker `danielson` exists. The Convex project `danielson` (`2841695`) exists
  and stays for later; this track does not use it.

## Licence Decision (Daniel, 2026-11-14)

This decision replaces the PM licence hold of 2026-11-14 20:05 and its withdrawal of 20:30.

Daniel (Tasks, 2026-11-14 20:23):

> "Agreed that we can use summaries, adaptations, or paraphrased instead of the exact text."

The PM rules (2026-11-14 21:45):

1. No exact Danielson Framework text (descriptors, rubric wording) goes into the public Math
   repo, the public graph, or a public site. Use own-word summaries or paraphrases, plus the
   element IDs.
2. Import without the hdkwa-danielson history, as one snapshot commit. Replace the
   descriptor fields with paraphrases before the first commit.
3. D10 changes to "show the paraphrase".

The PM additions (2026-11-14 21:55):

- The PM made `bodangren/hdkwa-danielson` private. D1 reads only the local clone, with no
  network.
- The import scan fails on a run of 6 or more words shared with the source text. The
  release check of the Danielson graph domain in mastery-advantage uses the same rule.

D1, D4, D10, D12, D13, and D14 apply these rules.

## Decisions (defaults of 2026-11-14)

- **D1 Snapshot import:** the import reads only the local clone, with no network: no GitHub
  clone and no fetch. It runs
  `git -C /home/daniebo/Desktop/hdkwa-danielson archive --format=tar --prefix=apps/danielson/ c047df1`
  and extracts the tar at the root of this repository. The export has no `.git`.
  - Then, in the working tree, the import applies D2 to D4 and the paraphrase step (D13),
    and runs the checks of D14.
  - Then it makes one commit with the message
    `chore(danielson): import bodangren/hdkwa-danielson at c047df1 as one snapshot`.
  - The source history does not come into this repository; the source repo keeps it. A
    file that D4 removes, or a text that D13 replaces, never goes into a commit of this
    repository.
  - The D5 change of `package.json` and the lockfile comes in the next commit.
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
- **D4 Removals:** after D2 and D3, and before the snapshot commit, the import removes
  `apps/danielson/measure/` (the rest), `apps/danielson/AGENTS.md`,
  `apps/danielson/CLAUDE.md`, `apps/danielson/package-lock.json`, and
  `apps/danielson/.github/`. The source repo keeps them. `apps/danielson/LICENSE` and
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
- **D10 Framework text in the app:** the app shows own-word paraphrases of the descriptors,
  short own-word labels in place of the domain and component titles, and the element IDs
  (`1` to `4`, `1a` to `4f`). It shows no exact Danielson Framework text. So the app follows
  the graph rule ("IDs + paraphrased labels only"). License holder: the school (Daniel,
  2026-11-14: "Yes. We have that through the school."). The section "Licence Decision"
  gives the rules.
- **D11 Graph data:** the app data stays TypeScript in `apps/danielson/src/data/`. The
  Danielson graph domain in mastery-advantage can start, but this repository reads it only
  after its release, in a later track.
- **D12 Image script:** the import keeps `scripts/generate-technique-images.mjs` and does not
  run it, because `sharp` is not a dependency and D5 adds none. The committed images stay.
  Each image shows the component name from the source `alignment` field. So the images keep
  the source component titles as pixels, with no descriptor text. The checks of D14 read
  text files only. A later track can render the images again with the new labels.
- **D13 Paraphrase:** before the snapshot commit, the import replaces the framework text in
  each text file of the commit (D14a gives the file list). This covers `src/data/*.ts`,
  `src/data/techniques/*.ts`, the tests, `src/app/**`, `README.md`, `product.md`,
  `product-guidelines.md`, `DESIGN.md`, the moved tracks, and the rows that D2 and D3 add.
  The rules:
  - Each `proficientDescriptor` of `DANIELSON_FRAMEWORK` (26) becomes an own-word summary of
    one or two sentences, with 40 words or less.
  - Each `title` of `DANIELSON_FRAMEWORK` (26) becomes a short own-word label, with 6 words
    or less. Its normalized form (D14b) is not the normalized source title.
  - Under `apps/danielson/src/`, each whole source title becomes the new label of the same
    element. Each technique `alignment` becomes `<subdomain>: <new label of that component>`.
  - In each file of the commit, each run of 6 or more words that the file shares with the
    source text (D14a) becomes own words or the element ID.
  - A file outside `apps/danielson/src/` can keep a whole source title of 5 words or less,
    because a title is not a descriptor. The run rule of D14a applies to it.
  - The field names and the data shape stay, so the pages need no code change for the text.
- **D14 Text checks:** three rules make the paraphrase step decidable.
  - **D14a Import scan (local, not committed):** the script
    `/tmp/danielson-import/scan-framework-text.mjs` reads the source text at run time with
    `git -C /home/daniebo/Desktop/hdkwa-danielson show c047df1:src/data/danielson.ts`.
    - It takes the 26 `title` and the 26 `proficientDescriptor` string literals. If it does
      not find 26 and 26, it stops with exit code 2.
    - It normalizes each text: Unicode NFKC, lowercase, each `’` to `'`, then each run of
      characters other than `a` to `z`, `0` to `9`, and `'` to one space. The words are the
      parts between the spaces.
    - It reads each text file of the staged snapshot from the index: each path that
      `git diff --cached --numstat` gives with line counts.
    - The run rule: 6 consecutive words of a file that are also 6 consecutive words of one
      source text (a run of 6 or more words) are a hit. The release check of the Danielson
      graph domain in mastery-advantage uses the same threshold.
    - The title rule: all words of a source title, in order and next to each other, in a
      file under `apps/danielson/src/`, are a hit.
    - It stops with exit code 1 if it finds a hit, and with exit code 0 if not.
    - For each hit, the output gives the path, the line, the element ID and kind (for
      example `3b:descriptor`), and the run length, never the words. The last line gives the
      file count and the hit counts.
    - With `--hashes`, the script prints the 52 lines `<id>:<kind> <sha256>` of D14b and
      nothing else.
    - The script and its output contain no source text. Both go into `evidence.md`.
  - **D14b Guard test (committed):** `apps/danielson/src/data/framework-text.test.ts` holds
    the 52 SHA-256 values (hex) of the normalized source titles and descriptors, with the
    keys `<id>:title` and `<id>:descriptor`. It holds no source text.
    - The hash normalization: trim, lowercase, and each run of whitespace to one space. The
      hash is SHA-256 of the UTF-8 bytes.
    - The test loads each module of `src/data/` except the tests, with
      `import.meta.glob('./**/*.ts', { eager: true })`. It walks each exported value.
    - It hashes each string value. When a value starts with an element ID and `: `, it also
      hashes the rest of the value. It fails when a hash is on the list.
    - A failure message gives the module, the path of the field, and the key, never the
      value.
    - It also checks that `DANIELSON_FRAMEWORK` has the 26 element IDs of the list, each
      with a non-empty `title` and `proficientDescriptor`.
    - It also checks that each technique `alignment` is
      `<subdomain>: <title of that component in DANIELSON_FRAMEWORK>`.
  - **D14c Order:** Red writes D14b after the export and before any paraphrase. On the
    source data, D14b fails and names each of the 52 fields of `DANIELSON_FRAMEWORK`. Then
    Green writes the paraphrases (D13) until D14b passes and D14a reports no hit. Both
    steps run in Phase S1, before the snapshot commit, and their work lands in that commit.

## Stories

### Story S1: Import the app as one snapshot with paraphrased framework text
**As a** developer
**I want** the Danielson app in `apps/danielson` as one snapshot of `c047df1`, with own-word framework text, and its open tracks in the root registry
**So that** the app is one more app of this repository, with one Measure registry and no exact Danielson Framework text

**Acceptance Criteria:**
- Given the repository after S1, When `git log --reverse --format='%H %P %s' -- apps/danielson` runs, Then its first commit has one parent and a subject that names `bodangren/hdkwa-danielson` and `c047df1`, and `git log --merges --oneline -- apps/danielson` lists no commit.
- Given the local clone, When S1 is complete, Then `git -C /home/daniebo/Desktop/hdkwa-danielson status --short`, `rev-parse HEAD origin/main`, and `for-each-ref` give the same output as before S1.
- Given the staged snapshot, When the D14a scan runs, Then it reports no run of 6 or more words and no whole title under `apps/danielson/src/`, and `evidence.md` holds the script and its output.
- Given the source data in the working tree, When the D14b guard runs before the paraphrase, Then it fails and names each of the 52 fields of `DANIELSON_FRAMEWORK`.
- Given the snapshot commit, When the app tests run, Then the D14b guard passes, and each technique `alignment` is `<subdomain>: <label of that component>`.
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

- Never write in `/home/daniebo/Desktop/hdkwa-danielson`. Read it only with `git -C` and
  `archive`, `show`, `rev-parse`, `rev-list`, `status`, or `for-each-ref`.
- Do not clone or fetch the source repository, and make no network call to GitHub for it.
- No exact Danielson Framework text (descriptors, rubric wording) goes into a commit, a
  commit message, a git note, `evidence.md`, or a log. Record element IDs, counts, paths,
  and hashes only.
- No dependency change outside D5.
- No change to the app behavior other than the base path (D7) and the paraphrased framework
  text (D10, D13).
- No account, no Convex, and no observation feature.
- The track changes no cloud resource except the new Worker `danielson` in Phase S3.
- Shared packages do not import from `apps/`.
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires, with the S1 exception of the
  plan (D14c). Each phase ends with the Phase Completion Verification and Checkpointing
  Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: `apps/danielson` comes from one snapshot commit of `c047df1`, with no source history
  and no merge commit.
- AC2: The root registry holds the five open tracks of the source; the nested Measure folder
  and the duplicates are gone.
- AC3: The app builds with vinext 1.x and no `next`, and each gate passes.
- AC4: The app has no base path.
- AC5: The Worker `danielson` serves each route and each technique image with HTTP 200.
- AC6: `measure/index.md` and `AGENTS.md` name `apps/danielson`.
- AC7: No committed file shares a run of 6 or more words with the source titles and
  descriptors, the app source shows no whole source title, and the D14b guard passes.
- AC8: The import read only the local clone, and the clone did not change.

## External Dependencies

- **Source repository:** `bodangren/hdkwa-danielson` stays untouched. This track does not
  change it, its GitHub Pages site, or the local clone. The future of the source repository
  is a separate item for Daniel, through the PM orchestrator.

## Out of Scope

- Accounts, Convex, and observation features. A later track adds teacher accounts (Convex
  Auth v2) and observation workflows.
- The Danielson graph domain (D11).
- The work of the five moved tracks.
- A change of the license line in `README.md`.
- The Convex project `danielson`.
- Any change to `bodangren/hdkwa-danielson`.
- A new render of the technique images (D12).
