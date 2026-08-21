# Specification: Danielson Local Demo and Teacher Proficiency Graph

## Overview

Create a local sales-demo environment for the Danielson application. Use a
local Convex deployment. Seed one fictional organization named `Danielson
School`. Seed demo accounts and representative teacher data.

Add a dynamic teacher proficiency graph to the existing teacher report. The
graph must use the current report projection. It must not create a second
proficiency model.

The graph must be visually clear during a sales call. It must also remain
usable with a keyboard and a screen reader.

## Confirmed Decisions

- Use a local Convex deployment.
- Use `Danielson School` as the demo organization.
- Use the term `demo account`.
- Use one password from `DANIELSON_DEMO_PASSWORD` for all demo accounts.
- Seed seven teacher scenarios.
- Include new, developing, and experienced teachers.
- Include teachers with and without a Performance Improvement Plan (PIP).
- Show the graph in the existing teacher report.
- Use the native browser full-screen feature.
- Show the framework, domains, and components when the graph opens.
- Show skills when the user selects one component.
- Use native Scalable Vector Graphics (SVG).
- Add no graph dependency.

## Existing Sources of Truth

Reuse these existing surfaces:

- `apps/danielson/lib/proficiency/graph.ts` owns the Danielson hierarchy.
- `apps/danielson/lib/reporting/projections.ts` owns current proficiency.
- `apps/danielson/lib/observations/queue.ts` owns target priority order.
- `apps/danielson/lib/proficiency/processor.ts` owns evidence effects.
- `apps/danielson/lib/proficiency/convex-repository.ts` owns proficiency writes.
- `apps/danielson/components/teacher-report-view.tsx` owns the report view.
- `packages/core-auth` owns password hashing behavior.
- The current Convex schema owns all demo records.

Do not add a second scheduler, priority rule, proficiency rule, graph catalog,
or account model.

## Demo Account Roster

All names and records are fictional.

| Username | Display name | Roles | Teacher scenario |
|---|---|---|---|
| `demo.sysadmin` | Casey Rivera | System administrator | No teacher profile |
| `demo.slt` | Alex Morgan | Senior Leadership Team (SLT), teacher | Experienced dual-role teacher |
| `demo.head` | Robin Taylor | School head | No teacher profile |
| `demo.hod.math` | Jordan Lee | Head of Department (HOD), teacher | Experienced dual-role teacher |
| `demo.coach.primary` | Sam Okafor | Coach | No teacher profile |
| `demo.teacher.new` | Maya Chen | Teacher | New teacher with limited evidence |
| `demo.teacher.developing` | Noah Williams | Teacher | Developing teacher below Proficient |
| `demo.teacher.experienced` | Sofia Patel | Teacher | Experienced teacher at Proficient |
| `demo.teacher.pip` | Ethan Brooks | Teacher | Teacher with an active approved PIP |
| `demo.teacher.growth` | Lina Park | Teacher | Teacher with a successful closed PIP |

The seven teacher profiles are Alex Morgan, Jordan Lee, Maya Chen, Noah
Williams, Sofia Patel, Ethan Brooks, and Lina Park.

## Demo Organization and Scope

Create these departments:

- Mathematics
- Primary School

Assign the Mathematics HOD to the Mathematics department. Assign the coach to
the Primary School teachers. Assign teacher memberships so the HOD and coach
have useful but different scopes.

The SLT member and school head have organization-wide evaluation access. The
system administrator has account access only. Existing self-access rules must
still apply to the SLT member and HOD when they view their own teacher record.

## Demo Teacher Scenarios

### Alex Morgan

- Has SLT and teacher roles.
- Has published evidence.
- Has no PIP.
- Can view their own public report.
- Cannot view private leadership comments about themselves.

### Jordan Lee

- Has HOD and teacher roles.
- Is an experienced teacher.
- Has a Proficient state and a low walkthrough cadence.
- Has no active PIP.
- Demonstrates HOD scope and self-exclusion.

### Maya Chen

- Is a new teacher.
- Has many skills with Not Enough Evidence.
- Has a Get Better Faster (GBF) assignment.
- Has due skills and a high walkthrough cadence.
- Has no PIP.

### Noah Williams

- Is an early-career teacher.
- Has ratings of 1 and 2 in selected skills.
- Has at least two submitted walkthroughs.
- Has three visible walkthrough priorities.
- Has no PIP.

### Sofia Patel

- Is an experienced teacher.
- Has ratings of 3 and 4 in selected skills.
- Has published Q1 and Q4 formal observations.
- Has no PIP.
- Demonstrates a low observation cadence.

### Ethan Brooks

- Has an approved active PIP.
- Has two PIP target skills.
- Has current and overdue evidence.
- Has public and private leadership comments.
- Has not completed the PIP.

### Lina Park

- Has a closed successful PIP.
- Has evidence that changes at least one target from rating 2 to rating 3.
- Has one teacher response.
- Demonstrates preserved historical improvement.

## Functional Requirements

### FR-1: Local Convex Setup

Add a documented local setup that uses the installed Convex command-line
interface. The developer must configure a local deployment before they seed
data. The local stack must start Convex and Vinext without a new dependency.

### FR-2: Local-Only Seed Command

Add `npm run seed:demo` to `apps/danielson/package.json`. The command must:

- require `DANIELSON_DEMO_PASSWORD`;
- read the configured Convex URL;
- refuse a URL that is not `localhost`, `127.0.0.1`, or `::1`;
- call an internal Convex mutation without `--prod`;
- print the demo usernames after success;
- never print the password.

### FR-3: Credential Behavior

Use the existing PBKDF2 password method. Use a unique salt for each account.
Set `mustChangePassword` to `false` for demo accounts. The same environment
password must authenticate each demo account.

Move the existing Node password-hash code to one app-local helper only if both
the production administrator seed and demo seed need it. Do not create a new
authentication package.

### FR-4: Seed Safety

The seed mutation must be internal. It must use one Convex transaction. It must
use the stable organization slug `danielson-school` and the stable usernames in
this specification.

If no organization exists, create the complete demo. If `Danielson School`
already exists with the expected demo accounts, return `already_seeded` and do
not add duplicates. If unrelated organization data exists, return `conflict`
and do not write data.

Do not add a demo marker table, fixture registry, seed ledger, hash, version
record, or reset mutation.

### FR-5: Demo Data Integrity

Use the existing schema. Use the existing proficiency processor and Convex
repository for rated evidence. Do not hand-write current proficiency, KST,
spaced repetition system (SRS), or priority rows when the processor can create
them.

Create observation, comment, response, GBF, and PIP records that satisfy their
current contracts. The seed must not bypass authorization behavior in normal
application requests.

### FR-6: Demo Data Dates

Build all dates from one seed reference time. Tests must pass a fixed reference
time. Production seeding may use the current time. Preserve a coherent order:
formal observation, walkthroughs, PIP approval, PIP evidence, and PIP closure.

### FR-7: Report Priority Targets

Extend `CurrentProficiency` with up to three priority targets. Each target must
contain:

- rank 1, 2, or 3;
- skill ID;
- existing observation priority reason.

Use `rankPriorityTargets()` from `apps/danielson/lib/observations/queue.ts`.
Do not create a second priority sort.

### FR-8: Graph Projection

Create a pure graph-view projection from `CurrentProficiency`.

The initial projection must contain:

- one central Danielson node;
- four domain nodes;
- all 22 component nodes;
- no skill nodes.

When one component is expanded, add only its direct skill children. Permit one
expanded component at a time.

The view projection must contain only presentation data. It must not become a
new proficiency source of truth.

### FR-9: Deterministic Layout

Use a deterministic radial layout:

- put the Danielson node at the center;
- put four domains on the first radius;
- put each domain's components on its outer arc;
- put the selected component's skills on the next outer arc.

Use pure arithmetic. Do not use force simulation, random placement, a graph
library, or stored layout coordinates.

### FR-10: Visual State

Show proficiency with text and color:

- Proficient
- Below Proficient
- Not Enough Evidence

Show due state with text and a separate border treatment. Show priority rank 1,
2, or 3 on each current target. Do not use color as the only status signal.

### FR-11: Graph Interaction

The graph must support:

- pointer drag to pan;
- wheel and button controls to zoom;
- a minimum and maximum zoom;
- Fit graph;
- Reset view;
- native full screen;
- node selection;
- component expansion and collapse.

The graph must update when the report receives new proficiency data. Do not
save graph interaction state to Convex or browser storage.

### FR-12: Node Detail

Selecting a domain or component must show its title and proficiency state.
Selecting a skill must also show:

- rating;
- points;
- due state;
- due date when present;
- overdue days;
- priority rank and reason when present;
- a link to the evidence record when present.

### FR-13: Report Integration

Render the same graph component in:

- `/my-report`;
- `/reports/teachers/[teacherProfileId]`.

Keep the existing detailed proficiency list below the graph. Do not expose
private comments or private metadata through graph props.

### FR-14: Accessibility

Use native buttons for graph controls. Give each interactive SVG node a useful
accessible name. Support Enter and Space for node activation. Show a visible
focus ring. Provide status text outside the SVG. Keep the existing detailed
list as the non-visual representation.

Respect `prefers-reduced-motion`. Do not require drag, wheel, color, or full
screen to read the data.

### FR-15: Demo Guide

Create `apps/danielson/DEMO.md`. Include:

- local Convex setup;
- environment variables;
- the seed command;
- the start command;
- the account roster;
- the native local reset procedure;
- a ten-minute sales-call path;
- expected results for each step.

Do not put the password value in the file.

## Non-Functional Requirements

### NFR-1: Performance

The initial SVG contains 27 nodes and 26 hierarchy edges. One expanded
component adds only its direct skills and edges. The graph must not cause a new
Convex request when the user pans, zooms, selects, or expands a node.

### NFR-2: Privacy

The graph uses the public teacher-report projection. A leadership report can
continue to contain private comments outside the graph. Private data must not
enter the graph model or SVG attributes.

### NFR-3: Security

The demo seed must refuse non-local Convex URLs. The seed function must remain
internal. Normal authorization checks must remain unchanged.

### NFR-4: Scope

Add no dependency. Add no schema table or index. Add no hash, checksum,
manifest, audit ledger, event system, cache, projection table, graph registry,
or stored layout.

### NFR-5: Writing

Use ASD-STE100 Simplified Technical English for documentation and web text.

## Acceptance Criteria

1. A developer can configure a local Convex deployment with the installed CLI.
2. `npm run seed:demo --workspace=apps/danielson` creates `Danielson School`.
3. The seed creates all ten accounts and seven teacher profiles.
4. One environment password authenticates every demo account.
5. The seed creates Mathematics and Primary School scopes.
6. The seed creates all seven teacher scenarios in this specification.
7. A second seed run adds no duplicate organization, account, or domain row.
8. The seed refuses a non-local Convex URL before it writes data.
9. The ranked leadership portfolio contains teachers with different attention
   states.
10. Noah Williams has three visible walkthrough priorities.
11. Ethan Brooks has an approved active PIP.
12. Lina Park has a successful closed PIP and a teacher response.
13. The teacher report returns up to three targets in the existing priority
   order.
14. The collapsed graph contains 27 nodes and 26 hierarchy edges.
15. Expanding one component adds only its direct skills.
16. The graph uses the correct proficiency, due, and target state for each
   visible node.
17. Pan, zoom, Fit graph, Reset view, selection, expansion, and full screen
   work in the browser.
18. Keyboard users can operate the controls and activate nodes.
19. The detailed proficiency list remains available below the graph.
20. The teacher-facing graph contains no private comment data.
21. No new dependency, schema table, index, hash, or stored layout exists.
22. Danielson tests, lint, app typecheck, Convex typecheck, build, generated
   facts, boundaries, and Measure Doctor pass.

## Out of Scope

- A hosted sales-demo deployment
- Production data seeding
- A seed or reset page
- A custom reset mutation
- Customer data import
- Real teacher data
- A graph editing interface
- A force-directed layout
- Saved graph positions
- Graph screenshots or exports
- New Danielson scoring or priority rules
- New PIP, GBF, KST, or SRS behavior
- New audit, provenance, hash, release, or approval machinery
