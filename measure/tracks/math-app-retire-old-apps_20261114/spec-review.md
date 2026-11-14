# Spec Review: math-app-retire-old-apps_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track is member 3 of the "Unified Math App" set. It runs after the three course imports. It removes each remaining reference to the four old math apps (`integrated-math-1`, `integrated-math-2`, `integrated-math-3`, `pre-calculus`). It makes the path guard test final, updates the project documents so they describe one math app with four courses, and changes no app behavior. It also lists the open registry entries that name an old app, and it reports them at closeout without changing them.

### How the current system works, per this spec

After the course imports, the repository holds one math app at `apps/math` and BM2 at `apps/bus-math-v2`. The base track creates `scripts/__tests__/old-app-path-guard.test.ts` with `REMOVED_APPS` and `KEEP_PATHS`; each import track adds its old app name to `REMOVED_APPS`. Several documents still describe four math apps: `AGENTS.md`, `measure/index.md`, `measure/product.md`, `measure/architecture.md`, `measure/tech-stack.md`, `measure/knowledge-space.md`, `measure/practice-primitives-roadmap.md`, `README.md`, and `INTEGRATION.md`. The CI workflow still has the `im1-im2-precalc` job (removed by the import tracks), and the root `package.json` still has `ws:im1:*`, `ws:im2:*`, `ws:pc:*`, and `ws:im3:*` scripts. `measure/tracks.md` has open entries and program sections that name the old apps; this track records them and does not change them.

### Findings

- F1 [Major] plan.md (phases): The plan has no closeout phase. The spec NFR requires the origin sync (`git fetch`, `git pull --ff-only`, `git push`) after closeout and forbids any push before closeout; FR-7 requires the open registry entry list to be reported at closeout; the plan "Commits" rule names "the closeout step", but no task performs it. Rationale: Spec-required actions have no scheduled task, so the implementer decides when and how to close out the track.
- F2 [Nit] plan.md Phase 1 (baseline task): The task says "Run each gate on the start commit". Commands cannot run on a past commit without a checkout. Rationale: The intended meaning is "run each gate at track start and record the result"; the wording can mislead the implementer.
- F3 [Nit] spec.md FR-1: The term "the audit fixtures that the member evidence files list" names no file. Rationale: The phrase means the fixtures listed in the evidence files of the set members; one example path would remove the ambiguity without changing the build.

### Author Response
- F1: FIX (the plan has a "Closeout" section after the last phase: the Measure closeout, the FR-7 report, and the origin sync with the fast-forward stop rule)
- F2: DECLINE
- F3: DECLINE

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track is member 3 of the "Unified Math App" set. It runs after the three course imports. It removes each remaining reference to the four old math apps (`integrated-math-1`, `integrated-math-2`, `integrated-math-3`, `pre-calculus`). It makes the path guard test final, updates the project documents so they describe one math app with four courses, and changes no app behavior. It also lists the open registry entries that name an old app, and it reports them at closeout without changing them.

### How the current system works, per this spec

After the course imports, the repository holds one math app at `apps/math` and BM2 at `apps/bus-math-v2`. The base track creates `scripts/__tests__/old-app-path-guard.test.ts` with `REMOVED_APPS` and `KEEP_PATHS`; each import track adds its old app name to `REMOVED_APPS`. Several documents still describe four math apps: `AGENTS.md`, `measure/index.md`, `measure/product.md`, `measure/architecture.md`, `measure/tech-stack.md`, `measure/knowledge-space.md`, `measure/practice-primitives-roadmap.md`, `README.md`, and `INTEGRATION.md`. The root `package.json` still has `ws:im1:*`, `ws:im2:*`, `ws:pc:*`, and `ws:im3:*` scripts. `measure/tracks.md` has open entries and program sections that name the old apps; this track records them and does not change them.

### Findings

- None

## Round 3

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)
Cause: the revision of 2026-11-14 (the cloud inventory, the deletion of the three empty Convex projects, Convex Auth v2, and the CCSS rule). The spec and the plan changed after Round 2.

### What this track proposes

This track is member 3 of the "Unified Math App" set. It runs after the three course imports. It removes each remaining reference to the four old math apps, makes the path guard final, updates the project documents so they describe one math app with courses as data, and changes no app behavior. It also deletes the three empty Convex projects of the old apps through the Convex Management API, with a team access token from Daniel, after it confirms each project ID, name, and empty deployment list. It records the open registry entries that name an old app and reports them at closeout without changing them.

### How the current system works, per this spec

After the course imports, the repository holds one math app at `apps/math` and BM2 at `apps/bus-math-v2`. The base track creates `scripts/__tests__/old-app-path-guard.test.ts` with `REMOVED_APPS` and `KEEP_PATHS`. Several documents still describe four math apps: `AGENTS.md`, `measure/index.md`, `measure/product.md`, `measure/architecture.md`, `measure/tech-stack.md`, `measure/knowledge-space.md`, `measure/practice-primitives-roadmap.md`, `README.md`, and `INTEGRATION.md`. The root `package.json` still has `ws:im1:*`, `ws:im2:*`, `ws:pc:*`, and `ws:im3:*` scripts. On Convex team `435396`, the projects `integrated-math-1` (`2015980`), `integrated-math-2` (`2015859`), and `pre-calculus` (`2897579`) have no deployments; the Convex CLI has no project delete command, so the track uses the Management API with a team access token. Cloudflare has no Worker of IM1, IM2, or AP Precalc.

### Findings

- F4 [Nit] plan.md Phase 3 (FR-8 task): The task runs `npx wrangler deployments list --name <name>` but names no Cloudflare credential for it. Rationale: Without an OAuth login or a `CLOUDFLARE_API_TOKEN`, the command fails with an auth error, and the implementer must decide how to authenticate; the CI workflow shows the credential shape at `.github/workflows/ci.yml:288`.
- F5 [Nit] spec.md FR-8: The Worker existence check runs after the three project deletes. Rationale: A positive result cannot prevent the deletes at that point; the check is harmless as a report, but the order weakens the stated stop condition, and the wording does not say why the check comes last.
- F6 [Nit] spec.md FR-8: "If the API refuses the token" names no status codes. Rationale: The plan records the delete status code; naming 401 and 403 would fix the stop condition without changing the build.

### Author Response

- F4: DECLINE
- F5: DECLINE
- F6: DECLINE

## Accepted Risks

None.
