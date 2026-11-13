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

## Accepted Risks

None.
