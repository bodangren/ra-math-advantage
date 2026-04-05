# Product Definition — Integrated Math 3

## Overview

Integrated Math 3 is a web-based learning management system for high school Integrated Math 3 courses. It provides structured, phase-based lessons with interactive activities, real-time progress tracking, and teacher tooling for monitoring student performance. The platform is scaffolded from the Bus Math v2 codebase, adapted for general integrated math curriculum.

## Target Users

### Students
- High school students enrolled in Integrated Math 3
- Progress through structured, 6-phase lessons (Hook → Introduction → Guided Practice → Independent Practice → Assessment → Closing)
- Complete interactive activities (spreadsheets, practice problems, drag-and-drop, assessments)
- Track their own progress via a personal dashboard

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

1. **Phase-Based Lesson System** — Lessons divided into 6 sequential phases with content sections (text, callout, activity, video, image). Students progress linearly through phases.

2. **Student Dashboard** — Shows overall progress, next lesson recommendation, and unit-by-unit breakdown with per-lesson progress bars.

3. **Interactive Activities** — Component-based activity system with spreadsheet exercises, practice problem sets, drag-and-drop interactions, and auto-graded assessments.

4. **Teacher Dashboard** — Organization-scoped view of all students with progress percentages and last-active timestamps.

5. **Gradebook** — Unit-level grid showing per-student, per-lesson progress with competency tracking against standards.

6. **Student Detail View** — Drill-down into individual student's per-lesson, per-phase completion with submission evidence.

7. **Competency Tracking** — Activities linked to competency standards; mastery levels updated on completion.

8. **Curriculum Public Page** — Public-facing overview of the course structure for prospective students/parents.

9. **Custom Auth** — JWT-based authentication with username/password (no third-party provider). Role-based access control (student/teacher/admin).

10. **Multi-Tenant** — Organization-scoped data isolation for profiles, classes, and enrollments.

## Curriculum Structure

The full curriculum specification lives in `curriculum/` at the project root.

**Summary**: 9 modules, 52 lessons covering quadratics, polynomials, inverses/radicals, exponentials, logarithms, rationals, statistics, and trigonometry.

```
Course (Integrated Math 3 Honors)
└── Modules (1–9)
    └── Lessons (52 total)
        └── Lesson Versions (draft/review/published/archived)
            └── Phases (1–6: Hook, Introduction, Guided Practice, Independent Practice, Assessment, Closing)
                └── Phase Sections (text | callout | activity | video | image)
```

| Module | Title | Lessons |
|--------|-------|---------|
| 1 | Quadratic Functions and Complex Numbers | 8 |
| 2 | Polynomials and Polynomial Functions | 5 |
| 3 | Polynomial Equations | 5 |
| 4 | Inverses and Radical Functions | 6 |
| 5 | Exponential Functions and Geometric Series | 5 |
| 6 | Logarithmic Functions | 5 |
| 7 | Rational Functions and Equations | 6 |
| 8 | Inferential Statistics | 5 |
| 9 | Trigonometric Functions | 7 |

See `curriculum/modules/` for per-module lesson breakdowns and skills.

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
