# Architectural Specification: Trigonometry & Advanced Renderers

## Objective
Implement specialized visual components for periodic functions, the unit circle, and polar coordinates.

## 1. Unit Circle Visualizer (`UnitCircleVisualizer.tsx`)
- **Coordinate System:**
  - Static `viewBox="-1.2 -1.2 2.4 2.4"`. Radius of the circle is `1.0`.
- **Drag & Snap Algorithm (`interactive` mode):**
  - Attach `onPointerDown`/`Move`/`Up` to an invisible SVG overlay.
  - Get SVG coords:
    ```typescript
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2.4 - 1.2;
    const y = -(((e.clientY - rect.top) / rect.height) * 2.4 - 1.2); // Y-axis inverted in math
    ```
  - Calculate angle: `let theta = Math.atan2(y, x)`. If `theta < 0`, `theta += 2 * Math.PI`.
  - Snap: `const step = Math.PI / 12; theta = Math.round(theta / step) * step;`
- **Fractional Pi Rendering:**
  - Create a utility `formatRadian(theta: number): ReactNode` that detects common fractions (`Math.PI/6`, `Math.PI/4`) and outputs pretty HTML (e.g., `<span>&pi;/2</span>`).

## 2. Trig Graph Builder (`TrigGraphBuilder.tsx`)
- **Architecture:**
  - Must extend the internal logic of `graphing-explorer` but override the axis generation.
  - X-axis grid lines should be drawn at multiples of `Math.PI / 4`.
  - Ensure floating point drift (e.g., `Math.PI / 2 + Math.PI / 2 !== Math.PI`) is handled by snapping grid coordinates using an epsilon (`epsilon = 1e-9`).
- **Equation Controller:**
  - Expose 4 HTML range sliders or number inputs for `A`, `B`, `C`, `D` representing `y = A * fn(B(x - C)) + D`.
  - Recalculate and draw the `<path>` on every change.

## 3. Polar Renderer (`PolarRenderer.tsx`)
- **Coordinate System:**
  - `viewBox="-R -R 2R 2R"` where `R` is the maximum polar radius required by the data.
- **Polar Grid Generation:**
  - Loop `r` from 1 to `R` to draw concentric `<circle>`s.
  - Loop `theta` from 0 to `2*PI` in `PI/6` steps to draw radial `<line>`s.
- **Curve Plotting:**
  - The generator will provide an array of objects: `{ r: number, theta: number }`.
  - The component maps to Cartesian: `x = r * Math.cos(theta)`, `y = -r * Math.sin(theta)` (SVG Y is inverted).
  - Draw as an SVG `<polyline>`.