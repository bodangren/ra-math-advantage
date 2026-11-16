# IM3 explicit Worked review action

The lesson page previously saved a student Worked acknowledgement when its phase became active. The new regression observed one submission immediately after render. No student action occurred.

The page now requires the student to select “I reviewed this worked example.” It disables the action during storage. A failed save keeps the phase incomplete. Retry reuses the same payload, timestamp, and key. Each recognized Worked source requires its own action. Opening or reopening a phase does not create a submission.

The new boundary test passes. It mocks layout and phase rendering to isolate page submission behavior. It does not prove visual review or comprehension. Existing renderer tests now use explicit actions and preserve their exact-source, phase-gating, retry, and no-duplicate assertions. All 77 related tests pass. App lint, standalone TypeScript, and production build pass.

The runtime change remains in the main working tree. The file contains earlier pending multi-node integration. The parent must isolate the selected caller for commit and complete independent review. The selected server acknowledgement writer is tracked separately in Q10. Teacher attestation remains required before any teacher-led evidence. No source approval or deployment occurred.
