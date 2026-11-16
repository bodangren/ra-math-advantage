# Phase 3 Manual Verification

**Date:** 2026-07-11
**Method:** Kimi WebBridge, real local browser session `kst-v3-2-phase-3`

## Procedure and result

1. Started the IM3 local application and opened `/auth/login` through Kimi
   WebBridge.
2. Inspected the rendered accessibility tree: the page exposed the skip link,
   site navigation, username and password textboxes, Sign In button, and
   password-recovery link with no browser-visible runtime error.
3. Navigated to the protected `/student/dashboard` route while unauthenticated.
   The route correctly required authentication, but initially used
   `/auth/login?redirect=/auth/login`, which would not return a student to the
   dashboard after sign-in.
4. Added the student-layout redirect regression test, corrected the post-login
   target, and repeated the Kimi navigation.

**Result:** Pass. The protected dashboard now redirects to
`/auth/login?redirect=/student/dashboard`; no student data was read or changed.

## Authenticated-flow limitation

No safe seeded local student credentials are available in the browser session.
The authenticated dashboard's canonical KST projection and v3.2 review-day
behavior are therefore covered by the completed server and route tests rather
than invented browser data.

## Companion automated and dev-migration evidence

- Focused layout, dashboard, knowledge-state, runtime-control, queue-dashboard,
  migration-transform, placement-migration, and KST pipeline tests passed.
- The isolated IM3 dev deployment completed all five component migrations with
  zero candidate rows. Every migration's dry run reported no committed writes,
  component status reported success, and the bounded verification query found
  zero unmigrated rows without hitting its page cap.

## Deliberate remaining operation

Schema narrowing is not executed. The cutover contract requires an explicit
post-cutover approval and a 14-day rollback window before legacy readers or
fields may be removed; no production operation was attempted.
