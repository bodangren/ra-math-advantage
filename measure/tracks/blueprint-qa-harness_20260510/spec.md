# Architectural Specification: Blueprint QA & Authoring Harness

## Objective
Build a developer-only React harness in `apps/bus-math-v2` that allows curriculum authors and engineers to iteratively test the `knowledge-space-practice` generator-to-renderer pipeline without needing Convex backend seeds.

## 1. State Management & Data Layer
- **File:** `apps/bus-math-v2/app/(dev)/blueprint-qa/page.tsx`
- **Data Fetching:** Must use a Node.js Server Action (`fs.readFileSync`) to load `apps/integrated-math-3/curriculum/skill-graph/nodes.json` and `blueprints.json`. Do not fetch over HTTP to avoid CORS/build issues.
- **State (Zustand or React `useReducer`):**
  ```typescript
  interface HarnessState {
    selectedNodeId: string | null;
    seed: number;
    difficulty: number; // 0.1 to 1.0
    mode: 'worked_example' | 'guided_practice' | 'independent_practice';
    generatorOutput: GeneratorOutput | null;
    generatorError: string | null;
    lastSubmission: { raw: unknown; graded: GenericEvidenceResult } | null;
  }
  ```

## 2. Generator Execution Engine
- **File:** `apps/bus-math-v2/app/(dev)/blueprint-qa/components/ExecutionEngine.tsx`
- **Execution:** When `seed`, `difficulty`, or `selectedNodeId` change, query the `@advantage/knowledge-space-practice` Master Registry for the `generatorKey`.
- **Error Boundary:** Generators will fail during development. Wrap the `.generate()` call in a `try/catch`. If caught, set `generatorError` and display the stack trace in a red `<pre>` block.
- **Output:** Render the `GeneratorOutput` in a syntax-highlighted JSON viewer (use `react-json-view` or equivalent).

## 3. Dynamic Renderer Mocking Context
- **File:** `apps/bus-math-v2/app/(dev)/blueprint-qa/components/HarnessSubmissionProvider.tsx`
- To mount production components (e.g., `graphing-explorer`) without crashing, we must mock the `PracticeSubmissionContext`.
- **Implementation Design:**
  ```tsx
  export const HarnessSubmissionProvider = ({ children, gradingMetadata, onIntercept }) => {
    const mockContext = {
      submit: async (partId, rawAnswer) => {
        // Intercept the answer
        const isCorrect = gradeAnswerLocally(rawAnswer, gradingMetadata.partAnswers[partId]);
        onIntercept({ partId, rawAnswer, isCorrect });
        return { success: true };
      },
      isSubmitting: false,
      // ... stub other context properties
    };
    return <PracticeSubmissionContext.Provider value={mockContext}>{children}</PracticeSubmissionContext.Provider>;
  }
  ```

## 4. Dynamic Component Loader
- **File:** `apps/bus-math-v2/app/(dev)/blueprint-qa/components/RendererPreview.tsx`
- Use the shared `ComponentRegistry` from `packages/activity-components`.
- If `rendererKey` does not exist in the registry, render a fallback: `<div className="border border-red-500 p-4">Component {rendererKey} not registered.</div>`.