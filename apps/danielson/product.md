# Danielson Teacher Growth

## Purpose

The application helps the school improve teacher proficiency against the
Danielson Framework for Teaching. It gives teachers and leaders one record of
evidence, target skills, and improvement work.

Track 1 creates the application foundation. It creates accounts, roles,
organization scopes, and system-administrator workflows. Later tracks add the
rubric, observations, reports, improvement plans, and Get Better Faster (GBF)
sequence.

## Users

- A teacher views their published evaluation records.
- A Head of Department (HOD) works with teachers in assigned departments.
- A coach works with assigned teachers.
- A school head works with all teachers in one organization.
- A Senior Leadership Team (SLT) member works with all teachers in one
  organization.
- A system administrator manages accounts and access. This role does not grant
  access to evaluation records.

One person has one account. One account can have more than one role.

## Track 1 Outcomes

- The app is a first-class monorepo workspace.
- The app uses the shared session, Convex, and shell packages.
- The app stores current role and assignment data in its own Convex boundary.
- The server checks current role and assignment data for every protected action.
- A system administrator can manage accounts, departments, roles, and
  assignments.
- A supervisor cannot evaluate themselves or read private leadership data about
  themselves.

## Product Boundaries

This track does not add the Danielson rubric, proficiency scores, observation
forms, reports, improvement plans, or GBF sequence.

The product does not score culture fit, staff attitude, or labor-market
availability.
