# Integrated Math 2 curriculum

The source inventory has 13 modules and 96 lessons.

## Content sources

- `modules/module-N-lesson-L` contains the lesson source. Some sources use an `index.md` file inside that directory.
- `questions.json` contains one scored checkpoint for each lesson. This is not the complete practice bank.
- `units.json` contains public module titles and descriptions.
- `source/` contains extracted problem-type documents.
- Original lesson worksheets provide the figures and problem statements. Published local assets are in `public/curriculum/`.

## Course plan

`calendar.json` contains 180 periods. It covers all 96 lessons. The budget has 108 instruction periods, 36 mastery periods, 18 group-work periods, nine review periods, and nine test periods. The nine assessment blocks are defined in `course-spec.md`.

`implementation/class-period-packages/unit-N.json` and `module-N-class-period-plan.md` provide module views of that calendar. The old individual period files have been removed.

The lesson runtime and the period plan are distinct. The current runtime delivers a lesson through ordered phases and a scored checkpoint. Full daily practice, mastery, spaced practice, group-work evidence, and secure assessment authoring remain open in the correction track. Do not treat planning entries as implemented activities.

## Build and verify

Run from the app directory:

```sh
npm run curriculum:build
npm run curriculum:check
npm run curriculum:audit
```

The build reads the lesson sources and creates `lessons.json`. It then creates the calendar and module plans. The check command fails if a generated output is stale. The audit command tests the current files. Historical audit JSON files are not proof that the current curriculum passes.

## Knowledge graph

The graph inventories contain all 96 lessons. Work on atomic skills, standards, prerequisites, practice blueprints, and projections continues in `measure/tracks/im2-complete-review_20260907/fix-plan.md` at the repository root.

## Source limitations

- One source PDF uses `PRoblem` in its filename.
- One source PDF uses the range `12-15 to 12-10` in its filename.
- Some diagrams require the original worksheet for complete interpretation.
- Legacy mathematical notation and worked-example completeness still require review.

Keep exact source filenames when you cite these documents. Do not use a filename anomaly as a lesson identifier.
