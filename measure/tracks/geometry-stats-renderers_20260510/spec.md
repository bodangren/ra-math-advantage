# Architectural Specification: Geometry & Statistics Renderers

## Objective
Implement specialized, stateless React components in `@advantage/activity-components` to render mathematical Geometry and Statistics activities. These components consume deterministic output from generators and report interactions back to the practice runtime.

## 1. Stats Distribution Plotter (`StatsDistributionPlotter.tsx`)
- **Mathematical Rendering:**
  - Must render a standard normal curve using an SVG `<path>`.
  - Equation: `y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2))`
  - Do NOT use D3 as a heavy dependency. Implement a simple `scaleLinear(domain, range)` utility in `packages/activity-components/src/utils/scale.ts`:
    ```typescript
    export const scaleLinear = (domain: [number, number], range: [number, number]) => {
      return (val: number) => range[0] + ((val - domain[0]) * (range[1] - range[0])) / (domain[1] - domain[0]);
    };
    ```
- **X/Y Domain:**
  - `xDomain` = `[mu - 4 * sigma, mu + 4 * sigma]`
  - `yDomain` = `[0, 1 / (sigma * Math.sqrt(2 * Math.PI))]`
- **Shading Logic:**
  - To shade an area under the curve (e.g., between `z=-1` and `z=1`), generate a second `<path>` object that traces the curve between the bounds, drops straight down to `y=0`, and closes back to the start. Fill with a semi-transparent brand color.
- **Interactivity (`independent_practice` mode):**
  - Render an invisible overlay SVG `<rect>` to capture `onPointerMove`.
  - Map mouse `clientX` back through the inverse `scaleLinear` to find the domain `x` value.
  - Snap the value to `0.5 * sigma` intervals.

## 2. Geometry Diagram Explorer (`GeometryDiagramExplorer.tsx`)
- **Coordinate Space & Auto-Scaling:**
  - The generator will provide coordinates in arbitrary mathematical space (e.g., triangle vertices `(0,0)`, `(100,0)`, `(50, 86)`).
  - Component must calculate the bounding box:
    ```typescript
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    // Same for Y
    const padding = (maxX - minX) * 0.1; // 10% padding
    const viewBox = `${minX - padding} ${minY - padding} ${(maxX - minX) + 2*padding} ${(maxY - minY) + 2*padding}`;
    ```
- **Input Overlay Architecture:**
  - Wrap the SVG in a `div` with `position: relative`.
  - The generator will provide input nodes with mathematical `(x, y)` coords.
  - Render actual HTML `<input type="number">` elements as absolute overlays.
  - Calculate percentage positions: `left: ((x - viewBox.minX) / viewBox.width) * 100 + '%'`. This ensures the inputs perfectly track the SVG points as the window resizes.
- **Markings:**
  - Parallel arrows and congruence tick marks must be drawn by calculating the midpoint of the line segment and the angle `Math.atan2(y2-y1, x2-x1)`, applying an SVG `transform="translate(midX, midY) rotate(angle)"`.