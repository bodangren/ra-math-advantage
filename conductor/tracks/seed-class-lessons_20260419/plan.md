# Plan: Seed Class Lessons

## Track: seed-class-lessons_20260419

## Context

The `class_lessons` table is empty. Demo environment creates a class but doesn't assign lessons. Chatbot falls back to open enrollment.

---

## Phase 1: Seed Mutation and Demo Wiring

### Task 1.1: Create `seed-class-lessons.ts` mutation

**File:** `convex/seed/seed-class-lessons.ts`

**Implementation:**
- Create `seedClassLessons` internalMutation
- Query demo organization by slug ('demo')
- Query demo teacher by username ('teacher@demo')
- Query demo class by teacherId and name ('Demo Class')
- Query Module 1 lessons (unitNumber = 1) ordered by orderIndex
- For each lesson, check if class_lesson entry exists (idempotent)
- Insert class_lesson entries with assignedAt = now

**Test:** `__tests__/convex/seed/seed-class-lessons.test.ts` (new file)

**Verification:** Run mutation tests

---

### Task 1.2: Wire into `seed-demo-env.ts`

**File:** `convex/seed/seed-demo-env.ts`

**Implementation:**
- After class creation and enrollments, call seedClassLessons
- Pass the demo classId to the mutation

**Verification:** seedAll completes without error

---

### Task 1.3: Add unit tests

**File:** `__tests__/convex/seed/seed-class-lessons.test.ts`

**Tests:**
- Seeds class lessons for demo class
- Is idempotent (no duplicates on re-run)
- Only seeds Module 1 lessons
- Returns count of seeded entries

**Verification:** Tests pass

---

## Phase 2: Verification

### Task 2.1: TypeScript check

```bash
npx tsc --noEmit
```

---

### Task 2.2: Build check

```bash
npm run build
```

---

### Task 2.3: Full test suite

```bash
npm test
```

---

## Phase Status

- [x] Phase 1: Seed Mutation and Demo Wiring
- [x] Phase 2: Verification
