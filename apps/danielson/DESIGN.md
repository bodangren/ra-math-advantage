# Danielson Design Definition

## Direction

The interface uses the approved HDKWA professional-development visual language.
It combines a museum-gallery canvas with the compact information that leaders
need during a school day.

The approved reference is
`/Users/daniel.bodanske/Desktop/hdkwa-danielson/DESIGN.md`.

The application does not copy the MVP layout. The MVP is a content hub. This
application is an evidence and workflow system. It keeps compact tables,
forms, reports, and graphs.

## Organization Branding

The organization record owns these optional values:

- Display name.
- Logo path.
- Primary color.
- Accent color.

The authenticated session supplies the values for the current organization.
The application uses generic Danielson values when an organization has no
brand values.

The local demo uses these HDKWA values:

| Value | HDKWA setting |
|---|---|
| Display name | Haidian Kaiwen Academy |
| Short name | HDKWA |
| Primary color | `#003366` |
| Accent color | `#C5A059` |
| Logo | HDKWA navy and gold logo |

Do not create a brand registry, brand table, upload system, or runtime theme
editor for this release.

## Color

Use these default tokens. Organization values replace the primary and accent
tokens after sign-in.

| Token | Default value | Use |
|---|---:|---|
| `--paper` | `#FFFFFF` | Page canvas |
| `--surface` | `#FFFFFF` | Forms and primary content |
| `--tile` | `#F5F5F7` | Grouped sections and table headings |
| `--ink` | `#1D1D1F` | Primary text |
| `--muted-ink` | `#515154` | Secondary text |
| `--brand-primary` | `#003366` | Navigation and primary actions |
| `--brand-accent` | `#C5A059` | Focus, progress, and selected details |
| `--action` | `#0066CC` | Links and utility actions |
| `--line` | `#D2D2D7` | Borders and rules |
| `--danger` | `#A72F32` | Destructive actions and errors |

Keep the proficiency score colors. Use red for 1.0 to 1.9. Use yellow for 2.0
to 2.9. Use green for 3.0 to 3.9. Use blue for 4.0. Always show text with the
color.

## Type

- Use the native sans-serif stack for headings, body text, and controls.
- Use a weight of 600 for display headings.
- Use negative letter spacing only on headings that are larger than 32 pixels.
- Use a body size of 17 pixels.
- Use the native monospace stack for record identifiers and framework codes.
- Use tabular numerals for dates, ratings, and counts.

## Surfaces and Controls

- Use a 12-pixel radius for cards, controls, and buttons.
- Use flat surfaces.
- Do not use card shadows.
- Use white for primary content.
- Use the light gray tile color for grouped content.
- Use a light border when a boundary is required.
- Use the organization primary color for the main action.
- Use the organization accent color for selected and progress states.
- Use the action blue for text links and secondary utilities.

## Header and Navigation

- Put the organization logo at the start of the header.
- Show the organization name and `Danielson Teacher Growth`.
- Keep the role-aware navigation.
- Keep the header compact on desktop.
- Stack the navigation on a small screen.
- Keep the sign-out action visible.

## Reports and Forms

- Keep the compact report and table structure.
- Use clear section headings and generous vertical spacing.
- Keep one primary action for each form.
- Use the accent color for due dates and selected evidence.
- Keep the proficiency graph on a calm light canvas.
- Keep public and private information visually separate.

## Accessibility

- Each text and control pair must meet Web Content Accessibility Guidelines
  (WCAG) 2.1 AA contrast.
- Do not use color as the only status signal.
- Keep visible keyboard focus.
- Use a focus ring with at least 3 pixels of thickness.
- Keep form labels and error summaries.
- Respect `prefers-reduced-motion`.
- Keep a body text size of at least 16 pixels on small screens.
