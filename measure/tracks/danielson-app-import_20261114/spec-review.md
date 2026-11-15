# Spec Review: danielson-app-import_20261114

Author model: claude-opus-5-5[1m]
Author model (Round 1 fixes): claude-sonnet-5-5

## Round 1

Date: 2026-11-15
Reviewer: measure-spec-review (volcengine-agent-plan/glm-latest#high)
Audited HEAD: a95a10cc4930f011e7519a5eb431f6f8f26f68ee
Status: fail (4 Blockers: F1 to F4; 2 Majors: F5, F6; F7 Major; F8 to F10 Nits). Files: `measure/runs/danielson-app-import_20261114/spec-review-a95a10cc.json` and `.log`.

### What this track proposes

This track imports the Danielson professional development site into this repository as `apps/danielson`. The import is one snapshot commit of `c047df1` from the local clone, with no source history. Before that commit, own-word paraphrases and labels replace the framework text, and a local scan and a committed hash guard test block each shared run of 6 or more words. Then the app moves to the repository toolchain and deploys as the static Worker `danielson`.

### Findings

- F1 [Blocker]: the `measure/tracks.md` entry still says "with its git history" and that the app keeps the framework text. Both contradict the revised spec.
- F2 [Blocker]: `metadata.json` has the same pre-revision claims in the description, the sprint goal, and the S1 story title. `estimated_tasks` does not match the task count of `plan.md`.
- F3 [Blocker]: D5, D6, D8, and the plan "Gate Commands" take their values from `apps/math`. That app does not exist, and this track runs before the track that creates it.
- F4 [Blocker]: the marker check of the deploy pipeline needs an RSC server chunk. A static export has none, and no spec says whether the check skips or stops.
- F5 [Major]: D10 (no exact framework text) and D12 (images keep the source component titles as pixels) read differently on the same question.
- F6 [Major]: the plan "Commits" section does not state when the `[x]` marks, the git notes, and the plan-update commit happen for the three no-commit S1 tasks. It does not state how a role passes a HEAD-advance gate without a commit.
- F7 [Major]: D5 omits `react-server-dom-webpack`, which each vinext app must declare after the RSC hotfix.
- F8 [Nit]: the file counts are 229 and 60 in the spec, and 230 and 61 at `c047df1`. The lockfile facts are dated.
- F9 [Nit]: D5 does not say whether the `version` field of the app manifest goes away.
- F10 [Nit]: the plan S3 Deploy task does not say that the orchestrator runs `deploy:app`.

### Author Response

- F1: FIX. The registry entry now says one snapshot commit of `c047df1`, no source history, own-word paraphrases and labels, and no exact framework text. The dependencies and the order are unchanged.
- F2: FIX. The description, the sprint goal, and the S1 story title of `metadata.json` match the revised spec. `estimated_tasks` is 25, the task count of `plan.md`. PM acceptance of the F3, F4, and F6 defaults: 2026-11-15.
- F3: FIX (default accepted by the PM, 2026-11-15). Each `apps/math` reference of D5, D6, D8, and the plan is now `apps/integrated-math-3` after `vinext-oxc-toolchain_20261114`. D5 says that each task reads each range, script name, config file, gate command, and the `compatibility_date` from that app at HEAD when the task starts. The documents pin no version number and no line number. The Worker-build fallback of D6 uses the same app. The S1 Contract task and the S2 Contract task read the values at task start.
- F4: FIX (default accepted by the PM, 2026-11-15). The static-app rule is in `prod-deploy-pipeline_20261114` (spec D4 and D13, plan S2 Contract and S2 Test, two new test lines, and an amendment in its `spec-review.md`). For a static app, the marker check passes only with no `dist/server/` folder and records "static export: no RSC server chunk". A build with server output fails. The Convex step is skipped for an app with Convex "none". D8 points to the rule, and the S3 Contract task confirms it. The security reason is in D13: a static export has no Worker code.
- F5: FIX, PM decision 2026-11-15. D10 names one exception: the pixel text of the committed technique images. D12 records the PM decision: keep the images, no re-render, and the request to turn the site on (the deploy gate of Phase S3) names the exception. The plan S3 Deploy task repeats this.
- F6: FIX (default accepted by the PM, 2026-11-15). The plan "Commits" section has an "S1 mechanics" list. Red writes the D14b guard in the working tree and records the failing output (keys only) in its role log, with no commit. The orchestrator records the Red HEAD-advance check as an accepted deviation. Green makes the snapshot commit. One plan-update commit follows with the `[x]` marks, the snapshot SHA, and the git notes. No earlier commit holds a file under `apps/danielson`.
- F7: FIX. D5 adds `react-server-dom-webpack` with the range of `apps/integrated-math-3` and gives the reason (`measure/tech-debt.md`, the `hotfix/rsdw-19.2.9` rows). The S1 join task adds it.
- F8: FIX. The counts are 230 and 61, checked read-only with `git ls-tree -r --name-only c047df1`. The lockfile facts are dated 2026-11-14 and marked as superseded by the `vinext-oxc-toolchain_20261114` S1 work. The S1 Contract task records the dependency state at the start of S1.
- F9: FIX. D5 says that the manifest loses the `version` field and has `"private": true`. The S1 join task states it.
- F10: FIX. The S3 Deploy task says that the orchestrator runs `npm run deploy:app -- danielson` (`AGENTS.md`, the deploy authorization of 2026-11-14), and a role does not.

## Round 2

Date: 2026-11-15
Reviewer: measure-spec-review (volcengine-agent-plan/glm-latest#high)
Audited HEAD: 28d1260060edc091118b1894efbe128bddcec937
Status: pass (no Blockers; F11 Major and F12 Nit are nonblocking). Files: `measure/runs/danielson-app-import_20261114/spec-review-28d12600.json` and `.log`.

### What this track proposes

This track imports the Danielson professional development site into this repository as `apps/danielson`. The import is one snapshot commit of `c047df1` from the local clone, with no network and no source history. Own-word paraphrases and labels replace the 26 descriptors and the 26 titles before that commit, and a local scan and a committed SHA-256 guard test block the shared text. Then the app moves to the repository toolchain, loses its base path, and deploys as the static Cloudflare Worker `danielson` through the local deploy pipeline.

### Findings

- F1 to F10 withdrawn (fixed in 28d12600).
- F11 [Major] spec.md D6 versus D8: the D6 fallback (the vinext Worker build) reads against the D8 static-app sentence. Under the fallback, the build holds server output, and the D8 `wrangler.jsonc` has no `main`, so the marker check fails and the S3 deploy stops. The spec does not say how `wrangler.jsonc` and the marker-check mode change under the fallback.
- F12 [Nit] prod-deploy-pipeline plan.md S2 Test (two static-app lines) versus its spec D5: "gets no Convex command" can read against the D5 preflight, which runs `npx convex login status` for each deploy. The wording does not say whether it means the `npx convex deploy` step only.

### Author Response

- F11: FIX (orchestrator default). D6 now says that, under the fallback, the app is not a static app: `wrangler.jsonc` follows the Worker pattern of `apps/integrated-math-3` with a `main` entry, and the normal marker check of D13 of `prod-deploy-pipeline_20261114` runs on the RSC server chunk. D8 says that the static-app rule does not apply under the D6 fallback. The S3 Contract task of `plan.md` has the same condition.
- F12: FIX (orchestrator default). In `prod-deploy-pipeline_20261114`, the two static-app test lines of the S2 Test (`plan.md`) and the two static-app Given lines of `spec.md` now say "no `npx convex deploy` command". The D5 preflight (`npx convex login status`) stays for each app. The fix is not re-reviewed; the amendment in the `spec-review.md` of that track records it.

## Accepted Risks

None.
