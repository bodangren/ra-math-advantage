/**
 * Test-side re-export shim for the IM3 representative route set.
 *
 * Source of truth lives in `@/lib/a11y/routes` (Phase 1, Task 3). The
 * shim keeps the `__tests__/a11y/*` files importable without crossing
 * the `apps/integrated-math-3/lib` boundary twice — tests already
 * import the constant here, and Phase 5 will keep that import path
 * stable.
 *
 * The hand-maintained flat string list (`REPRESENTATIVE_ROUTES`) is
 * derived from the rich `A11Y_ROUTES` object so the two cannot drift.
 */
export {
  A11Y_ROUTES,
  type A11yRoute,
  type A11yRiskCategory,
  type A11ySurface,
} from '@/lib/a11y/routes';
import { A11Y_ROUTES } from '@/lib/a11y/routes';

/**
 * Flat list of paths used by the gate harness.
 */
export const REPRESENTATIVE_ROUTES: string[] = A11Y_ROUTES.map((route) => route.path);
