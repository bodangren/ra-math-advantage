# Track: Unified Math App: Seat Licensing

Type: Feature
Spec format: Story-shaped (one story for each phase)
Depends on: `math-app-student-history_20261114`

## Overview

This track adds seat licenses to the unified math app. A license belongs to one
organization, one product, and one academic year, and it has a seat count. A seat is one
student for one academic year (set decision of 2026-11-14). The app assigns a seat when it
enrolls a student, and it refuses an enrollment when the license has no free seat. The app
blocks the course pages of an active enrollment with no seat. An admin sees the licenses
and releases seats. The model has a product key, so that BM2 can join later.

Sprint goal: each active student of an organization uses one seat of the license of the
year, and the app enforces the seat count.

## Track Set

This track is member 5 of the track set [Unified Math App](../../sets/unified-math-app_20261114.md). Depends on: `math-app-student-history_20261114`. The shared decisions and the start gate in the set overview apply to this track.

## Current System (expected at the start; facts checked 2026-11-14)

- **Organizations:** `organizations` has `name`, `slug`, `settings`, and the index
  `by_slug`. Each profile has an `organizationId`. The roles are `student`, `teacher`,
  `admin`, and `parent`.
- **Enrollments:** after `math-app-student-history_20261114`, each enrollment write goes
  through `enrollStudent(ctx, { classId, studentId })`. Each class has a `courseKey` and an
  `academicYear`.
- **Course access:** after the base track, a student opens the pages of a course only with
  an `active` or `completed` enrollment in a class of that course (base D8).
- **Admin pages:** `/admin/dashboard` and, after the history track, `/admin/years`.
- **No license data:** the schema has no license or seat table.

## Decisions (defaults of 2026-11-14)

- **D1 Seat scope:** one seat covers one student in one organization for one academic year,
  for each course of one product. The math app uses the product key `math`. A later BM2
  license uses another product key.
- **D2 License creation:** the operator makes a license and changes its seat count with
  internal mutations (`npx convex run`). No page makes a license.
- **D3 Seat count change:** a new seat count below the count of assigned seats fails.
- **D4 Assignment:** `enrollStudent` reuses the assigned seat of the student for the product
  and the year of the class. When the student has no seat, it assigns a free seat of the
  `active` license. When the license has no free seat, or no `active` license exists, the
  enrollment fails with a message, and nothing is written.
- **D5 Release:** a seat stays assigned when the enrollments of the student end. An admin
  releases a seat only when the student has no `active` enrollment in a class of that year
  and product. A released seat is free again.
- **D6 Enforcement:** the course access rule of base D8 adds one check. For an `active`
  enrollment, the student needs an assigned seat in an `active` license of the class year.
  A `completed` enrollment needs no seat, so the history stays readable.
- **D7 Cancelled license:** a license with `status: "cancelled"` gives no access and no new
  seat. Its seats stay as records.
- **D8 Demo license:** the seed writes one `active` license for the demo organization:
  product `math`, year `2026-2027`, 50 seats.

## Stories

### Story S1: License model
**As an** operator
**I want** to make a license for an organization, a product, and a year, with a seat count
**So that** the app knows how many students the organization pays for

**Acceptance Criteria:**
- Given the schema, When a test reads it, Then `licenses` (`organizationId`, `productKey`, `academicYear`, `seatCount`, `status`) and `license_seats` (`licenseId`, `organizationId`, `studentId`, `productKey`, `academicYear`, `status`, `assignedAt`, `releasedAt`) exist with their indexes.
- Given `createLicense` with a year that is not `YYYY-YYYY`, a seat count below 1, or a second `active` license for the same organization, product, and year, When the operator runs it, Then it fails and writes nothing.
- Given a license with 10 assigned seats, When the operator sets its seat count to 9, Then it fails; When the operator sets it to 10 or more, Then it succeeds.
- Given the seed, When it runs, Then the demo organization has the demo license of D8.

**Estimate:** M
**Priority:** Must

### Story S2: Seat assignment at enrollment
**As a** teacher
**I want** each enrollment to take a seat of the license
**So that** the seat count limits the active students

**Acceptance Criteria:**
- Given a license with one free seat and a student with no seat, When a teacher enrolls the student, Then the app assigns the seat and writes the enrollment.
- Given a student with a seat for `math` in `2026-2027`, When the student enrolls in a class of a second course of `2026-2027`, Then the app uses the same seat, and the count of assigned seats does not change.
- Given a license with no free seat, When a teacher enrolls a student with no seat, Then the enrollment fails with the message "The license for 2026-2027 has no free seat", and nothing is written.
- Given no `active` license for the year of the class, When a teacher enrolls a student, Then the enrollment fails with the message "The organization has no license for 2026-2027", and nothing is written.
- Given a roster import with more students than free seats, When it runs, Then each row after the last free seat gets a row error, and the other rows succeed.

**Estimate:** M
**Priority:** Must

### Story S3: Enforcement on access
**As an** organization
**I want** the course pages closed to an active student with no seat
**So that** the app enforces the license

**Acceptance Criteria:**
- Given a student with an `active` enrollment and an assigned seat, When the student opens a page of that course, Then the page renders.
- Given a student with an `active` enrollment and no assigned seat in an `active` license, When the student opens a page of that course, Then the app shows the page "No seat for this course year. Ask your teacher." and no course content.
- Given a cancelled license, When a student of that license opens a course page of an `active` enrollment, Then the app shows the same page.
- Given a student with only a `completed` enrollment, When the student opens the course pages, Then they render with no seat check.

**Estimate:** S
**Priority:** Must

### Story S4: Admin license view
**As an** admin
**I want** to see the licenses of my organization and release unused seats
**So that** I can manage the seats of each year

**Acceptance Criteria:**
- Given licenses for `2025-2026` and `2026-2027`, When an admin opens `/admin/licenses`, Then the page shows, for each license, the year, the product, the seat count, the assigned seats, and the free seats.
- Given a license, When the admin opens it, Then the page lists each assigned seat with the student name, the classes of that year, and a release action only for a seat with no `active` enrollment.
- Given a seat with an `active` enrollment, When the admin calls the release mutation for it, Then it fails and changes nothing.
- Given a teacher, When the teacher opens `/admin/licenses` or calls the release mutation, Then it is forbidden.

**Estimate:** M
**Priority:** Should

## Non-Functional Requirements

- No data migration (set decision of 2026-11-14).
- `productKey` is a string. The math app writes only `math`. Do not change BM2.
- Seat writes and enrollment writes happen in one Convex mutation, so that two enrollments
  at the same time cannot use more seats than the seat count.
- Each license query uses an index. No query reads a full table.
- Each new query and mutation checks the role on the server. The internal mutations of D2
  are `internalMutation`.
- No log line holds a student name.
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: `licenses` and `license_seats` exist, and the operator mutations of D2 and D3 work
  as S1 gives.
- AC2: Each enrollment assigns or reuses a seat, and the seat count limits the active
  students of a year.
- AC3: The course pages of an `active` enrollment need a seat in an `active` license.
- AC4: `/admin/licenses` shows the licenses and releases only seats with no `active`
  enrollment.
- AC5: The demo organization has the demo license, and the demo flows and the E2E suite
  pass.
- AC6: Each gate passes.

## Out of Scope

- Payments, invoices, and prices.
- A page that makes a license.
- BM2 licenses (the model allows them later).
- An automatic seat release.
