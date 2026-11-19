import { describe, expect, it } from "vitest";

import {
  generateTopic16LimitNotationEndBehavior,
  generateTopic16LimitNotationEndBehaviorOutput,
  getGenerator,
  TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID,
} from "../../index";
import type {
  Topic16LimitNotationEnd,
  Topic16LimitNotationAnswers,
  Topic16LimitNotationFunctionName,
  Topic16LimitNotationItem,
  Topic16LimitNotationItemId,
  Topic16LimitNotationPartId,
  Topic16LimitNotationVariant,
} from "../../index";

describe("Topic 1.6 limit-notation end-behavior generator registration", () => {
  it("resolves the exact registry row and public generator exports", () => {
    const key = "topic16-limit-notation-end-behavior";
    const generator = getGenerator(key);
    const variant: Topic16LimitNotationVariant = generateTopic16LimitNotationEndBehavior(0);
    const output = generateTopic16LimitNotationEndBehaviorOutput(0);
    const itemId: Topic16LimitNotationItemId = "a";
    const functionName: Topic16LimitNotationFunctionName = "f";
    const end: Topic16LimitNotationEnd = "negative_infinity";
    const partId: Topic16LimitNotationPartId = "a_leftLimit";
    const item: Topic16LimitNotationItem = variant.items[0]!;
    const answers: Topic16LimitNotationAnswers =
      output.expectedAnswer as Topic16LimitNotationAnswers;

    expect(generator.key).toBe(key);
    expect(generator.nodeIds).toEqual([TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID]);
    expect(
      generator.generate({
        nodeId: TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID,
        seed: 0,
        difficulty: 0,
      }),
    ).toEqual(output);
    expect(item.id).toBe(itemId);
    expect(item.functionName).toBe(functionName);
    expect(answers[partId]).toBe(end);
  });
});
