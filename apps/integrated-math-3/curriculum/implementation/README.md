# Curriculum Implementation Artifacts

This directory contains generated planning artifacts that bridge the source curriculum to app implementation.

## Files

- `class-period-packages/module-*.json`: one package for each planned class period.
- `practice-v1/activity-map.json`: activity candidates mapped to the `practice.v1` contract.
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

The audit verifies curriculum counts, lesson source quality, ALEKS coverage documentation, package coverage, and `practice.v1` mapping coverage.
