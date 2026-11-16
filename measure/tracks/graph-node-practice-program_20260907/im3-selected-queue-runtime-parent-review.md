# IM3 selected queue runtime parent review

## Scope

The parent reviewed `/tmp/im3-selected-queue-runtime-head.patch` against committed HEAD `b5576a62`. The review traced the queue resolver, PracticeCardRenderer, ActivityRenderer, GraphingExplorerActivity, and the shared GraphingExplorer. The patch is not integrated.

## Required repairs

1. Preserve the actual submission envelope. The shared graph component emits a complete `practice.v1` envelope. PracticeCardRenderer puts that envelope inside `answers` and builds a second envelope. This loses the required top-level parts and assistance data. Validate and forward the real envelope with the server-resolved physical identity and mode. Keep raw-answer compatibility for unrelated legacy components.
2. Pass the Guided mode to the rendered activity. The proposed patch changes only the outer envelope mode. ActivityRenderer still receives `practice`, so the actual component does not receive the Guided mode.
3. Pass the selected renderer configuration through the wrapper. PracticeCardRenderer does not supply activityProps. The committed GraphingExplorerActivity supports only the older variants and defaults to `y = x^2`. It does not render the selected seeded table-and-graph problem. Extend only the required prop and variant forwarding.
4. Reject selected identity mismatches before generic fallback. The queue patch detects a selected row only by the activity stable ID. A selected card or practice item can point to a changed activity and reach the generic path. Treat selected card, activity node, or stable ID claims as a selected boundary. Require the card, practice item, and physical activity identities to agree. Exclude mismatches and unapproved selected rows.

The existing new renderer test supplies raw answers through a mocked ActivityRenderer. It cannot prove the real envelope or configuration path. Add a composition test that uses the real graph component and the real queue output. Verify physical identity, Guided mode, selected equation, canonical parts, and assistance preservation.

## Disposition

Return the patch for repair. The producer and consumer must agree before this task can complete. Existing generic activities retain their current behavior. The selected draft remains unavailable. No curriculum approval, deployment, or schema change follows from this review.

## Corrected daily queue patch accepted

The parent applied the final selected patch to a fresh copy of committed HEAD on 2026-09-08. The real queue resolver supplies the exact Guided seed to the real app and shared graph components. The test enters five table values, plots five points, and uses two hints. The server grader returns 2 out of 2.

The queue now treats the selected card objective as a selected claim. A generic activity cannot satisfy that card. Tests also reject changed selected props and grading configuration. The renderer forwards the full response envelope and selected mode.

Parent checks pass: 46 tests, app lint, production build, and standalone TypeScript against the candidate practice-core sources. The first TypeScript run preceded the build and lacked the generated server entry. It passes after the build. The source mapping preserves the committed evidence serializer contract while the shared worktree contains a pending export removal. No source files are excluded from the type check.

This accepts the bounded committed daily queue repair. Shared worktree reconciliation remains required because those files contain pending later-node work. The Worked lesson path remains under Task Q16. This result does not prove the full signed-in student journey or approve curriculum publication.
