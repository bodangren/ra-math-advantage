# Product Guidelines — AP Precalculus

## Brand & Voice

- **Tone**: Professional, clear, educational — not playful or juvenile
- **Language**: Student-facing text should be encouraging and accessible; teacher-facing text should be precise and data-oriented
- **Terminology**: Use "phase" (not "step" or "section") for lesson divisions; use "unit" for top-level groupings; use "activity" for interactive exercises

## Visual Identity

- Use the colors and tokens in `DESIGN.md` and `app/globals.css`.
- Primary indigo: `#5e6ad2`. Sky accent: `#38bdf8`.
- Canvas: `#080a0f`. Panels: `#141820`. Elevated surfaces: `#1e2330`.
- Use Inter for headings and body text. Use Fira Code for monospace text.
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
- Give public boundaries explicit validators and types. Narrow unknown input before use.
- Path alias `@/*` maps to project root

## Backend guidance

Read `../../convex/_generated/ai/guidelines.md` before you change Convex code. The shared generated guidance is the current local reference.

Use TypeScript types for function parameters and return values. Add documentation for behavior and constraints. Do not repeat types in JSDoc.
