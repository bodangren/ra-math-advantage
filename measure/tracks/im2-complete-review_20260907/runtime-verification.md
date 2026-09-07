# IM2 runtime verification

Date: 2026-09-07.
Target: app-local anonymous Convex deployment. Backend ports: 3222 and 3223. Frontend: localhost:3002.

No production data was changed.

## Passed browser journey

1. Sign in with the local demo teacher account.
2. Create the `IM2 correction test` class.
3. Publish lesson 10.1 in the local test database through the internal publication mutation.
4. Assign lesson 10.1 to the class.
5. Register a synthetic student with the class code.
6. Sign in as that student.
7. Confirm that the student sees the assigned lesson.
8. Complete the first nine phases in order.
9. Submit `12` to the exponent checkpoint. Confirm score 0 and a blocked phase completion.
10. Submit `7`. Confirm score 1 and lesson completion.
11. Reload the lesson. Confirm 10 of 10 phases complete.
12. Sign in as the teacher. Confirm 10 of 10 phases in the gradebook.
13. Open saved answers. Confirm both attempts, scores, feedback, and submission times.

## Corrections from the browser test

- Remove the deprecated Convex `--local` flag.
- Use app-specific ports and fail if the frontend port is occupied.
- Store local Cloudflare server credentials in ignored `.dev.vars`. Keep the local admin key out of `.env.local`, which the Convex CLI reads as a deployment selector.
- Show assigned lessons in the class page.
- Paginate class rosters. The regression test traverses 205 students without duplicates.
- Replace obsolete homepage unit counts with source-derived counts.

Vite optimized lesson-renderer dependencies during the first lesson navigation and first full reload. Each interrupted navigation passed after reload. Production build verification is recorded separately. Do not treat this development behavior as a completed production browser test.

## Open work

The browser journey verifies the basic lesson flow. It does not verify the full mastery, spaced practice, jigsaw, assessment, or knowledge graph contract. The source content still needs complete worked-example review and accessible mathematical notation. The 180-period calendar and graph corrections remain open.

## Administrator draft review

A synthetic local administrator opened the paginated draft list. The administrator inspected Lesson 1.1 revision 2 and its answer key. Publication succeeded. The preview showed published status and the original worksheet link. Automated checks reject teacher and inactive accounts. This test used only the isolated IM2 backend on port 3222.
