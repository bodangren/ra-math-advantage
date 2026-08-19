# Implementation Plan: Danielson Application Foundation and Access

**Track type:** feature

**Application:** `apps/danielson/`

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition [checkpoint: 74496b9]

- [x] Task 1.1: Define the application ownership contract — `724f77b`
    - [x] Add the application product, product-guideline, and design documents
    - [x] Define app-owned routes, Convex ownership, and public entry points
    - [x] Record the allowed shared-package dependencies
- [x] Task 1.2: Define account and organization schemas — `e2fc1d8`
    - [x] Define strict account, organization, department, and teacher-profile contracts
    - [x] Define app-owned many-to-many role assignments
    - [x] Define HOD department and coach teacher assignments
    - [x] Define indexes for every authorization lookup
- [x] Task 1.3: Define the authorization matrix — `0dc52d0`
    - [x] Define capabilities for the six roles and their scopes
    - [x] Define additive role resolution
    - [x] Define subject exclusion for private data, evaluation writes, and supervisor-side PIP actions
    - [x] Define cross-organization denial
- [x] Task 1.4: Define account-administration audit events — `74496b9`
    - [x] Define actor, action, target, time, and before-and-after fields
    - [x] Define immutable, transactional, and replay-safe audit-event behavior
- [x] Task 1.5: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' — user directed full-track continuation

## Phase 2: Test

- [~] Task 2.1: Write account and multiple-role contract tests
    - [ ] Test teacher plus HOD and teacher plus SLT accounts
    - [ ] Test strict validation and duplicate assignment rejection
- [ ] Task 2.2: Write scoped authorization Red tests
    - [ ] Test HOD, coach, school-head, and SLT access
    - [ ] Test unauthenticated, deactivated, cross-organization, and out-of-scope denial
    - [ ] Test stale token roles and organizations, role grant, role revocation, and final-system-administrator protection
    - [ ] Assert denial occurs before a protected read or write
- [ ] Task 2.3: Write system-administrator Red tests
    - [ ] Test account, role, department, and assignment management
    - [ ] Prove that the role alone cannot read a teacher report
    - [ ] Prove that a second SLT role grants only SLT-scoped report access
- [ ] Task 2.4: Write subject-exclusion adversarial tests
    - [ ] Test private read, walkthrough, observation, and PIP self-denial for each supervisor role
    - [ ] Prove that teacher response and PIP acknowledgment remain allowed
- [ ] Task 2.5: Write audit and authentication Red tests
    - [ ] Test transactional audit events, strict before and after values, secret exclusion, denial, replay, and immutability
    - [ ] Test temporary credentials, password change, generic errors, throttling, cookie flags, and safe redirects
- [ ] Task 2.6: Write workspace and architecture contract tests
    - [ ] Test workspace inventory, commands, manifest ownership, dependencies, and quality gates
    - [ ] Test that shared packages do not import the new application
- [ ] Task 2.7: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)

## Phase 3: Implement

- [ ] Task 3.1: Create the minimum application workspace
    - [ ] Reuse the installed framework, configuration, application shell, and design primitives
    - [ ] Add sign-in, signed-out, unauthorized, and role-aware landing states
- [ ] Task 3.2: Implement organization and assignment persistence
    - [ ] Add app-owned Convex tables and indexes
    - [ ] Add bounded internal queries and transactional mutations
    - [ ] Add immutable audit-event writes
- [ ] Task 3.3: Integrate shared authentication
    - [ ] Compose the shared session and active-account guards in an app-owned wrapper
    - [ ] Resolve current Danielson roles from server-owned assignments
    - [ ] Add temporary credentials, password change, login throttling, and safe redirects
- [ ] Task 3.4: Implement system-administrator workflows
    - [ ] Add accessible account, role, department, and assignment controls
    - [ ] Prevent the system-administrator role from opening evaluation data
- [ ] Task 3.5: Implement the role-aware application shell
    - [ ] Show only actions permitted by the resolved roles and scope
    - [ ] Keep all security decisions on the server boundary
- [ ] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)

## Phase 4: Generate Docs and Doctor

- [ ] Task 4.1: Run focused and workspace quality gates
    - [ ] Run tests, coverage, lint, typecheck, and build for the new application and changed packages
    - [ ] Run authorization and accessibility integration tests
- [ ] Task 4.2: Update deterministic architecture facts
    - [ ] Run `npm run generate`
    - [ ] Run boundary and inventory-parity checks
- [ ] Task 4.3: Run Measure Doctor and inspect the final diff
    - [ ] Run `npm run doctor`
    - [ ] Confirm that no unrelated active-track files changed
- [ ] Task 4.4: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' (Protocol in workflow.md)
