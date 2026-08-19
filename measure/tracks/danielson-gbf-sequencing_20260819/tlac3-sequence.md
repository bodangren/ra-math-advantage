# TLAC 3.0 Sequence Analysis

## Purpose

Map the provided Get Better Faster (GBF) scope and sequence to the 63 Teach Like
a Champion 3.0 (TLAC 3.0) technique modules in the sibling prototype. Preserve
the source order. Mark every mapping as direct or inferred.

This document is a source analysis. It does not activate graph edges.

## Source Register

| Source | Use | SHA-256 |
|---|---|---|
| `get-better-faster-scope-sequence.pdf` | Phase and action-step order | `cf34c7ed03fd63fb0c89cb378b1fcacde4c6dc5a7238fc1b9cb059ddf733de64` |
| `Classroom-Insights-Handbook_25-26-1.pdf` | One implementation example | `9de9a26d9acdea6fd134c50fec300822fb652f385cd1fe5cbff6b518ee311828` |
| `../hdkwa-danielson/src/data/techniques/` | Candidate TLAC 3.0 technique IDs and local Danielson mappings | Repository source; freeze exact commit and file hashes during implementation |

The user supplied the first PDF as the GBF 2.0 scope and sequence. The visible
PDF title does not state an edition. The implementation must preserve that
qualification in provenance.

## Classification Rules

- **Source-stated order:** The GBF PDF places the action step in a numbered
  trajectory and phase.
- **Direct mapping:** The source names the TLAC 3.0 technique or describes its
  defining action.
- **Inferred mapping:** The action bullets match a local TLAC 3.0 technique, but
  the source does not use the current title.
- **Unsequenced:** The supplied source does not support a safe phase placement.

An inferred mapping must record its rationale and receive human review. It must
not become a hard gate by default.

## Source-Stated Trajectories

| Phase | Management trajectory | Rigor trajectory |
|---|---|---|
| Phase 1: Pre-teaching | Routines and Procedures 101; Strong Voice | Develop Effective Lesson Plans 101; Internalize Existing Lesson Plans |
| Phase 2: Days 1–30 | What to Do; Routines and Procedures 201; Teacher Radar; Whole-Class Reset | Write the Exemplar; Independent Practice; Monitor Aggressively |
| Phase 3: Days 31–60 | Build the Momentum; Pacing; Engage All Students; Narrate the Positive; Individual Student Corrections | Habits of Evidence; Check for Whole-Group Understanding; Re-teaching 101 - Model |
| Phase 4: Days 61–90 | Engaged Small Group Work | Re-teaching 201 - Guided Discourse; Universal Prompts; Habits of Discussion |
| Stretch It: Next steps | No management action step | Strategic Prompts; Go Conceptual |

The two trajectories run in parallel. The source does not state that completion
of the Management trajectory is required before work in the Rigor trajectory.

## TLAC 3.0 Mapping

| Phase and GBF action step | Primary TLAC 3.0 mapping | Other supported mappings | Status |
|---|---|---|---|
| P1-M1 Routines and Procedures 101 | `50 Routine Building` | `54 Make Expectations Visible`; `52 What to Do` | Primary direct; others inferred |
| P1-M2 Strong Voice | `58 Strong Voice` | `56 Firm, Calm Finesse` | Primary direct; other inferred |
| P1 preview: Least Invasive Intervention | `55 Least Invasive Intervention` | None | Direct preview; not yet required for mastery |
| P1 preview: Narrate the Positive | `59 Positive Framing` | `60 Precise Praise` | Inferred current-title mapping |
| P1 preview: Create a Challenge or Build Momentum | `28 Brighten the Lines` | `63 Joy Factor` | Inferred |
| P1 preview: Teacher Radar | `53 Radar and Be Seen Looking` | None | Direct behavioral match |
| P1 preview: Do It Again | `51 Do It Again` | None | Direct preview; not yet required for mastery |
| P1-R1 Develop Effective Lesson Plans 101 | `4 The Double Plan` | `1 Exemplar Planning`; `2 Plan for Error`; `26 Exit Ticket` | Inferred composite |
| P1-R2 Internalize Existing Lesson Plans | `4 The Double Plan` | `30 Work the Clock`; `31 Every Minute Matters` | Inferred composite |
| P2-M1 What to Do | `52 What to Do` | None | Direct |
| P2-M2 Routines and Procedures 201 | `50 Routine Building` | `51 Do It Again` | Direct behavioral match |
| P2-M3 Teacher Radar | `53 Radar and Be Seen Looking` | `25 Circulate` | Primary direct; other direct behavior |
| P2-M4 Whole-Class Reset | `52 What to Do` | `58 Strong Voice`; `51 Do It Again` | Inferred composite |
| P2-R3 Write the Exemplar | `1 Exemplar Planning` | None | Direct behavioral match |
| P2-R4 Independent Practice | `39 Silent Solo` | `38 Everybody Writes`; `20 Do Now`; `26 Exit Ticket` | Inferred composite with direct named routines |
| P2-R5 Monitor Aggressively | `9 Active Observation` | `25 Circulate`; `11 Affirmative Checking` | Inferred current-title mapping |
| P3-M5 Build the Momentum | `28 Brighten the Lines` | `63 Joy Factor` | Inferred |
| P3-M6 Pacing | `30 Work the Clock` | `27 Change the Pace`; `31 Every Minute Matters`; `35 Call and Response` | Direct behavioral matches |
| P3-M7 Engage All Students | `36 Means of Participation` | `34 Cold Call`; `43 Turn and Talk`; `35 Call and Response`; `29 All Hands` | Direct named routines |
| P3-M8 Narrate the Positive | `59 Positive Framing` | `60 Precise Praise` | Inferred current-title mapping |
| P3-M9 Individual Student Corrections | `55 Least Invasive Intervention` | `57 Art of the Consequence`; `56 Firm, Calm Finesse`; `61 Warm-Strict`; `62 Emotional Constancy` | Primary direct; others inferred |
| P3-R6 Habits of Evidence | `23 Accountable Independent Reading` | `24 FASE Reading` | Inferred |
| P3-R7 Check for Whole-Group Understanding | `10 Show Me` | `6 Replace Self-Report`; `9 Active Observation`; `11 Affirmative Checking` | Primary direct; others inferred |
| P3-R8 Re-teaching 101 - Model | `37 Break It Down` | `3 Delivery Moves` | Inferred |
| P4-M10 Engaged Small Group Work | `36 Means of Participation` | `25 Circulate`; `49 Engineer Efficiency`; `21 Take the Steps` | Inferred composite |
| P4-R9 Re-teaching 201 - Guided Discourse | `13 Show Call` | `15 No Opt Out` | Primary direct; other inferred |
| P4-R10 Universal Prompts | `33 Wait Time` | `37 Break It Down`; `32 Phrasing Fundamentals` | Primary direct behavior; others inferred |
| P4-R11 Habits of Discussion | `44 Habits of Discussion` | `46 Disciplined Discussion` | Primary direct; other inferred extension |
| S-R12 Strategic Prompts | `37 Break It Down` | `34 Cold Call`; `44 Habits of Discussion` | Inferred |
| S-R13 Go Conceptual | `17 Stretch It` | `16 Right Is Right`; `18 Format Matters` | Primary direct; others inferred |

## Unsequenced TLAC 3.0 Techniques

The supplied scope and sequence does not support a safe phase placement for
these local modules:

- `5 Knowledge Organizers`
- `7 Retrieval Practice`
- `8 Standardize the Format`
- `12 Culture of Error`
- `14 Own and Track`
- `19 Without Apology`
- `22 Board = Paper`
- `40 Front the Writing`
- `41 Art of the Sentence`
- `42 Regular Revision`
- `45 Batch Process`
- `47 Threshold & Strong Start`
- `48 Habits of Attention`

These skills remain valid Danielson child skills. Their KST and SRS state can
still make them due. They receive no GBF phase or prerequisite edge until a
reviewed source or approved inference supports one.

## Edge Inference Policy

1. Keep the Management and Rigor trajectories separate.
2. Treat source order as a recommended progression.
3. Create `supports` candidates for secondary techniques inside one action-step
   bundle.
4. Create low- or medium-confidence `prerequisite_for` candidates only between
   reviewed primary techniques in consecutive steps of the same trajectory.
5. Give every inferred edge the source page, action-step IDs, rationale,
   confidence, weight, author, and review status.
6. Keep all new edges in `draft` until a human approves them.
7. Do not assign hard-gate weight by default.
8. Reject duplicate endpoints, dangling endpoints, and medium- or
   high-confidence prerequisite cycles.

The user permits prerequisite inference from GBF sequencing. This policy keeps
that inference visible and reversible.

## Source-Informed Implementation Practices

The Classroom Insights handbook describes one implementation of a similar
system. It uses unannounced short visits, a consistent observer, follow-up within
48 hours, one small action step, practice during the follow-up, review of the
prior action step on the next visit, monthly or biweekly cadence, mid-year
reflection, final reflection, and secure longitudinal storage.

Confirmed local decisions override that implementation where they differ:

- Use 5–10 minute walkthroughs instead of 10–15 minutes.
- Use three prioritized observation targets.
- Use KST and SRS to vary cadence by teacher.
- Keep two formal observations in Q1 and Q4.

The remaining implementation practices require separate product approval.
