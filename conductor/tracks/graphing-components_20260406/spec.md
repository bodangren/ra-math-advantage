# Specification — Graphing Components

## Context

Module 1 lessons 1-1, 1-2, and 1-8 require interactive graphing as the primary mode of exploration and worked examples. Students need to plot quadratic functions, read x-intercepts, compare functions, and overlay systems of equations. The `graphing-explorer` component must deliver a full interactive coordinate plane experience in three modes.

Recharts is already a project dependency and can serve as the rendering foundation, but may need to be supplemented or replaced with a custom SVG/canvas solution for interactive point plotting. This decision is to be made during implementation — document in `tech-stack.md` if a new approach is chosen.

## Requirements

### Core Canvas: `GraphingCanvas` (internal)

1. **Coordinate plane** — Renders a Cartesian plane with configurable domain and range, grid lines, axis labels, and tick marks. Defaults: x ∈ [-10, 10], y ∈ [-10, 10].

2. **Function plotting** — Accepts one or more function expressions (e.g., `f(x) = x^2 + 2x - 3`) and renders them as smooth curves. Supports:
   - Standard quadratic `ax^2 + bx + c`
   - Linear `mx + b`
   - Up to 3 simultaneous functions (for system problems)

3. **Point markers** — Render labeled points on the plane (vertex, intercepts, intersection points). Points can be pre-set (teaching) or student-placed (guided/practice).

4. **Interactive features** — In guided/practice mode:
   - Student can click/tap the canvas to place points
   - Snap-to-grid optional (configurable)
   - Placed points show coordinate labels
   - Delete placed points by clicking them again

5. **Intercept identification** — Highlights where a function crosses the x-axis. In guided mode, student taps the intercepts to identify them. In teaching mode, they are auto-labeled.

6. **Vertex marker** — Special styled marker for the vertex. Labeled with coordinate.

### `graphing-explorer` Component (components/activities/graphing/)

7. **Teaching mode** — Full solution displayed: all functions plotted, all key points labeled (vertex, x-intercepts, y-intercept), step-by-step annotations visible. Read-only.

8. **Guided mode** — Scaffolded interaction:
   - Problem statement shown
   - Student completes a Table of Values (using `TableOfValues` from design system) before plotting
   - Hints available (reveal axis of symmetry, vertex, etc.)
   - Student places points on the canvas
   - Feedback: "Correct! Now connect the points" → auto-draws curve
   - After plotting: student identifies and taps the intercepts

9. **Practice mode** — Fresh problem variant, minimal scaffolding:
   - Problem statement shown
   - Student plots directly without table scaffold
   - After submission: correct solution overlaid for comparison

10. **Problem variants** — The component supports these problem types (configured via `props`):
    - `plot_from_equation` — Graph a quadratic from standard form
    - `compare_functions` — Given two functions (one as equation, one as graph/table), compare key features
    - `find_intercepts` — Graph and identify all x-intercepts; classify (0, 1, 2 real solutions)
    - `graph_system` — Plot a linear and a quadratic together; identify intersection points

11. **Mode-aware submission** — Emits `PracticeSubmissionEnvelope` with:
    - `answers`: placed points, identified intercepts, selected features
    - `parts`: per-task correctness (table correct, intercepts correct, etc.)
    - `artifact`: serialized graph state for teacher review

### Explore Phase Integration

12. **Explore mode** — A special display mode (subset of teaching) for Explore phases. Shows an inquiry question and a live graphing tool with sliders for parameters `a`, `b`, `c` in `y = ax^2 + bx + c`. Student manipulates parameters and observes graph changes. No submission required — completes via the standard `PhaseCompleteButton`.

## Acceptance Criteria

1. Coordinate plane renders correctly with grid, axes, labels for all screen sizes
2. Functions plot as smooth curves across the full domain
3. Teaching mode: all key points and annotations visible, read-only
4. Guided mode: table-first workflow, point placement, hint system, feedback loop
5. Practice mode: fresh problem, direct plotting, comparison overlay on submit
6. All 4 problem variant types (`plot_from_equation`, `compare_functions`, `find_intercepts`, `graph_system`) work in all 3 modes
7. Explore mode: parameter sliders update graph in real time
8. Submission envelope includes correct answers, parts, and artifact
9. Responsive on mobile (canvas scales, touch interaction works)
10. Unit tests for all logic; visual integration tests for rendering
11. `npm run lint` and `npm run build` pass

## Out of Scope

- 3D graphing
- Polar coordinates
- Modules 2-9 function types (these may reuse this component; no special handling needed now)
