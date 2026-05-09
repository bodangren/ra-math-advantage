# Specification: Demo Environment & Verification — All Apps

## 2026-05-09 Status: Update Required Before Implementation

Keep completed demo verification. Remaining/new verification must validate graph-derived runtime projections after `skill-runtime-projection_20260509` and the course rollout tracks, not hand-maintained activity maps or seed outputs.

## Overview

Seed demo environments and run end-to-end verification for IM1, IM2, and PreCalculus. Each app needs a demo org, teacher, students, class, enrollments, and sample progress data.

## Context

IM3 has `seed_demo_env.ts` (creates org/teacher/students/class/enrollments) and `seed_demo_progress.ts` (creates sample student progress). These are mostly generic — only the class name and lesson references are course-specific. IM1, IM2, and PreCalc need the same demo infrastructure.

## Functional Requirements

1. **IM1 Demo Environment**: Seed demo org, teacher, students, class with IM1 lesson assignments
2. **IM2 Demo Environment**: Seed demo org, teacher, students, class with IM2 lesson assignments
3. **PreCalc Demo Environment**: Seed demo org, teacher, students, class with PreCalc lesson assignments
4. **Demo Progress**: Create sample student progress records for demo students in each app
5. **Class Lessons**: Seed `class_lessons` entries assigning Module 1 lessons to demo class
6. **End-to-End Verification**: Verify each app can render lessons, activities, and teacher dashboards

## Non-Functional Requirements

- Demo environments must be independent (no cross-app data sharing)
- Each app's demo must use its own Convex deployment
- Demo data must be reproducible (idempotent seeding)
- Verification must cover student lesson flow and teacher dashboard

## Acceptance Criteria

- [ ] IM1: `seed_demo_env.ts` creates demo environment
- [ ] IM1: `seed_demo_progress.ts` creates sample progress
- [ ] IM1: `seed_class_lessons.ts` assigns Module 1 lessons
- [ ] IM2: `seed_demo_env.ts` creates demo environment
- [ ] IM2: `seed_demo_progress.ts` creates sample progress
- [ ] IM2: `seed_class_lessons.ts` assigns Module 1 lessons
- [ ] PreCalc: `seed_demo_env.ts` creates demo environment
- [ ] PreCalc: `seed_demo_progress.ts` creates sample progress
- [ ] PreCalc: `seed_class_lessons.ts` assigns Unit 1 lessons
- [ ] Each app: student can navigate through a lesson end-to-end
- [ ] Each app: teacher can view dashboard and gradebook
- [ ] Each app: activities render and accept submissions

## Out of Scope

- Curriculum content authoring (Tracks 2-4)
- Standards seeding (Track 5)
- Lesson seeding (Track 6)
- Production deployment
