# IM3 pilot SRS eligibility repair report

Base commit: `7494e62fb`.

The repair changes six stored values. It sets `srsEligible` to `false` for three selected draft Independent activities in the Module 1 map and the course map. It changes no other activity field. It preserves row order and all approval states.

The two pilot tests now derive the expected value from the node readiness flag and both review states. They assert that the three current draft stable activity IDs are present and ineligible in both stored maps. They do not exclude draft rows. The shared projector tests retain the approved positive cases.

Validation:

- Red proof: the stored-projection test failed because the stored value was `true` and the approval gate required `false`.
- Five pilot files: 5 files and 54 tests passed. Log: `/tmp/im3-pilot-eligibility-pilot-tests.log`.
- Lesson 1-8 recovery test: 1 file and 6 tests passed. Log: `/tmp/im3-pilot-eligibility-recovery-tests.log`.
- Shared projection test: 1 file and 26 tests passed. Log: `/tmp/im3-pilot-eligibility-projection-tests.log`.
- IM3 lint passed. Log: `/tmp/im3-pilot-eligibility-lint.log`.
- IM3 build passed. Log: `/tmp/im3-pilot-eligibility-build.log`.
- Standalone TypeScript passed. Log: `/tmp/im3-pilot-eligibility-tsc.log`.
- `git diff --check` passed.

Artifacts:

- Patch: `/tmp/im3-pilot-eligibility-final.patch`
- Exact four-path list: `/tmp/im3-pilot-eligibility-paths.txt`
- Candidate: `/tmp/im3-lesson18-recovery-v6l3h06f`
