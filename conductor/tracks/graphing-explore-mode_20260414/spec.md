# Specification — Graphing Explorer Explore Mode

## Context

The `graphing-explorer` component needs an "Explore" mode for Module 1 Explore phases. Per the curriculum spec, Explore phases use parameter sliders to let students manipulate the quadratic equation `y = ax² + bx + c` and observe how the graph changes in real time. This is distinct from teaching/guided/practice modes which focus on problem-solving workflows.

## Requirements

### Explore Mode Component

1. **New mode enum value** — Add `'explore'` to the `mode` prop union type in `GraphingExplorerProps`

2. **Parameter sliders** — Three sliders controlling `a`, `b`, and `c` coefficients:
   - `a`: range [-5, 5], step 0.1, default 1 (controls parabola width and direction)
   - `b`: range [-10, 10], step 0.5, default 0 (controls horizontal shift)
   - `c`: range [-10, 10], step 0.5, default 0 (controls vertical shift)

3. **Real-time graph updates** — Graph re-renders immediately as any slider moves:
   - The displayed equation updates to show current values: `y = ax² + bx + c` with substituted values
   - The parabola shape updates live

4. **Inquiry question display** — A configurable inquiry question prop (`exploreQuestion`) displayed above the sliders

5. **Exploration prompts** — Optional array of guiding questions shown as checkboxes or notes:
   - "What happens when a is positive vs negative?"
   - "How does b affect the vertex position?"
   - "What does c tell you about the y-intercept?"

6. **No submission required** — Explore mode does NOT show a Submit button. Completion is handled externally via `PhaseCompleteButton`.

7. **Slider controls UI** — Clean slider UI with:
   - Current value display next to each slider
   - Equation preview showing the live formula
   - Reset button to restore default values

## Props Interface

```typescript
interface GraphingExplorerProps {
  // ... existing props ...
  exploreQuestion?: string;
  explorationPrompts?: string[];
  sliderDefaults?: { a: number; b: number; c: number };
}
```

## Acceptance Criteria

1. Adding `'explore'` to mode prop renders the ExploreMode UI
2. All three sliders (a, b, c) are visible and functional
3. Moving any slider immediately updates the graph
4. The equation display shows current coefficient values
5. Inquiry question is displayed when provided
6. Exploration prompts are displayed when provided
7. No Submit button appears in explore mode
8. Component renders correctly within LessonStepper's Explore phase context
9. Unit tests cover slider state, graph update, and equation display
10. `npm run lint` and `npm run build` pass