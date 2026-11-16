# Review plan

## Integration record (2026-09-17)

The current Precalculus source and test changes are committed in `67065a9e1`. The commit is also owned by the graph-node-practice-program, teacher-led-mastery-advantage, and mastery-advantage-graph-remediation tracks because the worktree contained overlapping graph and pilot changes. Production deployment and complete course acceptance remain open.

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
- [x] Fix seed dispatch and curriculum source mapping. (PC03, PC19, PC20)
- [x] Fix grading, mastery, readiness, review scheduling, and repeated attempts. (PC12–PC18, PC38, PC42)
- [x] Correct lesson mathematics, notation, missing figures, and incomplete solutions. (PC21–PC34)
- [x] Complete lesson access, teacher workflows, and navigation. (PC04, PC05, PC07, PC10, PC11). PC10 styles: 20151d43. Other changes await integration.
- [x] Reconcile graph data, blueprints, prerequisites, and generator validation. (PC35–PC40)
- [x] Correct obsolete tests, local deployment guards, duplication, and documentation. (PC41, PC44, PC45)
- [ ] Configure and verify the hosted Convex and Cloudflare targets. Target details are required. (PC43)
- [x] Run regression tests, lint, TypeScript, build, and browser checks. Record remaining limits.

### Final local checks

- All 5946 app tests passed across 236 files.
- App lint, TypeScript, and production build passed.
- Shared checks passed: 15 math tests, 18 activity tests, 33 projection tests, and 2 renderer tests. The math tests include 10000 independently classified generated variants.
- Browser checks passed for incorrect practice, a new attempt, corrected practice, and mastery after Guided and Independent variants. The dashboard has no hydration errors.
- Regeneration preserves authored activity and class-period data. A negative test confirms that the audit rejects missing topic coverage.
- A local full seed rerun preserved 58 lessons, 58 lesson versions, 406 phases, 407 sections, and the saved student response.
- Authentication changes are committed. Other local corrections remain in the workspace with the existing related work. Hosted verification remains open until the target is specified.

- Mobile checks passed at 390 pixels for the dashboard and Lessons 1.8 and 4.14. Display equations scroll within the lesson.

See [remediation results](./remediation.md) for all 45 finding statuses. Local implementation and verification are complete. Integration of overlapping changes remains open. Hosted verification remains open.
