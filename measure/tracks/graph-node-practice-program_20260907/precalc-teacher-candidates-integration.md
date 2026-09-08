# Precalculus teacher candidate query integration

## Result

Q30 is applied in the shared worktree after independent review. The query checks active teacher and learner credentials in the same organization. It requires the exact approved source, canonical acknowledgement, and timely enrollment and assignment in a teacher-owned active class. It uses existing indexes without a submission limit. It returns only learner, lesson, acknowledgement, and eligible class display fields. Broad teacher data remains unchanged.

The query reuses the acknowledgement and teacher-confirmation checks. A matching confirmation removes the candidate. Duplicate enrollment rows make that class ineligible, including an active row paired with a withdrawn row. Another valid class can remain eligible.

## Parent verification

All 73 tests in four files pass. They cover the candidate query, real teacher writer, exact source projection, and real teacher route. The real acknowledgement, query, teacher action, and fresh-query sequence is tested. More than 100 unrelated submissions do not hide a candidate. Lint, a fresh build, and post-build standalone TypeScript pass.

The first parent run had one timeout while two builds ran. The same tests passed after the builds finished. No timeout or assertion was weakened. Logs use `/tmp/precalc-q30-parent-`; the final test log is `final-tests.log`.

## Limits

Runtime changes remain applied with pending application dependencies. This is a shared-worktree acceptance record. Q31 must connect this query to both teacher pages and verify the composed interface flow. Source approval and full signed-in browser verification remain open. No schema, index, live seed, or deployment change occurred.
