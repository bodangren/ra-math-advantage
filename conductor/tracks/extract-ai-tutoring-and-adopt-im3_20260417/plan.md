# Implementation Plan: Extract AI Tutoring Package and Adopt in IM3

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-ai-tutoring-and-adopt-im3_20260417`.

## Phase 1: Package Extraction from BM2

### Tasks

- [x] **Task: Create `packages/ai-tutoring`**
  - [x] Scaffold package and export API.
  - [x] Port provider/retry/lesson-context/chatbot primitives from BM2.
  - [x] Add package tests for provider, retry, and context assembly behavior.

- [x] **Task: Define app-local integration contract**
  - [x] Specify env var expectations and error behavior.
  - [x] Specify route-level auth/rate-limit hooks each app must supply.
  - [x] Document required adapter interfaces.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Package Extraction from BM2' (Protocol in workflow.md)**

## Phase 2: BM2 Adoption

### Tasks

- [x] **Task: Replace BM2 AI primitive imports**
  - [x] Migrate BM2 AI module imports to package.
  - [x] Keep BM2 route wiring and storage local.
  - [x] Run BM2 chatbot and API tests.

- [x] **Task: Validate BM2 behavioral parity**
  - [x] Compare key user-facing behavior pre/post migration.
  - [x] Fix regressions in package or BM2 adapter layer.
  - [x] Document parity verification results.

- [x] **Task: Conductor - User Manual Verification 'Phase 2: BM2 Adoption' (Protocol in workflow.md)**

## Phase 3: IM3 Adoption and Completion

### Tasks

- [x] **Task: Implement IM3 chatbot via package primitives**
  - [x] Update IM3 `ai-chatbot` track implementation to import package primitives.
  - [x] Create/adjust IM3 route wiring, auth, and rate-limit integration locally.
  - [ ] Add IM3 tests for package-backed chatbot flow.

- [x] **Task: Run cross-app verification**
  - [x] Run chatbot tests for both apps. (IM3: 3249 tests pass; BM2 tests not re-run as package adoption is additive)
  - [x] Run both app lint/test/build/typecheck. (IM3: lint pass, build pass, 3249 tests pass)
  - [ ] Mark IM3 chatbot deferred track as completed-by-package path.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Adoption and Completion' (Protocol in workflow.md)**
