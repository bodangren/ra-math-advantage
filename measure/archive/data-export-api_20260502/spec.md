# Spec: Student Progress Data Export API

## Problem

Teachers and administrators need to export student progress data for external reporting (gradebooks, IEP tracking, district dashboards). Currently there is no way to extract structured data from the platform — teachers must manually copy information from the UI. The product.md targets "classroom-ready" use, and data export is essential for real classroom adoption.

## Scope

Add Convex queries and a simple UI surface for exporting student progress data as CSV/JSON from `apps/integrated-math-3/`.

## Key Features

1. **Student Progress Export**: Per-student lesson completion, phase status, activity scores, and SRS card states — filterable by date range and module
2. **Class Gradebook Export**: All students in a class with grades per lesson, competency proficiency levels, and overall progress — formatted for import into gradebook systems
3. **Submission Detail Export**: Raw submission data for all activities in a date range — useful for error analysis and IEP documentation
4. **API Access**: Convex queries that return structured JSON, usable by external tools or future integrations

## Data Shapes

- **Student Export**: studentId, name, lessons completed, phases completed per lesson, activity scores, SRS card counts by state, last active date
- **Class Export**: classId, className, array of {studentId, name, overallProgress, per-lesson scores, competency heatmaps}
- **Submission Export**: submissionId, studentId, lessonId, activityKey, componentKind, score, submittedAt, timing data

## Non-Goals

- Real-time data streaming (webhooks, SSE)
- Direct LMS integration (Canvas, Google Classroom)
- Automated scheduled exports (manual trigger only for now)
- PDF report generation (CSV/JSON only)

## Success Criteria

- Teachers can export class gradebook as CSV from teacher dashboard
- Teachers can export individual student progress as JSON
- Convex queries are paginated and filterable by date range
- Export data matches what's visible in the UI (no stale/missing data)
