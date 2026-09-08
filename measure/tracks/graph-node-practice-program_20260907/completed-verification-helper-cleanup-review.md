# Completed verification helper cleanup review

These directories are disposable verification or extraction helpers. Do not remove the active G51 head, Q38 head, or live browser archive.

## G51 source helpers

- `/tmp/im1-g51-base.B4D5co`
- `/tmp/im1-g51-verify.pSPYXW`
- `/tmp/im1-g51-base.86cjCt`
- `/tmp/im1-g51-verify.qIMSVo`
- `/tmp/im1-g51-refreeze-base.ATS8QY`
- `/tmp/im1-g51-refreeze-verify.1lggV2`

The first source patch used the committed main state available before the refreeze. The final refreeze used main `HEAD` `e0c790796d2498052977a5e24b89895634db8892` and changed the same 19 source-owned paths: one lesson file, one source test, and 17 native images. The final artifact `/tmp/im1-g51-source-final.patch` and active candidate `/tmp/im1-g51-source-head-kk83le7a` preserve all final authored bytes. The older helper archives are superseded.

- `/tmp/im1-g51-media`

This is extracted DOCX media. The active G51 candidate contains the 17 exact native files. The committed DOCX remains the source. This helper is reproducible.

## Precalculus readiness helpers

- `/tmp/precalc-ready-baseline.AcG7LO`
- `/tmp/precalc-ready-verify.5KA7yg`

These helpers used main `HEAD` `2be12cec656b969ac83470a6e5b4ce3c4d122c5a` and verified the five readiness repair paths. The final patch `/tmp/precalc-ready-writer-final.patch` preserves the authored bytes. The repair was committed later. These directories are superseded.

## Precalculus teacher-date helpers

- `/tmp/precalc-teacher-date-base-final.Yg8rMe`
- `/tmp/precalc-teacher-date-verify-final.m9Upvf`

These helpers verified the two teacher-date paths against the prepared base for commit `cd6c8ba5d`. The accepted commit preserves the final authored bytes. These directories are superseded.

All listed helper directories are eligible for removal. I did not remove them.

## Parent verification and removal

The parent compared all files in each complete verification archive with its actual Git baseline. The base directories are sparse task-file snapshots. Each sparse file matches its named committed baseline.

- im1-g51-verify.pSPYXW: base d62b834b1; 0 task-owned changes.
- im1-g51-verify.qIMSVo: base d62b834b1; 19 task-owned changes.
- im1-g51-refreeze-verify.1lggV2: base e0c790796; 19 task-owned changes.
- precalc-ready-verify.5KA7yg: base 2be12cec6; 5 task-owned changes.
- precalc-teacher-date-verify-final.m9Upvf: base 925ec0cf8; 2 task-owned changes.

All complete-archive differences are limited to the expected task paths. Final changed bytes match current committed files. The older G51 lesson and test states are superseded by the reviewed title, spelling, and coordinate corrections. Their native images match committed source assets. All 17 extracted media files also match those assets.

The parent removed all ten base/verification directories and the media directory. No active candidate was removed.
