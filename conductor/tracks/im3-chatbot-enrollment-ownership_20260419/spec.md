# Track: IM3 Chatbot Enrollment Ownership Check

## Problem Statement

The IM3 chatbot has a critical authorization gap:

**Issue**: `isStudentActivelyEnrolled` only checks if a student is enrolled in ANY active class. It does NOT verify that the student's enrolled class has ownership of the requested lesson. A student in Class A can access ANY lesson in the system by requesting its ID.

**Severity**: HIGH - a student enrolled in one class can access chatbot content for lessons belonging to a different teacher's class.

## Root Cause

1. **Schema gap**: No `class_lessons` join table to track which lessons belong to which classes
2. **Authorization gap**: `isStudentActivelyEnrolled` (student.ts:391-402) only checks for any active enrollment
3. **Route gap**: `POST /api/student/lesson-chatbot/route.ts` calls the weak enrollment check before allowing lesson access

## Solution

Add class-level lesson ownership tracking and enforce it in the chatbot authorization flow.

### Step 1: Add `class_lessons` Join Table

New Convex table `class_lessons` with:
- `classId`: reference to owning class
- `lessonId`: reference to the lesson
- `assignedAt`: timestamp

Index: `by_class_and_lesson` compound index for efficient lookup.

### Step 2: Create `isStudentEnrolledInClassForLesson` Query

New internal query that verifies:
1. Student has an active enrollment in some class
2. That class has the requested lesson in its `class_lessons` entries

### Step 3: Update Chatbot Route

Replace the generic `isStudentActivelyEnrolled` check with `isStudentEnrolledInClassForLesson` that verifies ownership.

## Files to Modify

1. `convex/schema.ts` - Add `class_lessons` table
2. `convex/student.ts` - Add `isStudentEnrolledInClassForLesson` query
3. `app/api/student/lesson-chatbot/route.ts` - Use new ownership check
4. `__tests__/app/api/student/lesson-chatbot/route.test.ts` - Update/add tests

## Acceptance Criteria

1. A student enrolled ONLY in Class A cannot access lessons assigned to Class B
2. A student enrolled in Class A that owns Lesson L can access Lesson L
3. A student with no enrollments receives 403
4. Existing chatbot functionality remains intact for valid access patterns
5. New ownership check has test coverage