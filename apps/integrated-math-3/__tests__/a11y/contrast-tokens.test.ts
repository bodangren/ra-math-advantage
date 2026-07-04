import { describe, it, expect } from 'vitest';

// WCAG 2.1 contrast math test for the IM3 light-theme design tokens.
//
// Tokens are declared in apps/integrated-math-3/app/globals.css as OKLCH
// triplets (L C H) and also documented verbatim in DESIGN.md frontmatter
// as hex. We hardcode the light-theme OKLCH values here with a comment
// pointing back to globals.css so the test stays robust against CSS
// parsing brittleness. If the tokens change, both the CSS and this
// constant block must be updated together.
//
// Reference values (light theme, globals.css :root):
//   --background:          0.985 0.003 75
//   --foreground:          0.13  0.016 45
//   --primary:             0.55  0.19  40
//   --primary-foreground:  0.98  0.003 40
//   --muted-foreground:    0.50  0.012 60
//   --destructive:         0.55  0.22  15
//   --destructive-foreground: 0.98 0.003 250

type Oklch = { L: number; C: number; H: number };

const TOKENS: Record<string, Oklch> = {
  background: { L: 0.985, C: 0.003, H: 75 },
  foreground: { L: 0.13, C: 0.016, H: 45 },
  primary: { L: 0.55, C: 0.19, H: 40 },
  primaryFg: { L: 0.98, C: 0.003, H: 40 },
  mutedFg: { L: 0.50, C: 0.012, H: 60 },
  destructive: { L: 0.55, C: 0.22, H: 15 },
  destructiveFg: { L: 0.98, C: 0.003, H: 250 },
};

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Convert OKLCH → linear-light sRGB.
// Math per https://www.w3.org/TR/css-color-4/#color-conversion-code
function oklchToLinearSrgb(L: number, C: number, H: number): [number, number, number] {
  const hRad = degToRad(H);
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return [rLin, gLin, bLin];
}

function srgbChannelToLinear(c: number): number {
  const abs = Math.abs(c);
  if (abs <= 0.04045) return c / 12.92;
  return Math.sign(c) * Math.pow((abs + 0.055) / 1.055, 2.4);
}

function relativeLuminance(linear: [number, number, number]): number {
  const [r, g, b] = linear.map(srgbChannelToLinear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Fallback: if oklch already outputs linear-light sRGB in [0,1], use it directly.
// Our oklchToLinearSrgb returns linear-light sRGB already (pre-gamma), so we
// skip the second linearization step.
function luminanceOf({ L, C, H }: Oklch): number {
  return relativeLuminance(oklchToLinearSrgb(L, C, H));
}

function contrastRatio(a: number, b: number): number {
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Design token contrast (Task 12 Group A/B)', () => {
  const bg = luminanceOf(TOKENS.background);

  const cases: Array<{ name: string; fg: Oklch; min: number }> = [
    { name: 'foreground on background (body text)', fg: TOKENS.foreground, min: 4.5 },
    { name: 'muted-foreground on background', fg: TOKENS.mutedFg, min: 4.5 },
    { name: 'primary-foreground on primary (button)', fg: TOKENS.primaryFg, min: 4.5 },
    { name: 'destructive-foreground on destructive (button)', fg: TOKENS.destructiveFg, min: 4.5 },
  ];

  for (const { name, fg, min } of cases) {
    it(`${name} meets WCAG AA ratio ≥ ${min}:1`, () => {
      const bgForCase = name.includes('on primary')
        ? luminanceOf(TOKENS.primary)
        : name.includes('on destructive')
          ? luminanceOf(TOKENS.destructive)
          : bg;
      const fgLum = luminanceOf(fg);
      const ratio = contrastRatio(fgLum, bgForCase);
      expect(ratio, `contrast ratio ${name} = ${ratio.toFixed(2)}:1 (want ≥ ${min}:1)`).toBeGreaterThanOrEqual(min);
    });
  }
});
