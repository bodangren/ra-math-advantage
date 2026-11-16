# G49 source archive cleanup audit

Result: The archive has no unpreserved authored content.

Archive: `/tmp/im1-g49-source-head-20260908.koZ3PG`

Base: `df7883c69`

Source commit: `67131a0b9`

The lesson file, focused source test, and all 10 native image files are byte-identical to the committed source restoration.

The archive contains three older tracked-file states outside the source patch:

- `measure/tracks/graph-node-practice-program_20260907/plan.md`
- `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx`
- `apps/pre-calculus/__tests__/components/student/PrecalculusTopic11DailyCurriculumPilot.test.tsx`

These blobs exist in repository history. The plan blob is from the previously committed program state. The two Precalculus blobs are earlier committed component and test states that the later pending-request fix replaced. They are not unique work from this archive.

The untracked `node_modules` entry is a dependency link. The untracked `tsconfig.tsbuildinfo`, `next-env.d.ts`, and `.wrangler/deploy/config.json` files are generated build outputs. Temporary Git data and dependency overlays are archive infrastructure.

No source, test, planning, or implementation content exists only in this archive. The parent can remove the archive after approval.
