/**
 * The locked IM1 vertical-slice module id.
 *
 * Previously this value was read at test time from the measure track
 * `measure/tracks/im1-practice-readiness_20260609/metadata.json`
 * (`.verticalSliceModule`). That track has since been archived to
 * `measure/archive/`, and — more importantly — a `packages/` test must not
 * depend on a `measure/` track artifact (it violates the package-boundary
 * rule and breaks the suite on every archive). The canonical value therefore
 * lives here as package-owned source.
 *
 * Value `"1"` = IM1 Module 1 (six skills), the locked depth-first slice for
 * the IM1 practice-readiness rollout.
 */
export const VERTICAL_SLICE_MODULE = '1';
