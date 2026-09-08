# IM1 G53 Lesson 10-2 graph report

Base commit: `7d0557ff7`.

The patch adds one draft and inactive maximum-count capability. Problem 47 supplies line-count evidence and its required double-counting explanation. Problem 48 supplies plane-count evidence only. The patch reuses the two approved Lesson 10-2 skills at their exact prompt boundaries. It reuses the approved Lesson 12-4 postulate skill only for Problem 46.

The patch removes eight unsupported standard alignments. It clears the same three blueprint alignment arrays. It removes three empty mode specifications and three placeholder activities for each touched existing skill. Thus, it removes nine placeholder activities. It keeps all three existing skills and their approval states. It adds no prerequisite, approval, generator, executable mode, or readiness claim.

The canonical and projected totals are derived from the final arrays. The graph has 1,091 canonical and embedded nodes and 2,620 canonical edges. It has 491 skill records, 490 non-rejected skills, 487 blueprint rows, 484 generator gaps, 91 empty specification rows, 390 source-only rows, and 108 approved skill nodes. The practice projection has 309 activities and 316 SRS inputs.

Validation results:

- Focused graph tests: 3 files and 13 tests passed. Log: `/tmp/im1-g53-graph-focused-tests.log`.
- Full curriculum and seed tests: 69 files and 406 tests passed. Log: `/tmp/im1-g53-graph-full-tests.log`.
- Knowledge-space-practice tests: 29 files and 467 tests passed. Log: `/tmp/im1-g53-graph-knowledge-tests.log`.
- Integrated Math 1 lint passed. Log: `/tmp/im1-g53-graph-lint.log`.
- Integrated Math 1 build passed. Log: `/tmp/im1-g53-graph-build.log`.
- Standalone TypeScript passed. Log: `/tmp/im1-g53-graph-tsc.log`.
- `git diff --check` passed.
- A private baseline index generated the patch from the 13 exact candidate paths.
- The corrected regression uses the canonical `prerequisite_for` edge type. It compares the new teacher row with fresh projector output. It limits SRS parity to the four touched rows. Fifteen unrelated embedded SRS rows match the base.

Artifacts:

- Patch: `/tmp/im1-g53-graph-final.patch`
- Path list: `/tmp/im1-g53-graph-paths.txt`
- Candidate: `/var/folders/cv/6hxxdw1d71qg4pvsfqn14dyslct3qn/T/im1-g53-source-head-_ikmfpee`
