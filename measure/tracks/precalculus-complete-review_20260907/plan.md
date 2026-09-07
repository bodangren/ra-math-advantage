# Review plan

- [x] Inventory contracts, routes, data, and current changes.
- [x] Run app quality checks and inspect failures.
- [x] Trace authentication, submissions, grading, progress, and UI behavior.
- [x] Review curriculum accuracy, scope, and knowledge graph integrity.
- [x] Review maintenance and delivery workflows.
- [x] Write the evidence report and update the registry.

The initial review found 45 issues and 58 failing tests. The user then authorized remediation. Current results are below.

## Remediation

The user authorized all 45 corrections on 2026-09-07. Preserve unrelated workspace changes. Keep each finding open until its correction passes relevant checks.

- [x] Fix authentication and registration. Verify account safety and session revocation. (PC01, PC02, PC06, PC08, PC09) — fe38063
- [ ] Fix seed dispatch and curriculum source mapping. (PC03, PC19, PC20)
- [ ] Fix grading, mastery, readiness, review scheduling, and repeated attempts. (PC12–PC18, PC38, PC42)
- [ ] Correct lesson mathematics, notation, missing figures, and incomplete solutions. (PC21–PC34)
- [ ] Complete lesson access, teacher workflows, and navigation. (PC04, PC05, PC07, PC10, PC11)
- [ ] Reconcile graph data, blueprints, prerequisites, and generator validation. (PC35–PC40)
- [ ] Correct obsolete tests, deployment configuration, duplication, and documentation. (PC41, PC43–PC45)
- [ ] Run regression tests, lint, TypeScript, build, and browser checks. Record remaining limits.

### Remediation progress

- Account safety: 22 focused tests passed. Registration is atomic. Login uses full password credentials. Sessions use current account state. Authentication requests have input bounds and shared database attempt limits.
- Seed dispatch and independent rate-pattern checks: 4 tests passed. Required seed failures propagate.
- Explicit new attempts and progress refresh are implemented. The new attempt regression passed. Existing state snapshots need their obsolete mastery expectations corrected.
- Corrected lesson mathematics and normalized 3943 math spans. Five distinct parse errors were found and corrected; rerun the full rendering check.
- Added published lesson access, written responses, teacher classes, enrollment, assignments, and grading. Two access-boundary tests passed. End-to-end checks remain pending.
- Added due-review links and assigned lessons to the student dashboard. Verification remains pending.
- The first broad remediation run found 60 failing cases across 36 files. This includes previous failures and expectations for corrected behavior. The full output is in /tmp/precalc-remediation-full.log.
- TypeScript inference required explicit return types for four graders. Verify the complete API types after this correction.
- No deployment or commit has occurred. The hosted target is still unspecified.

### Runtime verification update

- Local Convex deployment and all 58 lesson seeds succeeded. The CLI rejected the old `--local` flag. The startup command now uses the configured deployment.
- Shortened a Convex query name that exceeded the backend limit of 64 characters. Updated its callers.
- Local development now uses Node. Cloudflare builds retain the Worker plugin. This corrected failed local registration.
- Browser checks passed for student registration, login, lesson access, written response submission, teacher login, class creation, enrollment, grading, assignments, student feedback, and teacher-route denial for students.
- All 58 lesson sources passed the math-rendering check. The Lesson 1.8 browser page rendered 64 math expressions without parse errors.
- The dashboard screenshot exposed a hydration error. Investigation remains active.
- Twelve practice clients now share strict evidence-response validation. Some also share the JSON transport helper. Topic graders remain explicit.
- The curriculum generator preserves authored activity maps and all four class-period packages. Audit counts now come from these files. Unit 4 uses local lesson content, not a Passwater source.
- The production Worker configuration no longer contains a localhost database URL. Hosted deployment verification still needs the target environment.
- No hosted deployment or commit has occurred. Full regression checks remain active.

### Final local checks

- All 5946 app tests passed across 236 files.
- App lint, TypeScript, and production build passed.
- Shared checks passed: 15 math tests, 18 activity tests, 33 projection tests, and 2 renderer tests. The math tests include 10000 independently classified generated variants.
- Browser checks passed for incorrect practice, a new attempt, corrected practice, and mastery after Guided and Independent variants. The dashboard has no hydration errors.
- Regeneration preserves authored activity and class-period data. A negative test confirms that the audit rejects missing topic coverage.
- A local full seed rerun preserved 58 lessons, 58 lesson versions, 406 phases, 407 sections, and the saved student response.
- Authentication changes are committed. Other local corrections remain in the workspace with the existing related work. Hosted verification remains open until the target is specified.
