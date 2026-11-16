# Specification: Danielson Application Foundation and Access

## Overview

Create `apps/danielson/` as a first-class application in this monorepo. Reuse
the shared authentication, application shell, and Convex infrastructure. Add an
application-owned role and scope model for teacher evaluation work.

One person has one account. One account can have multiple Danielson roles. The
application must authorize each action from the authenticated identity, the
assigned roles, the organization scope, and the relationship to the teacher who
is the subject of the record.

## Terminology

- **Teacher:** A person whose teaching proficiency is evaluated. A teacher can
  also have one or more leadership roles.
- **Supervisor:** An HOD, coach, school head, or SLT member.
- **Head of Department (HOD):** A supervisor for teachers in assigned
  departments.
- **Senior Leadership Team (SLT):** A supervisor with organization-wide teacher
  access.
- **Performance Improvement Plan (PIP):** A time-limited plan for required
  teacher improvement.
- **Web Content Accessibility Guidelines (WCAG):** The accessibility standard
  for the application interface.
- **System administrator:** A person who manages accounts, roles, departments,
  and assignments. This role does not grant access to teacher reports.
- **Access scope:** The set of teachers that a role assignment permits a person
  to access.
- **Subject:** The teacher whose record is being viewed or changed.

## Role and Scope Rules

| Role | Scope | Permitted product work |
|---|---|---|
| `teacher` | Own teacher record | View published results and public comments, submit one teacher response, and acknowledge a PIP |
| `hod` | Assigned departments | Read reports, submit walkthroughs and Q1 observations, and propose PIPs |
| `coach` | Assigned teachers | Read reports, submit walkthroughs and Q1 observations, and propose PIPs |
| `school_head` | All teachers in the organization | Use HOD actions and submit Q4 observations |
| `slt` | All teachers in the organization | Use school-head actions and approve or close PIPs |
| `sysadmin` | Account administration | Manage accounts, roles, departments, and assignments |

Roles are additive. A system administrator can view teacher reports only when
the same account also has an authorized supervisor role. A supervisor who is
also a teacher cannot use a leadership role to see private comments about their
own teacher record. A supervisor cannot observe themselves or take a
supervisor-side PIP action on themselves.

## Functional Requirements

1. **FR-1 — First-class workspace:** Create an app-owned workspace, product
   definition, product guidelines, design definition, routes, quality commands,
   and Convex boundary for `apps/danielson/`.
2. **FR-2 — Shared platform reuse:** Reuse `@math-platform/core-auth`,
   `@math-platform/core-convex`, and `@math-platform/app-shell`. Do not copy
   their authentication or shell logic into the application.
3. **FR-3 — Multiple roles:** Store zero or more Danielson role assignments for
   each account. Do not require separate teacher and leadership accounts.
4. **FR-4 — Organization structure:** Store organizations, departments,
   department membership, coach assignments, and teacher profiles with stable
   identifiers.
5. **FR-5 — Scoped authorization:** Enforce teacher, HOD, coach, school-head,
   SLT, and system-administrator permissions on the server for every protected
   query and mutation.
6. **FR-6 — Subject exclusion:** Deny access to the private leadership section
   when the authenticated person is the subject teacher. This denial applies
   even when that person has an HOD, coach, school-head, or SLT role. Also deny
   self-observation and supervisor-side PIP actions. Permit the teacher's own
   response and PIP acknowledgment.
7. **FR-7 — System administration:** Permit a system administrator to create,
   deactivate, and update accounts and to manage roles and assignments. The
   system-administrator role alone must not permit access to evaluation data.
8. **FR-8 — Account status:** Reuse the shared active-account and credential
   checks. A deactivated account must lose access without a data deletion.
9. **FR-9 — Production bootstrap:** Permit a deployment operator to create the
   first organization and system administrator only when no organization exists.
   Give the administrator a temporary credential and require a password change.
10. **FR-10 — Monorepo registration:** Add the application to the architecture
    manifest, workspace inventory, root quality commands, and continuous
    integration inventory.
11. **FR-11 — Current grants:** Resolve the account, organization, Danielson
    roles, and assignments from current server data on every protected
    operation. Do not authorize from a session role or session organization.
12. **FR-12 — Account credentials:** Create a usable temporary credential for a
    new account with the shared password functions. Require a password change.
    Do not store a plaintext password. Limit repeated failed sign-in
    attempts and use generic credential errors.
13. **FR-13 — Final administrator:** Do not deactivate or revoke the final
    active system-administrator account in an organization.

## Non-Functional Requirements

- Derive the actor identity from the authenticated session. Do not trust an
  actor ID, organization ID, or role from client input.
- Use indexed and bounded Convex queries for account and assignment lookups.
- Keep the Danielson role model application-owned. Do not add Danielson terms to
  shared authentication packages.
- Keep shared packages free of application and `convex/_generated` imports.
- Meet WCAG 2.1 AA for sign-in, navigation, forms, focus order, labels, and error
  states.
- Do not add a dependency without explicit approval.
- Keep protected Convex functions internal. Verify the cookie and active
  credential in Next.js. Pass only the derived actor account ID to the internal
  Convex operation. Reload current grants in the same transaction as a write.
- Do not mutate a shared Convex client with a per-request acting identity.

## Acceptance Criteria

1. One account can act as both a teacher and an HOD without a second sign-in.
2. One account can act as both a teacher and an SLT member without a second
   sign-in.
3. An HOD can access only teachers in an assigned department.
4. A coach can access only assigned teachers.
5. A school head or SLT member can access all teachers in the organization.
6. A system administrator can manage accounts and assignments but cannot read a
   teacher report by use of that role alone.
7. A person with both system-administrator and SLT roles receives report access
   from the SLT role only.
8. A supervisor cannot read private leadership data about their own teacher
   record.
9. A supervisor cannot submit an evaluation or supervisor-side PIP action about
   themselves.
10. A teacher can submit their permitted response and PIP acknowledgment for
    their own record.
11. A grant or revocation takes effect on the next protected operation without
    a new sign-in.
12. A person from another organization cannot read or change any account,
   assignment, or teacher record.
13. A deployment operator can create the first organization and system
    administrator. The bootstrap rejects a second organization.
14. A new account gets one temporary credential. The application does not
    expose the password hash or salt.
15. The application rejects an operation that would remove the final active
    system administrator in an organization.
16. Authentication, authorization, architecture, accessibility, lint, test,
    typecheck, build, generated-fact, boundary, and Measure Doctor gates pass.

## Out of Scope

- Danielson rubric content and proficiency calculations.
- Walkthrough and formal observation records.
- Teacher and leadership reports.
- Improvement plans.
- Get Better Faster sequencing.
- A new authentication provider.
