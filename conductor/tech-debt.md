# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Misconception tags not persisted in review evidence | High | Open | getMisconceptionSummary always returns empty |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| N+1 query: teacher SRS (getOverdueLoad, getPracticeStreaks, getStrugglingStudents, getClassSrsHealth) | High | Resolved | Parallelized with Promise.all in srs-queries.ts |
| Enrollment fallback grants unrestricted access when no class_lessons | High | Resolved | Changed to deny-by-default (return false) in student.ts:445 |
| Prompt injection sanitization too weak (sanitizeInput) | High | Resolved | Added newline stripping, role-switch token removal, bracket stripping |
| Teacher lessons page: class selector non-functional | Medium | Resolved | ClassSelector client component with URL routing already implemented |
| practice-core: computeBaseRating([]) untested edge case | Medium | Open | Empty parts array returns 'Good' — may be unintended |
| practice-core: computeTimingBaseline(allLowConfidence) untested | Medium | Open | All low-confidence timings produce zero percentiles untested |
| practice-core: seed tests don't exercise seed mutation | Medium | Open | seed-demo-env.test.ts validates static type, not actual mutation |
| Demo seed only assigns Unit 1 lessons | Low | Open | seed-demo-env.ts queries unitNumber=1 only; blocks Units 2-9 chatbot access |
