# Implementation Plan — Supporting Activity Components

## Phase 1: Comprehension Quiz

- [x] Task: Implement `comprehension-quiz` base component
    - [x] Write tests: renders multiple_choice, true_false, short_answer, select_all question types
    - [x] Write tests: teaching mode shows correct answers highlighted; read-only
    - [x] Implement `components/activities/quiz/ComprehensionQuiz.tsx` — teaching mode

- [x] Task: Add guided and practice modes to `ComprehensionQuiz`
    - [x] Write tests: guided — one-at-a-time; immediate feedback; one retry before reveal
    - [x] Write tests: practice — all shown; feedback only after batch submit
    - [x] Write tests: score computed correctly for all question types (including select_all partial credit)
    - [x] Implement guided and practice mode state machines

- [x] Task: Implement quiz submission envelope
    - [x] Write tests: envelope includes per-question answer, correctness, retry count, total score
    - [x] Implement `buildQuizSubmission()`; register in activity registry

- [x] Task: Conductor — Phase Completion Verification 'Comprehension Quiz' (Protocol in workflow.md)

## Phase 2: Fill-in-the-Blank

- [x] Task: Implement `fill-in-the-blank` base component
    - [x] Write tests: parses template string with `{{blank:id}}` markers; renders inline blanks
    - [x] Write tests: teaching mode shows blanks pre-filled as highlighted labels
    - [x] Implement `components/activities/blanks/FillInTheBlank.tsx` — teaching mode [8b325bc]

- [ ] Task: Add guided and practice modes to `FillInTheBlank`
    - [ ] Write tests: guided — immediate per-blank feedback on submit; incorrect blanks show correct answer
    - [ ] Write tests: practice — all blanks, feedback only after full submit
    - [ ] Write tests: `MathInputField` used for expression blanks; plain text for word blanks
    - [ ] Implement guided and practice modes

- [ ] Task: Implement optional word bank drag-and-drop
    - [ ] Write tests: word bank items drag into blanks; blank shows dragged term; can be cleared
    - [ ] Implement word bank panel using `@hello-pangea/dnd` (already in dependencies)

- [ ] Task: Implement fill-in submission envelope
    - [ ] Write tests: envelope includes per-blank answer, correctness, word bank usage flag
    - [ ] Implement `buildFillInSubmission()`; register in activity registry

- [ ] Task: Conductor — Phase Completion Verification 'Fill-in-the-Blank' (Protocol in workflow.md)

## Phase 3: Rate-of-Change Calculator

- [ ] Task: Implement `rate-of-change-calculator` teaching mode
    - [ ] Write tests: `from_equation` — formula shown, f(a) and f(b) computed and labeled
    - [ ] Write tests: `from_table` — table rows highlighted; formula applied
    - [ ] Write tests: `from_graph` — graph data shown; estimation and exact value labeled
    - [ ] Implement `components/activities/roc/RateOfChangeCalculator.tsx` — teaching mode

- [ ] Task: Add guided and practice modes
    - [ ] Write tests: guided — student identifies a, f(a), b, f(b) in sub-steps; each validated
    - [ ] Write tests: practice — student enters full calculation and final answer
    - [ ] Implement guided and practice modes; reuse `MathInputField` for value entry

- [ ] Task: Implement submission and register
    - [ ] Write tests: envelope includes identified values, step correctness, final answer
    - [ ] Register in activity registry

- [ ] Task: Conductor — Phase Completion Verification 'Rate-of-Change Calculator' (Protocol in workflow.md)

## Phase 4: Discriminant Analyzer

- [ ] Task: Implement `discriminant-analyzer` teaching mode
    - [ ] Write tests: renders equation → labeled a, b, c → formula → computed value → classification
    - [ ] Implement `components/activities/discriminant/DiscriminantAnalyzer.tsx` — teaching mode

- [ ] Task: Add guided and practice modes
    - [ ] Write tests: guided — stepped (identify → compute → classify); each sub-step validated
    - [ ] Write tests: practice — full computation; batch validated on submit
    - [ ] Implement guided and practice modes

- [ ] Task: Implement submission and register
    - [ ] Write tests: envelope includes coefficient identification, discriminant value, classification
    - [ ] Register in activity registry

- [ ] Task: Conductor — Phase Completion Verification 'Discriminant Analyzer' (Protocol in workflow.md)
