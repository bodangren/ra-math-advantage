# Specification — E-Textbook Design System

## Context

The IM3 platform must present lesson content as a visually appealing, interactive e-textbook — not raw markdown dumps. Students and teachers interact with this content daily; it must feel like a modern digital textbook with proper math typesetting, visual hierarchy, and polished UI primitives.

The curriculum content includes LaTeX-style math expressions, step-by-step worked examples, key concept boxes, vocabulary terms, tables of values, and discourse prompts. Each of these needs a dedicated, styled component.

## Requirements

### Math Rendering

1. **KaTeX Integration** — Render LaTeX math expressions inline and in display (block) mode. The curriculum files use `[...]` for math blocks and inline math notation throughout.
   - Install `katex` and `react-katex` (or equivalent lightweight wrapper) — **requires user approval per guardrails**.
   - Create a `<MathBlock>` component for display math and a `<MathInline>` component for inline math.
   - Integrate with the existing `MarkdownRenderer` so math inside markdown content is auto-detected and rendered via KaTeX.

### Content Primitives (components/textbook/)

2. **TheoremBox** — Styled container for key concepts, theorems, and formulas. Supports a title, optional icon, and body content. Visually distinct from surrounding content (bordered, tinted background using oklch tokens).

3. **DefinitionCard** — For vocabulary terms. Shows the term prominently with its definition. Supports an optional "related terms" list.

4. **CalloutBox** — Variants: `important` (warning), `tip`, `remember`, `caution`. Each has a distinct icon and color. Replaces the existing plain `Callout.tsx` with a richer version.

5. **StepRevealContainer** — For worked examples. Renders a numbered sequence of steps. In teaching mode, all steps are visible. In guided/practice modes, steps are hidden and revealed one at a time via a "Show Next Step" button with smooth animation.

6. **ExampleHeader** — Styled header for worked examples showing example number, title, and difficulty indicator. Visually separates examples within a lesson.

7. **VocabularyHighlight** — Inline component that highlights vocabulary terms within body text. On hover/tap, shows a tooltip with the definition.

8. **TableOfValues** — Styled math table for coordinate pairs and function values. Supports highlighting specific rows/columns. Uses monospace numerals (`font-mono-num`).

9. **DiscoursePrompt** — Styled container for "Think About It" prompts. Visually distinct, encourages reflection. Optionally expandable for student responses.

10. **ReflectionCard** — For CAP Reflection sections. Shows the three dimensions (Courage, Adaptability, Persistence) with their prompts in a visually engaging card layout.

### Layout Components

11. **LessonPageLayout** — Top-level responsive layout for a lesson page. Includes:
    - Lesson title and metadata header (module, lesson number, goals)
    - Phase navigation sidebar (collapsible on mobile)
    - Main content area with constrained max-width for readability
    - Sticky progress bar at top showing phase completion

12. **PhaseContainer** — Wrapper for a single phase's content. Applies the correct visual treatment based on `phaseType` — e.g., explore phases get a distinct "inquiry" background, learn phases get a clean "textbook" feel, worked examples get the step-reveal treatment.

### Typography & Spacing

13. **Textbook typography CSS** — Extend `globals.css` with:
    - Proper heading hierarchy for lesson content (distinct from app chrome headings)
    - Math-friendly line heights and spacing
    - Print-friendly styles (for teachers who want to print)
    - Responsive font scaling

### Dark Mode

14. All components must work in both light and dark mode using the existing oklch color system.

## Acceptance Criteria

1. KaTeX renders inline and block math correctly in all content components
2. All 9 content primitives (items 2-10) render correctly with sample content
3. LessonPageLayout is responsive (mobile, tablet, desktop)
4. PhaseContainer applies distinct visual treatment per phase type
5. Dark mode works for all components with no contrast issues
6. StepRevealContainer animates step reveals smoothly
7. VocabularyHighlight tooltip is accessible (keyboard navigable, screen reader friendly)
8. All components have unit tests and Storybook-style visual test pages
9. `npm run lint` and `npm run build` pass
10. No new dependencies installed without explicit user approval

## Out of Scope

- Interactive activity components (Tracks 5-7)
- Actual lesson data/content (Track 8)
- Wiring components into the lesson page (Track 3: Lesson Rendering Engine)
