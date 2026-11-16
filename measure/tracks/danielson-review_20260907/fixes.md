# Danielson Review Corrections

Date: 2026-09-07.

The confirmed review defects are corrected. The work also fixes an additional
administration defect found during implementation. School-policy and curriculum
scope decisions remain open below. The original review describes the baseline.

## Completed corrections

| Finding | Correction |
|---|---|
| F01 | Rewrote all fourteen lessons with substantial technique errors. |
| F02 | Rewrote thirteen other lessons. Removed unsupported research claims, contradictory instructions, and mixed-language text. |
| F03 | Replaced all 63 book references with the matching technique identifier. Removed unattributed quotation fields and quotation rendering. |
| F04 | Removed twelve unavailable video IDs and the unrelated Threshold video. Added a book-reference fallback instruction. |
| F05 | Learn uses canonical component names from the existing graph. |
| F06 | Learn opens separately. Unsaved forms warn before page close or link navigation. Successful draft saves clear the warning. |
| F07 | Submission rejects future observed dates. Current plan progress excludes future evidence. The date input sets a current-time maximum when focused. |
| F08 | The plan overlay preserves an earlier SRS due date. |
| F09 | Both plan-list scope paths exclude inactive subject accounts. |
| F10 | A saved proposal opens its saved plan. The old proposal form cannot submit again after success. |
| F11 | Account, department, comment, response, GBF, and plan mutations refresh the displayed data. Temporary passwords remain visible during that refresh. |
| F12 | Navigation uses current session roles across sections. Own-row plan actions are hidden. Navigation and graph controls meet the 44-pixel target. Current evidence displays “Current”. |
| F13 | Updated the product and architecture documents. Added recovery and capacity notes to the README. |
| Additional defect | Administration changes now check `accountIsActive`, `organizationIsActive`, and `credentialIsActive`. The old code checked a field absent from the authentication response. |

## Product gap progress

| Gap | Implemented | Still open |
|---|---|---|
| G01: Complete curriculum | Added rehearsal and peer-review instructions to all technique pages. Added examples to the major rewrites. Explained the library's coverage. | School-approved instruction for 1b, 1d, and 4a–4f. The library still contains 63 techniques. |
| G02: Rating support | Added named rating levels, evidence instructions, and a framework reference at the rating form. | The school's approved component descriptors and calibration examples. Generic level names are not a complete rubric. |
| G03: Formal record integrity | Partial records show their component count. A partial record cannot receive a whole-evaluation Proficient status. Existing component ratings remain intact. | The requirement for new formal records and the correction policy for published subject, date, and school-year metadata. |
| G04: Actionable GBF progress | Added named next action steps and links to due skills and evidence gaps. Explained the meaning of mapped evidence. | A decision to adopt another source edition or add assignment restart behavior. The supplied sequence remains authoritative for the implementation. |
| G05: Assignment visibility | Added a paginated current-assignment page for teacher memberships, HOD assignments, and coach assignments. | None for the reviewed visibility defect. |
| G06: Recovery and sessions | Added administrator reset for other accounts. Temporary credentials require a change. Password and account-status changes invalidate older sessions. Concurrent stale password changes cannot overwrite a reset. | Maintain access to another administrator for recovery of an administrator's lost password. |
| G07: Capacity | Documented the current limits and the point at which formal-record growth reaches the portfolio ceiling. | The existing limits remain. A higher capacity needs a bounded-query change and load verification. |

No published observation metadata was rewritten. Legacy records with incorrect
metadata need the school correction policy. New future-dated submissions are
rejected. No hosted deployment was changed.

## Verification

- 60 test files and 400 tests passed.
- New regression cases failed before the corresponding behavior was changed.
- App lint passed.
- App and Convex TypeScript checks passed.
- Production build passed.
- Measure Doctor and monorepo boundary checks passed.
- Coverage reported 85.64% statements, 75.43% branches, 92.40% functions, and
  90.67% lines. The coverage configuration does not include every source file.
- Local browser checks covered eight role accounts and the SLT own-row case.
- Browser checks verified draft save and reload, Learn in a separate tab,
  canceled unsaved navigation, current assignment display, and mobile layout.
- A browser test reset a fictional demo teacher password. It verified rejection
  of the old session and the required password change. The original demo password
  was restored. A new sign-in with that password succeeded.
- The temporary draft was discarded. No observation, plan, comment, or teacher
  response was published by the browser checks. The local stack was stopped.

The media correction removes known bad references. It does not certify playback
or caption quality for every remaining video. The corrected content uses the
local source extracts linked in the original curriculum review. This is not an
independent teacher calibration study.

## Release effect

Existing sessions lack the new credential change-time claim. Users must sign in
again after deployment. No database migration or dependency installation is
required. The implementation reuses the existing credential timestamp and
password functions. It adds no hash or session ledger.

## Commits

- `07c4c342`: Observation and plan evidence protection.
- `69249bf2`: Curriculum and reference corrections.
- `b8959159`: Saved workflows, navigation, administration, recovery, and guidance.

## Source video addition (2026-09-07)

Added all eight TLAC 3.0 videos from
`hdkwa-danielson/public/youtube-channel-video-links-2026-05-20-11-18-44.csv`.
Learn now lists the overview and seven technique tutorials. The seven matching
technique pages also contain the tutorials. Each video has an embedded player
and a direct YouTube link. Source titles are preserved. A note corrects the
Replace Self-Report title: the book uses Technique 6, not Technique 7.

All eight YouTube oEmbed responses returned matching titles on 2026-09-07.
This check verifies public metadata, not playback in every region. The browser
check verifies the player frame and fallback link, not video playback.

The supplied directory contains no Get Better Faster video filenames or text
references. Checked source, public files, scripts, Measure files, outputs, and
ignored files. The PDF directory contains the 63 TLAC technique files. The
Get Better Faster video task remains open. A source-location question is pending.

Validation: 409 tests in 61 files passed. App lint, TypeScript, and production
build passed. Browser checks passed for keyboard expansion, overview and
technique embeds, direct links, the source-number correction, and mobile width.
