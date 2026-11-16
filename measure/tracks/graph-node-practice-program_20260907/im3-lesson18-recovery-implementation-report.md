# IM3 Lesson 1-8 recovery report

Base commit: `5dd54dc09b97e0a8e2fe063c46e9fe74484d3496`.

The recovery restores seven verified Lesson 1-8 source records in five catalogs. It preserves each catalog-specific legacy `rawText` value. It restores two draft inactive blueprints with empty mode maps.

The repair appends two inactive SRS rows to all three SRS stores. It appends two teacher skill rows to the course stores. It keeps the two existing module teacher skill rows unchanged. It appends seven source attempt artifacts to all three teacher stores. It adds no activity, generator, grader, approval, or readiness claim.

A semantic scope check removed the target rows and compared every remaining projection row with the base. All unrelated values and their relative order match the base in all four projection files.

Validation:

- Focused Lesson 1-8 test: 1 file and 6 tests passed. Log: `/tmp/im3-lesson18-recovery-focused.log`.
- Relevant knowledge-space projection test: 1 file and 26 tests passed. Log: `/tmp/im3-lesson18-recovery-projection-tests.log`.
- Five legacy pilot files: 4 files passed. One file has the verified baseline SRS eligibility failure. The other 53 tests passed. Log: `/tmp/im3-lesson18-recovery-pilot-tests.log`.
- Standalone TypeScript passed after explicit graph types were added. Log: `/tmp/im3-lesson18-recovery-tsc.log`.
- Parent lint and build passed on the first freeze. Parent recorded nine unchanged curriculum baseline failures and 850 passing tests.
- `git diff --check` passed.

Artifacts:

- Patch: `/tmp/im3-lesson18-recovery-final.patch`
- Exact 13-path list: `/tmp/im3-lesson18-recovery-paths.txt`
- Candidate: `/tmp/im3-lesson18-recovery-v6l3h06f`
