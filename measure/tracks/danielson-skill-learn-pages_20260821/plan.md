# Danielson Skill Learn Pages Plan

## Phase 1: Contract and Catalog Definition

- [x] Task: Define the app-owned Learn content contract. [e6160ea]
    - [x] Add one `Technique` type with only the fields in the approved MVP modules.
    - [x] Define a catalog with exactly 63 technique records.
    - [x] Keep `source-inventory.ts` as the skill identity and component source.
    - [x] Define `learnHref(skillId)` for a slug or canonical skill ID.
    - [x] Define `getLearnTechnique(slug)` and ordered previous and next records.
    - [x] Add no database, API route, manifest, checksum, or approval state.

- [x] Task: Define the Learn route and interface contract. [e6160ea]
    - [x] Use `/learn` for the catalog.
    - [x] Use `/learn/[slug]` for one technique.
    - [x] Require an active Danielson session on both routes.
    - [x] Permit every active Danielson account to read the content.
    - [x] Return not found for an unknown slug.
    - [x] Define the exact index, detail, navigation, video, and mobile content.

## Phase 2: Test

- [~] Task: Write catalog and route Red tests.
    - [ ] Test exactly 63 unique approved IDs.
    - [ ] Test exact parity with `APPROVED_TLAC_SOURCE_INVENTORY`.
    - [ ] Test title and component parity.
    - [ ] Test that no supplemental ID enters the catalog.
    - [ ] Test URL normalization for plain and canonical skill IDs.
    - [ ] Test the known and unknown slug behavior.
    - [ ] Run the focused tests and confirm Red before production changes.

- [ ] Task: Write interface and integration Red tests.
    - [ ] Test 63 unique links on the Learn index.
    - [ ] Test the Cold Call title, alignment, description, steps, source, and book reference.
    - [ ] Test that an empty video ID renders no iframe.
    - [ ] Test semantic headings, list structure, and navigation labels.
    - [ ] Test the authenticated header Learn link.
    - [ ] Test direct Learn links in the report, graph, queue, walkthrough form, and improvement plan.
    - [ ] Run the focused tests and confirm Red before production changes.

## Phase 3: Implement

- [ ] Task: Add the approved 63-module catalog.
    - [ ] Copy only the 63 modules exported by the approved MVP index.
    - [ ] Change only local type import paths.
    - [ ] Add the minimal catalog access functions.
    - [ ] Do not copy supplemental records or image assets.
    - [ ] Run the catalog tests until Green.

- [ ] Task: Add the Learn index and detail pages.
    - [ ] Add the protected `/learn` server page.
    - [ ] Group the index by domain and component.
    - [ ] Add the protected `/learn/[slug]` server page.
    - [ ] Render the explanation, action steps, optional details, quote, video, and book reference.
    - [ ] Add previous, next, and index navigation.
    - [ ] Add responsive HDKWA styles with visible focus and 44-pixel touch targets.
    - [ ] Use ASD-STE100 for new interface text.
    - [ ] Run the route and component tests until Green.

- [ ] Task: Link Learn pages and update the deployment-review presentation.
    - [ ] Add `Learn` to the authenticated header.
    - [ ] Add direct skill links to the five required current views.
    - [ ] Verify that no private data enters a Learn URL or Learn page.
    - [ ] Capture desktop index, desktop detail, and mobile detail screenshots.
    - [ ] Add one Learn-page slide to the SLT presentation.
    - [ ] Update `apps/danielson/README.md` with the routes and slide count.
    - [ ] Render and inspect every slide.
    - [ ] Run the slide overflow check.

## Phase 4: Generate Docs and Doctor

- [ ] Task: Run final verification and close the track.
    - [ ] Run all Danielson tests and coverage.
    - [ ] Run Danielson lint.
    - [ ] Run application TypeScript.
    - [ ] Run Convex TypeScript to detect boundary regressions.
    - [ ] Run the Danielson production build.
    - [ ] Run architecture boundaries and quality parity.
    - [ ] Run Measure generation and Measure Doctor.
    - [ ] Check the final route list for `/learn` and `/learn/[slug]`.
    - [ ] Check the local screenshots and final presentation.
    - [ ] Record the results in this plan.
    - [ ] Set the track metadata and registry status to complete.
