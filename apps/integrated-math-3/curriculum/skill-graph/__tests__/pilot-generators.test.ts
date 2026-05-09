import { describe, it, expect } from 'vitest';
import { getGenerator, GENERATOR_KEYS } from '@math-platform/math-content/knowledge-space';
import type { GeneratorInput, GeneratorOutput } from '@math-platform/knowledge-space-practice';
import { validateGeneratorOutput, generatorOutputSchema } from '@math-platform/knowledge-space-practice';

const PILOT_GENERATORS = [
  { key: 'quadratic-graph-analysis', nodeId: 'math.im3.skill.1.1.graph-quadratic-functions' },
  { key: 'average-rate-of-change', nodeId: 'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change' },
  { key: 'solve-quadratic-by-graphing', nodeId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing' },
] as const;

describe('Module 1 Generators', () => {
  for (const { key, nodeId } of PILOT_GENERATORS) {
    describe(`Generator: ${key}`, () => {
      it('produces deterministic output for seed=42', () => {
        const generator = getGenerator(key);
        const input: GeneratorInput = { nodeId, seed: 42, difficulty: 0.5 };
        const output1 = generator.generate(input);
        const output2 = generator.generate(input);
        expect(JSON.stringify(output1)).toBe(JSON.stringify(output2));
      });

      it('produces output with required GeneratorOutput fields', () => {
        const generator = getGenerator(key);
        const input: GeneratorInput = { nodeId, seed: 42, difficulty: 0.5 };
        const output: GeneratorOutput = generator.generate(input);
        expect(output).toHaveProperty('prompt');
        expect(output).toHaveProperty('data');
        expect(output).toHaveProperty('expectedAnswer');
        expect(output).toHaveProperty('solutionSteps');
        expect(output).toHaveProperty('gradingMetadata');
        expect(typeof output.prompt).toBe('string');
        expect(output.prompt.length).toBeGreaterThan(0);
        expect(output.solutionSteps.length).toBeGreaterThan(0);
      });

      it('validates against generatorOutputSchema', () => {
        const generator = getGenerator(key);
        const input: GeneratorInput = { nodeId, seed: 42, difficulty: 0.5 };
        const output = generator.generate(input);
        const result = validateGeneratorOutput(output, generatorOutputSchema);
        if (!result.valid) {
          console.error(`Generator ${key} validation errors:`, result.errors);
        }
        expect(result.valid).toBe(true);
      });

      it('grading metadata has consistent partIds', () => {
        const generator = getGenerator(key);
        const input: GeneratorInput = { nodeId, seed: 42, difficulty: 0.5 };
        const output = generator.generate(input);
        const gm = output.gradingMetadata;
        const answerKeys = Object.keys(gm.partAnswers);
        const scoreKeys = Object.keys(gm.partMaxScores);
        const ruleKeys = Object.keys(gm.partGradingRules);
        expect(answerKeys.sort()).toEqual(scoreKeys.sort());
        expect(answerKeys.sort()).toEqual(ruleKeys.sort());
      });

      it('different seeds produce different prompts', () => {
        const generator = getGenerator(key);
        const input1: GeneratorInput = { nodeId, seed: 1, difficulty: 0.5 };
        const input2: GeneratorInput = { nodeId, seed: 999, difficulty: 0.5 };
        const output1 = generator.generate(input1);
        const output2 = generator.generate(input2);
        expect(output1.prompt).not.toBe(output2.prompt);
      });
    });
  }

  it('all pilot generator keys are registered', () => {
    for (const { key } of PILOT_GENERATORS) {
      expect(GENERATOR_KEYS).toContain(key);
    }
  });
});