# Product Guidelines — AP Precalculus

## Brand & Voice

- **Tone**: Professional, clear, educational — not playful or juvenile
- **Language**: Student-facing text should be encouraging and accessible; teacher-facing text should be precise and data-oriented
- **Terminology**: Use "phase" (not "step" or "section") for lesson divisions; use "unit" for top-level groupings; use "activity" for interactive exercises

## Visual Identity

- **Color System**: oklch-based CSS custom properties for all theme colors
  - **Brand purple** (primary): TBD — define during Design Definition
  - **Accent color**: TBD — define during Design Definition
  - **Neutral palette**: TBD — define during Design Definition
  - Semantic colors: destructive = red, success = green, warning = golden yellow
- **Typography**:
  - Display headings: Lora (serif) — `font-display`
  - Body text: DM Sans (sans) — `font-body`
  - Monospace/numbers: Fira Code — `font-mono-num`
- **Dark Mode**: Full support via `next-themes` with class-based toggling
- **Component Library**: shadcn/ui (new-york style, RSC-compatible)
- **Icons**: lucide-react
- **Animations**: Subtle, purposeful — via tailwindcss-animate

## Layout Principles

- Responsive layout that works on desktop and tablet
- Student lesson viewer uses a sequential phase navigation pattern
- Teacher dashboard uses data-dense layouts with progress bars and tables
- Cards and panels use consistent border-radius via CSS variables (--radius)

## Accessibility

- All interactive elements must have visible focus indicators
- Color is never the sole indicator of state — always pair with text/icon
- Phase status badges use color + text labels (e.g., "Completed", "In Progress")

## Code Quality

- TypeScript strict mode enabled
- React Server Components by default; `"use client"` only for interactive components
- No `any` types without lint suppression comments
- Path alias `@/*` maps to project root
