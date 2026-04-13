# Specification — Reconcile Activity Schemas with Component Props

## Overview

Align Zod schemas for `comprehension-quiz` and `fill-in-the-blank` with actual component props. The schemas are currently disconnected dead code that blocks curriculum content authoring.

## Problem Statement

The schemas define a different API than what the components actually use:

### ComprehensionQuiz
**Schema** (`comprehension-quiz.schema.ts`):
- `text: z.string()` — question text field
- `choices: z.record(z.string(), z.array(z.string()))` — question ID → choice array
- `correctAnswers: z.record(z.string(), z.number())` — question ID → numeric index
- Types: `multiple_choice`, `true_false`, `short_answer` (missing `select_all`)

**Component** (`ComprehensionQuiz.tsx`):
- `prompt: string` — question text field
- `options?: string[]` — inline choices per question
- `correctAnswer: string | string[]` — actual answer string(s)
- Types: `multiple_choice`, `true_false`, `short_answer`, `select_all`

### FillInTheBlank
**Schema** (`fill-in-the-blank.schema.ts`):
- Template uses `___` markers
- `blanks: z.array({id, position, length, hint})` — positional blank info
- `answers: z.record(z.string(), z.array(z.string()))` — ID → array of acceptable answers

**Component** (`FillInTheBlank.tsx`):
- Template uses `{{blank:id}}` markers
- `blanks: {id, correctAnswer, isMath}[]` — inline blank definitions
- `answers: Record<string, string>` — single answer per blank

## Approach

Write new schemas that match the actual component props. The components are correct; schemas are wrong. Update schemas to match components.

### Phase 1: ComprehensionQuiz Schema Reconciliation

1. Rewrite `comprehensionQuizSchema` to match component `Question` interface:
   - `prompt` (not `text`)
   - `options` (inline, not record)
   - `correctAnswer: string | string[]` (not numeric index)
   - Add `select_all` type support

2. Update tests to use new schema structure

### Phase 2: FillInTheBlank Schema Reconciliation

1. Rewrite `fillInTheBlankSchema` to match component `Blank` interface:
   - `{{blank:id}}` markers in template (not `___`)
   - `blanks: {id, correctAnswer, isMath}[]` (not positional array)
   - `answers: Record<string, string>` (not array)

2. Update tests to use new schema structure

## Acceptance Criteria

1. `comprehensionQuizSchema` validates props matching `ComprehensionQuiz` component props
2. `fillInTheBlankSchema` validates props matching `FillInTheBlank` component props
3. All existing tests pass (after updating test fixtures to match new schema structure)
4. Schema types can be used directly as component prop types with minimal casting
5. Registry `getSchemaProps('comprehension-quiz')` and `getSchemaProps('fill-in-the-blank')` return schemas that validate real component data