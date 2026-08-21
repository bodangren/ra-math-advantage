# Danielson HDKWA Branding and Presentation Specification

## Overview

The HDKWA Danielson MVP has an approved visual style. The current application
does not need to copy the MVP layout. It must use the same institutional visual
language so that Senior Leadership Team (SLT) members recognize the product.

The application supports more than one organization. Each organization must
own its visible brand name, logo, primary color, and accent color. The local
demo organization must use the HDKWA identity.

The completed interface must have a screenshot catalog. A PowerPoint
presentation must use selected screenshots to support a deployment decision.

## Approved Visual Reference

The approved MVP design is
`/Users/daniel.bodanske/Desktop/hdkwa-danielson/DESIGN.md`.

The MVP uses these primary choices:

- White canvas: `#FFFFFF`.
- Section background: `#F5F5F7`.
- HDKWA navy: `#003366`.
- HDKWA gold: `#C5A059`.
- Action blue: `#0066CC`.
- Near-black text: `#1D1D1F`.
- Native sans-serif display and body type.
- Flat surfaces with 12-pixel radii.
- The HDKWA navy and gold logo.

The current application uses parchment, forest green, ochre, Georgia headings,
small radii, and shadows. This track replaces these global choices. It keeps
the current application layout, data density, reports, and workflows.

## Functional Requirements

### FR-1: Organization Branding

1. Keep branding on the existing `organizations` document.
2. Add no branding table.
3. Permit an organization to define a display name, logo path, primary color,
   and accent color.
4. Keep the fields optional for existing organizations.
5. Use safe generic values when the fields are absent.
6. Include the current organization branding in the authenticated session
   profile.
7. Apply the current organization colors to the application shell.
8. Show the current organization logo and name in the header.
9. Add no branding administration screen in this track.

### FR-2: HDKWA Demo Identity

1. Change the local demo organization to Haidian Kaiwen Academy.
2. Use `HDKWA` as the short visible name when space is limited.
3. Reuse the approved MVP logo asset.
4. Use HDKWA navy and gold for the local demo organization.
5. Show HDKWA branding on the local pilot login page.
6. Preserve all 10 demo accounts and all seven teacher scenarios.
7. Preserve local-only seed protection and idempotent behavior.

### FR-3: Visual Alignment

1. Use a white page canvas.
2. Use light gray section surfaces.
3. Use native sans-serif type for headings and body text.
4. Use flat surfaces and 12-pixel radii.
5. Use organization primary color for navigation and primary actions.
6. Use organization accent color for focus, progress, and selected details.
7. Keep blue links and utility actions when they improve recognition.
8. Keep the Danielson proficiency score colors.
9. Keep text labels with each state color.
10. Keep Web Content Accessibility Guidelines (WCAG) 2.1 AA contrast.
11. Keep keyboard focus, reduced motion, and mobile layout behavior.

### FR-4: Screenshot Catalog

Capture full-page screenshots at a desktop viewport for these pages and states:

1. Local pilot login.
2. Authenticated overview.
3. Password change.
4. Unauthorized access.
5. Leadership report portfolio.
6. Developing-teacher report.
7. Experienced-teacher report.
8. Active improvement-plan teacher report.
9. Closed improvement-plan teacher report.
10. Get Better Faster teacher report.
11. Collapsed proficiency graph.
12. Expanded proficiency graph.
13. Selected proficiency node details.
14. Ranked walkthrough queue.
15. Walkthrough draft form.
16. Formal observation form.
17. Published observation.
18. Observation amendment form.
19. Leadership improvement-plan list.
20. New improvement-plan proposal.
21. Active improvement-plan detail.
22. Improvement-plan revision.
23. Teacher report.
24. Teacher observation history.
25. Teacher response state.
26. System administration hub.
27. Account administration.
28. Department administration.
29. Coach assignment administration.
30. HOD-scoped portfolio and queue.
31. Coach-scoped portfolio and queue.

Capture a narrow mobile view for these pages:

1. Login.
2. Leadership portfolio.
3. Walkthrough form.
4. Teacher report.
5. Proficiency graph.

Use stable file names. Store no screenshot metadata in Convex. Create no
screenshot hashes or manifests.

### FR-5: SLT Presentation

Create one PowerPoint file for SLT. The presentation must help SLT decide if
the application is ready for deployment.

The presentation must include:

1. The teacher-proficiency problem and the November decision need.
2. The role-based application flow.
3. The leadership portfolio.
4. The ranked walkthrough queue.
5. The five-to-ten-minute walkthrough form.
6. The proficiency graph.
7. Official observation and evidence history.
8. Improvement-plan tracking.
9. The teacher view and response boundary.
10. System administration and organization scope.
11. Pilot data and access controls.
12. The deployment decision and next steps.

Use the HDKWA visual system. Use application screenshots as the primary visual
evidence. Do not claim browser behavior or product capability that was not
verified.

## Non-Functional Requirements

1. Use ASD-STE100 Simplified Technical English for interface text, track files,
   and slide text.
2. Add no dependency.
3. Add no new table.
4. Add no hash, audit, release, or provenance subsystem.
5. Keep all branding data organization-scoped.
6. Keep private comments out of teacher-facing data and screenshots.
7. Do not expose the demo password outside the local login page and controlled
   local screenshots.
8. Keep the current authorization checks.

## Acceptance Criteria

1. The HDKWA demo shows the approved logo, navy, gold, white canvas, and light
   gray section surfaces.
2. A second organization without branding uses safe generic values.
3. An authenticated session returns only its current organization branding.
4. The demo seed creates HDKWA branding without changing its account roster or
   teacher scenarios.
5. The page and form tests pass with the new visual shell.
6. The screenshot catalog contains all required desktop and mobile views.
7. Every screenshot shows the expected role, scope, and privacy state.
8. The final PowerPoint renders without overlap, clipping, or missing images.
9. Every slide has a clear purpose for the SLT deployment decision.
10. Danielson tests, coverage, lint, application TypeScript, Convex TypeScript,
    build, architecture checks, and Measure Doctor pass.

## Out of Scope

- A branding editor.
- User-uploaded logos.
- Custom fonts.
- A theme registry.
- A separate tenant or branding service.
- Screenshot persistence in the application.
- Automated presentation generation in the application.
- Production deployment.
