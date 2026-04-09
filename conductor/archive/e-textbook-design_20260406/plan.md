# Implementation Plan — E-Textbook Design System

## Phase 1: Math Rendering Foundation [checkpoint: 7a261a5]

- [x] Task: Integrate KaTeX for math rendering (**requires user approval for `npm install`**) — **0d69077**
    - [x] Request user approval to install `katex` and `react-katex` (or `@matejmazur/react-katex`)
    - [x] Write unit tests for `<MathBlock>` (display math) and `<MathInline>` (inline math)
    - [x] Implement `components/textbook/MathBlock.tsx` and `components/textbook/MathInline.tsx`
    - [x] Add KaTeX CSS import to `globals.css` or layout

- [x] Task: Extend `MarkdownRenderer` to auto-detect and render math expressions — **24094fe**
    - [x] Write test: markdown containing `$...$` renders inline math via KaTeX
    - [x] Write test: markdown containing `$$...$$` or `[...]` renders display math via KaTeX
    - [x] Implement remark/rehype plugin or post-processing to extract math and render via KaTeX components
    - [x] Verify existing markdown content still renders correctly

- [x] Task: Conductor — Phase Completion Verification 'Math Rendering Foundation' (Protocol in workflow.md) — **7a261a5**

## Phase 2: Content Primitives — Structural [checkpoint: 3066b25]

- [x] Task: Create `TheoremBox` component — **5b26db4**
    - [x] Write tests: renders title, body, icon; supports custom color variants
    - [x] Implement `components/textbook/TheoremBox.tsx` — bordered container with tinted bg, oklch tokens

- [x] Task: Create `DefinitionCard` component — **75acec7**
    - [x] Write tests: renders term, definition, optional related terms
    - [x] Implement `components/textbook/DefinitionCard.tsx`

- [x] Task: Create `CalloutBox` component with variants — **44a6ee5**
    - [x] Write tests: each variant (important, tip, remember, caution) renders correct icon and color
    - [x] Implement `components/textbook/CalloutBox.tsx` replacing the basic `Callout.tsx`

- [x] Task: Create `ExampleHeader` component — **055bb55**
    - [x] Write tests: renders example number, title, difficulty badge
    - [x] Implement `components/textbook/ExampleHeader.tsx`

- [x] Task: Conductor — Phase Completion Verification 'Content Primitives — Structural' (Protocol in workflow.md)

## Phase 3: Content Primitives — Interactive [checkpoint: cb107ca]

- [x] Task: Create `StepRevealContainer` component — **9f5d5cd**
    - [x] Write tests: all steps visible in teaching mode; steps hidden and revealable in guided/practice mode
    - [x] Write tests: animation triggers on reveal; keyboard accessible
    - [x] Implement `components/textbook/StepRevealContainer.tsx` with framer-motion or CSS transitions

- [x] Task: Create `VocabularyHighlight` component — **b1a3921**
    - [x] Write tests: renders highlighted term inline; tooltip shows definition on hover
    - [x] Write tests: keyboard navigable (focus + Enter shows tooltip); aria attributes present
    - [x] Implement `components/textbook/VocabularyHighlight.tsx`

- [x] Task: Create `TableOfValues` component — **83a9b74**
    - [x] Write tests: renders table with headers and rows; highlights specified cells; uses font-mono-num
    - [x] Implement `components/textbook/TableOfValues.tsx`

- [x] Task: Create `DiscoursePrompt` component — **28c5907**
    - [x] Write tests: renders prompt text with distinct styling; optional expandable area
    - [x] Implement `components/textbook/DiscoursePrompt.tsx`

- [x] Task: Create `ReflectionCard` component — **e93f2f2**
    - [x] Write tests: renders three CAP dimensions with prompts
    - [x] Implement `components/textbook/ReflectionCard.tsx`

- [x] Task: Conductor — Phase Completion Verification 'Content Primitives — Interactive' (Protocol in workflow.md)

## Phase 4: Layout & Typography [checkpoint: 3bfc4a2]

- [x] Task: Create `LessonPageLayout` component — **ee17283**
    - [x] Write tests: renders header, sidebar, main content area; sidebar collapses on mobile
    - [x] Write tests: sticky progress bar reflects phase completion
    - [x] Implement `components/textbook/LessonPageLayout.tsx` with responsive breakpoints

- [x] Task: Create `PhaseContainer` component — **da13b7f**
    - [x] Write tests: applies distinct visual treatment per phaseType (all 10 types)
    - [x] Implement `components/textbook/PhaseContainer.tsx` — maps phaseType to background, border, icon

- [x] Task: Add textbook typography and spacing to `globals.css` — **af4d877**
    - [x] Add `.textbook-content` scope with heading hierarchy, line heights, math spacing
    - [x] Add responsive font scaling rules
    - [x] Add print-friendly `@media print` styles
    - [x] Verify dark mode contrast for all textbook styles

- [x] Task: Conductor — Phase Completion Verification 'Layout & Typography' (Protocol in workflow.md)
