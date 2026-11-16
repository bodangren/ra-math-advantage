# Danielson Skill Learn Pages Specification

## Overview

The application tracks 63 approved Teach Like a Champion 3.0 (TLAC 3.0)
skills. A teacher can see a skill in a report, graph, walkthrough, or
improvement plan. The application does not explain the skill.

This track adds one Learn page for each approved skill. It reuses the 63
approved technique modules from the HDKWA Minimum Viable Product (MVP). It
does not add the 40 supplemental MVP records.

## Users

- A teacher uses a Learn page to understand a target skill.
- A supervisor uses a Learn page to prepare coaching and observation work.
- A system administrator can read the same non-confidential content.

## Source Boundary

The approved content source is:

`/Users/daniel.bodanske/Desktop/hdkwa-danielson/src/data/techniques/`

The approved source index is:

`/Users/daniel.bodanske/Desktop/hdkwa-danielson/src/data/techniques/index.ts`

The source index exports exactly 63 modules. Copy these modules into the
Danielson application. Do not import from the sibling repository at run time.

The current application inventory remains the identity and alignment source:

`apps/danielson/lib/proficiency/source-inventory.ts`

Each copied module must match one inventory record by technique ID. Its title
and Danielson component must also match the inventory record.

Do not add a content manifest, checksum, source-tree hash, review table, or
content database. Use tests to check the 63-record contract.

## Functional Requirements

### FR-1: Learn Catalog

The application must expose an app-owned catalog with exactly 63 techniques.

Each technique must contain these fields:

- Technique ID.
- Title.
- Danielson domain.
- Danielson component.
- Source name.
- Alignment text.
- Short description.
- One or more action steps.
- Optional detailed summary.
- Optional quote.
- Optional demonstration video ID.
- Optional book title and page reference.

The catalog must reject or fail a test for a duplicate ID, a missing approved
ID, an extra ID, a title mismatch, or a component mismatch.

### FR-2: Learn Index

The protected route `/learn` must list all 63 techniques.

The page must group techniques by Danielson domain and component. It must show
the technique title and component for each link. The page must use the current
organization brand.

The page must work on a small screen. It must use one content column on a
small screen. Each technique link must have a visible keyboard focus state.

### FR-3: Learn Detail

The protected route `/learn/[slug]` must show the technique that matches the
slug. An unknown slug must return the application not-found result.

The page must show:

- The technique title.
- The Danielson component.
- The source name.
- A short explanation.
- Numbered action steps.
- The approved detailed summary when it exists.
- The approved quote when it exists.
- A book reference when it exists.
- A video only when the module contains a valid video ID.
- Previous and next technique links.
- A link back to the Learn index.

Do not render an empty video frame. Do not add reflection storage, progress
storage, completion state, badges, comments, or recommendations.

### FR-4: Access

All Learn routes must require an active Danielson session. The content contains
no teacher record, rating, comment, response, or private leadership data.

Do not add a new role or capability. Do not add a Convex query or table.

### FR-5: Discovery and Direct Links

The authenticated header must include one `Learn` link.

The application must link a skill to its Learn page from these current views:

- The current proficiency list in a teacher report.
- The selected skill details in the proficiency graph.
- The prioritized walkthrough queue.
- A walkthrough draft target.
- An improvement plan target and its current progress.

Use one shared function to create each Learn URL. It must accept a plain slug
or the canonical `danielson.tlac.skill.<slug>` ID.

### FR-6: Presentation and Documentation

Capture these new views from the local HDKWA pilot:

- Learn index on a desktop viewport.
- One Learn detail page on a desktop viewport.
- One Learn detail page on a mobile viewport.

Add one slide to the existing Senior Leadership Team (SLT) presentation. The
slide must show how a proficiency target opens its Learn page. Update the
Danielson README with the Learn-page routes and the new presentation count.

## Writing and Design

Use `apps/danielson/DESIGN.md` for the interface.

Use HDKWA navy and gold. Use flat white and light-gray surfaces. Use the
existing 12-pixel radius. Do not copy the full MVP page layout.

Use ASD-STE100 Simplified Technical English for all new interface text. Use
short labels and direct instructions. Preserve approved technique names,
citations, and source content when an editorial change could change the
instructional meaning.

Use semantic headings, lists, links, and landmarks. Keep touch targets at least
44 pixels high. Do not use color as the only information signal.

## Non-Functional Requirements

- Add no dependency.
- Add no Convex code.
- Keep the catalog in the Danielson application.
- Render Learn pages on the server.
- Keep the page useful when a video is absent or cannot load.
- Keep all current authorization and privacy rules unchanged.
- Keep all current tests green.

## Acceptance Criteria

1. The app-owned catalog contains exactly the 63 approved module IDs.
2. Every module title and component matches the current proficiency inventory.
3. The catalog contains no supplemental MVP record.
4. `/learn` shows 63 unique technique links grouped by domain and component.
5. `/learn/cold-call` shows the approved Cold Call content and action steps.
6. An unknown Learn slug returns the not-found result.
7. Empty video IDs produce no iframe.
8. Every protected Learn route requires an active session.
9. The header and five skill surfaces contain correct Learn links.
10. The pages meet the keyboard, heading, label, mobile, and contrast rules in
    the Danielson design guide.
11. The new desktop and mobile screenshots exist.
12. The SLT presentation contains one Learn-page slide.
13. The Danielson test, lint, TypeScript, build, boundary, parity, generation,
    and Measure Doctor gates pass.

## Out of Scope

- The 40 supplemental MVP records.
- A content editor or approval workflow.
- A database-backed content service.
- A Learn progress or completion tracker.
- Reflections, badges, ratings, comments, or replies on Learn pages.
- A recommendation algorithm.
- A search engine or client-side filter.
- New technique images.
- A rewrite of the approved instructional source content.
