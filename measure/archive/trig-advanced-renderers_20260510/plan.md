# Implementation Plan: Trigonometry & Advanced Renderers

- [ ] **Phase 1: Unit Circle Base SVG**
  - [ ] Scaffold `UnitCircleVisualizer.tsx`.
  - [ ] Setup the static `-1.2 -1.2 2.4 2.4` viewBox. Draw the unit circle and axes.
  - [ ] Write the `formatRadian` utility function to pretty-print common pi fractions.

- [ ] **Phase 2: Unit Circle Interactivity**
  - [ ] Add the invisible pointer overlay.
  - [ ] Implement the `Math.atan2` coordinate-to-angle conversion.
  - [ ] Implement the snapping algorithm (nearest `Math.PI/12`).
  - [ ] Draw the terminal side radius line and the reference triangle (drop altitude to X-axis).
  - [ ] Connect selected angle to `useSubmission()`.

- [ ] **Phase 3: Trig Graph Builder**
  - [ ] Scaffold `TrigGraphBuilder.tsx`.
  - [ ] Implement a custom grid and axis drawing loop using multiples of `Math.PI`.
  - [ ] Build the parameters control panel (A, B, C, D inputs).
  - [ ] Write the curve generator: loop `x` across the domain in `0.05` increments, compute `y = A * Math.sin(B * (x - C)) + D`, convert to SVG coordinates, and draw the `<path>`.
  - [ ] Connect the 4 parameters to `useSubmission()`.

- [ ] **Phase 4: Polar Renderer**
  - [ ] Scaffold `PolarRenderer.tsx`.
  - [ ] Implement the polar grid background (concentric circles, radial lines).
  - [ ] Write the `(r, theta)` to `(x, y)` Cartesian conversion utility.
  - [ ] Implement the `<polyline>` plotter for arrays of polar coordinates.

- [ ] **Phase 5: Registration**
  - [ ] Export all three components and register them in `packages/activity-components/src/registry.ts`.