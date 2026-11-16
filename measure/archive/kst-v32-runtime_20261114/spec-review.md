# Spec Review: kst-v32-runtime_20261114

Author model: claude-opus-5-5[1m]
Author model (Round 1 fixes): claude-sonnet-5-5

## Round 1

Date: 2026-11-15
Reviewer: measure-spec-review on opencode-go/deepseek-v4.1-flash (a substitution for the Kimi table model)
Audited commit: 35c3a18f
Status: fail

Paraphrase: the track moves five packages and the math app callers from kst-srs.v2 to kst-srs.v3.2. It replaces the in-repo spec copy with a README that points to the mastery-advantage source at a pinned commit. Six phases apply the 16 migration items, and each phase has a contract task, a Red task, an implement task, the gates, and a checkpoint.

Findings:

- F1 [Blocker] K2 and plan S1: ts-fsrs 6.0.0 does not export `forgetting_curve` from its root module, and `DEFAULT_SCHEDULER_CONFIG` holds no weights.
- F2 [Blocker] K11 and plan S5: the §11.4 `high` case needs the `confidence` union widened, and the plan names no change. The rule "optional field only" forbids it.
- F3 [Major] K9: the teacher field is `reviewLoadStates` (§9.4), not `reviewLoadState`.
- F4 [Major] plan S2 Red: the weighted rate 0.60 has no observable on a public function.
- F5 [Nit] two stale line numbers: `measure/index.md` line 20, and `measure/knowledge-space.md` line 129.
- F6 [Nit] the argument counts of the two `stabilityToRetention` functions ignore the optional scale parameter.
- F7 [Nit] the text "ts-fsrs (lockfile 5.4.1)" is stale. The lockfile resolves 6.0.0.
- F8 [Major] MIGRATION item 6, first bullet (the §8.4 reference to §13.3), has no phase.

### Author Response

- F1: FIX. I read the declarations of ts-fsrs 6.0.0 and `scheduler.ts`. Spec K2 and the plan S1 Implement tasks now name the import `forgettingCurve` from `ts-fsrs/models/fsrs-6` and the call `forgettingCurve(parameters.w, elapsedDays, stability)`. The value `parameters` comes from `generatorParameters(...)` with the values of `DEFAULT_SCHEDULER_CONFIG`, the same as the scheduler. `FSRS_DECAY = 0.1542` equals `FSRS6_DEFAULT_DECAY` and `w[20]`. Each "ts-fsrs 5.4.1" statement is removed. The plan S1 Contract records the import and the argument order.
- F2: FIX. Spec K11 adds the value `high` to the `confidence` union. The affected files are `placement.ts` of `knowledge-space-core`, `convex/placement.ts` (two validators), `schema.ts` (`placement_results`), and `seed-knowledge-state.ts`. The Non-Functional Requirement now reads "adds an optional field, or widens a literal union so that each stored document stays valid". Plan S5 has a Contract line, a Red line (the v2 test that rejects `high` changes), and an Implement line with the files. The Current System bullet lists the places of the union.
- F3: FIX. Spec K9 and the S4 acceptance criterion use `reviewLoadState` (student) and `reviewLoadStates` (teacher, a map from student ID to state). The S4 plan lines follow the same names.
- F4: FIX. Spec K5 names the new exported function `computeCorrectedCorrectness(passes, guessFloor)`. It returns `{ weightedRate, effectiveSampleSize, wilsonLower, retentionStrength }`. The S2 Red case reads `weightedRate` (0.60, ±0.005, because §13.1 gives two decimals). The S2 Contract writes this contract.
- F5: FIX. Spec Current System, spec K1 area, and plan S1 now cite `measure/index.md` line 20 and `measure/knowledge-space.md` lines 5 and 129. I checked each line.
- F6: FIX. The Current System bullets state the required arguments and the optional arguments (`scaleFactor` in `srs-engine`, `scale` in `knowledge-space-core`).
- F7: FIX. The lockfile version is now 6.0.0.
- F8: FIX. The code that cites the misconception cap is `srs-rating.ts`, which S2 changes. Spec K6 now says that the comment of stage 5 cites §13.3 and that this part of item 6 changes no behavior. Plan S2 has a Contract line, an Implement line, and a Verify line (`git grep` of `13.3` in `srs-rating.ts`).

## Round 2

Date: 2026-11-15
Reviewer: measure-spec-review on opencode-go/deepseek-v4.1-flash (a substitution for the Kimi table model)
Audited commit: 2c6de11d
Status: pass

Paraphrase: the track moves five packages and the math app callers from kst-srs.v2 to kst-srs.v3.2. It replaces the in-repo spec copy with a README that points to the mastery-advantage source at a pinned commit. Six phases apply the 16 migration items, and each phase has a contract task, a Red task, an implement task, the gates, and a checkpoint.

Findings: F1 to F8 withdrawn (fixed in 2c6de11d). No Blocker remains.

- F9 [Major] plan S5 Red, Changed v2 Cases: the case in `phase5-docs-and-doctor.test.ts` (line 264) that asserts the two-value `confidence` enum is not listed.
- F10 [Nit] spec K2: the `FACTOR` that pairs with `FSRS_DECAY` in `knowledge-space-core` is not stated.
- F11 [Nit] plan Test Rules: the S2 weighted-rate case uses the tolerance 0.005, and the rules give 0.001.

### Author Response

- F9: FIX. I read line 264 of `apps/integrated-math-3/__tests__/lib/placement/phase5-docs-and-doctor.test.ts`: it matches `z.enum(['low', 'medium'])` in `placement.ts`. Plan S5 Test (Red) now has a line for this case, with the change to the enum that holds `high`, the later path under `apps/math`, and the record under "Changed v2 Cases".
- F10: FIX. I read `computeDecayFactor` and `forgetting_curve` in the ts-fsrs 6.0.0 dist source. Spec K2 now gives the curve `(1 + FACTOR × elapsedDays / stability)^(−FSRS_DECAY)` and `FACTOR = 0.9^(−1/FSRS_DECAY) − 1` (about 0.980), the same form as ts-fsrs. The retention at `elapsedDays = stability` is 0.9. The spec says that the S1 Red case and the parity test pin this value, and that `19/81` pairs with the decay 0.5 only.
- F11: FIX. The plan Test Rules now name the one exception: the S2 weighted-rate case uses the tolerance 0.005, because §13.1 gives two decimals. Each other case uses 0.001.

## Accepted Risks

None.
