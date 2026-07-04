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

// oklchToLinearSrgb already returns linear-light sRGB (pre-gamma).
// WCAG relative luminance is computed directly from linear-light values:
// L = 0.2126*R + 0.7152*G + 0.0722*B
// No sRGB EOTF (gamma decode) is needed — the values are already linear.
function luminanceOf({ L, C, H }: Oklch): number {
  const [r, g, b] = oklchToLinearSrgb(L, C, H);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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

describe('Adversarial: contrast-ratio math edge cases', () => {
  it('pure black (#000, luminance 0) on pure white (#fff, luminance 1) is exactly 21:1', () => {
    // #000 sRGB (0,0,0) → linear (0,0,0) → luminance = 0
    // #fff sRGB (1,1,1) → linear (1,1,1) → luminance = 0.2126+0.7152+0.0722 = 1.0
    const black = 0;
    const white = 1.0;
    const ratio = contrastRatio(black, white);
    expect(Math.abs(ratio - 21), `pure B/W ratio must be 21:1, got ${ratio.toFixed(4)}:1`).toBeLessThan(1e-9);
  });

  it('contrast ratio is symmetric (a on b == b on a)', () => {
    const a = luminanceOf(TOKENS.foreground);
    const b = luminanceOf(TOKENS.background);
    expect(Math.abs(contrastRatio(a, b) - contrastRatio(b, a))).toBeLessThan(1e-12);
  });

  it('identical colors yield a ratio of 1:1', () => {
    const lum = luminanceOf(TOKENS.background);
    expect(contrastRatio(lum, lum)).toBeCloseTo(1, 9);
  });
});
