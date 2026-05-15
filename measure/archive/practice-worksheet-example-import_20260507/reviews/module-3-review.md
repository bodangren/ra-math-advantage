# Module 3 Curriculum Review Report

**Reviewer:** Kimi Code CLI  
**Date:** 2026-05-07  
**Scope:** `apps/integrated-math-1/curriculum/modules/module-3-lesson-{1..6}`

---

## Summary

| File | Status | Issues Found | Action Taken |
|------|--------|--------------|--------------|
| `module-3-lesson-1` | **PASS** | 0 | None |
| `module-3-lesson-2` | **PASS** | 1 (vocabulary casing) | Fixed |
| `module-3-lesson-3` | **PASS** | 0 | None |
| `module-3-lesson-4` | **PASS** | 2 (vocabulary casing, LaTeX syntax) | Fixed |
| `module-3-lesson-5` | **PASS** | 0 | None |
| `module-3-lesson-6` | **PASS** | 2 (vocabulary casing, math delimiter consistency) | Fixed |

**Overall Module Assessment: PASS**

---

## Lesson 3-1 — Representing Relations

**Result: PASS**

- **Template compliance:** All required sections present (header, source, goals, vocabulary, 5 examples, mixed exercises, review notes).
- **Math delimiters:** All mathematical expressions use `[` and `]` consistently. No bare `$`, `\(`, or `\)` found.
- **Source reference:** `Int1_0301_practice.docx` — correct lesson number and filename pattern.
- **Content quality:** Examples describe objectives and processes procedurally, not as verbatim transcriptions.
- **Cross-lesson consistency:** Vocabulary terms use Title Case, matching the module standard (lessons 3-1 and 3-5).

**No issues found.**

---

## Lesson 3-2 — Functions

**Result: PASS (after fix)**

- **Template compliance:** All required sections present (header, source, goals, vocabulary, 4 examples, mixed exercises, review notes).
- **Math delimiters:** All mathematical expressions use `[` and `]` delimiters.
- **Source reference:** `Int1_0302_practice.docx` — correct.
- **Content quality:** Examples are procedural and pedagogical. Good progression from relations (3-1) to functions.

**Issue found & fixed:**
- **Vocabulary casing inconsistency:** All six vocabulary terms were lowercase (`function`, `relation`, `domain`, `range`, `function notation`, `mapping`), while Lessons 3-1 and 3-5 use Title Case.
  - **Fix:** Capitalized all vocabulary terms to match module standard.

---

## Lesson 3-3 — Linearity and Continuity of Graphs

**Result: PASS**

- **Template compliance:** All required sections present (header, source, goals, vocabulary, 5 examples, mixed exercises, review notes).
- **Math delimiters:** All math properly bracketed. LaTeX expressions (`\frac`, `\Delta`, etc.) are correctly nested inside `[` `]`.
- **Source reference:** `Int1_0303_practice.docx` — correct.
- **Content quality:** Examples clearly describe the classification process for discrete/continuous and linear/nonlinear functions.
- **Cross-lesson consistency:** Vocabulary already uses Title Case (`Discrete function`, `Continuous function`, etc.).

**No issues found.**

---

## Lesson 3-4 — Intercepts of Graphs

**Result: PASS (after fixes)**

- **Template compliance:** All required sections present (header, source, goals, vocabulary, 8 grouped examples, mixed exercises, review notes).
- **Math delimiters:** All math properly bracketed.
- **Source reference:** `Int1_0304_practice.docx` — correct.
- **Content quality:** Good progression from estimating intercepts graphically to solving equations by graphing and interpreting zeros in context.

**Issues found & fixed:**
1. **Vocabulary casing inconsistency:** `zero of a function`, `positive function`, and `negative function` were lowercase.
   - **Fix:** Capitalized to `Zero of a function`, `Positive function`, `Negative function`.
2. **LaTeX syntax error:** In the Example 4 interpretation block, `\text{Starting debt} = \(1950` used `\(` inside an existing math block, which is invalid nested math-mode syntax.
   - **Fix:** Replaced `\(1950` with `\$1950` to render a dollar sign correctly in LaTeX math mode.

---

## Lesson 3-5 — Shapes of Graphs

**Result: PASS**

- **Template compliance:** All required sections present (header, source, goals, vocabulary, 7 examples, mixed exercises, review notes).
- **Math delimiters:** All math properly bracketed. Limit notation (`x \to +\infty`, `f(x) \to +\infty`) is correctly enclosed.
- **Source reference:** `Int1_0305_practice.docx` — correct.
- **Content quality:** Examples are well-structured, moving from symmetry → intervals → extrema → end behavior. Good synthesis lesson.
- **Cross-lesson consistency:** Vocabulary uses Title Case, matching the module standard.

**No issues found.**

---

## Lesson 3-6 — Sketching Graphs and Comparing Functions

**Result: PASS (after fixes)**

- **Template compliance:** All required sections present (header, source, goals, vocabulary, 4 examples, mixed exercises, review notes).
- **Math delimiters:** All major expressions properly bracketed.
- **Source reference:** `Int1_0306_practice.docx` — correct.
- **Content quality:** Strong capstone lesson that integrates intercepts, extrema, intervals, end behavior, and symmetry. Business context (revenue/cost/profit) adds real-world relevance.

**Issues found & fixed:**
1. **Vocabulary casing inconsistency:** All 14 vocabulary terms were lowercase.
   - **Fix:** Capitalized all terms (e.g., `x-intercept` → `[ x ]-intercept`, `linear function` → `Linear function`, `break-even point` → `Break-even point`).
2. **Math delimiter inconsistency:** Unlike Lesson 3-4 (which uses `[ x ]-intercept` and `[ y ]-intercept`), Lesson 3-6 used bare `x-intercept`, `y-intercept`, `x-axis`, and `y-axis` in vocabulary definitions and body text.
   - **Fix:** Wrapped variable references in brackets throughout vocabulary and body text:
     - `x-intercept` → `[ x ]-intercept`
     - `y-intercept` → `[ y ]-intercept`
     - `x-axis` → `[ x ]-axis`
     - `y-axis` → `[ y ]-axis`
     - Updated body occurrences in Example 1, Example 3, and Mixed Exercises.

---

## Cross-Lesson Consistency

| Aspect | Assessment |
|--------|------------|
| **Vocabulary casing** | Fixed. All lessons now use Title Case for vocabulary terms. |
| **Math delimiters** | Fixed. Lesson 3-6 now brackets `x` and `y` in intercept/axis terms, consistent with Lesson 3-4. |
| **Definition alignment** | Domain, range, relation, and mapping definitions are consistent in substance across lessons where they reappear. Lesson 3-2 appropriately narrows the mapping definition for the function context. |
| **Example numbering** | Acceptable. Grouped examples (e.g., "Examples 1 and 2") in Lesson 3-4 reflect the source worksheet structure and are pedagogically sound. |

## Lesson Progression

The module flows logically:

1. **3-1 Representing Relations** — foundational: ordered pairs, tables, graphs, mappings, domain/range.
2. **3-2 Functions** — builds on relations: function definition, vertical line test, function notation, evaluation.
3. **3-3 Linearity and Continuity** — classifies functions: discrete vs. continuous, linear vs. nonlinear.
4. **3-4 Intercepts of Graphs** — focuses on specific points: intercepts, zeros, solving by graphing.
5. **3-5 Shapes of Graphs** — analyzes global behavior: symmetry, increasing/decreasing intervals, extrema, end behavior.
6. **3-6 Sketching and Comparing** — capstone: synthesizes all features to sketch, compare, and model real-world situations.

**Progression assessment: Strong.** Each lesson builds prerequisite knowledge for the next.

---

## Remaining Notes (Non-blocking)

The following items are documented in each file's **Review Notes** section and are expected to be addressed during image/content extraction, not as curriculum-file defects:

- **Lesson 3-1:** Problems 4–6, 15, 18–26 reference graphs, tables, and mapping diagrams that require human review of original worksheet images.
- **Lesson 3-2:** Problems 1–6, 11–13, 32 include graphs, mappings, and diagrams that require image review.
- **Lesson 3-3:** Problems 1–33 include 23 graph images and 3 table images that must be reviewed and converted.
- **Lesson 3-4:** Problems 1–13 and 22–24 reference graph/table images. Problem 20 has a known name inconsistency (`Moesha and Keyon` vs. `Shelby and Dylan`) flagged for verification.
- **Lesson 3-5:** All problem sets (1–25) reference graph images requiring visual review.
- **Lesson 3-6:** 8 worksheet images (`media/image1.png` through `media/image8.png`) require verification against text descriptions.

---

*Review complete. All identified issues have been fixed directly in the source files.*
