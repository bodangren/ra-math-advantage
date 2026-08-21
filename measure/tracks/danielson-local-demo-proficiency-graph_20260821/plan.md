# Implementation Plan: Danielson Local Demo and Teacher Proficiency Graph

## Implementation Rules

- Follow `apps/danielson/demo-contract.md` and `apps/danielson/reporting-contract.md` after Phase 1 creates or updates them.
- Apply the Ponytail Rule before each code change.
- Reuse the existing report, queue, proficiency, authentication, and Convex code.
- Add no dependency.
- Add no schema table or index.
- Add no hash, manifest, registry, ledger, cache, or stored graph layout.
- Use ASD-STE100 Simplified Technical English for all text.
- Write or update a failing behavioral test before each implementation change.
- Do not stage or edit unrelated active work in the monorepo.

## Phase 1: Contract and Schema Definition

- [x] Task: Define the local demo contract. [01d22e15]
    - [ ] Create `apps/danielson/demo-contract.md`.
    - [ ] Copy the confirmed organization, account, department, and teacher scenario tables from `spec.md`.
    - [ ] Define the seed results as `created`, `already_seeded`, and `conflict`.
    - [ ] Define the stable organization slug as `danielson-school`.
    - [ ] Define all stable usernames from the specification.
    - [ ] Require one reference time for all generated dates.
    - [ ] Require `mustChangePassword: false` for all demo credentials.
    - [ ] State that the seed is local only and internal only.
    - [ ] State that native local Convex reset is the only reset process.

- [x] Task: Define the report and graph contract. [01d22e15]
    - [ ] Update `apps/danielson/reporting-contract.md`.
    - [ ] Add `priorityTargets` to the current proficiency projection.
    - [ ] Define each target as `{ rank, skillId, reason }`.
    - [ ] Limit the list to three targets.
    - [ ] State that `rankPriorityTargets()` owns the order.
    - [ ] Define the collapsed graph as one root, four domains, and 22 components.
    - [ ] Define one expanded component at a time.
    - [ ] Define the radial layout and node detail fields.
    - [ ] Define pan, zoom, Fit graph, Reset view, full screen, selection, and expansion.
    - [ ] Define the accessible detailed list as a required companion view.

- [x] Task: Confirm the minimum persistence boundary. [01d22e15]
    - [ ] Read `apps/danielson/convex/schema.ts` before editing any Convex file.
    - [ ] Check for `apps/danielson/convex/_generated/ai/guidelines.md`.
    - [ ] If the file is absent, run `npx convex ai-files install` from `apps/danielson/`.
    - [ ] Confirm that the command adds guidance files only. Stop if it changes a dependency.
    - [ ] Read `apps/danielson/convex/_generated/ai/guidelines.md` before editing Convex code.
    - [ ] Record in `demo-contract.md` that the current schema is sufficient.
    - [ ] Do not add a demo table, marker row, layout row, or graph-state row.
    - [ ] Do not add an index for a seven-teacher fixture.
    - [ ] If the current schema cannot represent one required scenario, stop and report the exact field or relation that is missing.

- [x] Task: Measure - User Manual Verification 'Contract and Schema Definition' (Protocol in workflow.md). [manual-contract-check]
    - [ ] Confirm that the account roster has ten accounts and seven teacher profiles.
    - [ ] Confirm that the scenario list includes new and experienced teachers.
    - [ ] Confirm that the scenario list includes teachers with and without a PIP.
    - [ ] Confirm that no new runtime system appears in the contract.

## Phase 2: Test

- [x] Task: Write Red tests for the demo scenario builder. [83035f6d]
    - [ ] Create `apps/danielson/__tests__/demo/scenarios.red.test.ts`.
    - [ ] Use a fixed reference time.
    - [ ] Assert the organization slug and name.
    - [ ] Assert the ten exact usernames.
    - [ ] Assert the seven exact teacher profiles.
    - [ ] Assert the full role matrix.
    - [ ] Assert Mathematics and Primary School scope.
    - [ ] Assert the new, developing, experienced, active-PIP, closed-PIP, HOD, and SLT scenarios.
    - [ ] Assert that all dates follow the required event order.
    - [ ] Assert that the fixture contains no real school or teacher data.

- [x] Task: Write Red tests for the local seed script. [3046cb1d]
    - [ ] Create `apps/danielson/__tests__/scripts/seed-demo.red.test.ts`.
    - [ ] Export small pure helpers from `apps/danielson/scripts/seed-demo.mjs` for tests.
    - [ ] Assert failure when `DANIELSON_DEMO_PASSWORD` is missing.
    - [ ] Assert acceptance of `localhost`, `127.0.0.1`, and `::1` Convex URLs.
    - [ ] Assert rejection of a cloud or production URL.
    - [ ] Assert that the generated CLI arguments do not contain `--prod`.
    - [ ] Assert that the password is not present in standard output.
    - [ ] Assert that each credential gets a unique salt.
    - [ ] Add regression coverage for `apps/danielson/scripts/seed-admin.mjs` if password hashing moves to a shared app-local helper.

- [x] Task: Write Red Convex tests for demo seeding. [3adbbafc]
    - [ ] Create `apps/danielson/__tests__/convex/demo.red.test.ts`.
    - [ ] Use the existing Danielson in-memory Convex test pattern.
    - [ ] Invoke the real internal mutation handler.
    - [ ] Assert exact account, role, profile, department, membership, HOD, and coach rows.
    - [ ] Assert `mustChangePassword: false`.
    - [ ] Assert a second call returns `already_seeded` and preserves row counts.
    - [ ] Seed an unrelated organization and assert `conflict` with zero new rows.
    - [ ] Assert that rated evidence produces observation outcomes, cards, reviews, proficiency, KST, and priority through the existing processor.
    - [ ] Assert that Not Enough Evidence produces no rating, card, review, or mastery effect.
    - [ ] Assert the active and closed PIP states.
    - [ ] Assert the public comment, private comment, and teacher response records.
    - [ ] Assert the GBF assignment and due skills for Maya Chen.

- [x] Task: Write Red tests for the report priority projection and graph model. [4ca69070]
    - [ ] Create `apps/danielson/__tests__/reporting/proficiency-graph-model.red.test.ts`.
    - [ ] Update `apps/danielson/__tests__/reporting/projections.red.test.ts`.
    - [ ] Assert that `priorityTargets` equals the first three results from `rankPriorityTargets()`.
    - [ ] Assert target ranks 1, 2, and 3.
    - [ ] Assert that a collapsed model has 27 nodes and 26 hierarchy edges.
    - [ ] Assert that one expanded component adds only its direct skill children and edges.
    - [ ] Assert that selecting another component removes the prior component's skills.
    - [ ] Assert deterministic positions for equivalent input.
    - [ ] Assert that no input object is mutated.
    - [ ] Assert proficiency, due, evidence, and target fields on skill nodes.
    - [ ] Assert that the graph model contains no comment or response field.

- [x] Task: Write Red component tests for the SVG graph. [eff09f98]
    - [ ] Create `apps/danielson/__tests__/components/teacher-proficiency-graph.red.test.tsx`.
    - [ ] Render the component with a representative current proficiency fixture.
    - [ ] Assert one SVG with a useful accessible name.
    - [ ] Assert visible Danielson, domain, and component labels.
    - [ ] Assert that skill nodes are absent before expansion.
    - [ ] Activate a component with a pointer and with Enter.
    - [ ] Assert that only its direct skills appear.
    - [ ] Assert that selecting a skill shows rating, points, due state, due date, overdue days, priority, and evidence link.
    - [ ] Assert that status text remains present when style classes are ignored.
    - [ ] Assert that each interactive node has an accessible name.
    - [ ] Assert visible controls for Zoom in, Zoom out, Fit graph, Reset view, and Full screen.
    - [ ] Mock `requestFullscreen()` and assert that the control calls it.
    - [ ] Assert minimum and maximum zoom limits.
    - [ ] Assert that pointer drag changes only the local SVG transform.
    - [ ] Assert that graph interaction performs no fetch or Convex call.

- [x] Task: Write Red report integration and privacy tests. [aa554583]
    - [ ] Update `apps/danielson/__tests__/reporting/independent-review.red.test.tsx` or add one focused report test file.
    - [ ] Assert that `TeacherReportView` renders the graph for a teacher report.
    - [ ] Assert that the same component renders for a leadership report.
    - [ ] Assert that the existing detailed proficiency list remains after the graph.
    - [ ] Inject sentinel private comment text and assert that it does not enter the graph props, SVG labels, or detail panel.
    - [ ] Assert that a self-view still has no private-comment property.

- [~] Task: Write Red sales-demo acceptance tests.
    - [ ] Add a behavioral test that reads the seeded leadership portfolio.
    - [ ] Assert at least one Below Proficient teacher, one Proficient teacher, and one teacher with Not Enough Evidence.
    - [ ] Assert that Noah Williams has three walkthrough targets.
    - [ ] Assert that Ethan Brooks has an active approved PIP.
    - [ ] Assert that Lina Park has a closed successful PIP and one response.
    - [ ] Assert that the HOD and coach see different scoped teacher sets.
    - [ ] Assert that the system administrator cannot read evaluation reports.

- [ ] Task: Run and record the Red gate.
    - [ ] Run the new focused test files with `CI=true`.
    - [ ] Confirm that each new behavior fails for the expected missing production seam.
    - [ ] Run Danielson lint and typecheck.
    - [ ] Fix test-only syntax and type errors.
    - [ ] Keep product assertions Red.

- [ ] Task: Measure - User Manual Verification 'Test' (Protocol in workflow.md).
    - [ ] Review the test names against every acceptance criterion.
    - [ ] Reject any test that only greps source or checks that a function was called.
    - [ ] Confirm that the tests prove visible output or persisted behavior.

## Phase 3: Implement

- [x] Task: Implement the local credential helper and seed command. [0a578fe8]
    - [x] Create `apps/danielson/scripts/password-hash.mjs` only because two seed scripts need the same PBKDF2 code.
    - [x] Move the existing `seed-admin.mjs` hashing behavior to the helper without changing its production result.
    - [x] Create `apps/danielson/scripts/seed-demo.mjs`.
    - [x] Read `DANIELSON_DEMO_PASSWORD` and fail when it is missing.
    - [x] Read `NEXT_PUBLIC_CONVEX_URL` from the process environment or `apps/danielson/.env.local` with `node:fs`.
    - [x] Parse the URL with the native `URL` class and require a loopback host.
    - [x] Create one salted credential payload for each stable username.
    - [x] Call `demo:seedLocalDemo` without `--prod`.
    - [x] Print the result and username list without the password.
    - [x] Add `"seed:demo": "node scripts/seed-demo.mjs"` to `apps/danielson/package.json`.
    - [x] Add `"dev:stack": "convex dev --start 'vinext dev'"` to `apps/danielson/package.json`.
    - [x] Do not create a second process supervisor.

- [x] Task: Implement the internal Convex demo seed. [6d0e5676]
    - [x] Create `apps/danielson/convex/demo.ts`.
    - [x] Add exact argument and return validators.
    - [x] Keep `seedLocalDemo` as an `internalMutation`.
    - [x] Check for existing organization data before the first write.
    - [x] Return `already_seeded` only when the expected organization and account identities exist.
    - [x] Return `conflict` for unrelated or mismatched data.
    - [x] Insert the organization, accounts, credentials, roles, profiles, departments, memberships, HOD assignment, and coach assignments.
    - [x] Insert submitted observation records and comments with the current schema.
    - [x] Use `processTeacherEvidence()` with `createDanielsonTeacherProficiencyPort()` for rated and Not Enough Evidence events.
    - [x] Insert the GBF assignment with the current GBF contract.
    - [x] Insert active and closed PIP data with the current PIP contract.
    - [x] Keep all writes in the mutation transaction.
    - [x] Do not add a schema table, index, marker, log, or fixture registry.

- [~] Task: Implement priority targets in the report projection.
    - [ ] Update `apps/danielson/lib/reporting/contracts.ts`.
    - [ ] Update `apps/danielson/lib/reporting/projections.ts`.
    - [ ] Import and reuse `rankPriorityTargets()`.
    - [ ] Return only rank, skill ID, and reason for the first three targets.
    - [ ] Update the exact current-proficiency validators in `apps/danielson/convex/reporting.ts`.
    - [ ] Do not add a new Convex query or read.

- [ ] Task: Implement the pure radial graph model.
    - [ ] Create `apps/danielson/lib/reporting/proficiency-graph.ts`.
    - [ ] Define presentation-only node and edge types.
    - [ ] Put the central node at `(0, 0)`.
    - [ ] Place the four domains at equal angles on the first radius.
    - [ ] Place each domain's components in stable graph order on that domain's outer arc.
    - [ ] Place the selected component's skills on the next outer arc.
    - [ ] Add state, due, target rank, and evidence fields from `CurrentProficiency`.
    - [ ] Compute bounds for Fit graph.
    - [ ] Use no random value, force simulation, browser measurement, or stored coordinate.

- [ ] Task: Implement the dynamic SVG component.
    - [ ] Create `apps/danielson/components/teacher-proficiency-graph.tsx`.
    - [ ] Accept only `CurrentProficiency` as domain data.
    - [ ] Store selected node, expanded component, and view transform in React state.
    - [ ] Render hierarchy edges before nodes.
    - [ ] Render status text in each node label or accessible name.
    - [ ] Render priority ranks 1, 2, and 3.
    - [ ] Use a distinct due border and a text due label.
    - [ ] Clamp zoom to the tested minimum and maximum.
    - [ ] Use pointer capture for drag pan.
    - [ ] Implement wheel zoom around the pointer position.
    - [ ] Implement Zoom in, Zoom out, Fit graph, and Reset view with native buttons.
    - [ ] Use `requestFullscreen()` on the graph container.
    - [ ] Handle missing full-screen support with a clear status message.
    - [ ] Support Enter and Space on interactive nodes.
    - [ ] Keep all interaction local to the component.

- [ ] Task: Integrate the graph with the teacher report.
    - [ ] Import the graph in `apps/danielson/components/teacher-report-view.tsx`.
    - [ ] Render it before the existing Current proficiency details.
    - [ ] Use the same public `currentProficiency` object for teacher and leadership reports.
    - [ ] Keep the existing details and evidence links below the graph.
    - [ ] Do not pass comments, responses, PIP text, or private data to the graph.
    - [ ] Add graph styles to `apps/danielson/app/globals.css`.
    - [ ] Use existing design tokens.
    - [ ] Add a visible focus style.
    - [ ] Add responsive sizing for small screens.
    - [ ] Respect the existing reduced-motion rule.

- [ ] Task: Document the local demo.
    - [ ] Add `DANIELSON_DEMO_PASSWORD` to `apps/danielson/.env.example` without a value.
    - [ ] Create `apps/danielson/DEMO.md`.
    - [ ] Document `npx convex dev --configure new --dev-deployment local --once` as the one-time local configuration command.
    - [ ] Document `npm run seed:demo`.
    - [ ] Document `npm run dev:stack`.
    - [ ] Document the account roster and role for each account.
    - [ ] Document the native local Convex reset procedure.
    - [ ] Add a ten-minute sales path through login, portfolio, teacher report, full-screen graph, walkthrough queue, and PIP.
    - [ ] State the expected visible result for each step.
    - [ ] Do not write the password value.

- [ ] Task: Verify the real local Convex flow.
    - [ ] Configure a new local Convex deployment from an empty local data directory.
    - [ ] Set `DANIELSON_DEMO_PASSWORD` in the local environment.
    - [ ] Run the seed command once and confirm `created`.
    - [ ] Run the seed command again and confirm `already_seeded`.
    - [ ] Start the local stack.
    - [ ] Sign in with each demo account.
    - [ ] Confirm each role sees the correct navigation and teacher scope.
    - [ ] Confirm all seven teacher scenarios appear in reports.
    - [ ] Reset the native local deployment and repeat the seed once.
    - [ ] Record only the commands and results in the track verification note. Do not add a seed ledger or screenshot hash.

- [ ] Task: Measure - User Manual Verification 'Implement' (Protocol in workflow.md).
    - [ ] Review the leadership portfolio as `demo.slt`.
    - [ ] Review the graph for new, developing, experienced, active-PIP, and closed-PIP teachers.
    - [ ] Review self-access as `demo.slt` and `demo.hod.math`.
    - [ ] Confirm that the result is ready for a sales call.

## Phase 4: Generate Docs and Doctor

- [ ] Task: Run the focused and full automated gates.
    - [ ] Run the focused demo, projection, graph, component, and report tests.
    - [ ] Run `CI=true npm run test --workspace=apps/danielson`.
    - [ ] Run Danielson coverage and confirm more than 80 percent coverage for new modules.
    - [ ] Run `npm run lint --workspace=apps/danielson`.
    - [ ] Run `npx tsc --noEmit --project apps/danielson/tsconfig.json`.
    - [ ] Run `npx tsc -p apps/danielson/convex/tsconfig.json --noEmit`.
    - [ ] Run `npm run build --workspace=apps/danielson`.

- [ ] Task: Run generated facts and architecture gates.
    - [ ] Run `npm run generate`.
    - [ ] Inspect generated diffs and keep only required route or command changes.
    - [ ] Run `node scripts/check-monorepo-boundaries.mjs`.
    - [ ] Run `node scripts/architecture/check-quality-parity.mjs`.
    - [ ] Run `npm run doctor`.
    - [ ] Run `git diff --check`.

- [ ] Task: Run the sales-call manual verification.
    - [ ] Use a desktop viewport.
    - [ ] Use a narrow mobile viewport.
    - [ ] Complete the ten-minute path in `apps/danielson/DEMO.md`.
    - [ ] Test pan, wheel zoom, zoom buttons, Fit graph, Reset view, and full screen.
    - [ ] Complete component expansion and skill selection with a keyboard only.
    - [ ] Confirm visible focus and text status for every node state.
    - [ ] Confirm that the detailed list contains the same proficiency facts as the graph.

- [ ] Task: Run an independent final review.
    - [ ] Assign a separate reviewer after all implementation gates pass.
    - [ ] Give the reviewer the specification, plan, and changed-file list.
    - [ ] Ask the reviewer to check Ponytail compliance, seed safety, authorization, privacy, accessibility, layout logic, test quality, and sales-demo usefulness.
    - [ ] Require the reviewer to identify removable code and duplicated rules.
    - [ ] Fix each material finding with a failing behavioral test first.
    - [ ] Rerun all gates after fixes.

- [ ] Task: Measure - User Manual Verification 'Generate Docs and Doctor' (Protocol in workflow.md).
    - [ ] Present the local startup commands and demo account list.
    - [ ] Present the final test, type, lint, build, boundary, and Doctor results.
    - [ ] Ask the user to confirm the sales-demo flow before track closure.

## Stop Conditions

Stop implementation and report the exact issue if any of these conditions
occurs:

- The feature requires a new dependency.
- The feature requires a new schema table or index.
- The seed cannot refuse a non-local target.
- Existing proficiency processing cannot create coherent demo state.
- The report projection cannot supply the graph without a second data read.
- A private field enters the graph contract.
- The graph cannot remain keyboard-readable with the detailed list present.
- An unrelated active-track file must change.
