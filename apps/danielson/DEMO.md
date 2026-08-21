# Danielson Local Demo

This demo uses the HDKWA brand with fictional accounts and local Convex data. Do not use it with a cloud deployment.

## Start the local demo

Run the one-time local Convex configuration command from `apps/danielson`.

```sh
npx convex dev --configure new --dev-deployment local --project danielson --once
```

Set `DANIELSON_DEMO_PASSWORD` in `.env.local`. Use one local password for all demo accounts.

Seed the organization.

```sh
npm run seed:demo
```

The first run returns `created`. A second run returns `already_seeded`. The command accepts only a loopback Convex URL.

The seed creates the Haidian Kaiwen Academy organization. It uses the approved HDKWA logo, navy, and gold colors.

Start the application and Convex together.

```sh
npm run dev:stack
```

Use Convex import to clear only the selected local deployment.

```sh
printf '[]\n' > .convex/empty-organizations.json
npx convex import --table organizations --replace-all --yes --deployment local .convex/empty-organizations.json
rm .convex/empty-organizations.json
npm run seed:demo
```

The import command clears all application tables in the local deployment. Do not add `--prod`.

## Account roster

| Username | Name | Role | Expected scenario |
| --- | --- | --- | --- |
| `demo.sysadmin` | Casey Rivera | System administrator | Account and department administration. No evaluation reports. |
| `demo.slt` | Alex Morgan | Senior leadership team and teacher | Experienced teacher. |
| `demo.head` | Robin Taylor | School head | Organization-wide leadership scope. |
| `demo.hod.math` | Jordan Lee | Head of mathematics and teacher | Mathematics department scope. |
| `demo.coach.primary` | Sam Okafor | Coach | Primary School teacher scope. |
| `demo.teacher.new` | Maya Chen | Teacher | New teacher. Not enough evidence. Active Get Better Faster (GBF) track. |
| `demo.teacher.developing` | Noah Williams | Teacher | Developing teacher. Below Proficient. Three walkthrough targets. |
| `demo.teacher.experienced` | Sofia Patel | Teacher | Experienced teacher. Proficient. Q1 and Q4 evaluations. |
| `demo.teacher.pip` | Ethan Brooks | Teacher | Below Proficient. Active Performance Improvement Plan (PIP). |
| `demo.teacher.growth` | Lina Park | Teacher | Closed successful PIP. One teacher response. |

## Ten-minute sales path

1. Sign in as `demo.slt`.
2. Open the leadership portfolio.
3. Confirm that the portfolio shows Below Proficient, Proficient, and Not enough evidence teachers.
4. Open Noah Williams. Confirm three walkthrough targets.
5. Open Ethan Brooks. Confirm the active PIP and the proficiency graph.
6. Select a graph component. Confirm that only its direct skills expand.
7. Select a skill with the keyboard. Confirm rating, points, due state, priority, and the evidence link.
8. Use Zoom in, Zoom out, Fit graph, Reset view, and full screen.
9. Open Lina Park. Confirm the closed successful PIP and the teacher response.
10. Sign in as `demo.hod.math` and `demo.coach.primary`. Confirm that each role sees its assigned teacher scope.

The graph is a presentation of the existing current proficiency report. The detailed proficiency list remains below it as the accessible companion view. Private leadership comments do not enter the graph.
