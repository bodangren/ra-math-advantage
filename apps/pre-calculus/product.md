# Product Definition — AP Precalculus

## Overview

AP Precalculus is a web-based learning management system for high school AP Precalculus courses. It prepares students for the AP Precalculus exam through structured, phase-based lessons with interactive activities, real-time progress tracking, and teacher tooling for monitoring student performance. The platform is built on the same architecture as Integrated Math 3 and Math for Business Operations v2.

## Target Users

### Students
- High school students enrolled in AP Precalculus
- Progress through structured, variable-length, typed phase lessons
- Complete interactive activities (graphing, practice problems, drag-and-drop, assessments)
- Track their own progress via a personal dashboard
- Prepare for the AP Precalculus exam

### Teachers
- Manage student rosters via classes and enrollments
- Monitor real-time student progress across units and lessons
- View detailed gradebook per unit with phase-level completion
- Review individual student submissions and error analysis
- Access course overview with competency/standards alignment

### Admins
- Treated as teacher-compatible for routing purposes
- Access to teacher dashboard and admin-specific pages

## Core Features

1. **Phase-Based Lesson System** — Lessons divided into variable-length, typed phase sequences with content sections (text, callout, activity, video, image). Phase types include Explore, Vocabulary, Learn, Key Concept, Worked Example, Guided Practice, Independent Practice, Assessment, Discourse, and Reflection. Students progress linearly through phases.

2. **Student Dashboard** — Shows overall progress, next lesson recommendation, and unit-by-unit breakdown with per-lesson progress bars.

3. **Interactive Activities** — Component-based activity system with graphing exercises, practice problem sets, drag-and-drop interactions, and auto-graded assessments.

4. **Teacher Dashboard** — Organization-scoped view of all students with progress percentages and last-active timestamps.

5. **Gradebook** — Unit-level grid showing per-student, per-lesson progress with competency tracking against standards.

6. **Student Detail View** — Drill-down into individual student's per-lesson, per-phase completion with submission evidence.

7. **Competency Tracking** — Activities linked to AP Precalculus standards; mastery levels updated on completion.

8. **Curriculum Public Page** — Public-facing overview of the course structure for prospective students/parents.

9. **Custom Auth** — JWT-based authentication with username/password (no third-party provider). Role-based access control (student/teacher/admin).

10. **Multi-Tenant** — Organization-scoped data isolation for profiles, classes, and enrollments.

## Curriculum Structure

**Summary**: 4 units, 58 lessons covering polynomial/rational functions, exponential/logarithmic functions, trigonometric/polar functions, and parametric/vectors/matrices.

```
Course (AP Precalculus)
└── Units (1–4)
    └── Lessons (58 total)
        └── Lesson Versions (draft/review/published/archived)
            └── Phases (1–N, variable count)
                └── Phase Sections (text | callout | activity | video | image)
```

| Unit | Title | Lessons |
|------|-------|---------|
| 1 | Polynomial and Rational Functions | 14 |
| 2 | Exponential and Logarithmic Functions | 15 |
| 3 | Trigonometric and Polar Functions | 15 |
| 4 | Functions with Parameters, Vectors, and Matrices | 14 |

## Instructional Model

Lessons follow a structured daily routine:
1. Warm-Up (skill activation)
2. Concept development through exploration or mini-lesson
3. Guided and independent practice
4. In-class assessment (exit ticket or quick check)
5. CAP reflection (Courage, Adaptability, Persistence)

All graded work is completed in class. Retakes allowed (max score 85%).

## Non-Goals (Current Scope)

- Content authoring/CMS for teachers (content is managed in the database)
- Real-time collaboration
- Mobile native apps
- Third-party LMS integration (e.g., Canvas, Google Classroom)
