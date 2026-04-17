# Implementation Plan: Extract AI Tutoring Package and Adopt in IM3

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-ai-tutoring-and-adopt-im3_20260417`.

## Phase 1: Package Extraction from BM2

### Tasks

- [ ] **Task: Create `packages/ai-tutoring`**
  - [ ] Scaffold package and export API.
  - [ ] Port provider/retry/lesson-context/chatbot primitives from BM2.
  - [ ] Add package tests for provider, retry, and context assembly behavior.

- [ ] **Task: Define app-local integration contract**
  - [ ] Specify env var expectations and error behavior.
  - [ ] Specify route-level auth/rate-limit hooks each app must supply.
  - [ ] Document required adapter interfaces.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Package Extraction from BM2' (Protocol in workflow.md)**

## Phase 2: BM2 Adoption

### Tasks

- [ ] **Task: Replace BM2 AI primitive imports**
  - [ ] Migrate BM2 AI module imports to package.
  - [ ] Keep BM2 route wiring and storage local.
  - [ ] Run BM2 chatbot and API tests.

- [ ] **Task: Validate BM2 behavioral parity**
  - [ ] Compare key user-facing behavior pre/post migration.
  - [ ] Fix regressions in package or BM2 adapter layer.
  - [ ] Document parity verification results.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: BM2 Adoption' (Protocol in workflow.md)**

## Phase 3: IM3 Adoption and Completion

### Tasks

- [ ] **Task: Implement IM3 chatbot via package primitives**
  - [ ] Update IM3 `ai-chatbot` track implementation to import package primitives.
  - [ ] Create/adjust IM3 route wiring, auth, and rate-limit integration locally.
  - [ ] Add IM3 tests for package-backed chatbot flow.

- [ ] **Task: Run cross-app verification**
  - [ ] Run chatbot tests for both apps.
  - [ ] Run both app lint/test/build/typecheck.
  - [ ] Mark IM3 chatbot deferred track as completed-by-package path.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Adoption and Completion' (Protocol in workflow.md)**
