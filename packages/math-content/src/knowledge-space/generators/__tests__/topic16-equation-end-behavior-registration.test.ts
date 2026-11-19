import { describe, expect, it } from "vitest";

import {
  generateTopic16EquationEndBehavior,
  generateTopic16EquationEndBehaviorOutput,
  getGenerator,
  TOPIC16_EQUATION_END_BEHAVIOR_NODE_ID,
} from "../../index";
import type {
  Topic16EquationEndBehaviorAnswers,
  Topic16EquationEndBehaviorEnd,
  Topic16EquationEndBehaviorFunctionName,
  Topic16EquationEndBehaviorItem,
  Topic16EquationEndBehaviorItemId,
  Topic16EquationEndBehaviorPartId,
  Topic16EquationEndBehaviorVariant,
} from "../../index";

describe("Topic 1.6 equation end-behavior generator registration", () => {
  it("resolves the exact registry row and public generator exports", () => {
    const key = "topic16-equation-end-behavior";
    const generator = getGenerator(key);
    const variant: Topic16EquationEndBehaviorVariant = generateTopic16EquationEndBehavior(0);
    const output = generateTopic16EquationEndBehaviorOutput(0);
    const itemId: Topic16EquationEndBehaviorItemId = "a";
    const functionName: Topic16EquationEndBehaviorFunctionName = "f";
    const end: Topic16EquationEndBehaviorEnd = "down";
    const partId: Topic16EquationEndBehaviorPartId = "a_leftEnd";
    const item: Topic16EquationEndBehaviorItem = variant.items[0]!;
    const answers: Topic16EquationEndBehaviorAnswers =
      output.expectedAnswer as Topic16EquationEndBehaviorAnswers;

    expect(generator.key).toBe(key);
    expect(generator.nodeIds).toEqual([TOPIC16_EQUATION_END_BEHAVIOR_NODE_ID]);
    expect(
      generator.generate({ nodeId: TOPIC16_EQUATION_END_BEHAVIOR_NODE_ID, seed: 0, difficulty: 0 }),
    ).toEqual(output);
    expect(item.id).toBe(itemId);
    expect(item.functionName).toBe(functionName);
    expect(answers[partId]).toBe(end);
  });
});
