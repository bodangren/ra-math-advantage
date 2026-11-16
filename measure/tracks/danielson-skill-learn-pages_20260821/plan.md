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

- [x] Task: Write catalog and route Red tests. [e5b9f96]
    - [x] Test exactly 63 unique approved IDs.
    - [x] Test exact parity with `APPROVED_TLAC_SOURCE_INVENTORY`.
    - [x] Test title and component parity.
    - [x] Test that no supplemental ID enters the catalog.
    - [x] Test URL normalization for plain and canonical skill IDs.
    - [x] Test the known and unknown slug behavior.
    - [x] Run the focused tests and confirm Red before production changes.

- [x] Task: Write interface and integration Red tests. [e5b9f96]
    - [x] Test 63 unique links on the Learn index.
    - [x] Test the Cold Call title, alignment, description, steps, source, and book reference.
    - [x] Test that an empty video ID renders no iframe.
    - [x] Test semantic headings, list structure, and navigation labels.
    - [x] Test the authenticated header Learn link.
    - [x] Test direct Learn links in the report, graph, queue, walkthrough form, and improvement plan.
    - [x] Run the focused tests and confirm Red before production changes.

## Phase 3: Implement

- [x] Task: Add the approved 63-module catalog. [4dc4161]
    - [x] Copy only the 63 modules exported by the approved MVP index.
    - [x] Change only local type import paths.
    - [x] Add the minimal catalog access functions.
    - [x] Do not copy supplemental records or image assets.
    - [x] Run the catalog tests until Green.

- [x] Task: Add the Learn index and detail pages. [e6ef8eb]
    - [x] Add the protected `/learn` server page.
    - [x] Group the index by domain and component.
    - [x] Add the protected `/learn/[slug]` server page.
    - [x] Render the explanation, action steps, optional details, quote, video, and book reference.
    - [x] Add previous, next, and index navigation.
    - [x] Add responsive HDKWA styles with visible focus and 44-pixel touch targets.
    - [x] Use ASD-STE100 for new interface text.
    - [x] Run the route and component tests until Green.

- [x] Task: Link Learn pages and update the deployment-review presentation. [e6ef8eb, 207f49a]
    - [x] Add `Learn` to the authenticated header.
    - [x] Add direct skill links to the five required current views.
    - [x] Verify that no private data enters a Learn URL or Learn page.
    - [x] Capture desktop index, desktop detail, and mobile detail screenshots.
    - [x] Add one Learn-page slide to the SLT presentation.
    - [x] Update `apps/danielson/README.md` with the routes and slide count.
    - [x] Render and inspect every slide.
    - [x] Run the slide overflow check.

## Phase 4: Generate Docs and Doctor

- [x] Task: Run final verification and close the track.
    - [x] Run all Danielson tests and coverage.
    - [x] Run Danielson lint.
    - [x] Run application TypeScript.
    - [x] Run Convex TypeScript to detect boundary regressions.
    - [x] Run the Danielson production build.
    - [x] Run architecture boundaries and quality parity.
    - [x] Run Measure generation and Measure Doctor.
    - [x] Check the final route list for `/learn` and `/learn/[slug]`.
    - [x] Check the local screenshots and final presentation.
    - [x] Record the results in this plan.
    - [x] Set the track metadata and registry status to complete.

## Final Verification

- 59 test files passed.
- 378 tests passed.
- Coverage passed with 85.30% statements, 74.83% branches, 91.93% functions, and 90.43% lines.
- Danielson lint passed with zero warnings.
- Application TypeScript passed.
- Convex TypeScript passed.
- The production build passed and listed `/learn` and `/learn/:slug`.
- Architecture boundaries passed for 26 workspaces and 388 internal imports.
- Quality parity passed for 26 workspaces.
- Measure generation passed.
- Measure Doctor passed.
- The desktop Learn index, desktop Cold Call page, and mobile Cold Call page passed local browser review.
- The 15-slide SLT presentation passed the overflow test.
