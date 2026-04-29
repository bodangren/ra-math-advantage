# Chatbot Prompt Injection Defense - Implementation Plan

## Phase 1: Core Injection Detection
- [~] Write failing tests for detectPromptInjection utility
- [ ] Implement detectPromptInjection with pattern matching for common injection techniques
- [ ] Verify tests pass

## Phase 2: BM2 Integration
- [ ] Update BM2 route to use system/user message separation
- [ ] Integrate prompt injection detection before AI call
- [ ] Add tests for injection detection in BM2 route
- [ ] Verify BM2 tests pass

## Phase 3: IM3 Integration
- [ ] Update IM3 route to use system/user message separation
- [ ] Integrate prompt injection detection before AI call
- [ ] Add tests for injection detection in IM3 route
- [ ] Verify IM3 tests pass

## Phase 4: Polish
- [ ] Update tech-debt.md
- [ ] Update lessons-learned.md
- [ ] Final verification (build, typecheck, lint)
- [ ] Commit and push
