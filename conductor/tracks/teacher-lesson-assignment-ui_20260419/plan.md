# Plan: Teacher Lesson Assignment UI

## Track: teacher-lesson-assignment-ui_20260419

## Context

The `class_lessons` table exists in schema but is empty. Teachers have no UI to assign lessons to classes. The chatbot authorization falls back to open enrollment when no `class_lessons` entries exist.

---

## Phase 1: Convex Queries [x]

### Task 1.1: Add `getTeacherClassesWithLessons` internalQuery

**File:** `convex/teacher/lesson-assignment.ts` (new file)

**Test:** `__tests__/convex/teacher/lesson-assignment.test.ts`

**Implementation:**
- Query `classes` table by teacherId
- For each class, query `class_lessons` by classId to get assigned lessons
- Return structured data: class id, name, and list of assigned lessonIds

**Verification:** Run tests

---

### Task 1.2: Add `getAvailableLessons` internalQuery

**File:** `convex/teacher/lesson-assignment.ts`

**Test:** `__tests__/convex/teacher/lesson-assignment.test.ts`

**Implementation:**
- Query `lessons` table ordered by unitNumber, orderIndex
- Return lesson id, title, slug, unitNumber, orderIndex

**Verification:** Run tests

---

## Phase 2: Convex Mutations [x]

### Task 2.1: Add `assignLessonToClass` internalMutation

**File:** `convex/teacher/lesson-assignment.ts`

**Test:** `__tests__/convex/teacher/lesson-assignment.test.ts`

**Implementation:**
- Validate teacher owns the class
- Check if assignment already exists (idempotent)
- Insert into `class_lessons` with assignedAt timestamp

**Verification:** Run tests

---

### Task 2.2: Add `unassignLessonFromClass` internalMutation

**File:** `convex/teacher/lesson-assignment.ts`

**Test:** `__tests__/convex/teacher/lesson-assignment.test.ts`

**Implementation:**
- Validate teacher owns the class
- Query `class_lessons` by classId + lessonId
- Delete the entry

**Verification:** Run tests

---

## Phase 3: Teacher UI [x]

### Task 3.1: Create `/teacher/lessons` page

**File:** `app/teacher/lessons/page.tsx`

**Implementation:**
- Use `requireTeacherSessionClaims`
- Fetch classes with assignments via `fetchInternalQuery`
- Render class selector + lesson list

**Verification:** Build passes

---

### Task 3.2: Add lesson assignment toggle component

**File:** `app/teacher/lessons/page.tsx` (inline)

**Implementation:**
- Server action with toggle button
- Calls mutation on toggle

**Verification:** Build passes

---

## Phase 4: Verification [x]

### Task 4.1: Update `getLessonForChatbot` fallback comment

**File:** `convex/student.ts`

**Implementation:**
- The existing fallback logic is correct; just verify it remains in place

**Verification:** Code review

---

### Task 4.2: Add navigation link to teacher nav

**File:** `components/teacher/TeacherNavigation.tsx`

**Implementation:**
- Add "Lessons" link to nav items

**Verification:** Build passes

---

### Task 4.3: Final verification

**Commands:**
```
npx tsc --noEmit
npm run build
npm test
```

---

## Phase Status

- [x] Phase 1: Convex Queries
- [x] Phase 2: Convex Mutations
- [x] Phase 3: Teacher UI
- [x] Phase 4: Verification
