# Danielson HDKWA Branding and Presentation Plan

## Phase 1: Contract and Schema Definition

- [x] Task: Define the minimum organization branding contract. [27d6bf3]
    - [x] Keep branding on the existing organization document.
    - [x] Define optional display name, logo path, primary color, and accent color fields.
    - [x] Define generic fallback values.
    - [x] Define the HDKWA demo values.
    - [x] Add no branding table, editor, registry, or upload flow.

- [x] Task: Update the Danielson design definition. [267d1be]
    - [x] Record the approved MVP reference.
    - [x] Replace parchment, forest, ochre, Georgia, shadows, and small radii.
    - [x] Preserve the current application layout and information density.
    - [x] Preserve score colors, text states, keyboard focus, and reduced motion.

## Phase 2: Test

- [x] Task: Add organization-branding and session tests. [a782986]
    - [x] Test an HDKWA organization.
    - [x] Test an organization without optional branding.
    - [x] Test organization isolation in the session result.
    - [x] Test the authenticated session brand result.

- [x] Task: Add demo and shell behavior tests. [258645d]
    - [x] Test the HDKWA demo organization name and brand fields.
    - [x] Test that all existing demo accounts and scenarios remain.
    - [x] Test the header logo, organization name, navigation, and fallback brand.
    - [x] Test the organization color variables.
    - [x] Confirm Red before production changes.

## Phase 3: Implement

- [x] Task: Implement organization-owned branding and the HDKWA demo. [980fd23]
    - [x] Add the optional fields to the organization schema.
    - [x] Return the fields through the existing account and session reads.
    - [x] Apply the fields through the existing application shell.
    - [x] Reuse the approved MVP logo asset.
    - [x] Change the demo organization to Haidian Kaiwen Academy.
    - [x] Keep all local seed checks and scenarios.

- [x] Task: Align the visual system with the approved MVP. [541976b]
    - [x] Use the approved white, gray, navy, gold, blue, and ink colors.
    - [x] Use native sans-serif type.
    - [x] Use flat 12-pixel surfaces and controls.
    - [x] Refine the header, cards, tables, forms, reports, and graph canvas.
    - [x] Verify contrast, focus, mobile layout, and reduced motion.

- [~] Task: Verify the local demo and capture the interface.
    - [x] Reset and reseed only the local Danielson deployment when required.
    - [ ] Verify the 10 pilot accounts and seven teacher scenarios.
    - [ ] Capture every desktop page and state in the specification.
    - [ ] Capture the five required mobile views.
    - [ ] Keep private leadership data out of teacher screenshots.

- [ ] Task: Create and verify the SLT presentation.
    - [ ] Use the HDKWA visual system and selected application screenshots.
    - [ ] Use a decision-focused narrative for SLT.
    - [ ] Render every slide.
    - [ ] Inspect every slide at full size.
    - [ ] Correct overlap, clipping, wrapping, and inconsistent treatment.

## Phase 4: Generate Docs and Doctor

- [ ] Task: Run final verification and close the track.
    - [ ] Run focused and full Danielson tests.
    - [ ] Run coverage, lint, application TypeScript, and Convex TypeScript.
    - [ ] Run the Danielson production build.
    - [ ] Run architecture boundaries, quality parity, generation, and Measure Doctor.
    - [ ] Verify the screenshot catalog and final PowerPoint paths.
    - [ ] Record the verified limits and close the track.
