# Saved worktrees 4f74 and 54ed preservation review

## Result

Worktree `4f74` can be removed after parent review. Its saved HEAD is an ancestor of current main. Its 13 unique working states are superseded Lesson 1.8 and Measure states.

Do not remove worktree `54ed` until a Git ref preserves its detached two-commit history. Its one unique working state is superseded. No working-tree content needs integration from either worktree.

This review did not edit or remove a worktree. It did not change a Git ref. Retain `02d6` and `18ee`.

## Method

I expanded all tracked and untracked status entries. I compared file bytes, absent-file states, file modes, and symbolic-link targets with current main, `02d6`, and `18ee`. I scanned ignored paths. I reviewed each state that had no exact external match. I also checked branch, tag, and current-main ancestry for each saved HEAD.

## Worktree 4f74

- Path: `/Users/daniel.bodanske/.codex/worktrees/4f74/ra-math-advantage`
- Saved HEAD: `106e1cb29e48540457732745c6335a31f6a47160`
- Reachability: current `master` contains saved HEAD.
- Status: 123 modified files, 15 deleted paths, and 226 untracked paths.
- Ignored paths: none.

### Exact-state counts

| Preservation location | Count |
| --- | ---: |
| Main, `02d6`, and `18ee` | 210 |
| `02d6` and `18ee` | 129 |
| Main and `02d6` | 12 |
| No exact external state | 13 |
| Total | 364 |

No file mode or symbolic-link target is unique.

### Review of the 13 unique states

Nine graph and projection files, two tests, and two Measure files form one old Lesson 1.8 candidate. One path is counted in only one category below; the total is 13.

The test `example-1-8-2-alignment.test.ts` maps only Example 2 to the linear-quadratic systems skill. It requires Worked, Guided, and Independent solver activities. It also reuses the printed worked solution as the Independent response. The unique graph, projection, and `pilot-rendering.test.ts` states implement or validate this executable candidate.

Current main has the accepted full Lesson 1.8 reconciliation. It maps Examples 1 through 4 to the linear-quadratic systems skill. It maps Examples 5 through 7 to the two-quadratic systems skill. It keeps all executable modalities unavailable because the exact renderer, generator, response input, and server grader are absent. The current `lesson-1-8-reconciliation.test.ts` verifies this boundary. The saved executable candidate conflicts with that accepted decision.

The saved graph catalogs also predate the accepted Lesson 1.1 through Lesson 1.8 reconciliations. They omit later nodes and contain older broad records. The root catalogs and projection files are mirrors of the same stale candidate. The saved `measure/tracks.md` and remediation plan are old progress snapshots. Do not integrate any of these 13 states.

### 4f74 disposition

No unique useful source, test, graph, projection, or planning content remains. Saved HEAD is reachable from `master`. Worktree `4f74` can be removed after parent verification.

## Worktree 54ed

- Path: `/Users/daniel.bodanske/.codex/worktrees/54ed/ra-math-advantage`
- Saved HEAD: `525dd4ec51803c66e1a01a562714fa4c2bf5872c`
- Merge base with current main: `106e1cb29e48540457732745c6335a31f6a47160`
- Reachability: no branch or tag contains saved HEAD. Saved HEAD is not an ancestor of current main.
- Status: 113 modified files, 15 deleted paths, and 220 untracked paths.
- Ignored paths: none.

### Exact-state counts

| Preservation location | Count |
| --- | ---: |
| Main, `02d6`, and `18ee` | 210 |
| `02d6` and `18ee` | 121 |
| Main and `02d6` | 12 |
| `02d6` only | 4 |
| No exact external state | 1 |
| Total | 348 |

No file mode or symbolic-link target is unique.

### Detached commit history

Two commits follow the merge base:

1. `4f28e978f` — `fix(knowledge-space): repair module 1 projection and graph view`
2. `525dd4ec5` — `measure(plan): record M1-F projection repair`

The implementation commit changes graph projection code, graph rendering code, and behavioral tests. Current main and the retained working states contain later accepted versions of these paths. The planning commit records the historical M1-F repair. Current main has a later remediation plan. No working file needs integration.

The commits are not reachable from a branch or tag. Create a preservation branch or tag at saved HEAD before removal. A suitable branch name is `codex/preserve-saved-54ed-im3-projection-repair`. This one ref preserves both commits.

### Review of the one unique state

The unique file is `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`. It has six records. Current main has 27 records. All six saved record IDs exist in current main. The saved records contain old Lesson 1.1, 1.2, 1.4, 1.6, and 1.7 source and modality contracts. The accepted lesson reconciliations replace these contracts and add the missing capability records. The prior `saved-0485-full-preservation-review.md` and `saved-54d1-im3-reconciliation-review.md` document the same superseded record families. Do not integrate this aggregate.

### 54ed disposition

No unique useful working-tree content remains. Preserve the detached commits with a ref. Then worktree `54ed` can be removed after parent verification.

## Shared deletion and dependency review

All deleted states have exact absent-state preservation in main or a retained worktree. The restored Precalculus route test has a later current-main version. The deleted skill files have replacement link states outside these worktrees.

All symbolic links have exact link-target matches outside each audited worktree. No unique installed dependency state exists. The audit did not inspect or copy secret values.

## Complete inventories


### 4f74 status inventory

#### No exact external state (13)

- `??` `file` `apps/integrated-math-3/curriculum/skill-graph/__tests__/example-1-8-2-alignment.test.ts`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-rendering.test.ts`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/edges.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/standard-edges.json`
- ` M` `file` `measure/tracks.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

#### Main and `02d6` (12)

- `??` `file` `tmp/pdfs/classroom-insights-contact-sheet.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-1.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-2.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-3.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-4.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-5.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-contact-sheet.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-1.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-2.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-3.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-4.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-5.png`

#### `02d6` and `18ee` (129)

- `??` `file` `apps/bus-math-v2/.vinext/dev/lock.json`
- `??` `file` `apps/bus-math-v2/__tests__/app/api/progress/assessment/notebook-organizer.acceptance.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/app/api/progress/assessment/route.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/components/lesson/ActivityRenderer.test.tsx`
- `??` `file` `apps/bus-math-v2/__tests__/components/student/DailyPracticeSession-generated-variant.acceptance.test.tsx`
- ` M` `file` `apps/bus-math-v2/__tests__/components/student/DailyPracticeSession.test.tsx`
- `??` `file` `apps/bus-math-v2/__tests__/convex/activities-daily-source-authority.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/activities-generated-variant-server-owned.acceptance.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/activities-server-owned-submission.acceptance.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/learningEvidence-production-flow.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/convex/learningEvidence-submission-authority.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/seed-stable-activity-id.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/dev/blueprint-qa/curriculum-review.test.tsx`
- ` M` `file` `apps/bus-math-v2/__tests__/dev/blueprint-qa/harness.test.tsx`
- ` M` `file` `apps/bus-math-v2/__tests__/setup/convex-schema.test.ts`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/RendererPreview.tsx`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/data.ts`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/graph-documents.ts`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/page.tsx`
- ` M` `file` `apps/bus-math-v2/app/api/progress/assessment/route.ts`
- ` M` `file` `apps/bus-math-v2/components/lesson/ActivityRenderer.tsx`
- ` M` `file` `apps/bus-math-v2/components/student/DailyPracticeSession.tsx`
- ` M` `file` `apps/bus-math-v2/convex/activities.ts`
- ` M` `file` `apps/bus-math-v2/convex/learningEvidence.ts`
- ` M` `file` `apps/bus-math-v2/convex/schema.ts`
- ` M` `file` `apps/bus-math-v2/convex/seed.ts`
- ` M` `file` `apps/bus-math-v2/lib/assessments/scoring.ts`
- ` M` `file` `apps/bus-math-v2/lib/learning-evidence/bm2-pilot.ts`
- `??` `file` `apps/integrated-math-1/.next/types/routes.d.ts`
- `??` `file` `apps/integrated-math-2/.next/types/routes.d.ts`
- ` M` `file` `apps/integrated-math-3/.next/types/routes.d.ts`
- `??` `file` `apps/integrated-math-3/__tests__/app/api/activities/submissions/idempotency-key.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/app/api/activities/submissions/route.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/app/api/activities/submit/route.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/components/activities/graphing/GraphingExplorer.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/components/activities/graphing/GraphingExplorerActivity-pilot.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/components/activities/graphing/GraphingExplorerActivity.test.tsx`
- ` M` `file` `apps/integrated-math-3/__tests__/components/lesson/LessonRenderer-activity-submission.test.tsx`
- ` M` `file` `apps/integrated-math-3/__tests__/components/student/PracticeCardRenderer.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/components/student/PracticeSessionProvider-retry-acceptance.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/components/student/PracticeSessionProvider-server-authority.test.tsx`
- ` M` `file` `apps/integrated-math-3/__tests__/components/student/PracticeSessionProvider.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/convex/activities-create-idempotency.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/activities-public-create-boundary.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/activities-server-owned-recovery.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-production-factory.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-submission-authority.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/queue/im3-first-offer-queue.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/queue/im3-pilot-queue.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/queue/queue.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/seed/im3-pilot-seed.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/srs/submissionSrs.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/student-phase-completion.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/studentKnowledgeState.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/lib/activities/server-grading-contract.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/lib/activities/server-grading.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/lib/activities/submission-progress-authority.test.ts`
- `??` `file` `apps/integrated-math-3/app/api/activities/submissions/route.ts`
- ` M` `file` `apps/integrated-math-3/components/activities/graphing/GraphingExplorerActivity.tsx`
- ` M` `file` `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx`
- ` M` `file` `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`
- ` M` `file` `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`
- ` M` `file` `apps/integrated-math-3/components/student/PracticeCardRenderer.tsx`
- ` M` `file` `apps/integrated-math-3/components/student/PracticeSessionProvider.tsx`
- ` M` `file` `apps/integrated-math-3/convex/_generated/api.d.ts`
- ` M` `file` `apps/integrated-math-3/convex/activities.ts`
- ` M` `file` `apps/integrated-math-3/convex/learningEvidence.ts`
- ` M` `file` `apps/integrated-math-3/convex/queue/queue.ts`
- ` M` `file` `apps/integrated-math-3/convex/schema.ts`
- ` M` `file` `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts`
- ` M` `file` `apps/integrated-math-3/convex/student.ts`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts`
- `??` `file` `apps/integrated-math-3/lib/activities/server-grading.ts`
- ` M` `file` `apps/integrated-math-3/lib/activities/submission.ts`
- ` M` `file` `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts`
- `??` `file` `apps/pre-calculus/.next/types/routes.d.ts`
- `??` `file` `apps/pre-calculus/__tests__/app/api/activities/precalculus-pilot/submissions/route.acceptance.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/app/api/activities/precalculus-topic-1-1/submissions/route.red.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/production-route.test.ts`
- ` D` `missing` `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/submission-authority.red.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/components/student/PrecalculusMasteryAdvantagePilot.acceptance.test.tsx`
- `??` `file` `apps/pre-calculus/__tests__/components/student/PrecalculusTopic11DailyCurriculumPilot.red.test.tsx`
- `??` `file` `apps/pre-calculus/__tests__/convex/activities-server-owned-submission.acceptance.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/learning-evidence-bounded-authority.red.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/learning-evidence-production-flow.red.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/convex/learning-evidence-submission-authority.red.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/convex/learning-evidence.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/precalculus-kst-consumer.red.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/seed/topic11-source-link.acceptance.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/topic11-daily-handler.acceptance.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/learning-evidence-pilot.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/lib/auth/server.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/lib/learning-evidence/precalc-pilot.test.ts`
- `??` `file` `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts`
- `??` `file` `apps/pre-calculus/app/api/activities/precalculus-topic-1-1/submissions/route.ts`
- ` M` `file` `apps/pre-calculus/app/api/learning-evidence/precalculus-pilot/route.ts`
- ` M` `file` `apps/pre-calculus/app/auth/login/page.tsx`
- ` M` `file` `apps/pre-calculus/app/student/dashboard/page.tsx`
- `??` `file` `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx`
- `??` `file` `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx`
- ` M` `file` `apps/pre-calculus/convex/_generated/api.d.ts`
- ` M` `file` `apps/pre-calculus/convex/activities.ts`
- `??` `file` `apps/pre-calculus/convex/learningEvidence.ts`
- ` M` `file` `apps/pre-calculus/convex/schema.ts`
- ` M` `file` `apps/pre-calculus/convex/seed/seed_lesson_1_1.ts`
- ` M` `file` `apps/pre-calculus/lib/auth/server.ts`
- ` M` `file` `apps/pre-calculus/lib/learning-evidence/precalc-pilot.ts`
- ` M` `file` `apps/pre-calculus/package.json`
- ` M` `file` `measure/generated/architecture.json`
- ` M` `file` `measure/tech-debt.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/index.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/spec.md`
- ` M` `file` `package-lock.json`
- `??` `file` `packages/activity-components/src/__tests__/graphing-explorer-activity.test.tsx`
- `??` `file` `packages/activity-components/src/__tests__/graphing-explorer-worked-example.test.tsx`
- ` M` `file` `packages/activity-components/src/components/graphing/GraphingCanvas.tsx`
- ` M` `file` `packages/activity-components/src/components/graphing/GraphingExplorer.tsx`
- ` M` `file` `packages/activity-components/src/components/graphing/GraphingExplorerActivity.tsx`
- ` M` `file` `packages/activity-components/src/primitives/__tests__/coordinate-plane.adversarial.test.tsx`
- ` M` `file` `packages/graphing-core/src/__tests__/canvas-utils.test.ts`
- ` M` `file` `packages/graphing-core/src/canvas-utils.ts`
- ` M` `file` `packages/knowledge-space-practice/src/__tests__/projections.test.ts`
- ` M` `file` `packages/knowledge-space-practice/src/blueprints/schemas.ts`
- ` M` `file` `packages/knowledge-space-practice/src/blueprints/types.ts`
- ` M` `file` `packages/knowledge-space-practice/src/projections/activity-map.ts`
- ` M` `file` `packages/math-content/src/schemas/graphing-explorer.schema.ts`
- ` M` `file` `scripts/architecture/architecture.manifest.json`

#### Main, `02d6`, and `18ee` (210)

- `??` `file` `.agents/skills/convex-add/SKILL.md`
- `??` `file` `.agents/skills/convex-advisor/SKILL.md`
- `??` `file` `.agents/skills/convex-agent/SKILL.md`
- `??` `file` `.agents/skills/convex-auth/SKILL.md`
- `??` `file` `.agents/skills/convex-authz/SKILL.md`
- `??` `file` `.agents/skills/convex-backup/SKILL.md`
- `??` `file` `.agents/skills/convex-billing/SKILL.md`
- `??` `file` `.agents/skills/convex-cost/SKILL.md`
- `??` `file` `.agents/skills/convex-crons/SKILL.md`
- `??` `file` `.agents/skills/convex-deploy-guard/SKILL.md`
- `??` `file` `.agents/skills/convex-design/SKILL.md`
- `??` `file` `.agents/skills/convex-docs/SKILL.md`
- `??` `file` `.agents/skills/convex-domains/SKILL.md`
- `??` `file` `.agents/skills/convex-env/SKILL.md`
- `??` `file` `.agents/skills/convex-expert/SKILL.md`
- `??` `file` `.agents/skills/convex-explain-app/SKILL.md`
- `??` `file` `.agents/skills/convex-improve-convex-plugin/SKILL.md`
- `??` `file` `.agents/skills/convex-insights/SKILL.md`
- `??` `file` `.agents/skills/convex-launch-readiness/SKILL.md`
- `??` `file` `.agents/skills/convex-migrate-rehearse/SKILL.md`
- `??` `file` `.agents/skills/convex-migrate/SKILL.md`
- `??` `file` `.agents/skills/convex-monitor/SKILL.md`
- `??` `file` `.agents/skills/convex-optimize/SKILL.md`
- ` M` `file` `.agents/skills/convex-quickstart/SKILL.md`
- `??` `file` `.agents/skills/convex-reviewer/SKILL.md`
- `??` `file` `.agents/skills/convex-seed/SKILL.md`
- `??` `file` `.agents/skills/convex-self-heal/SKILL.md`
- `??` `file` `.agents/skills/convex-sentinel/SKILL.md`
- `??` `file` `.agents/skills/convex-suggest/SKILL.md`
- `??` `file` `.agents/skills/convex-test/SKILL.md`
- `??` `file` `.agents/skills/convex-verify/SKILL.md`
- ` M` `file` `.agents/skills/convex/SKILL.md`
- `??` `link` `.claude/skills/convex`
- `??` `link` `.claude/skills/convex-add`
- `??` `link` `.claude/skills/convex-advisor`
- `??` `link` `.claude/skills/convex-agent`
- `??` `link` `.claude/skills/convex-auth`
- `??` `link` `.claude/skills/convex-authz`
- `??` `link` `.claude/skills/convex-backup`
- `??` `link` `.claude/skills/convex-billing`
- `??` `link` `.claude/skills/convex-cost`
- `??` `link` `.claude/skills/convex-create-component`
- ` D` `file` `.claude/skills/convex-create-component/SKILL.md`
- ` D` `file` `.claude/skills/convex-create-component/agents/openai.yaml`
- ` D` `file` `.claude/skills/convex-create-component/assets/icon.svg`
- ` D` `file` `.claude/skills/convex-create-component/references/advanced-patterns.md`
- ` D` `file` `.claude/skills/convex-create-component/references/hybrid-components.md`
- ` D` `file` `.claude/skills/convex-create-component/references/local-components.md`
- ` D` `file` `.claude/skills/convex-create-component/references/packaged-components.md`
- `??` `link` `.claude/skills/convex-crons`
- `??` `link` `.claude/skills/convex-deploy-guard`
- `??` `link` `.claude/skills/convex-design`
- `??` `link` `.claude/skills/convex-docs`
- `??` `link` `.claude/skills/convex-domains`
- `??` `link` `.claude/skills/convex-env`
- `??` `link` `.claude/skills/convex-expert`
- `??` `link` `.claude/skills/convex-explain-app`
- `??` `link` `.claude/skills/convex-improve-convex-plugin`
- `??` `link` `.claude/skills/convex-insights`
- `??` `link` `.claude/skills/convex-launch-readiness`
- `??` `link` `.claude/skills/convex-migrate`
- `??` `link` `.claude/skills/convex-migrate-rehearse`
- `??` `link` `.claude/skills/convex-monitor`
- `??` `link` `.claude/skills/convex-optimize`
- `??` `link` `.claude/skills/convex-quickstart`
- ` D` `file` `.claude/skills/convex-quickstart/SKILL.md`
- ` D` `file` `.claude/skills/convex-quickstart/agents/openai.yaml`
- ` D` `file` `.claude/skills/convex-quickstart/assets/icon.svg`
- `??` `link` `.claude/skills/convex-reviewer`
- `??` `link` `.claude/skills/convex-seed`
- `??` `link` `.claude/skills/convex-self-heal`
- `??` `link` `.claude/skills/convex-sentinel`
- `??` `link` `.claude/skills/convex-suggest`
- `??` `link` `.claude/skills/convex-test`
- `??` `link` `.claude/skills/convex-verify`
- ` D` `file` `.claude/skills/convex/SKILL.md`
- ` M` `file` `apps/bus-math-v2/__tests__/app/api/learning-evidence/bm2-pilot/route.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/app/api/learning-evidence/bm2-pilot/submission-authority.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/app/api/learning-evidence/bm2-pilot/teacher-consumer.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/app/api/progress/assessment/generated-variant.acceptance.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/learningEvidence-bounded-authority.red.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/convex/learningEvidence.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/lib/learning-evidence/bm2-pilot.test.ts`
- ` D` `missing` `apps/bus-math-v2/app/(dev)/blueprint-qa/actions.ts`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/BlueprintSpecPanel.tsx`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/GeneratorPanel.tsx`
- ` D` `missing` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/NodeList.tsx`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/ReviewDecisionControls.tsx`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/SourcePagePanel.tsx`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/review-utils.ts`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/source-documents.ts`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/types.ts`
- `??` `file` `apps/bus-math-v2/app/api/dev/curriculum-graph/route.ts`
- `??` `file` `apps/bus-math-v2/app/api/dev/curriculum-source/route.ts`
- ` M` `file` `apps/bus-math-v2/app/api/learning-evidence/bm2-pilot/route.ts`
- ` M` `file` `apps/bus-math-v2/convex/_generated/api.d.ts`
- `??` `file` `apps/integrated-math-3/__tests__/app/api/learning-evidence/im3-pilot/route.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/app/api/phases/complete/route.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/components/lesson/ActivityRenderer-activity-families.test.tsx`
- ` M` `file` `apps/integrated-math-3/__tests__/components/lesson/PhaseCompleteButton.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-attempt-ordering.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-bounded-authority.red.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-durable.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/seed/seed-im3-pilot-mapping.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/seed/seed-practice-items-idempotence.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/srs/submission-srs-variant-key.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/srs/submissionSrs-v31-policy.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/student-phase-completion-completed-row.red.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/lib/activities/submission.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/lib/phase-completion/client.test.ts`
- ` M` `file` `apps/integrated-math-3/app/api/activities/submit/route.ts`
- `??` `file` `apps/integrated-math-3/app/api/learning-evidence/im3-pilot/route.ts`
- ` M` `file` `apps/integrated-math-3/app/api/phases/complete/route.ts`
- ` M` `file` `apps/integrated-math-3/components/lesson/PhaseCompleteButton.tsx`
- ` M` `file` `apps/integrated-math-3/convex/seed.ts`
- `??` `file` `apps/integrated-math-3/convex/seed/seed_im3_pilot.ts`
- ` M` `file` `apps/integrated-math-3/convex/srs/submissionSrs.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/convex-module-paths.red.test.ts`
- ` M` `file` `apps/pre-calculus/app/auth/register/page.tsx`
- ` D` `missing` `apps/pre-calculus/convex/learning-evidence.ts`
- ` M` `file` `measure/generated/routes.md`
- ` M` `file` `measure/skill-graph-im3-rollout-audit.md`
- ` M` `file` `measure/skill-graph-precalc-rollout-audit.md`
- `??` `file` `measure/tracks/appc-mastery-advantage-rollout_20260821/index.md`
- `??` `file` `measure/tracks/appc-mastery-advantage-rollout_20260821/metadata.json`
- `??` `file` `measure/tracks/appc-mastery-advantage-rollout_20260821/plan.md`
- `??` `file` `measure/tracks/appc-mastery-advantage-rollout_20260821/spec.md`
- `??` `file` `measure/tracks/bc-mastery-advantage-rollout_20260821/index.md`
- `??` `file` `measure/tracks/bc-mastery-advantage-rollout_20260821/metadata.json`
- `??` `file` `measure/tracks/bc-mastery-advantage-rollout_20260821/plan.md`
- `??` `file` `measure/tracks/bc-mastery-advantage-rollout_20260821/spec.md`
- `??` `file` `measure/tracks/im3-mastery-advantage-rollout_20260821/index.md`
- `??` `file` `measure/tracks/im3-mastery-advantage-rollout_20260821/metadata.json`
- `??` `file` `measure/tracks/im3-mastery-advantage-rollout_20260821/plan.md`
- `??` `file` `measure/tracks/im3-mastery-advantage-rollout_20260821/spec.md`
- ` M` `file` `measure/tracks/kst-srs-v3-2-im3-runtime-migration_20260710/plan.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/change-disposition.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/inventory-review.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/metadata.json`
- ` M` `file` `measure/tracks/teacher-led-mastery-advantage_20260819/metadata.json`
- ` M` `file` `measure/tracks/teacher-led-mastery-advantage_20260819/plan.md`
- ` M` `file` `measure/tracks/teacher-led-mastery-advantage_20260819/spec.md`
- ` M` `file` `measure/tracks/vertical-slice-value-proof_20260605/metadata.json`
- ` M` `file` `measure/tracks/vertical-slice-value-proof_20260605/plan.md`
- `??` `file` `opencode.json`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/HDKWA-Danielson-System-Review.pptx`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/HDKWA-Danielson-System-Review.pptx.inspect.ndjson`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/administration.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/hod-scope.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/improvement-plan.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/learn-detail.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/learn-detail.png`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/learn-index.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/mobile-walkthrough-bottom.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/mobile-walkthrough-top.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/pilot-login.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/proficiency-graph.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/published-observation.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/queue.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/teacher-report-leadership.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/teacher-view.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/walkthrough-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/01-local-pilot-login.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/02-authenticated-overview.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/03-password-change.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/04-unauthorized-access.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/05-leadership-portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/06-developing-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/07-experienced-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/08-active-pip-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/09-closed-pip-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/10-gbf-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/11-collapsed-proficiency-graph.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/12-expanded-proficiency-graph.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/13-selected-proficiency-node.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/14-ranked-walkthrough-queue.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/15-walkthrough-draft-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/16-formal-observation-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/17-published-observation.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/18-observation-amendment-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/19-leadership-improvement-plan-list.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/20-new-improvement-plan-proposal.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/21-active-improvement-plan-detail.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/22-improvement-plan-revision.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/23-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/24-teacher-observation-history.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/25-teacher-response-state.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/26-system-administration-hub.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/27-account-administration.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/28-department-administration.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/29-coach-assignment-administration.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/30a-hod-scoped-portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/30b-hod-scoped-queue.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/31a-coach-scoped-portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/31b-coach-scoped-queue.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/32-learn-index.png`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/33-learn-cold-call.png`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-01-login.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-02-leadership-portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-03-walkthrough-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-04-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-05-proficiency-graph.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-06-learn-cold-call.png`
- ` M` `file` `packages/practice-core/src/__tests__/learning-evidence.test.ts`
- ` M` `file` `packages/practice-core/src/index.ts`
- ` M` `file` `packages/practice-core/src/practice/learning-evidence.ts`
- ` M` `file` `packages/srs-engine/src/srs/submission-srs-adapter.ts`
- ` M` `file` `scripts/generate-measure-docs.ts`
- ` M` `file` `skills-lock.json`


### 54ed status inventory

#### `02d6` only (4)

- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- ` M` `file` `measure/tracks.md`

#### No exact external state (1)

- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`

#### Main and `02d6` (12)

- `??` `file` `tmp/pdfs/classroom-insights-contact-sheet.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-1.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-2.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-3.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-4.png`
- `??` `file` `tmp/pdfs/classroom-insights-page-5.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-contact-sheet.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-1.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-2.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-3.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-4.png`
- `??` `file` `tmp/pdfs/gbf-scope-sequence-page-5.png`

#### `02d6` and `18ee` (121)

- `??` `file` `apps/bus-math-v2/.vinext/dev/lock.json`
- `??` `file` `apps/bus-math-v2/__tests__/app/api/progress/assessment/notebook-organizer.acceptance.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/app/api/progress/assessment/route.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/components/lesson/ActivityRenderer.test.tsx`
- `??` `file` `apps/bus-math-v2/__tests__/components/student/DailyPracticeSession-generated-variant.acceptance.test.tsx`
- ` M` `file` `apps/bus-math-v2/__tests__/components/student/DailyPracticeSession.test.tsx`
- `??` `file` `apps/bus-math-v2/__tests__/convex/activities-daily-source-authority.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/activities-generated-variant-server-owned.acceptance.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/activities-server-owned-submission.acceptance.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/learningEvidence-production-flow.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/convex/learningEvidence-submission-authority.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/seed-stable-activity-id.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/dev/blueprint-qa/curriculum-review.test.tsx`
- ` M` `file` `apps/bus-math-v2/__tests__/dev/blueprint-qa/harness.test.tsx`
- ` M` `file` `apps/bus-math-v2/__tests__/setup/convex-schema.test.ts`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/RendererPreview.tsx`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/data.ts`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/graph-documents.ts`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/page.tsx`
- ` M` `file` `apps/bus-math-v2/app/api/progress/assessment/route.ts`
- ` M` `file` `apps/bus-math-v2/components/lesson/ActivityRenderer.tsx`
- ` M` `file` `apps/bus-math-v2/components/student/DailyPracticeSession.tsx`
- ` M` `file` `apps/bus-math-v2/convex/activities.ts`
- ` M` `file` `apps/bus-math-v2/convex/learningEvidence.ts`
- ` M` `file` `apps/bus-math-v2/convex/schema.ts`
- ` M` `file` `apps/bus-math-v2/convex/seed.ts`
- ` M` `file` `apps/bus-math-v2/lib/assessments/scoring.ts`
- ` M` `file` `apps/bus-math-v2/lib/learning-evidence/bm2-pilot.ts`
- `??` `file` `apps/integrated-math-1/.next/types/routes.d.ts`
- `??` `file` `apps/integrated-math-2/.next/types/routes.d.ts`
- ` M` `file` `apps/integrated-math-3/.next/types/routes.d.ts`
- `??` `file` `apps/integrated-math-3/__tests__/app/api/activities/submissions/idempotency-key.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/app/api/activities/submissions/route.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/app/api/activities/submit/route.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/components/activities/graphing/GraphingExplorer.test.tsx`
- ` M` `file` `apps/integrated-math-3/__tests__/components/lesson/LessonRenderer-activity-submission.test.tsx`
- ` M` `file` `apps/integrated-math-3/__tests__/components/student/PracticeCardRenderer.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/components/student/PracticeSessionProvider-retry-acceptance.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/components/student/PracticeSessionProvider-server-authority.test.tsx`
- ` M` `file` `apps/integrated-math-3/__tests__/components/student/PracticeSessionProvider.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/convex/activities-create-idempotency.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/activities-public-create-boundary.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/activities-server-owned-recovery.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-production-factory.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-submission-authority.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/queue/im3-first-offer-queue.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/queue/im3-pilot-queue.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/queue/queue.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/seed/im3-pilot-seed.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/srs/submissionSrs.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/student-phase-completion.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/studentKnowledgeState.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/lib/activities/server-grading-contract.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/lib/activities/server-grading.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/lib/activities/submission-progress-authority.test.ts`
- `??` `file` `apps/integrated-math-3/app/api/activities/submissions/route.ts`
- ` M` `file` `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx`
- ` M` `file` `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`
- ` M` `file` `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`
- ` M` `file` `apps/integrated-math-3/components/student/PracticeCardRenderer.tsx`
- ` M` `file` `apps/integrated-math-3/components/student/PracticeSessionProvider.tsx`
- ` M` `file` `apps/integrated-math-3/convex/_generated/api.d.ts`
- ` M` `file` `apps/integrated-math-3/convex/activities.ts`
- ` M` `file` `apps/integrated-math-3/convex/learningEvidence.ts`
- ` M` `file` `apps/integrated-math-3/convex/queue/queue.ts`
- ` M` `file` `apps/integrated-math-3/convex/schema.ts`
- ` M` `file` `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts`
- ` M` `file` `apps/integrated-math-3/convex/student.ts`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts`
- `??` `file` `apps/integrated-math-3/lib/activities/server-grading.ts`
- ` M` `file` `apps/integrated-math-3/lib/activities/submission.ts`
- ` M` `file` `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts`
- `??` `file` `apps/pre-calculus/.next/types/routes.d.ts`
- `??` `file` `apps/pre-calculus/__tests__/app/api/activities/precalculus-pilot/submissions/route.acceptance.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/app/api/activities/precalculus-topic-1-1/submissions/route.red.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/production-route.test.ts`
- ` D` `missing` `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/submission-authority.red.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/components/student/PrecalculusMasteryAdvantagePilot.acceptance.test.tsx`
- `??` `file` `apps/pre-calculus/__tests__/components/student/PrecalculusTopic11DailyCurriculumPilot.red.test.tsx`
- `??` `file` `apps/pre-calculus/__tests__/convex/activities-server-owned-submission.acceptance.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/learning-evidence-bounded-authority.red.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/learning-evidence-production-flow.red.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/convex/learning-evidence-submission-authority.red.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/convex/learning-evidence.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/precalculus-kst-consumer.red.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/seed/topic11-source-link.acceptance.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/topic11-daily-handler.acceptance.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/learning-evidence-pilot.test.ts`
- `??` `file` `apps/pre-calculus/__tests__/lib/auth/server.test.ts`
- ` M` `file` `apps/pre-calculus/__tests__/lib/learning-evidence/precalc-pilot.test.ts`
- `??` `file` `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts`
- `??` `file` `apps/pre-calculus/app/api/activities/precalculus-topic-1-1/submissions/route.ts`
- ` M` `file` `apps/pre-calculus/app/api/learning-evidence/precalculus-pilot/route.ts`
- ` M` `file` `apps/pre-calculus/app/auth/login/page.tsx`
- ` M` `file` `apps/pre-calculus/app/student/dashboard/page.tsx`
- `??` `file` `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx`
- `??` `file` `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx`
- ` M` `file` `apps/pre-calculus/convex/_generated/api.d.ts`
- ` M` `file` `apps/pre-calculus/convex/activities.ts`
- `??` `file` `apps/pre-calculus/convex/learningEvidence.ts`
- ` M` `file` `apps/pre-calculus/convex/schema.ts`
- ` M` `file` `apps/pre-calculus/convex/seed/seed_lesson_1_1.ts`
- ` M` `file` `apps/pre-calculus/lib/auth/server.ts`
- ` M` `file` `apps/pre-calculus/lib/learning-evidence/precalc-pilot.ts`
- ` M` `file` `apps/pre-calculus/package.json`
- ` M` `file` `measure/generated/architecture.json`
- ` M` `file` `measure/tech-debt.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/index.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/spec.md`
- ` M` `file` `package-lock.json`
- ` M` `file` `packages/activity-components/src/components/graphing/GraphingCanvas.tsx`
- ` M` `file` `packages/activity-components/src/components/graphing/GraphingExplorer.tsx`
- ` M` `file` `packages/activity-components/src/primitives/__tests__/coordinate-plane.adversarial.test.tsx`
- ` M` `file` `packages/graphing-core/src/__tests__/canvas-utils.test.ts`
- ` M` `file` `packages/graphing-core/src/canvas-utils.ts`
- ` M` `file` `packages/knowledge-space-practice/src/blueprints/schemas.ts`
- ` M` `file` `packages/knowledge-space-practice/src/blueprints/types.ts`
- ` M` `file` `packages/math-content/src/schemas/graphing-explorer.schema.ts`
- ` M` `file` `scripts/architecture/architecture.manifest.json`

#### Main, `02d6`, and `18ee` (210)

- `??` `file` `.agents/skills/convex-add/SKILL.md`
- `??` `file` `.agents/skills/convex-advisor/SKILL.md`
- `??` `file` `.agents/skills/convex-agent/SKILL.md`
- `??` `file` `.agents/skills/convex-auth/SKILL.md`
- `??` `file` `.agents/skills/convex-authz/SKILL.md`
- `??` `file` `.agents/skills/convex-backup/SKILL.md`
- `??` `file` `.agents/skills/convex-billing/SKILL.md`
- `??` `file` `.agents/skills/convex-cost/SKILL.md`
- `??` `file` `.agents/skills/convex-crons/SKILL.md`
- `??` `file` `.agents/skills/convex-deploy-guard/SKILL.md`
- `??` `file` `.agents/skills/convex-design/SKILL.md`
- `??` `file` `.agents/skills/convex-docs/SKILL.md`
- `??` `file` `.agents/skills/convex-domains/SKILL.md`
- `??` `file` `.agents/skills/convex-env/SKILL.md`
- `??` `file` `.agents/skills/convex-expert/SKILL.md`
- `??` `file` `.agents/skills/convex-explain-app/SKILL.md`
- `??` `file` `.agents/skills/convex-improve-convex-plugin/SKILL.md`
- `??` `file` `.agents/skills/convex-insights/SKILL.md`
- `??` `file` `.agents/skills/convex-launch-readiness/SKILL.md`
- `??` `file` `.agents/skills/convex-migrate-rehearse/SKILL.md`
- `??` `file` `.agents/skills/convex-migrate/SKILL.md`
- `??` `file` `.agents/skills/convex-monitor/SKILL.md`
- `??` `file` `.agents/skills/convex-optimize/SKILL.md`
- ` M` `file` `.agents/skills/convex-quickstart/SKILL.md`
- `??` `file` `.agents/skills/convex-reviewer/SKILL.md`
- `??` `file` `.agents/skills/convex-seed/SKILL.md`
- `??` `file` `.agents/skills/convex-self-heal/SKILL.md`
- `??` `file` `.agents/skills/convex-sentinel/SKILL.md`
- `??` `file` `.agents/skills/convex-suggest/SKILL.md`
- `??` `file` `.agents/skills/convex-test/SKILL.md`
- `??` `file` `.agents/skills/convex-verify/SKILL.md`
- ` M` `file` `.agents/skills/convex/SKILL.md`
- `??` `link` `.claude/skills/convex`
- `??` `link` `.claude/skills/convex-add`
- `??` `link` `.claude/skills/convex-advisor`
- `??` `link` `.claude/skills/convex-agent`
- `??` `link` `.claude/skills/convex-auth`
- `??` `link` `.claude/skills/convex-authz`
- `??` `link` `.claude/skills/convex-backup`
- `??` `link` `.claude/skills/convex-billing`
- `??` `link` `.claude/skills/convex-cost`
- `??` `link` `.claude/skills/convex-create-component`
- ` D` `file` `.claude/skills/convex-create-component/SKILL.md`
- ` D` `file` `.claude/skills/convex-create-component/agents/openai.yaml`
- ` D` `file` `.claude/skills/convex-create-component/assets/icon.svg`
- ` D` `file` `.claude/skills/convex-create-component/references/advanced-patterns.md`
- ` D` `file` `.claude/skills/convex-create-component/references/hybrid-components.md`
- ` D` `file` `.claude/skills/convex-create-component/references/local-components.md`
- ` D` `file` `.claude/skills/convex-create-component/references/packaged-components.md`
- `??` `link` `.claude/skills/convex-crons`
- `??` `link` `.claude/skills/convex-deploy-guard`
- `??` `link` `.claude/skills/convex-design`
- `??` `link` `.claude/skills/convex-docs`
- `??` `link` `.claude/skills/convex-domains`
- `??` `link` `.claude/skills/convex-env`
- `??` `link` `.claude/skills/convex-expert`
- `??` `link` `.claude/skills/convex-explain-app`
- `??` `link` `.claude/skills/convex-improve-convex-plugin`
- `??` `link` `.claude/skills/convex-insights`
- `??` `link` `.claude/skills/convex-launch-readiness`
- `??` `link` `.claude/skills/convex-migrate`
- `??` `link` `.claude/skills/convex-migrate-rehearse`
- `??` `link` `.claude/skills/convex-monitor`
- `??` `link` `.claude/skills/convex-optimize`
- `??` `link` `.claude/skills/convex-quickstart`
- ` D` `file` `.claude/skills/convex-quickstart/SKILL.md`
- ` D` `file` `.claude/skills/convex-quickstart/agents/openai.yaml`
- ` D` `file` `.claude/skills/convex-quickstart/assets/icon.svg`
- `??` `link` `.claude/skills/convex-reviewer`
- `??` `link` `.claude/skills/convex-seed`
- `??` `link` `.claude/skills/convex-self-heal`
- `??` `link` `.claude/skills/convex-sentinel`
- `??` `link` `.claude/skills/convex-suggest`
- `??` `link` `.claude/skills/convex-test`
- `??` `link` `.claude/skills/convex-verify`
- ` D` `file` `.claude/skills/convex/SKILL.md`
- ` M` `file` `apps/bus-math-v2/__tests__/app/api/learning-evidence/bm2-pilot/route.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/app/api/learning-evidence/bm2-pilot/submission-authority.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/app/api/learning-evidence/bm2-pilot/teacher-consumer.red.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/app/api/progress/assessment/generated-variant.acceptance.test.ts`
- `??` `file` `apps/bus-math-v2/__tests__/convex/learningEvidence-bounded-authority.red.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/convex/learningEvidence.test.ts`
- ` M` `file` `apps/bus-math-v2/__tests__/lib/learning-evidence/bm2-pilot.test.ts`
- ` D` `missing` `apps/bus-math-v2/app/(dev)/blueprint-qa/actions.ts`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/BlueprintSpecPanel.tsx`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/GeneratorPanel.tsx`
- ` D` `missing` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/NodeList.tsx`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/ReviewDecisionControls.tsx`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/SourcePagePanel.tsx`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/review-utils.ts`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/source-documents.ts`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/types.ts`
- `??` `file` `apps/bus-math-v2/app/api/dev/curriculum-graph/route.ts`
- `??` `file` `apps/bus-math-v2/app/api/dev/curriculum-source/route.ts`
- ` M` `file` `apps/bus-math-v2/app/api/learning-evidence/bm2-pilot/route.ts`
- ` M` `file` `apps/bus-math-v2/convex/_generated/api.d.ts`
- `??` `file` `apps/integrated-math-3/__tests__/app/api/learning-evidence/im3-pilot/route.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/app/api/phases/complete/route.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/components/lesson/ActivityRenderer-activity-families.test.tsx`
- ` M` `file` `apps/integrated-math-3/__tests__/components/lesson/PhaseCompleteButton.test.tsx`
- `??` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-attempt-ordering.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-bounded-authority.red.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/learningEvidence-durable.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/seed/seed-im3-pilot-mapping.red.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/seed/seed-practice-items-idempotence.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/srs/submission-srs-variant-key.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/convex/srs/submissionSrs-v31-policy.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/convex/student-phase-completion-completed-row.red.test.ts`
- ` M` `file` `apps/integrated-math-3/__tests__/lib/activities/submission.test.ts`
- `??` `file` `apps/integrated-math-3/__tests__/lib/phase-completion/client.test.ts`
- ` M` `file` `apps/integrated-math-3/app/api/activities/submit/route.ts`
- `??` `file` `apps/integrated-math-3/app/api/learning-evidence/im3-pilot/route.ts`
- ` M` `file` `apps/integrated-math-3/app/api/phases/complete/route.ts`
- ` M` `file` `apps/integrated-math-3/components/lesson/PhaseCompleteButton.tsx`
- ` M` `file` `apps/integrated-math-3/convex/seed.ts`
- `??` `file` `apps/integrated-math-3/convex/seed/seed_im3_pilot.ts`
- ` M` `file` `apps/integrated-math-3/convex/srs/submissionSrs.ts`
- `??` `file` `apps/pre-calculus/__tests__/convex/convex-module-paths.red.test.ts`
- ` M` `file` `apps/pre-calculus/app/auth/register/page.tsx`
- ` D` `missing` `apps/pre-calculus/convex/learning-evidence.ts`
- ` M` `file` `measure/generated/routes.md`
- ` M` `file` `measure/skill-graph-im3-rollout-audit.md`
- ` M` `file` `measure/skill-graph-precalc-rollout-audit.md`
- `??` `file` `measure/tracks/appc-mastery-advantage-rollout_20260821/index.md`
- `??` `file` `measure/tracks/appc-mastery-advantage-rollout_20260821/metadata.json`
- `??` `file` `measure/tracks/appc-mastery-advantage-rollout_20260821/plan.md`
- `??` `file` `measure/tracks/appc-mastery-advantage-rollout_20260821/spec.md`
- `??` `file` `measure/tracks/bc-mastery-advantage-rollout_20260821/index.md`
- `??` `file` `measure/tracks/bc-mastery-advantage-rollout_20260821/metadata.json`
- `??` `file` `measure/tracks/bc-mastery-advantage-rollout_20260821/plan.md`
- `??` `file` `measure/tracks/bc-mastery-advantage-rollout_20260821/spec.md`
- `??` `file` `measure/tracks/im3-mastery-advantage-rollout_20260821/index.md`
- `??` `file` `measure/tracks/im3-mastery-advantage-rollout_20260821/metadata.json`
- `??` `file` `measure/tracks/im3-mastery-advantage-rollout_20260821/plan.md`
- `??` `file` `measure/tracks/im3-mastery-advantage-rollout_20260821/spec.md`
- ` M` `file` `measure/tracks/kst-srs-v3-2-im3-runtime-migration_20260710/plan.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/change-disposition.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/inventory-review.md`
- `??` `file` `measure/tracks/mastery-advantage-graph-remediation_20260821/metadata.json`
- ` M` `file` `measure/tracks/teacher-led-mastery-advantage_20260819/metadata.json`
- ` M` `file` `measure/tracks/teacher-led-mastery-advantage_20260819/plan.md`
- ` M` `file` `measure/tracks/teacher-led-mastery-advantage_20260819/spec.md`
- ` M` `file` `measure/tracks/vertical-slice-value-proof_20260605/metadata.json`
- ` M` `file` `measure/tracks/vertical-slice-value-proof_20260605/plan.md`
- `??` `file` `opencode.json`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/HDKWA-Danielson-System-Review.pptx`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/HDKWA-Danielson-System-Review.pptx.inspect.ndjson`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/administration.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/hod-scope.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/improvement-plan.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/learn-detail.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/learn-detail.png`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/learn-index.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/mobile-walkthrough-bottom.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/mobile-walkthrough-top.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/pilot-login.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/proficiency-graph.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/published-observation.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/queue.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/teacher-report-leadership.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/teacher-view.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/deck-assets/walkthrough-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/01-local-pilot-login.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/02-authenticated-overview.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/03-password-change.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/04-unauthorized-access.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/05-leadership-portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/06-developing-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/07-experienced-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/08-active-pip-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/09-closed-pip-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/10-gbf-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/11-collapsed-proficiency-graph.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/12-expanded-proficiency-graph.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/13-selected-proficiency-node.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/14-ranked-walkthrough-queue.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/15-walkthrough-draft-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/16-formal-observation-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/17-published-observation.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/18-observation-amendment-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/19-leadership-improvement-plan-list.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/20-new-improvement-plan-proposal.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/21-active-improvement-plan-detail.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/22-improvement-plan-revision.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/23-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/24-teacher-observation-history.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/25-teacher-response-state.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/26-system-administration-hub.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/27-account-administration.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/28-department-administration.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/29-coach-assignment-administration.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/30a-hod-scoped-portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/30b-hod-scoped-queue.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/31a-coach-scoped-portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/31b-coach-scoped-queue.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/32-learn-index.png`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/33-learn-cold-call.png`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-01-login.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-02-leadership-portfolio.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-03-walkthrough-form.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-04-teacher-report.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-05-proficiency-graph.jpg`
- `??` `file` `outputs/danielson-hdkwa-system-review_20260821/screenshots/mobile/mobile-06-learn-cold-call.png`
- ` M` `file` `packages/practice-core/src/__tests__/learning-evidence.test.ts`
- ` M` `file` `packages/practice-core/src/index.ts`
- ` M` `file` `packages/practice-core/src/practice/learning-evidence.ts`
- ` M` `file` `packages/srs-engine/src/srs/submission-srs-adapter.ts`
- ` M` `file` `scripts/generate-measure-docs.ts`
- ` M` `file` `skills-lock.json`


## Parent removal

The parent verified all 364 states in 4f74 and all 348 states in 54ed, including executable modes and symbolic-link targets. It confirmed the 13 and one unique state counts. All saved Module 1 blueprint IDs remain in current main. The accepted Lesson 1.8 records retain four linear-quadratic and three two-quadratic source examples, empty renderer mode maps, and no unsupported Independent specification. The parent inspected the old Example 2 test and accepted its superseded disposition.

The 4f74 HEAD is an ancestor of main. The parent preserved the two detached 54ed commits in `codex/preserve-saved-54ed-im3-projection-repair` at `525dd4ec5`. It then removed both worktrees. The other 16 saved worktrees remain intact. Keep 02d6 and 18ee until their preserved states receive separate review.
