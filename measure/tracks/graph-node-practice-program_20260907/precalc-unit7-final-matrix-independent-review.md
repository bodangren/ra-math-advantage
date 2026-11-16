# Precalculus Q37 Unit 7 final matrix review

## Verdict

All nine required rows are closed for the selected Topic 1.1 flow.

The evidence tests the committed runtime fixes and the disposable local data. It does not prove full course coverage. It does not approve a curriculum source.

## Acceptance matrix

| Row | Status | Independent evidence assessment |
|---|---|---|
| 1. Real lesson and mixed phase | Closed | The baseline browser run opened the authenticated real lesson. It found all seven seeded phases. It checked the exact Worked graph points. It distinguished ordinary Worked text from the acknowledgement action. It submitted the labeled written response and found one stored `lesson_responses` row. |
| 2. Worked acknowledgement and waiting state | Closed | The browser submitted the canonical empty-parts acknowledgement. It found one physical submission. It found the waiting state and no Guided or Independent access. The teacher dashboard showed the exact learner and submission. |
| 3. Teacher introduction and unlock | Closed | The browser used the real teacher form and route. The candidate disappeared. The exact teacher-led evidence row persisted. No receipt, SRS card, SRS review, or mastery effect came from the teacher action. The learner used the real refresh control and received practice access. The later date proof also found no hydration error and retained the stored timestamp semantics. |
| 4. Wrong and corrected Guided | Closed | The real browser stored wrong Guided attempt 1 at 0/3 and correct Guided attempt 2 at 3/3. The persisted rows include the exact Guided activity, ordinals, graded parts, evidence links, and receipts. Both receipts are persisted and non-mastery-bearing with reason `ungraded_evidence`. |
| 5. Hint and reveal | Closed | The final assistance browser run used a visible hint and reveal in Guided and Independent modes. It stored the per-part counters. Guided remained non-mastery-bearing. The correct assisted Independent attempt received `Hard`. The script also proved blank submission sends no request, ambiguous failure freezes the tuple, retry remains available, and a new attempt clears answers and assistance state. |
| 6. Independent outcomes | Closed | The baseline browser run used a distinct Independent graph. Wrong attempt 1 stored 0/3 and received `Again`. Correct attempt 2 stored 3/3 and received `Good`. Both receipts were eligible and mastery-bearing. The evidence retained the exact node, physical submission links, one SRS card, and two reviews. The assistance run separately proved the assisted correct `Hard` result. |
| 7. Ambiguous response and duplicate pending click | Closed | The acknowledgement replay run accepted the first request, lost the response, and retried with the same key and body. One submission persisted. The Guided assistance run repeated this pattern with the same frozen tuple and one persisted effect. The pending-guard browser run issued one request for two synchronous clicks while pending. It released the guard after failure and allowed the exact-key retry. The optional teacher-confirmation ambiguity variant was not needed because the row permits the submission variant. The Q38 saved-retry run also proved accepted response loss, persisted-read recovery, and a one-request same-event retry guard. |
| 8. Stale source | Closed | The corrected writer check rejects new Guided and Independent submissions with HTTP 409 while the selected Worked source is stale. The persisted identities remain unchanged. Separate replay evidence shows that exact historical Guided and Independent replays still return the stored submissions after the source becomes stale. The fixture restores the source explicitly. |
| 9. Reload, dashboards, completion, and saved attempts | Closed | The earlier reload matrix proved stable persisted identities, the saved ordinary response, continued practice access, and a stable teacher candidate list. Q38 adds the required physical saved-attempt projection. The lesson and student dashboard show latest Guided and Independent attempts. Reload sends no learner API POST and leaves all learner rows equal. Historical results remain visible after source withdrawal. Missing-receipt retry uses the old submission ID, creates no submission, and recovers an accepted lost response through a stored receipt. A new attempt uses a new submission ID and the next ordinal. The teacher dashboard remains stable. |

## Supporting runtime repairs

The acknowledgement replay fix uses structural JSON equality for persisted nested data. The Worked pending guard blocks a second synchronous request. The readiness writer blocks new practice unless the learner is ready. It keeps the accepted historical replay branch before that check. The assistance controls preserve per-part counters and frozen retry input. The Q38 saved views validate ownership, grade data, receipt data, timestamps, and bounded latest-per-mode reads.

The KaTeX stylesheet fix removes the observed page-width overflow. The final layout result has a document width of 1,280 pixels at a 1,280-pixel viewport. The remaining large internal SVG path bounds do not increase the document width.

## Evidence qualification

The first saved-retry harness run failed because its locator required one specific error string. The final corrected run used a newly created pending Guided attempt and captured the actual `Failed to fetch` alert. No matrix claim uses the failed run.

The initial Unit 7 reports record defects that existed before the later commits. The final browser artifacts and focused tests supersede those failed states. The retained literal `\\u222B` logo text is a preexisting visual defect. It does not invalidate a required matrix row.

I found no required path that remains untested.
