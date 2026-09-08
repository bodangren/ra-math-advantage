# Saved worktree 4e21 full preservation review

## Result

Do not remove this worktree until a Git ref preserves its detached two-commit history.

No dirty, untracked, deleted, mode, or symbolic-link state requires content integration. Every one of the 355 status entries has an exact copy in current main or in retained worktree `02d6` or `18ee`.

This review did not edit or remove the worktree. It did not change Git refs.

## Scope

- Worktree: `/Users/daniel.bodanske/.codex/worktrees/4e21/ra-math-advantage`
- Saved HEAD: `e7225d39171067560ff9bff9baa89606853edcfa`
- Merge base with current main: `106e1cb29e48540457732745c6335a31f6a47160`
- Comparison targets: current main working tree, retained `02d6`, retained `18ee`, and current Git refs.
- Status inventory: 116 modified files, 15 deleted paths, and 224 untracked paths.
- Ignored-file scan: no ignored path.

## Detached commit history

No branch or tag contains saved HEAD. Neither saved commit is an ancestor of current main. The two commits are:

1. `c6fcf59f831d4993da4bfd1e2f0ec038686655a4` — `fix(im3): reconcile lesson 1-1 candidates`
2. `e7225d39171067560ff9bff9baa89606853edcfa` — `measure(plan): complete Task M1-L1`

The first commit adds the Lesson 1.1 reconciliation test and changes the Module 1 node and blueprint catalogs. Current main has a later accepted Lesson 1.1 state. It narrows the graphing capability to a table, graph, domain, and range contract. It also has later source mappings and modality contracts. The saved broad key-feature contracts are superseded. The prior `saved-54d1-im3-reconciliation-review.md` records the same semantic decision.

The second commit records the completed task in an early remediation plan. Current main has a much later plan. The current plan includes the accepted lesson reconciliations and later verification. The saved plan is historical.

These semantic findings mean that no file content needs integration. They do not make the unreferenced commits reachable. Create a preservation branch or tag at saved HEAD before removal. A suitable branch name is `codex/preserve-saved-4e21-im3-lesson11`. This one ref preserves both commits.

## Exact-state comparison

| Exact preservation location | Count |
| --- | ---: |
| Main, `02d6`, and `18ee` | 210 |
| `02d6` and `18ee` | 129 |
| Main and `02d6` | 12 |
| `02d6` only | 4 |

The comparison includes file bytes, absent-file states, file modes, and symbolic-link targets. No status entry has a unique state. All 33 symbolic links have an exact matching target state outside this worktree. No file mode is unique.

The four states that only `02d6` preserves are the root blueprint catalog, two practice projection catalogs, and `measure/tracks.md`. The prior `saved-32fb-full-preservation-review.md` rejects the graph and projection state as superseded. It also rejects the registry snapshot as historical. Keep `02d6` until it receives its own removal review.

The 129 states preserved by both retained worktrees are older runtime, test, graph, plan, generated, and output states. The current main tree contains later versions or the accepted deletion state. The retained worktrees preserve their exact bytes or absence.

The 12 PDF-render files match current main and `02d6`. They are source-inspection output. The 210 remaining states match all three comparison targets.

## Deletion and dependency review

The 15 deleted status paths have exact absent-file states outside this worktree. They include replaced `.claude/skills` entries and the previously reviewed application deletions. No deletion is unique.

The skill links are dependency state. Their link targets match another checkout. The audit found no unique installed dependency state. It did not inspect or copy secret values.

## Removal condition

Create a branch or tag that points to saved HEAD. Then verify that the ref contains both commits. After that check, this worktree can be removed. Do not copy its whole tree. Do not integrate its superseded IM3 graph or planning files. Preserve `02d6` and `18ee`.

## Complete status inventory

Each entry below gives the saved status, path type, exact preservation location, and path.

### `02d6` only (4)

- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- ` M` `file` `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- ` M` `file` `measure/tracks.md`

### Main and `02d6` (12)

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

### `02d6` and `18ee` (129)

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
- ` D` `other` `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`
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

### Main, `02d6`, and `18ee` (210)

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
- ` D` `other` `apps/bus-math-v2/app/(dev)/blueprint-qa/actions.ts`
- `??` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/BlueprintSpecPanel.tsx`
- ` M` `file` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/GeneratorPanel.tsx`
- ` D` `other` `apps/bus-math-v2/app/(dev)/blueprint-qa/components/NodeList.tsx`
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
- ` D` `other` `apps/pre-calculus/convex/learning-evidence.ts`
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

The parent independently verified all 355 states, including file modes and symbolic-link targets. Every state has an exact copy in main, 02d6, or 18ee. The parent created `codex/preserve-saved-4e21-im3-lesson11` at `e7225d391` before removal. This preserves the two detached Lesson 1.1 commits.

The parent removed worktree 4e21. The other 18 saved worktrees remain intact. Keep 02d6 and 18ee until their preserved states receive separate review.
