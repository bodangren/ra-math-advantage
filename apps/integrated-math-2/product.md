# Product Definition — Integrated Math 2

## Current implementation

IM2 provides authenticated student lessons, server-graded checkpoints, phase progress, class enrollment, and teacher evidence views. Administrators can review and publish draft lesson revisions. These paths have local verification. Production deployment remains separate.

The source course contains 96 lessons and 403 worked-example sections. Each lesson has one scored numeric checkpoint. A checkpoint result measures that question. It does not establish mastery of every lesson objective or a complete standard.

Students can join a class with a valid code. They can open assigned published lessons and complete phases in order. Teachers can create classes, assign published lessons, inspect rosters, and read submission evidence. Access checks use the current account and organization.

## Planned capabilities

The following capabilities remain product requirements. They are not current availability claims.

- Full graph-based Worked, Guided Practice, and Independent Practice modes.
- Complete practice variants for each approved objective.
- Graph-based mastery and spaced review with valid evidence.
- A class-period runtime for the 180-period teaching calendar.
- Secure assessment forms and formal retake grading.
- Additional graphing and drag-and-drop activities.

The separate Graph Node Practice Program track owns active graph component work. Unfinished graph candidates remain ineligible for mastery and spaced review.

## Roles

- Students use assigned published content and their own progress.
- Teachers manage their own classes and enrolled student evidence.
- Administrators can also review and publish curriculum drafts.

## Curriculum Structure

The full curriculum specification lives in `curriculum/` at the app root.

**Summary**: 13 units, 96 lessons covering geometry, algebra, trigonometry, and probability.

```
Course (Integrated Math 2)
└── Units (1–13)
    └── Lessons (96 total)
        └── Lesson Versions (draft/review/published/archived)
            └── Phases (1–N, variable count)
                └── Phase Sections (text | callout | activity | video | image)
```

| Unit | Title | Lessons |
|------|-------|---------|
| 1 | Relationships in Triangles | 7 |
| 2 | Quadrilaterals | 6 |
| 3 | Similarity | 6 |
| 4 | Right Triangles & Trigonometry | 8 |
| 5 | Circles | 8 |
| 6 | Measurement | 9 |
| 7 | Probability | 8 |
| 8 | Relations and Functions | 7 |
| 9 | Linear Equations, Inequalities & Systems | 9 |
| 10 | Exponents and Roots | 7 |
| 11 | Polynomials | 7 |
| 12 | Quadratic Functions | 9 |
| 13 | Trigonometric Identities & Equations | 5 |

## Instructional Model

The teaching calendar specifies this daily routine. The app lesson phases do not yet implement a timed class-period session:
1. Warm-Up (skill activation)
2. Concept development through exploration or mini-lesson
3. Guided and independent practice
4. In-class assessment (exit ticket or quick check)
5. CAP reflection (Courage, Adaptability, Persistence)

The intended formal assessment policy requires in-class work and permits retakes with an 85% score cap. The current formative checkpoint flow does not enforce this formal assessment policy.

## Non-Goals (Current Scope)

- Content authoring/CMS for teachers (content is managed in the database)
- Real-time collaboration
- Mobile native apps
- Third-party LMS integration (e.g., Canvas, Google Classroom)
