# Danielson Teacher Growth

This application helps a school collect Danielson observation evidence. It
also shows current teacher proficiency and the next walkthrough priorities.

The application supports these users:

- Teachers view published evidence, public comments, plan progress, and their
  final response.
- Heads of department and coaches complete scoped walkthroughs.
- School heads and Senior Leadership Team (SLT) members review school-wide
  proficiency and improvement plans.
- System administrators manage accounts, roles, departments, and assignments.

## Main functions

- Ranked leadership portfolio for 50 or more teachers.
- Five-to-ten-minute walkthrough forms with three priority targets.
- Quarter 1 and Quarter 4 formal observation records.
- Dynamic proficiency graph with 1–4 scores, score colors, zoom, pan, and
  keyboard controls.
- Performance Improvement Plan (PIP) proposals, approval, progress, revision,
  and closure.
- Get Better Faster (GBF) progress when a teacher has an assignment.
- Public teacher reports and private leadership comments.
- Organization-scoped access and optional school branding.

## Local HDKWA pilot

The local pilot uses the Haidian Kaiwen Academy (HDKWA) brand. It contains 10
fictional accounts and seven teacher profiles. The cases include new,
developing, experienced, active-PIP, and closed-PIP teachers.

The seed command rejects hosted Convex deployments. Use it only with a local
Convex deployment.

### Configure the environment

Copy the example values to `apps/danielson/.env.local`. Set a strong local
session secret. Set one local pilot password.

```sh
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
AUTH_JWT_SECRET=replace-with-a-long-random-secret
DANIELSON_DEMO_PASSWORD=replace-with-a-local-pilot-password
```

### Configure and seed Convex

Run these commands from `apps/danielson`.

```sh
npx convex dev --configure new --dev-deployment local --project danielson --once
npm run seed:demo
npm run dev:stack
```

The first seed returns `created`. A repeated seed returns `already_seeded`.

Open [http://localhost:3000/auth/login](http://localhost:3000/auth/login).
The local login page lists the pilot usernames. It reads the pilot password
from the local environment.

See [DEMO.md](./DEMO.md) for the account roster, reset command, and the
ten-minute review path.

## Organization branding

Each organization can define a display name, logo path, primary color, and
accent color. These values stay on the existing organization record. An
organization without these values uses the generic Danielson brand.

The HDKWA local seed uses the approved HDKWA logo, navy, and gold colors. The
application uses the same organization brand on the header and primary
controls.

## Review artifacts

The interface review contains 33 desktop screenshots and five mobile
screenshots.

The Senior Leadership Team (SLT) presentation contains 14 slides. It includes
clear desktop and mobile walkthrough views.

- [Screenshot catalog](../../outputs/danielson-hdkwa-system-review_20260821/screenshots/)
- [SLT presentation](../../outputs/danielson-hdkwa-system-review_20260821/HDKWA-Danielson-System-Review.pptx)

The screenshots use fictional local data. Teacher screenshots do not contain
private leadership comments.

## Quality checks

Run these commands from the repository root.

```sh
CI=true npm run test --workspace=apps/danielson
npm run lint --workspace=apps/danielson
npx tsc --noEmit --project apps/danielson/tsconfig.json
npx tsc --noEmit --project apps/danielson/convex/tsconfig.json
npm run build --workspace=apps/danielson
```

The application uses the repository Measure workflow. Read the active track
before you change a feature.

## Production limits

The local pilot is not a production deployment. Complete these items before
production use:

- Confirm the production identity provider.
- Complete authenticated browser acceptance.
- Confirm school policy and Human Resources (HR) text.
- Configure production backup and monitoring.
- Assign a deployment owner and a support path.

Do not seed fictional pilot accounts in a hosted Convex deployment.
