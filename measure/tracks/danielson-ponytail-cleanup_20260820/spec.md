# Danielson Ponytail Cleanup Specification

## Purpose

Remove scope that the agent added without a product requirement. Complete the minimum production path for next week.

This specification supersedes earlier Danielson requirements for audit-only hashes, a generic access-audit ledger, a mixed-source review queue, and inactive GBF release machinery.

## Requirements

1. Add the hashing and narrow-scope policy to `AGENTS.md`.
2. Remove the standing four-agent workflow from `AGENTS.md`.
3. Remove all audit-only source hashes and hash tests.
4. Keep password hashing, session signing, and the login rate-limit hash.
5. Remove the generic access-audit subsystem.
6. Remove unused server functions, service methods, indexes, review queues, validators, and duplicate app contract documents.
7. Verify each index against all production queries before removal.
8. Keep `teacher_knowledge_state` and `teacher_priority`.
9. Keep observation amendments and PIP production history for the production release next week.
10. Make a GBF assignment retry return the existing assignment when the stored skill snapshot is unchanged.
11. Use the teacher's GBF phase in walkthrough priority. Keep SRS as the only due-date scheduler.
12. Add one production seed path for the first organization and system administrator. Require a password change after first sign-in.
13. Keep authorization, privacy, data-loss protection, query bounds, return validators, and accessibility controls.

## Acceptance Criteria

- No audit-only SHA-256 field, constant, or test remains in the Danielson app.
- No access-audit table, route, capability, service, or write remains.
- Each removed index has no production query.
- No dead registered Danielson Convex function remains.
- A repeated GBF assignment with the same stored skill snapshot returns the existing assignment.
- A GBF assignment affects the teacher's walkthrough priority.
- A deployment operator can seed the first active organization and system administrator.
- The seeded administrator must change the temporary password.
- The Danielson tests, lint, application typecheck, Convex typecheck, build, architecture checks, generated facts, and Measure Doctor pass.

## Out of Scope

- Removal of observation amendment behavior.
- Removal of PIP production history.
- A second cadence scheduler.
- New dependencies.
- New provenance, audit, or hash machinery.
