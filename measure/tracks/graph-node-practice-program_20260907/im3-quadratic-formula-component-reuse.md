# IM3 quadratic-formula component reuse review

## Decision

Create one small `QuadraticFormulaActivity` in the shared activity package. Reuse `MathInputField`, the `practice.v1` envelope builder, and the submission-lock pattern from `IntervalClassificationActivity`.

Do not adapt `StepByStepper`, `DiscriminantAnalyzer`, or `FillInTheBlank` as the full activity. Each one exposes or computes answer authority in the browser.

## Existing component findings

### `MathInputField`

Path: `packages/activity-components/src/components/algebraic/MathInputField.tsx`.

This is the best direct UI reuse. It provides a native text input, a visible label, `aria-label`, `required`, disabled state, an error message with `role="alert"`, and a KaTeX preview. It works with keyboard text entry.

Use it without `correctAnswer` and without `showValidation`. Its local string comparison is not suitable for quadratic roots. The server must grade the answer.

The component is already exported from `packages/activity-components/src/components/algebraic/index.ts` and the package root.

### `IntervalClassificationActivity`

Path: `packages/activity-components/src/components/intervals/IntervalClassificationActivity.tsx`.

Reuse its interaction pattern:

- one controlled value per part;
- one hint counter per part;
- one reveal counter per part;
- one change counter per part;
- an immediate `lockedRef` guard;
- a visible locked state;
- no blank submission;
- an asynchronous `onSubmit` callback;
- a retry error with `role="alert"`;
- one `practice.v1` part for each public answer field.

Do not reuse its answer derivation. It derives reveal answers from public graph data. A quadratic-formula activity must not derive or receive future roots in Independent public props.

### `FillInTheBlank`

Paths:

- `packages/activity-components/src/components/blanks/FillInTheBlank.tsx`
- `packages/math-content/src/schemas/fill-in-the-blank.schema.ts`

This component already emits named parts and omits client correctness fields in practice mode. It also has labeled math inputs, Guided hint and reveal controls, a live region, and asynchronous submit handling.

It is not safe as the direct quadratic-formula activity. Its blank props can contain `correctAnswer` and `acceptedAnswers`. Guided mode compares answers in the browser. Teaching mode renders `correctAnswer`. Its current blank gate accepts a whitespace string because it checks only for `undefined`. Its retry unlocks the activity after an error. This permits edits to the failed attempt body. It also uses client correctness and score fields in Guided mode.

Reuse only its accessible labels, KaTeX input, and envelope shape concepts.

### `DiscriminantAnalyzer`

Paths:

- `packages/activity-components/src/components/discriminant/DiscriminantAnalyzer.tsx`
- `packages/activity-components/src/components/discriminant/DiscriminantAnalyzerActivity.tsx`

Do not extend this component for the root fields. It computes the discriminant and root classification in the browser. It includes `correctDiscriminant`, `correctClassification`, client `isCorrect`, and a client score in its callback. It also reveals the correct values after submission. The direct inputs have visible labels, but the labels do not use `htmlFor`. The component has no strict request retry contract.

### `StepByStepSolverActivity`

Paths:

- `packages/activity-components/src/components/algebraic/StepByStepSolverActivity.tsx`
- `packages/activity-components/src/components/algebraic/StepByStepper.tsx`
- `apps/integrated-math-3/components/activities/algebraic/StepByStepSolverActivity.tsx`

Do not use this component for scored Guided or Independent responses. It receives the full correct step sequence. It validates steps in the browser. Its submitted part IDs are step indexes instead of `discriminant`, `x1`, and `x2`. The shared and app wrappers also use different part ID separators.

It can remain a Worked display until a source-faithful Worked presentation replaces it.

## Minimum public props

Add a strict shared schema for a quadratic-formula activity. Keep answer data outside the schema.

The minimum public props are:

```ts
{
  title?: string;
  prompt: string;
  equation: string;
  fieldHelp?: Partial<Record<"discriminant" | "x1" | "x2", string>>;
  workedSteps?: Array<{ description: string; expression?: string }>;
}
```

Apply these rules:

- Allow `workedSteps` only in teaching mode.
- Do not send `expectedAnswer`, `partAnswers`, accepted answers, solution roots, or future solution steps to Guided or Independent mode.
- Always show `discriminant`, `x1`, and `x2`. Do not expose a canonical root count. A one-field repeated-root variant would reveal that the discriminant is zero.
- The learner enters each distinct root once. The learner can leave `x2` blank for a repeated root. The server decides whether that blank value is valid for the server-owned variant.
- If the server needs a regime label, keep it server-owned unless the prompt itself gives that information.
- Keep the generated seed and canonical grading data in the server-owned attempt record.

A shared mode-specific union is safer than one object with optional secret fields. The schema can reject `workedSteps` for Guided and Independent props.

## Minimum component wiring

Add these paths:

- `packages/math-content/src/schemas/quadratic-formula-activity.schema.ts`
- `packages/math-content/src/schemas/index.ts`
- `packages/activity-components/src/components/algebraic/QuadraticFormulaActivity.tsx`
- `packages/activity-components/src/components/algebraic/index.ts`
- `packages/activity-components/src/index.ts`
- `apps/integrated-math-3/lib/activities/registry.ts`

Use the existing app `ActivityRenderer`. It already passes `activityId`, `mode`, `onSubmit`, `onComplete`, and public activity props. No new app wrapper is necessary if the shared component implements that callback shape.

The component behavior must be:

- Worked: show the prompt, equation, and source-faithful steps. Do not submit a grade.
- Guided: show `discriminant`, `x1`, and `x2` fields. Show a field hint only after the learner selects its hint control. A reveal must come from a reviewed server response. Do not put the revealed value in initial props.
- Independent: show the same answer fields without solution data. Submit raw answers only.

Build the envelope with `buildPracticeSubmissionEnvelope`. Use exact part IDs `discriminant`, `x1`, and `x2` for every generated variant. Include `hintsUsed`, `revealStepsSeen`, and `changedCount`. Do not include `isCorrect`, `score`, or `maxScore` from the client.

Use `onSubmit?: (payload: unknown) => void | Promise<void>`. Call `onComplete` only after the promise resolves.

Freeze the first submitted answers and telemetry in a ref before the asynchronous call. Keep the same frozen envelope after an ambiguous failure. Let the parent retry that exact envelope and idempotency key. Do not unlock inputs after the failure. A new activity identity or remount starts a new attempt.

## Keyboard and accessibility requirements

Use a `<form>` with `onSubmit`. This lets Enter submit from a text field. Give all non-submit controls `type="button"`.

Use one stable `useId` prefix. Give each input a unique `id`. Connect each visible `<label>` with `htmlFor`. `MathInputField` already does this, but the caller must give each field a stable and unique label.

Use these visible labels:

- `Discriminant`
- `First root`
- `Second root`

Use `aria-describedby` for field help and errors. Add `aria-live="polite"` for hint and save-state updates. Keep submission errors in `role="alert"`. Move focus to the first invalid field after a blank submit attempt. Preserve normal Tab order.

Require a nonblank `discriminant` and `x1`. Allow `x2` to be blank. The server validates whether a blank second root is correct for the server-owned variant. Disable submission while a request is pending or the attempt is locked. Use an immediate ref guard to prevent a same-event double submission or a same-event answer change.

The KaTeX preview needs a safe failure state for malformed learner text. A preview error must not remove the native input or block correction.

## Test gaps

Add shared component tests before implementation. They must prove:

- Worked mode renders the supplied source steps and no answer fields.
- Guided and Independent props contain no answer or future-step keys.
- The same three fields appear for every generated variant. No public prop reveals the canonical root count.
- Each input has a visible associated label.
- Tab reaches all inputs and controls in order.
- Enter submits the form once.
- Whitespace in `discriminant` or `x1` causes no callback and keeps the attempt editable. A blank `x2` reaches the server as a raw answer for repeated-root validation.
- The envelope uses only `discriminant`, `x1`, and `x2` parts for every variant.
- The envelope has no client correctness or score fields.
- A hint changes only its field counter.
- Independent mode shows no answer before submission.
- A reveal is absent until an explicit reviewed response supplies it.
- A synchronous double click produces one callback.
- An ambiguous failure keeps the exact frozen answers and counters.
- A parent retry uses the same envelope and key.
- A remount with a new activity ID starts empty fields and zero counters.
- All interactive controls pass the existing accessibility test setup.

Add an app registry test. It must prove that `quadratic-formula` resolves to the shared component and that the existing `ActivityRenderer` forwards the callback shape.

## Scope boundary

This component work does not define symbolic equivalence, attempt storage, server grading, receipt persistence, exact-node evidence, graph approval, or queue activation. The server contract review owns those items. The component must use that generalized contract when it is ready. It must not create a separate client grading or pilot path.
