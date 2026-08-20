# Implementation Plan: Danielson Application Foundation and Access

**Track type:** feature

**Application:** `apps/danielson/`

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition [checkpoint: 849f220]

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
- [x] Task 1.4: Define the production bootstrap and administration boundaries
    - [x] Define the first organization and system-administrator seed path
    - [x] Keep authorization in each administration mutation
- [x] Task 1.5: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' — user directed full-track continuation

## Phase 2: Test [checkpoint: 6cffd96]

- [x] Task 2.1: Write account and multiple-role contract tests — `bc10524`
    - [x] Test teacher plus HOD and teacher plus SLT accounts
    - [x] Test strict validation and duplicate assignment rejection
- [x] Task 2.2: Write scoped authorization Red tests — `bc10524`
    - [x] Test HOD, coach, school-head, and SLT access
    - [x] Test unauthenticated, deactivated, cross-organization, and out-of-scope denial
    - [x] Test stale token roles and organizations, role grant, role revocation, and final-system-administrator protection
    - [x] Assert denial occurs before a protected read or write
- [x] Task 2.3: Write system-administrator Red tests — `bc10524`
    - [x] Test account, role, department, and assignment management
    - [x] Prove that the role alone cannot read a teacher report
    - [x] Prove that a second SLT role grants only SLT-scoped report access
- [x] Task 2.4: Write subject-exclusion adversarial tests — `bc10524`
    - [x] Test private read, walkthrough, observation, and PIP self-denial for each supervisor role
    - [x] Prove that teacher response and PIP acknowledgment remain allowed
- [x] Task 2.5: Write bootstrap and authentication Red tests — `bc10524`
    - [x] Test first-administrator creation, secret exclusion, denial, and final-administrator protection
    - [x] Test temporary credentials, password change, generic errors, throttling, cookie flags, and safe redirects
- [x] Task 2.6: Write workspace and architecture contract tests — `bc10524`
    - [x] Test workspace inventory, commands, manifest ownership, dependencies, and quality gates
    - [x] Test that shared packages do not import the new application
- [x] Task 2.7: Measure - User Manual Verification 'Phase 2: Test' — user directed full-track continuation

## Phase 3: Implement [checkpoint: 8d57514]

- [x] Task 3.1: Create the minimum application workspace — `8d57514`
    - [x] Reuse the installed framework, configuration, application shell, and design primitives
    - [x] Add sign-in, signed-out, unauthorized, and role-aware landing states
- [x] Task 3.2: Implement organization and assignment persistence — `8d57514`
    - [x] Add app-owned Convex tables and indexes
    - [x] Add bounded internal queries and transactional mutations
    - [x] Keep actor and time fields on assignment records
- [x] Task 3.3: Integrate shared authentication — `8d57514`
    - [x] Compose the shared session and active-account guards in an app-owned wrapper
    - [x] Resolve current Danielson roles from server-owned assignments
    - [x] Add temporary credentials, password change, login throttling, and safe redirects
- [x] Task 3.4: Implement system-administrator workflows — `8d57514`
    - [x] Add accessible account, role, department, and assignment controls
    - [x] Prevent the system-administrator role from opening evaluation data
- [x] Task 3.5: Implement the role-aware application shell — `8d57514`
    - [x] Show only actions permitted by the resolved roles and scope
    - [x] Keep all security decisions on the server boundary
- [x] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' — user directed full-track continuation

## Phase 4: Generate Docs and Doctor [checkpoint: 08a18fc3]

- [x] Task 4.1: Run focused and workspace quality gates — `08a18fc3`
    - [x] Run tests, coverage, lint, typecheck, and build for the new application and changed packages
    - [x] Run authorization and accessibility integration tests
- [x] Task 4.2: Update deterministic architecture facts — `8d57514`
    - [x] Run `npm run generate`
    - [x] Run boundary and inventory-parity checks
- [x] Task 4.3: Run Measure Doctor and inspect the final diff — `8d57514`
    - [x] Run `npm run doctor`
    - [x] Confirm that no unrelated active-track files changed
- [x] Task 4.4: Complete the independent final review — `08a18fc3`
    - [x] Review the implementation against the specification and plan
    - [x] Correct the security, replay, test, scale, usability, and accessibility findings
    - [x] Confirm that the corrections satisfy the review
- [x] Task 4.5: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' — user directed full-track continuation
