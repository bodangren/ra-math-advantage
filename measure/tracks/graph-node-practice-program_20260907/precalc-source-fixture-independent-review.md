# Q22 Topic 1.1 source fixture independent review

## Result

Accept the fixture reconciliation. The patch updates four stale expectations to the accepted G31 source records. It does not weaken unrelated source or seed checks.

## Verified corrections

1. The Example 1 fixture now matches the accepted accessible source text exactly. It retains the empty-vase condition, constant volume rate, vessel shape, all four graph behaviors, and the correct Graph D selection. The assertions still test the mathematical reason for the selection through the `wide rounded body` and `steep to gentle to steep` phrases.

2. The Example 2 fixture now matches the accepted piecewise-linear graph description exactly. It retains the domain, all four coordinate points, the three straight segments, and both increasing ranges. The assertions use the prose ranges that occur in the stored source text.

3. The physical-context skill expectation now uses the accepted narrow description. The skill assesses graph selection from direction and changing rate. It does not claim that the learner identifies variable roles, because the original prompt supplies those roles.

4. The interval-classification blueprint expectation now requires both accepted source nodes, `.002` and `.009`. Example 2 supplies increasing-interval evidence. Example 9 supplies decreasing-interval evidence. The test keeps the exact node ID, alignment, renderer mappings, review state, mode specifications, and placeholder-activity checks.

## Scope

The patch changes one test file and five small hunks. It does not change a catalog, source record, activity, seed handler, approval state, or runtime path. All other assertions in the 11-test file remain unchanged.

The patch applies cleanly to the current main worktree.

## Verification

I ran the complete `topic11-source-link.acceptance.test.ts` suite in the author candidate. All 11 tests passed.
