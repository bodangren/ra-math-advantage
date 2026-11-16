# IM1 candidate cleanup review

## Result

Keep the candidate until the parent completes its final review. All G53, G54, G55, and coverage-order task content is present in committed HEAD. The candidate contains no unique authored file that requires preservation.

Candidate: `/var/folders/cv/6hxxdw1d71qg4pvsfqn14dyslct3qn/T/im1-g53-source-head-_ikmfpee`

Exact comparison HEAD: `8de4645b0edf7fbf3851ed1f411dce607b562be1`.

## Tracked comparison

The candidate has 8,576 regular tracked files. Every candidate blob is reachable in Git. The candidate differs from current HEAD in 54 tracked paths. No tracked file mode differs.

- 31 paths are absent from the candidate. Current HEAD added these files after the candidate baseline. They include committed IM3 quadratic-formula implementation tests and Measure review documents. Git contains each complete file.
- 23 paths contain older bytes. Each candidate blob is byte-identical to a reachable Git commit. No modified candidate blob is unreachable.
- The 23 older blobs include 12 IM3 application files, 9 shared package files, `measure/tracks.md`, and the active graph plan.
- No Integrated Math 1 source, graph, projection, test, or coverage file differs from current HEAD.

The exact 54-path status list is `/tmp/im1-candidate-final-tracked-status.txt`. The ignored inventory is `/tmp/im1-candidate-final-ignored.txt`.

## Untracked and ignored content

Git reports three untracked, non-ignored entries:

- `apps/integrated-math-1/.next/types/routes.d.ts` is generated build output.
- `apps/integrated-math-1/node_modules` is a dependency link to the candidate root dependency directory.
- `apps/integrated-math-3/node_modules` is the same type of dependency link.

Git reports 846 ignored entries. They consist of dependency-tree entries and 218 Integrated Math 1 build entries. The root `node_modules` directory contains 625 dependency links and no regular files. This includes 21 local `@math-platform/*` workspace links. The candidate also contains 215 generated files in `apps/integrated-math-1/dist` and generated `.next` data. The two application `node_modules` entries are symbolic links with normal link modes.

No untracked authored source or report exists in the candidate.

## Process check

No persistent test, build, TypeScript, development-server, or application process uses the candidate path. The process check only observed its own short search command.

## Recommendation

The candidate is eligible for removal after the parent completes final verification. Git preserves all task content. The remaining differences are older committed states, missing newer committed files, dependency links, and generated build output.

## Parent removal

The parent independently verified that all 8,576 regular tracked files have reachable Git blobs. The final checks found no open file or persistent process. The parent removed the candidate directory after G55 and the coverage order repair were committed. External symbolic-link targets remain intact. The current IM3 candidate remains active.
