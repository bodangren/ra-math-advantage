// Test fixtures for skill inventory extraction parsers.
// Each fixture is a representative snippet from a curriculum source format.

// ---------------------------------------------------------------------------
// IM3 class-period plan (canonical example/objective source)
// ---------------------------------------------------------------------------

export const im3Module1ClassPeriodPlan = String.raw`
# Module 1 Class-Period Plan

## Period-by-Period Plan

| Period | Day Type | Source Textbook Lesson | Primary Objective | Worked Examples | Embedded Objectives | Notes |
|--------|----------|------------------------|-------------------|-----------------|---------------------|-------|
| 1 | ` + '`instruction`' + String.raw` | ` + '`1-1`' + String.raw` | ` + '`1a. Graph quadratic functions.`' + String.raw` | ` + '`1-1, Examples 1-3 — Graph Using a Table; Compare Quadratic Functions; Real-World Application (Modeling)`' + String.raw` | — | Graph from equation/table/context; key features and interpretation. |
| 2 | ` + '`instruction`' + String.raw` | ` + '`1-1`' + String.raw` | ` + '`1b. Find and interpret the average rate of change.`' + String.raw` | ` + '`1-1, Examples 4-6 — From an Equation; From a Table; From a Graph (Estimation + Algebra)`' + String.raw` | — | Average rate of change. |
| 3 | ` + '`mastery`' + String.raw` | — | — | — | — | Mastery cycle on ` + '`1a-1b`' + String.raw`. |
| 4 | ` + '`instruction`' + String.raw` | ` + '`1-2`' + String.raw` | ` + '`1c. Solve quadratic equations by graphing.`' + String.raw` | ` + '`1-2, Examples 1-3 — One Real Solution; Two Real Solutions; Estimate Roots`' + String.raw` | — | Reading exact and estimated roots from graphs. |
| 5 | ` + '`instruction`' + String.raw` | ` + '`1-2`' + String.raw` | ` + '`1d. Interpret solutions (roots) in context.`' + String.raw` | ` + '`1-2, Examples 4-5 — Solve by Using a Table; Solve by Using a Calculator`' + String.raw` | ` + '`1c`' + String.raw` | Interpreting approximate solutions. |
| 6 | ` + '`jigsaw`' + String.raw` | — | — | — | — | Math practices focus. |
| 7 | ` + '`instruction`' + String.raw` | ` + '`1-3`' + String.raw` | ` + '`1e. Understand and use the imaginary unit i.`' + String.raw` | ` + '`1-3, Examples 1-3 — Square Roots of Negative Numbers; Products of Pure Imaginary Numbers; Equation with Pure Imaginary Solutions`' + String.raw` | ` + '`1g`' + String.raw` | Introduces i, negative roots. |
| 8 | ` + '`instruction`' + String.raw` | ` + '`1-3`' + String.raw` | ` + '`1f. Perform operations with complex numbers.`' + String.raw` | ` + '`1-3, Examples 4-7 — Equate Complex Numbers; Add or Subtract Complex Numbers; Multiply Complex Numbers; Divide Complex Numbers`' + String.raw` | — | Full operations day. |
| 9 | ` + '`mastery`' + String.raw` | — | — | — | — | Mastery cycle. |
| 10 | ` + '`instruction`' + String.raw` | ` + '`1-4`' + String.raw` | ` + '`1h. Solve quadratic equations by factoring.`' + String.raw` | ` + '`1-4, Examples 1-4 — Factor by Using the Distributive Property; Factor a Trinomial; Solve an Equation by Factoring; Factor a Trinomial Where a Is Not 1`' + String.raw` | ` + '`1i`' + String.raw` | Standard-form setup. |
| 11 | ` + '`instruction`' + String.raw` | ` + '`1-4`' + String.raw` | ` + '`1j. Recognize special factor patterns.`' + String.raw` | ` + '`1-4, Examples 5-7 — Factor a Difference of Squares; Factor a Perfect Square Trinomial; Complex Solutions`' + String.raw` | — | Special-product factoring. |
| 12 | ` + '`review`' + String.raw` | — | — | — | — | Module 1 review. |
| 13 | ` + '`test`' + String.raw` | — | — | — | — | Module 1 assessment. |
`;

// ---------------------------------------------------------------------------
// IM3 module overview
// ---------------------------------------------------------------------------

export const im3Module1Overview = String.raw`
# Module 1: Quadratic Functions and Complex Numbers

## Overview

Students develop a deep understanding of quadratic relationships, multiple solution methods, and extend solutions into the complex number system. Emphasis is placed on connecting algebraic procedures with graphical meaning.

## Lessons

### 1-1 Graphing Quadratic Functions
Students analyze vertex form, standard form, and intercept form. Focus on transformations (translations, reflections, stretches) and identifying key features (vertex, axis of symmetry, intercepts).

### 1-2 Solving Quadratic Equations by Graphing
Students interpret x-intercepts as solutions and connect graphical solutions to real-world contexts.

### 1-3 Complex Numbers
Introduction to imaginary unit i, operations with complex numbers, and understanding why non-real solutions occur.

### 1-4 Solve Quadratic Equations by Factoring
Students factor trinomials and apply the zero product property.

## Skills Developed

- Strategic selection of solution methods
- Connecting representations
- Interpreting solutions in context
`;

// ---------------------------------------------------------------------------
// Module overview with ambiguous/combined headings
// ---------------------------------------------------------------------------

export const moduleWithCombinedHeadings = String.raw`
# Module 2: Polynomials and Polynomial Functions

## Overview

Students analyze polynomial functions, perform operations, and graph polynomial equations.

## Lessons

### 2-1 Polynomial Functions
Students explore power functions, end behavior, and symmetry.

### 2-2 Analyzing Graphs of Polynomial Functions
Students approximate zeros, find extrema, and use rate of change.

### 2-3 Operations with Polynomials
Students add, subtract, multiply, and apply polynomials in context.

### 2-4 Dividing Polynomials
Long division and synthetic division of polynomials.

### 2-5 Powers of Binomials
Pascal's Triangle and the Binomial Theorem for expansions.

## Skills Developed

- Analyzing end behavior and symmetry
- Polynomial arithmetic and division
- Binomial expansion strategies
`;

// ---------------------------------------------------------------------------
// ALEKS problem-type registry snippet
// ---------------------------------------------------------------------------

export const aleksRegistrySnippet = String.raw`
# ALEKS-Style Problem-Type Registry

## Registry

| familyKey | Module | Objectives | Source examples | Interaction shape | Status | Notes |
|---|---|---|---|---|---|---|
| ` + '`quadratic_graph_analysis`' + String.raw` | 1 | ` + '`1a`' + String.raw` | ` + '`1-1, Examples 1-3`' + String.raw` | graphing explorer + feature table | component-planned | Covers graphing from table, equation, comparison. |
| ` + '`average_rate_of_change`' + String.raw` | 1 | ` + '`1b`' + String.raw` | ` + '`1-1, Examples 4-6`' + String.raw` | step-by-step solver + table/graph readout | component-planned | Must support equation, table, graph inputs. |
| ` + '`solve_quadratic_by_graphing`' + String.raw` | 1 | ` + '`1c`' + String.raw`, ` + '`1d`' + String.raw` | ` + '`1-2, Examples 1-5`' + String.raw` | graphing explorer | component-planned | Exact roots, estimated roots, table/calculator. |
| ` + '`complex_number_operations`' + String.raw` | 1 | ` + '`1f`' + String.raw` | ` + '`1-3, Examples 4-7`' + String.raw` | step-by-step solver | component-planned | Equate, add/subtract, multiply, divide. |
| ` + '`quadratic_factoring`' + String.raw` | 1 | ` + '`1h`' + String.raw`, ` + '`1i`' + String.raw` | ` + '`1-4, Examples 1-4`' + String.raw` | step-by-step solver | component-planned | GCF, trinomial, a != 1, ZPP. |
`;

// ---------------------------------------------------------------------------
// IM3 Reveal source textbook (snippet of lesson with examples)
// ---------------------------------------------------------------------------

export const revealLessonSnippet = String.raw`
## Lesson 1-1

### Today's Goals

- Graph quadratic functions by using a table.
- Compare graphs of quadratic functions.
- Solve real-world problems by graphing quadratic functions.

### Today's Vocabulary

**vertex form** — A quadratic function written in the form ` + '`f(x) = a(x - h)^2 + k`' + String.raw`, where ` + '`(h, k)`' + String.raw` is the vertex.

### Learn Graphing Quadratic Functions

...

### Example 1 — Graph Using a Table

Graph ` + '`f(x) = x^2 + 2x - 3`' + String.raw` by making a table of values.

First, find the axis of symmetry: ` + '`x = -b / (2a) = -2 / 2 = -1`' + String.raw`

### Example 2 — Compare Quadratic Functions

Compare the graphs of ` + '`f(x) = x^2`' + String.raw` and ` + '`g(x) = 3x^2`' + String.raw`.

### Example 3 — Real-World Application (Modeling)

A soccer ball is kicked and its height in feet after ` + '`t`' + String.raw` seconds is given by ` + '`h(t) = -16t^2 + 48t`' + String.raw`. Find the maximum height.

## Lesson 1-2

### Today's Goals

- Solve quadratic equations by graphing.

### Example 1 — One Real Solution

Solve ` + '`x^2 + 4x + 4 = 0`' + String.raw` by graphing.

### Example 2 — Two Real Solutions

Solve ` + '`x^2 - 2x - 3 = 0`' + String.raw` by graphing.
`;

// ---------------------------------------------------------------------------
// PreCalculus lesson format (different structure)
// ---------------------------------------------------------------------------

export const precalcLessonContent = String.raw`
# Lesson 2-1 — Change in Arithmetic and Geometric Sequences
Unit: 2
Topic: 2.1
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider the sequences:
- Sequence A: 2, 5, 8, 11, 14, ...
- Sequence B: 2, 6, 18, 54, 162, ...

### Section: question

How do these sequences change from term to term?

## Vocabulary

### Section: text

A sequence in which the difference between consecutive terms is constant is called an **arithmetic sequence**. The constant difference is the **common difference**, ` + '`d`' + String.raw`.

### Section: text

A sequence in which the ratio between consecutive terms is constant is called a **geometric sequence**. The constant ratio is the **common ratio**, ` + '`r`' + String.raw`.

## Learn

### Section: text

**Arithmetic Sequence Formula:**
` + '`a_n = a_1 + (n - 1)d`' + String.raw`

**Geometric Sequence Formula:**
` + '`a_n = a_1 * r^(n - 1)`' + String.raw`

## Worked Example

### Section: text

**Example 1:** Find the 10th term of the arithmetic sequence 4, 9, 14, 19, ...

**Solution:** ` + '`a_10 = 4 + (10 - 1)(5) = 4 + 45 = 49`' + String.raw`

### Section: text

**Example 2:** Find the 8th term of the geometric sequence 3, 6, 12, 24, ...

**Solution:** ` + '`a_8 = 3 * 2^(8 - 1) = 3 * 128 = 384`' + String.raw`
`;

// ---------------------------------------------------------------------------
// Edge cases: module with no examples, malformed table rows
// ---------------------------------------------------------------------------

export const emptyWorkedExamples = String.raw`
## Period-by-Period Plan

| Period | Day Type | Source Textbook Lesson | Primary Objective | Worked Examples | Embedded Objectives | Notes |
|--------|----------|------------------------|-------------------|-----------------|---------------------|-------|
| 1 | ` + '`instruction`' + String.raw` | ` + '`1-1`' + String.raw` | ` + '`1a. Intro to functions.`' + String.raw` | — | — | This lesson has no named examples. |
| 2 | ` + '`instruction`' + String.raw` | ` + '`1-2`' + String.raw` | ` + '`1b. Evaluate functions.`' + String.raw` | ` + '`1-2, Examples 1-2`' + String.raw` | — | Has examples. |
`;

// ---------------------------------------------------------------------------
// Duplicate lesson from two plan files
// ---------------------------------------------------------------------------

export const duplicateLessonPlan = String.raw`
## Period-by-Period Plan

| Period | Day Type | Source Textbook Lesson | Primary Objective | Worked Examples | Embedded Objectives | Notes |
|--------|----------|------------------------|-------------------|-----------------|---------------------|-------|
| 1 | ` + '`instruction`' + String.raw` | ` + '`1-1`' + String.raw` | ` + '`1a. Graph quadratic functions.`' + String.raw` | ` + '`1-1, Examples 1-3`' + String.raw` | — | First plan file. |
`;

export const duplicateLessonPlan2 = String.raw`
## Period-by-Period Plan

| Period | Day Type | Source Textbook Lesson | Primary Objective | Worked Examples | Embedded Objectives | Notes |
|--------|----------|------------------------|-------------------|-----------------|---------------------|-------|
| 1 | ` + '`instruction`' + String.raw` | ` + '`1-1`' + String.raw` | ` + '`1a. Graph quadratic functions (alternate).`' + String.raw` | ` + '`1-1, Examples 4-5`' + String.raw` | — | Second plan file, same lesson. |
`;
