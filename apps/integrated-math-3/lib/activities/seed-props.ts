import { stepByStepSolverSchema } from "@math-platform/activity-components/schemas";

/** Converts stored lesson props to the current activity contract. */
export function normalizeSeedProps(
  componentKey: string,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const props = { ...source };
  if (componentKey === "comprehension-quiz" && Array.isArray(props.questions)) {
    props.questions = props.questions.map((value, index) => {
      const question = value as Record<string, unknown>;
      const { question: prompt, correctIndex, ...rest } = question;
      const options = question.options as string[] | undefined;
      return {
        ...rest,
        id: question.id ?? `q${index + 1}`,
        type: question.type ?? (options ? "multiple_choice" : "short_answer"),
        prompt: question.prompt ?? prompt,
        correctAnswer:
          question.correctAnswer ??
          (Number.isInteger(correctIndex) ? options?.[correctIndex as number] : undefined),
      };
    });
  }
  if (componentKey === "step-by-step-solver") {
    if (!props.equation && Array.isArray(props.equations)) {
      props.equation = props.equations.join("; ");
      delete props.equations;
    }
    const type =
      typeof props.problemType === "string" ? props.problemType.replaceAll("-", "_") : "expression";
    props.problemType = stepByStepSolverSchema.shape.problemType.safeParse(type).success
      ? type
      : "expression";
    if (Array.isArray(props.steps)) {
      props.steps = props.steps.map((value, index) => {
        const step = value as Record<string, unknown>;
        return {
          ...step,
          id: step.id ?? `step_${index}`,
          description: step.description ?? step.explanation ?? `Step ${index + 1}`,
        };
      });
    }
  }
  if (componentKey === "graphing-explorer") {
    const equations = props.equations ?? props.functions;
    if (Array.isArray(equations) && equations.length > 0) {
      props.equation ??= equations[0];
      if (equations.length > 1) {
        if (props.variant === "compare") {
          props.variant = "compare_functions";
          props.comparisonEquation = equations[1];
        } else {
          props.variant = "graph_system";
          props.linearEquation = equations[1];
        }
      }
      delete props.equations;
      delete props.functions;
      delete props.features;
    }
    if (props.variant === "explore" || props.variant === "rate_of_change") delete props.variant;
    if (props.variant === "find_zeros") props.variant = "find_intercepts";
    delete props.title;
  }
  return props;
}
