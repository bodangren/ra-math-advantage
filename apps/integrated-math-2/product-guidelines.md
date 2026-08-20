# Product Guidelines — Integrated Math 2

## Brand & Voice

- **Tone**: Professional, clear, educational — not playful or juvenile
- **Language**: Student-facing text should be encouraging and accessible; teacher-facing text should be precise and data-oriented
- **Terminology**: Use "phase" (not "step" or "section") for lesson divisions; use "unit" for top-level groupings; use "activity" for interactive exercises

## Visual Identity

- **Color System**: oklch-based CSS custom properties for all theme colors
  - **Brand orange** (primary): `oklch(0.55 0.19 40)` light / `oklch(0.70 0.21 40)` dark
  - **Complementary teal** (accent): `oklch(0.60 0.14 195)` light / `oklch(0.65 0.16 195)` dark
  - **Warm neutrals**: backgrounds and surfaces tinted toward hue 70 (warm sand) in light mode
  - **Dark chrome** (header/footer/hero): `oklch(0.14 0.028 40)` — deep warm dark
  - Semantic colors: destructive = red (hue 15), success = green (hue 155), warning = golden yellow (hue 80)
  - Orange is brand/CTA only — never used for warning states (use amber/yellow instead)
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
