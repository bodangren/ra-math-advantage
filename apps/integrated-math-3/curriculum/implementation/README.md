# Curriculum Implementation Artifacts

This directory contains generated planning artifacts that bridge the source curriculum to app implementation.

## Files

- `class-period-packages/module-*.json`: one package for each planned class period.
- `exceptions.json`: explicit source limitations and replacement plans.
- `audit/latest.json`: latest machine-readable curriculum audit report.

## Class-Period Package Schema

Instruction packages include `periodId`, `module`, `period`, `dayType`, `sourceLesson`, `objectiveCode`, `objective`, `workedExamples`, `aleksSrsPractice` or `srsSubstitute`, and six daily phases: `warmUp`, `conceptDevelopment`, `guidedPractice`, `independentPractice`, `assessment`, and `capReflection`.

Non-instruction packages include a `nonInstructionArtifact` object for `mastery`, `jigsaw`, `review`, or `test` day work.

## Validation

Run:

```bash
npm run curriculum:audit
```

The audit verifies curriculum counts, lesson source quality, ALEKS coverage documentation, package coverage, and class-period package coverage. Run `npm test` to validate the seeded runtime activities.

The class-period packages are teaching plans. They are not executable activity records. The lesson seeds define executable activities. The seed contract tests validate their props and section links.
