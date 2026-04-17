# Specification: Extract AI Tutoring Package and Adopt in IM3

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-ai-tutoring-and-adopt-im3_20260417`.

## Overview

Use BM2 as source of truth for AI tutoring primitives so IM3 does not create a duplicate local implementation.

## Dependencies

- `bm2-consume-core-packages_20260417`

## Functional Requirements

- FR-1: Extract BM2 provider/retry/context/chatbot primitives into package.
- FR-2: Keep secrets, rate-limit persistence, and app route wiring local.
- FR-3: Migrate BM2 imports to package.
- FR-4: Implement IM3 chatbot track using package imports (not copy-paste).

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] `packages/ai-tutoring` exists and is consumed by BM2.
- [ ] IM3 chatbot is implemented via package primitives.
- [ ] No API key secrets in package code.
- [ ] Chatbot tests pass in both apps.

## Out of Scope

- Multi-turn chat history.
- Cross-app shared rate limit table.
