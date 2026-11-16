# QF backend first parent review

The first implementation is not accepted. Build and TypeScript pass. These checks do not prove the submission contract.

- `canonicalQfPayload` omits accepted top-level telemetry. A changed timing or artifact can replay as the same request.
- The route accepts reordered parts. The grader emits a fixed order. The replay comparator must normalize that order for both requests.
- Legacy guards check the stable ID and node/component pair. They do not check a physical activity linked to a QF variant.
- The activity gate rejects approved status only. It also accepts missing, rejected, and needs-changes states. Require the accepted draft state.
- The writer does not check the draft node and blueprint publication state.
- The item lookup uses an unbounded collect. Use the existing index with a two-row limit to detect duplicates. Check the exact variant key and reverse relation.
- The seed patches an existing activity without first verifying that its identity and content belong to the intended QF record. Preserve unrelated and approved records. Reject inconsistent relations.

Add behavioral regressions for each boundary. Test stored, JSON-round-tripped graded receipts against original requests. Keep the indexed server ordinal separate from original client attempt telemetry. No source integration is accepted by this review.
