# v3.1 Calibration and Evaluation Release Operations

This runbook is the operational boundary around the pure v3.1 package APIs.
No step below deploys parameters automatically.

## 1. Prepare the Fit Dataset

1. Select one `domain × ageBand` population and a closed term window.
2. Include only attributable learner reviews with a nonblank `paramsVersion`.
   Exclude administrative `teacher_reset` rows, which are intentionally
   unstamped.
3. Freeze the dataset and record its lowercase SHA-256 digest, review count,
   distinct-student count, and exact `0.20` holdout fraction.
4. Stop below 10,000 reviews or 100 students. The lifecycle must return
   `blocked_volume_gate`; no fit or release decision is permitted.

## 2. Evaluate and Review a Candidate

1. Run the external optimizer and holdout scorer. The package receives only
   immutable candidate/incumbent references and their holdout log-losses.
2. Call `evaluateFsrsFitLifecycle` without a human decision. An improving fit
   must remain `pending_human_review`; an equal or worse fit is
   `blocked_holdout_regression`.
3. Review the dataset hash, window, optimizer version, revision ordering, and
   holdout evidence. Record a named reviewer, review ID, rationale, decision,
   and decision timestamp after the dataset window closes.
4. Re-evaluate with that decision. A human cannot override a non-improving
   candidate.

## 3. Publish the Reference Registry

For scheduling lookup, publish registry records in this order:

1. exact population: `(domain, ageBand)`
2. domain fallback: `(domain)`
3. exact built-in default: `fsrs-defaults.ts-fsrs.v5.4.1`

Only a human-approved artifact may be marked `released`. Missing, unapproved,
or ineligible records remain in the resolution attempts for auditability but
are never selected.

`resolveReleasedFsrsParameters` resolves references only. The current
scheduler has no executable fitted-weight bundle and remains pinned to the
built-in defaults. Do not stamp a fitted version until a later integration
binds the approved version and exact weights in one validated scheduler input.

## 4. Run Synthetic Evaluation

1. Declare the deterministic learner parameter grid, seed, config hash, run
   length, mastery values, and misconception cases.
2. Supply a `SyntheticEvaluationEngine` adapter for the exact candidate engine
   version. Each callback must evaluate the full trace and report worst-case
   behavior, not a convenient final-day snapshot.
3. Run `runSyntheticEvaluation` and retain the versioned result, candidate
   predictions, attempt trace, config hash, and five invariant metrics.
4. Any invariant failure rejects the candidate. Safely withheld unready
   recommendations are allowed; recommending an unready item is not.

## 5. Run Replay Evaluation

1. Build the candidate-prediction artifact for the frozen replay corpus. Bind
   its content digest to `replayInputHash`, and verify its engine and parameter
   versions match `candidateEngineVersion` and `candidateParamsVersion`.
2. Preserve each source review's original scheduling `paramsVersion` separately
   from the candidate prediction identity.
3. Run bounded batches with the returned cursor unchanged. A cursor is rejected
   if the corpus, source fingerprint, candidate/incumbent identity, seed,
   configuration, report evidence, invariants, or baselines change.
4. On completion, verify cumulative bin samples equal
   `processedReviewCount`, review/fringe/invariant evidence is nonempty, and the
   recommendation is either `rejected` or `eligible_for_human_approval`.

## 6. Release Decision

A release may proceed only when:

- all five synthetic invariants pass;
- replay MAE is at most incumbent + `0.02`;
- maximum calibration-bin error is at most `0.10`;
- fringe flaps per student-week are at most incumbent × `1.10`;
- the prediction artifact and every source-review stamp are attributable; and
- a named human approves the reviewed artifacts.

Placement accuracy and edge Brier score are report-only in v3.1. The harness
never performs deployment, graph edits, registry publication, or parameter
application.
