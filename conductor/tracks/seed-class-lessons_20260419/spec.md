# Spec: Seed Class Lessons

## Context

The `class_lessons` table is empty in the demo environment. Teachers have no pre-populated lesson assignments. The chatbot falls back to open enrollment when no `class_lessons` entries exist.

## Problem

When `class_lessons` is empty:
1. Teachers must manually assign every lesson via the `/teacher/lessons` UI
2. The chatbot's proper authorization flow (via class_lessons) never gets exercised in demo
3. Production deployments start with zero lesson assignments

## Solution

Seed `class_lessons` entries for the demo environment, assigning all published Module 1 lessons to the demo class. This mirrors how `class_enrollments` seeds student memberships.

## Scope

- Create `seed-class-lessons.ts` mutation
- Query published lessons from Module 1 (unitNumber 1)
- Assign all Module 1 lessons to the demo class
- Make idempotent (skip if entries already exist)
- Wire into `seed-demo-env.ts` after class creation

## Acceptance Criteria

1. Running `seedAll` produces populated `class_lessons` for the demo class
2. Subsequent runs are idempotent (no duplicate entries)
3. Demo students can access Module 1 lessons via chatbot (with proper class_lesson authorization)
4. TypeScript compiles clean
5. Existing tests pass

## Non-Goals

- UI changes (Teacher assignment UI already built in prior track)
- Non-demo class seeding (production classes use the UI)
- Module 2-9 seeding (demo focuses on Module 1)
