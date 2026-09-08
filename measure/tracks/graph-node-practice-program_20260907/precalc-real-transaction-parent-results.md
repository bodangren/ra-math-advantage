# Precalculus real local transaction parent results

The parent ran the actual current selected writer and evidence handler on cached Convex backend precompiled-2026-08-25-7cce8fb. The target is local-anonymous q35-precalc-rename-20260908 at loopback ports 43130 and 43131. The database and test source are disposable files under /tmp/precalc-q35-rename-current-main. No cloud environment was used.

The isolated fixture approves only the selected node and blueprint. It creates schema-valid physical activities, an active credential, and earlier teacher evidence. The teacher evidence is a fixture. Q34 separately covers the actual teacher action. No Independent receipt, mastery evidence, card, or review is preinserted.

The actual writer returned a 3/3 grade with attempt ordinal 1. The actual selected mutation returned new eligible mastery evidence. Counts changed from one teacher evidence row and zero receipts/cards/reviews to two evidence rows and one receipt/card/review. A repeat returned replay.

The actual writer created a second submission with ordinal 2. A test-only mutation called submitSelectedEvidenceHandler and verified a new mastery result and receipt before throwing. A later query returned exactly the same full evidence, receipt, card, and review rows as before the failed mutation.

Two concurrent CLI requests then submitted that second physical submission. They returned one new result and one replay result. Final counts were three evidence rows, including the teacher fixture, two receipts, one card, and two reviews. Exactly one evidence row, receipt, and review referenced the second submission.

The parent script is /tmp/precalc-q35-run-atomic.py. The result is /tmp/precalc-q35-atomic-result.log. Full before/after rows are in /tmp/precalc-q35-before-rollback.log, /tmp/precalc-q35-after-rollback.log, and /tmp/precalc-q35-after-concurrent.log. Independent review accepts the exact local results. See `precalc-real-transaction-independent-review.md`.

These checks exercise the real local transaction manager. They do not prove cloud infrastructure or browser behavior. The backend log records an SRS-card conflict and an automatic retry of selectedLearningEvidence.submitSelected. This is evidence of overlapping transactions and conflict retry. The rollback test uses an outer forced error after the actual selected effects. It does not test every internal failure path. Additional controls remain open.
