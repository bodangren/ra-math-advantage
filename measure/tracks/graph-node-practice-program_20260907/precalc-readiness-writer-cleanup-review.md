# Q37 readiness writer archive cleanup review

## Result

The archive does not contain unique authored source. It is eligible for removal after root approval.

Do not reuse this archive as the Q38 implementation base. Create Q38 from current `HEAD`. The archive base is `2b5f4e17c`, and later commits are absent.

## Tracked comparison

- Base tracked paths inspected: 8,377.
- Tracked paths changed from base: 5.
- All five changed files are byte-identical to commit `91bfd0320`.
- Unique changed tracked files: 0.
- The archive omits 566 tracked files. All omitted files are under `apps/integrated-math-3/curriculum/.venv`. This was the intentional archive exclusion.

The five preserved files are:

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts`
- `apps/pre-calculus/__tests__/convex/selected-topic11-submission-writer.test.ts`
- `apps/pre-calculus/__tests__/convex/selected-topic11-writer-evidence-flow.test.ts`
- `apps/pre-calculus/__tests__/app/api/activities/precalculus-pilot-selected-route.test.ts`

## Generated and dependency content

- 207 untracked files are under `apps/pre-calculus/dist`.
- `apps/pre-calculus/tsconfig.tsbuildinfo` is generated TypeScript state.
- `apps/pre-calculus/next-env.d.ts` is generated framework output.
- `apps/pre-calculus/.wrangler/deploy/config.json` is generated deployment-build configuration.
- Root `node_modules` contains the verification dependency overlay.
- `apps/pre-calculus/node_modules` is a dependency symlink.

These files do not contain Q38 source work.

## Recommendation

Remove the archive after root approval. Start Q38 from a fresh current-HEAD archive. Reuse the committed Q37 helpers through normal imports. Do not copy generated output or dependency links into the new candidate.
