# IM3 Quadratic Formula allocation review findings

The first allocation proposal is not ready for implementation. Parent and independent review found these contract gaps.

- Historical graded submissions can have an attempt ordinal greater than one and still use the fixed seed. An ordinal cannot identify an allocated variant. Preserve the existing exact-body receipt replay before requiring a new allocation handle.
- The grader compares the public equation with the regenerated private seed. A later variant needs public props derived from that same private variant. Keep the fixed activity as the mode identity. Do not change its equation to serve another attempt.
- A normal reload must return the current pending or final state. Only an explicit learner action can start the next attempt.
- Status is stored in `submissionData.status`. A pending row also requires both submission timestamps. Direct submission consumers need checks that exclude pending rows from completed work and preserve valid final results.
- The seed rerun currently requires one item per fixed activity. Later items would make that rerun fail. Both seed validation and legacy receipt authority must select the exact original relation while preserving valid later relations and rejecting malformed relations.

The revised proposal adds an optional private variant reference to the existing submission row. This is a proposed schema change. Its necessity and consumer impact still need review. No allocation code or schema change is accepted by this report.

The implementation scope must also define the first attempt, the later variant schedule, exhaustion behavior, and the exact public final-state response. A finite schedule proves only its supported attempts. It does not establish full course coverage.

The graph binding correction remains a separate active batch. This review does not publish draft activities or change learning evidence.
