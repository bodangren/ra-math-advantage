# G51 final archive cleanup review

## Verdict

The archive is safe to remove after root approval.

All G51 authored bytes are in current `HEAD` (`3e1d0097a`). I found no unique or unexplained source file in the archive.

## Review scope

- Archive: `/tmp/im1-g51-source-head-kk83le7a`
- Original archive base: `8bca01b6f`
- Current repository commit: `3e1d0097a`
- Parent image directory: `/tmp/im1-g51-parent-native`

I compared regular files by exact bytes. I compared the complete base tree with the archive. I then compared all archive differences with current `HEAD`.

## Authored files

The archive differs from the original base in 13 authored paths. Each path is byte-identical to current `HEAD`:

- `apps/integrated-math-1/__tests__/curriculum/lesson-7-5-capabilities-source.test.ts`
- `apps/integrated-math-1/__tests__/curriculum/lesson-10-1-capabilities-source.test.ts`
- `apps/integrated-math-1/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/edge-review-queue.json`
- `apps/integrated-math-1/curriculum/skill-graph/edges.json`
- `apps/integrated-math-1/curriculum/skill-graph/generator-gap-queue.json`
- `apps/integrated-math-1/curriculum/skill-graph/im1-coverage-matrix.json`
- `apps/integrated-math-1/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/srs-input.json`
- `apps/integrated-math-1/curriculum/skill-graph/standard-edges.json`
- `measure/skill-graph-im1-rollout-audit.md`

The nine formatting-repair paths are included in this set. Their final bytes match commit `3e1d0097a`.

The source restoration was already present in base `8bca01b6f`. This includes the extensionless Lesson 10.1 source and the 17 public image assets. These archive bytes also match current `HEAD`.

## Parent images

`/tmp/im1-g51-parent-native` contains 17 files. Each `image1` through `image17` file is byte-identical to the file with the same name in `apps/integrated-math-1/public/curriculum/module-10-lesson-1/`. This includes 14 PNG files and 3 JPEG files.

The parent image directory has no unique image content.

## Generated and dependency artifacts

The archive has 625 symbolic links under root `node_modules`. These links are the verified dependency overlay.

The archive has these generated ignored files:

- `apps/integrated-math-1/.wrangler/deploy/config.json`
- `apps/integrated-math-1/.next/types/routes.d.ts`
- `apps/integrated-math-1/next-env.d.ts`
- `apps/integrated-math-1/tsconfig.tsbuildinfo`

The original base tree contains 566 files under `apps/integrated-math-3/curriculum/.venv/` that are absent from the archive. This directory is an installed Python environment. Its absence does not remove authored G51 work.

## Preservation result

- Unique authored files: none.
- Unexplained files: none.
- Authored files not in current `HEAD`: none.
- Parent image bytes not in committed public assets: none.
- Required preservation action before archive removal: none.

I did not edit the archive or the main repository.

## Parent removal

The parent verified every source and graph path against committed HEAD. It also verified all 17 native image bytes against committed public assets. The parent removed both completed directories. Dependency symlinks were not followed. The 20 saved Codex worktrees remain intact.
