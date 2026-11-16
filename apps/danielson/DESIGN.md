# Danielson Design Guide

## Purpose

Use this guide for the Danielson application.

Use the approved HDKWA visual design as the main reference. The reference file
is `/Users/daniel.bodanske/Desktop/hdkwa-danielson/DESIGN.md`.

Do not copy the layout of the Minimum Viable Product (MVP). The MVP is a
content hub. This application contains evidence, reports, forms, and graphs.
Keep these functions compact and clear.

## Organization Brand

Store these optional values on the organization record:

- Display name.
- Logo path.
- Primary color.
- Accent color.

Get the values from the authenticated session. Use the generic Danielson brand
when an organization has no brand values.

Use these values for the local HDKWA pilot:

| Value | HDKWA setting |
|---|---|
| Display name | Haidian Kaiwen Academy |
| Short name | HDKWA |
| Primary color | `#003366` |
| Accent color | `#C5A059` |
| Logo | HDKWA navy and gold logo |

Do not add a brand registry. Do not add a brand table. Do not add a logo upload
system. Do not add a theme editor.

## Color

Use these default color tokens. After sign-in, replace the primary and accent
tokens with the organization values.

| Token | Default value | Use |
|---|---:|---|
| `--paper` | `#FFFFFF` | Page background |
| `--surface` | `#FFFFFF` | Forms and main content |
| `--tile` | `#F5F5F7` | Grouped sections and table headings |
| `--ink` | `#1D1D1F` | Main text |
| `--muted-ink` | `#515154` | Secondary text |
| `--brand-primary` | `#003366` | Navigation and primary actions |
| `--brand-accent` | `#C5A059` | Focus, progress, and selected details |
| `--action` | `#0066CC` | Links and utility actions |
| `--line` | `#D2D2D7` | Borders and rules |
| `--danger` | `#A72F32` | Destructive actions and errors |

Keep the proficiency score colors:

- Use red for scores from 1.0 to 1.9.
- Use yellow for scores from 2.0 to 2.9.
- Use green for scores from 3.0 to 3.9.
- Use blue for a score of 4.0.
- Use an outline for a missing score.

Always show a text label with a status color.

## Type

- Use the native sans-serif font stack for all interface text.
- Use a font weight of 600 for display headings.
- Use negative letter spacing only for headings larger than 32 pixels.
- Use a body text size of 17 pixels.
- Use the native monospace font stack for record identifiers and framework codes.
- Use tabular numerals for dates, ratings, and counts.

## Surfaces and Controls

- Use a 12-pixel radius for cards, controls, and buttons.
- Use flat surfaces.
- Do not use card shadows.
- Use white for main content.
- Use light gray for grouped content.
- Use a light border when an element needs a boundary.
- Use the organization primary color for the main action.
- Use the organization accent color for a selected state.
- Use action blue for text links and utility actions.

## Header and Navigation

- Put the organization logo at the start of the header.
- Show the organization name.
- Show the product name `Danielson Teacher Growth`.
- Show only the navigation items that the current user can use.
- Keep the desktop header compact.
- Stack the navigation on a small screen.
- Keep the sign-out action visible.

## Reports

- Keep report tables compact.
- Put teachers who need attention first.
- Show one clear state for each report category.
- Show text with every color state.
- Keep public and private information in separate sections.
- Do not send private information to a teacher view.

## Forms

- Give each form one main action.
- Put a visible label on each control.
- Put related rating controls in a fieldset.
- Use a legend to identify each rating group.
- Show an error summary after a failed submission.
- Move keyboard focus to the error summary.
- Keep save and submit actions clear on a small screen.

## Proficiency Graph

- Use a light gray graph background.
- Show the current average score to one decimal place.
- Show a text state below each score.
- Keep the score colors defined in this guide.
- Let the user expand one component to show its approved skills.
- Provide zoom, pan, fit, reset, and full-screen controls.
- Provide a keyboard method for each graph action.
- Keep the detailed proficiency list below the graph.

## Mobile Layout

- Use one content column on a small screen.
- Keep tap targets at least 44 pixels high.
- Keep a body text size of at least 16 pixels.
- Show all three walkthrough targets in one vertical form.
- Keep rating choices large enough for touch input.
- Keep submit, save, and discard actions visible at the end of the form.

## Interface Writing

Use ASD-STE100 Simplified Technical English for all user-facing text.

- Use short sentences.
- Use active voice.
- Give one instruction in each sentence.
- Use one term for one concept.
- Define an abbreviation when it first appears.
- Use the same label for the same action on each page.
- Use direct labels for buttons and navigation.
- Tell the user what happened in an error message.
- Tell the user what to do next in an error message.
- Do not use idioms.
- Do not use vague words.
- Do not use decorative slogans.
- Keep exact framework, product, and source terms when they are required.

Apply these rules to navigation, labels, help text, validation messages, error
messages, empty states, confirmation messages, reports, and presentation text.

## Accessibility

- Meet Web Content Accessibility Guidelines (WCAG) 2.1 AA contrast.
- Do not use color as the only status signal.
- Keep a visible keyboard focus indicator.
- Use a focus ring that is at least 3 pixels thick.
- Keep form labels and error summaries.
- Respect `prefers-reduced-motion`.
- Use text alternatives for meaningful images.
- Use a body text size of at least 16 pixels on a small screen.
