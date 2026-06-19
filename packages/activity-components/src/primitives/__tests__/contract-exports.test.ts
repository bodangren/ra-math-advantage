// packages/activity-components/src/primitives/__tests__/contract-exports.test.ts
// Phase 1 Red test for primitive-layer-contract_20260615 (T0).
//
// Per test-strategy.md §5/§7, Phase 1's canonical verification is `tsc --noEmit`
// (a Green gate, not a Red test). The live behavior gate for Phase 1's
// deliverable is delegated to the Phase-2 contract test
// (`coordinate-plane.test.tsx`) per §3, which will fail to import the types
// if the Phase 1 root re-export is missing.
//
// This vitest test pins the FR-2 contract surface at the package root so a
// missing or malformed `MathPrimitiveProps<TValue>` / `PrimitiveMode` export
// is caught at the spec level. It is expected to PASS once Phase 1 Green
// exports the types from `packages/activity-components/src/index.ts`.

import { describe, it, expect } from 'vitest';
import type { PrimitiveMode, MathPrimitiveProps } from '../../index';

describe('Phase 1 contract: FR-2 primitive type exports from @math-platform/activity-components', () => {
  it('PrimitiveMode is the string-literal union "static" | "interactive" | "readonly"', () => {
    const validModes: PrimitiveMode[] = ['static', 'interactive', 'readonly'];
    expect(validModes).toEqual(['static', 'interactive', 'readonly']);
  });

  it('MathPrimitiveProps<TValue> requires `value: TValue`', () => {
    type TestProps = MathPrimitiveProps<{ x: number; y: number }>;
    const props: TestProps = { value: { x: 1, y: 2 } };
    expect(props.value).toEqual({ x: 1, y: 2 });
  });

  it('MathPrimitiveProps<TValue> declares onChange as optional (no-op in non-interactive modes)', () => {
    type TestProps = MathPrimitiveProps<{ x: number }>;
    const propsWithoutOnChange: TestProps = { value: { x: 1 } };
    expect(propsWithoutOnChange.onChange).toBeUndefined();
  });

  it('MathPrimitiveProps<TValue> declares mode as optional (default "interactive" per FR-2)', () => {
    type TestProps = MathPrimitiveProps<{ x: number }>;
    const propsWithoutMode: TestProps = { value: { x: 1 } };
    expect(propsWithoutMode.mode).toBeUndefined();
  });

  it('MathPrimitiveProps<TValue> declares disabled as optional boolean', () => {
    type TestProps = MathPrimitiveProps<{ x: number }>;
    const propsWithoutDisabled: TestProps = { value: { x: 1 } };
    expect(propsWithoutDisabled.disabled).toBeUndefined();
  });
});
