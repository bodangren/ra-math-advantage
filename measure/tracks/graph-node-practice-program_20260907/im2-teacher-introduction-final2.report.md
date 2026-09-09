# IM2 Lesson 1.4 teacher introduction final 2

Baseline: `1afc2b7b5`.

The patch changes the six authorized paths in `/tmp/im2-teacher-introduction-final2.paths.txt`.

The triangle-only canonical teacher receipt guard now requires `occurredAt` to equal `new Date(createdAt).toISOString()`. It requires finite source and teacher times. It requires the teacher evidence creation time to be at or after the source submission time. The Lesson 1.1 branch is unchanged.

The triangle handler test records two red failures in `/tmp/im2-teacher-introduction-final2-red.log`. The new same-key and new-key checks reject a valid ISO time that does not match `createdAt`. They also reject a teacher time before the source submission. Each rejection preserves every table.

Verification:

- Focused tests: 91 passed in 5 files.
- Full IM2 tests: 362 passed in 52 files.
- Lint: passed.
- Build: passed.
- Post-build `npx tsc --noEmit --pretty false`: passed with no output.

No database, deployment, staging, commit, dependency, or environment operation ran.
