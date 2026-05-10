# Implementation Plan: Geometry & Statistics Renderers

- [ ] **Phase 1: Shared Rendering Utilities**
  - [ ] Create `packages/activity-components/src/utils/scale.ts`. Implement `scaleLinear` and `scaleLinearInverse`.
  - [ ] Create `packages/activity-components/src/utils/geometry.ts`. Implement bounding box and angle calculators (`midpoint`, `angleBetweenPoints`).

- [ ] **Phase 2: Stats Distribution Plotter Base SVG**
  - [ ] Scaffold `StatsDistributionPlotter.tsx`.
  - [ ] Implement the PDF calculation loop: generate 100 points between `mu - 4*sigma` and `mu + 4*sigma`.
  - [ ] Build the SVG path string (`M x0,y0 L x1,y1 ...`).
  - [ ] Render axes using `<line>` and label standard deviations using `<text>`.

- [ ] **Phase 3: Stats Interactivity & Shading**
  - [ ] Implement the shaded area `<path>` generator.
  - [ ] Add dual-range slider (or drag handles on the SVG) for user interaction in `independent_practice` mode.
  - [ ] Hook the selected `[min, max]` values into `useSubmission()`.

- [ ] **Phase 4: Geometry Canvas Base**
  - [ ] Scaffold `GeometryDiagramExplorer.tsx`.
  - [ ] Implement the `viewBox` bounding box calculation.
  - [ ] Build sub-renderers for generic shapes: `<path>` for polygons, `<circle>` for circles.

- [ ] **Phase 5: Geometry Decorators & Inputs**
  - [ ] Implement `<Marking />` component for tick marks and parallel arrows, utilizing SVG transforms based on segment angles.
  - [ ] Implement the `HTMLInputOverlay` layer. Use percentage-based absolute positioning over the responsive SVG.
  - [ ] Gather input states and dispatch to `useSubmission()`.

- [ ] **Phase 6: Component Registry**
  - [ ] Export components and register them in `packages/activity-components/src/registry.ts`.