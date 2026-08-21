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

- [x] Task: Verify the local demo and capture the interface. [d42ffa4]
    - [x] Reset and reseed only the local Danielson deployment when required.
    - [x] Verify the 10 pilot accounts and seven teacher scenarios.
    - [x] Capture every desktop page and state in the specification.
    - [x] Capture the five required mobile views.
    - [x] Keep private leadership data out of teacher screenshots.

- [x] Task: Create and verify the SLT presentation. [d42ffa4]
    - [x] Use the HDKWA visual system and selected application screenshots.
    - [x] Use a decision-focused narrative for SLT.
    - [x] Render every slide.
    - [x] Inspect every slide at full size.
    - [x] Correct overlap, clipping, wrapping, and inconsistent treatment.

## Phase 4: Generate Docs and Doctor

- [x] Task: Run final verification and close the track. [560d087]
    - [x] Run focused and full Danielson tests.
    - [x] Run coverage, lint, application TypeScript, and Convex TypeScript.
    - [x] Run the Danielson production build.
    - [x] Run architecture boundaries, quality parity, generation, and Measure Doctor.
    - [x] Verify the screenshot catalog and final PowerPoint paths.
    - [x] Record the verified limits and close the track.

## Final Verification

- 367 Danielson tests passed.
- Statement coverage is 84.98 percent.
- Lint, application TypeScript, Convex TypeScript, and the production build passed.
- Architecture boundaries, quality parity, Measure generation, and Measure Doctor passed.
- The catalog contains 33 desktop screenshots and five mobile screenshots.
- The PowerPoint contains 13 inspected slides. The geometry check found no overflow.
- One separate architecture test has nine pending owner approvals in the active
  ESLint-to-Oxlint migration. This result is outside the Danielson track.

## Phase 5: Mobile Presentation Correction

- [~] Task: Make the mobile walkthrough clear and correct the design guide.
    - [ ] Rewrite `apps/danielson/DESIGN.md` in ASD-STE100 Simplified Technical English.
    - [ ] Add direct ASD-STE100 rules for user-facing text.
    - [ ] Add one clear mobile walkthrough slide to the SLT presentation.
    - [ ] Render and inspect every slide again.
    - [ ] Run the slide overflow check.
    - [ ] Update the README when the presentation count changes.
    - [ ] Run the relevant documentation and Measure checks.
