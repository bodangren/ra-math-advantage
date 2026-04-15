# Daily Practice SRS Roadmap

## Purpose

This roadmap sequences post-Module-9 work for daily practice, spaced repetition scheduling, objective proficiency, and reusable course-agnostic practice infrastructure.

The guiding design is:

```text
practice.v1 submission evidence
  -> deterministic system-derived review rating
  -> SRS card state
  -> objective proficiency interpreted by objective policy
```

Students should answer math problems. They should not self-select FSRS ratings.

## Sequencing

These tracks begin after Module 9 curriculum seed completion unless explicitly reprioritized.

1. **Daily Practice SRS Product Contract** - Define instructional language, objective policy, triage handling, and measurement semantics.
2. **Reusable SRS Core Library** - Build course-agnostic scheduler, rating, queue, and proficiency primitives behind replaceable adapters.
3. **Practice Timing Telemetry** - `conductor/tracks/practice-timing-telemetry_20260415/`
4. **Practice Item and Objective Blueprint Model** - Map stable practice problem families to objectives and policy metadata.
5. **Convex SRS Schema and Review Log** - Persist cards, reviews, sessions, due dates, and immutable evidence.
6. **Submission-to-SRS Rating Adapter** - Convert `practice.v1` correctness/process evidence into system-derived ratings.
7. **Practice Timing Baselines** - `conductor/tracks/practice-timing-baselines_20260415/`
8. **Daily Practice Queue Engine** - Queue required new period practice first, then overdue and due reviews.
9. **Student Daily Practice Experience** - Add the student flow for new practice, due review, completion, and progress language.
10. **Objective Proficiency Measurement** - Combine retention, coverage, fluency, confidence, and priority into student/teacher progress.
11. **Teacher SRS Dashboard and Interventions** - Add class health, overdue load, weak essential objectives, and misconception diagnostics.
12. **Cross-Course Extraction and Developer Docs** - Document reusable interfaces for future courses.

## Timing Design Notes

Timing is useful only after it is normalized by problem family. A correct 90-second response can mean different things for different objectives.

The system should track:

- Wall-clock time.
- Active working time.
- Idle time.
- Focus loss count.
- Hidden-tab count.
- Timing confidence.
- Part-level timing when a component can provide it.

The system should not:

- Use raw speed as a grade.
- Compare students on speed leaderboards.
- Penalize low-confidence timing.
- Let timing override correctness or misconception evidence.

## Objective Measurement Notes

Objective proficiency should be interpreted against an objective-specific policy:

- `essential`
- `supporting`
- `extension`
- `triaged`

Different objectives can intentionally require different amounts of evidence. A narrow objective may be complete with a small number of problem families. A broad or essential objective may require more varied evidence.
