# Danielson Design Definition

## Direction

The interface uses the visual language of a precise field notebook. It must
feel calm, credible, and quick to scan during a school day. It must not look
like a generic software dashboard.

## Color

Use these semantic tokens. Each text and control pair must meet Web Content
Accessibility Guidelines (WCAG) 2.1 AA contrast.

| Token | Light value | Use |
|---|---:|---|
| `--paper` | `#F4F0E6` | Page background |
| `--surface` | `#FFFDF7` | Cards and forms |
| `--ink` | `#18231F` | Primary text |
| `--muted-ink` | `#53605A` | Secondary text |
| `--forest` | `#164C3B` | Primary actions and navigation |
| `--ochre` | `#8E4417` | Due and attention states |
| `--line` | `#69766F` | Borders and rules |
| `--danger` | `#A72F32` | Destructive actions and errors |

Do not use color as the only status signal.

## Type

- Use Georgia for display headings.
- Use the native system font for body text and controls.
- Use tabular numerals for dates and counts.
- Keep body text at 16 pixels or more.

## Layout

- Use a compact top bar for role-aware navigation.
- Use one content column for forms.
- Use a compact table for account and assignment lists.
- Keep the primary action in a consistent position.
- Stack the top bar links on small screens.

## Components

- Reuse the shared provider, authentication context, and logout control.
- Keep the Danielson header and navigation in this app.
- Keep all Danielson cards, tables, forms, badges, and tokens in this app.
- Use a clear page title, purpose statement, and current scope on each protected
  page.
- Use a visible focus ring with at least 2 pixels of thickness.
- Use an inline error summary for a server failure.
- Use native control validation for a required value.

## Motion

- Use motion only to show a state change.
- Respect `prefers-reduced-motion`.
- Keep transitions at 180 milliseconds or less.
