# G50 Lesson 9-7 graph independent review

## Verdict

Accept the corrected frozen candidate.

## Verified scope

- The graph adds exactly 17 draft, inactive capability atoms.
- `.023`, `.024`, and `.025` preserve printed Examples 1, 2, and 3.
- `.025` is unique. It has matching `appears_in_context` and lesson `contains` edges.
- The broad table-construction blueprint and applicable new blueprints bind exact source examples.
- `.023` binds broad table construction, joint-frequency reading, marginal-frequency reading, and named-frequency difference.
- `.024` binds overall relative-frequency table construction, overall joint relative frequency, and joint-or-marginal interpretation.
- `.025` binds conditional relative frequency, conditional table construction, conditional interpretation, and reversed-condition comparison.
- Mixed Exercise-only capabilities keep empty `sourceNodeIds` arrays.
- The broad approved table skill remains approved. Its empty executable specifications and placeholder activity are removed.
- Problem 33 keeps the rounded-percentage ambiguity. It requires separate observed conversion work before table-construction evidence.
- Problems 1-4 and 13-16 keep accepted-table stage boundaries.
- Problem 36 reuses broad table construction. Its new atom is limited to a related question and consistent solution.
- Conditional rows state the condition and denominator direction.
- Edge `1277` is absent from both edge catalogs and its review row. Both SRS projections remove its table-to-geometry prerequisite residue.
- The graph does not add an approval, readiness, equivalence, or unsupported prerequisite claim.
- The derived catalogs use the corrected total of 2,622 edges. The other reported derived counts are internally consistent.

The older `1276` projection residue is outside this G50 patch. The separate G52 audit owns that repair.

## Focused verification

Command:

`npm run test -- --run __tests__/curriculum/lesson-9-7-capabilities-source.test.ts __tests__/curriculum/lesson-9-7-source.test.ts`

Result: 2 files passed. All 10 tests passed.
