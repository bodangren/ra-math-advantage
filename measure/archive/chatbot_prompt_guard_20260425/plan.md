# Chatbot Prompt Injection Defense - Implementation Plan

## Phase 1: Core Injection Detection [checkpoint: da51d9c]
- [x] Write failing tests for detectPromptInjection utility
- [x] Implement detectPromptInjection with pattern matching for common injection techniques
- [x] Verify tests pass

## Phase 2: BM2 Integration [checkpoint: da51d9c]
- [x] Update BM2 route to use system/user message separation
- [x] Integrate prompt injection detection before AI call
- [x] Add tests for injection detection in BM2 route
- [x] Verify BM2 tests pass

## Phase 3: IM3 Integration [checkpoint: da51d9c]
- [x] Update IM3 route to use system/user message separation
- [x] Integrate prompt injection detection before AI call
- [x] Add tests for injection detection in IM3 route
- [x] Verify IM3 tests pass

## Phase 4: Polish [checkpoint: da51d9c]
- [x] Update tech-debt.md
- [x] Update lessons-learned.md
- [x] Final verification (build, typecheck, lint)
- [x] Commit and push
