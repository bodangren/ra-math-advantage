# Track parent-portal_20260605 Context

Program: Strategic Backlog (Tier 3)
Depends on: skill-runtime-projection_20260509 (visualization.v1 parent payloads)

- [Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Metadata](./metadata.json)

## Re-mediated by

This track was rejected by the 2026-06-21 fleet completion audit as a false positive
(the `/parent` route was a static stub; delivered components/guards/projections had no
live production caller). The remediation track below wired the real production route,
auth guard, Convex projection query, and route-rendering tests:

- **`parent_portal_prod_wiring_remediation_20260621`** — **COMPLETED / ARCHIVED** (2026-06-23)
  *Link: [../archive/parent_portal_prod_wiring_remediation_20260621/](../archive/parent_portal_prod_wiring_remediation_20260621/)*
