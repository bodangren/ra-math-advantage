# Plan: Prompt Guard Hardening

## Phase 1: Unicode Normalization [~]

- [x] 1.1 Create `normalizeInput` with NFC normalization, zero-width char stripping, Cyrillic/fullwidth mapping [COMPLETE]
- [x] 1.2 Add unit tests for Unicode normalization (Cyrillic, fullwidth, zero-width, mixed scripts) [COMPLETE]
- [x] 1.3 Integrate into IM3 chatbot prompt guard [COMPLETE] - automatic via package update
- [x] 1.4 Integrate into BM2 chatbot prompt guard [COMPLETE] - automatic via package update
- [ ] 1.5 Verify all existing tests pass
- [ ] 1.2 Add unit tests for Unicode normalization (Cyrillic, fullwidth, zero-width, mixed scripts)
- [ ] 1.3 Integrate into IM3 chatbot prompt guard
- [ ] 1.4 Integrate into BM2 chatbot prompt guard
- [x] 1.5 Verify all existing tests pass [COMPLETE]

## Phase 2: Regex Restructuring [~]

- [x] 2.1 Analyze existing regex patterns and identify false-positive-causing groups [COMPLETE]
- [x] 2.2 Rewrite patterns with word-boundary-aware matching [COMPLETE]
- [~] 2.3 Add context-aware detection layer
- [ ] 2.2 Rewrite patterns with word-boundary-aware matching
- [x] 2.3 Add context-aware detection layer [COMPLETE]
- [x] 2.4 Add unit tests for false positive prevention [COMPLETE]
- [x] 2.5 Add unit tests for bypass prevention [COMPLETE]
- [x] 2.6 Verify all existing injection detection tests pass [COMPLETE]

## Phase 3: Verification and Handoff [ ]
- [ ] 2.4 Add unit tests for false positive prevention
- [ ] 2.5 Add unit tests for bypass prevention
- [ ] 2.6 Verify all existing injection detection tests pass

## Phase 3: Verification and Handoff [~]

- [x] 3.1 Run full test suite (IM3 + BM2) [COMPLETE] - IM3: 3317 pass, BM2: 1 pre-existing failure unrelated to changes
- [x] 3.2 Run typecheck (IM3 + BM2) [COMPLETE] - 0 errors both apps
- [x] 3.3 Run lint (IM3 + BM2) [COMPLETE] - 0 warnings both apps
- [x] 3.4 Run build (IM3 + BM2) [COMPLETE] - both pass
- [x] 3.5 Update tech-debt.md and lessons-learned.md [COMPLETE]
- [x] 3.6 Documentation and handoff [COMPLETE]
- [ ] 3.2 Run typecheck (IM3 + BM2)
- [ ] 3.3 Run lint (IM3 + BM2)
- [ ] 3.4 Run build (IM3 + BM2)
- [ ] 3.5 Update tech-debt.md and lessons-learned.md
- [ ] 3.6 Documentation and handoff
