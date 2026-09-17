# IM3 review remediation

Scope: Correct all 38 review findings. Preserve unrelated work. Use existing contracts and components. Do not install dependencies or change a deployment.

- [x] Correct authentication, export, roster, login, and publication boundaries (1–9).
- [x] Correct activity contracts, graph evaluation, grading, modes, and persistence (10–18, 21).
- [x] Correct verified curriculum and answer-key errors (19–20).
- [x] Correct graph relationships, projections, and learner-state producers (22–30).
- [x] Correct accessibility, unused surfaces, and CSV handling (31–33).
- [x] Restore tests and CI coverage. Correct audit and documentation drift (34–38).
- [x] Run full checks, review changes, and record a result for each finding.

Use tests before runtime changes. Run lint and relevant tests before commits. Run separate TypeScript and build checks. A finding is complete only after its correction passes verification.

## Integration status

- [ ] Separate the verified changes from overlapping work. Make the Measure task commits and attach their notes.

All 38 local corrections pass the IM3 checks. See `fixes.md`. The commit step remains open because the workspace contains concurrent changes in the same files. No deployment or live content publication was performed.
