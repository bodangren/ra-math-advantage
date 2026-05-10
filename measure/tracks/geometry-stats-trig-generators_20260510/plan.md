# Implementation Plan: Geometry, Stats, & Trig Generators

- [ ] **Phase 1: Statistics**
  - [ ] Implement `stats-distribution-generator.ts`.
  - [ ] Implement `Box-Muller` for dataset generation.
  - [ ] Format outputs to match `StatsDistributionPlotterProps`.

- [ ] **Phase 2: Geometry**
  - [ ] Implement `geometry-diagram-generator.ts`.
  - [ ] Write the triangle generation algorithm (Law of Cosines -> Coordinates).
  - [ ] Add support for "parallel lines and transversal" coordinate generation.
  - [ ] Output the standard `<Polygon>`, `<Line>`, and `<Angle>` marker arrays.

- [ ] **Phase 3: Trigonometry**
  - [ ] Implement `unit-circle-generator.ts` generating angles and exact fractional string answers.
  - [ ] Implement `sinusoidal-graph-generator.ts` outputting `A, B, C, D` values.

- [ ] **Phase 4: Registration & Validation**
  - [ ] Export generators to `registry.ts`.
  - [ ] Map keys to IM1 M10-M14 and IM3 M8-M9 blueprints.
  - [ ] Use the QA Harness to verify the generated coordinates draw clean SVG diagrams.