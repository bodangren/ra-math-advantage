import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export interface Topic12TableAverageRateRow {
  readonly input: number;
  readonly output: number;
}

export interface Topic12TableAverageRateChoiceOption {
  readonly id: string;
  readonly label: string;
  readonly startInput: number;
  readonly endInput: number;
}

export interface Topic12TableAverageRateChoiceVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly inputLabel: string;
  readonly outputLabel: string;
  readonly rows: readonly Topic12TableAverageRateRow[];
  readonly options: readonly Topic12TableAverageRateChoiceOption[];
  readonly correctOptionId: string;
  readonly solutionSteps: readonly string[];
}

export const TOPIC12_TABLE_AVERAGE_RATE_CHOICE_NODE_ID =
  'math.precalc.skill.1.2.compare-rates-of-change-across-intervals';

const PROMPT = 'The table gives the life expectancy of US females born in a given year. Over which interval is the average rate of change in life expectancy greatest?';
const GENERATED_PROMPT = 'This hypothetical table gives life-expectancy values for a population by year. Over which interval is the average rate of change in life expectancy greatest?';
const INPUT_LABEL = 'Birth year';
const OUTPUT_LABEL = 'Life expectancy (years)';

const SOURCE_ROWS: readonly Topic12TableAverageRateRow[] = [
  { input: 1800, output: 41.24 },
  { input: 1850, output: 46.10 },
  { input: 1900, output: 53.63 },
  { input: 1950, output: 70.65 },
  { input: 2000, output: 81.83 },
];

function roundToHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

function buildOptions(rows: readonly Topic12TableAverageRateRow[]): readonly Topic12TableAverageRateChoiceOption[] {
  return rows.slice(0, -1).map((row, index) => ({
    id: String.fromCharCode(65 + index),
    label: String.fromCharCode(65 + index),
    startInput: row.input,
    endInput: rows[index + 1]!.input,
  }));
}

function buildSolutionSteps(
  rows: readonly Topic12TableAverageRateRow[],
  options: readonly Topic12TableAverageRateChoiceOption[],
): readonly string[] {
  return options.map((option) => {
    const start = rows.find((row) => row.input === option.startInput)!;
    const end = rows.find((row) => row.input === option.endInput)!;
    const outputChange = end.output - start.output;
    const inputChange = end.input - start.input;
    const rate = outputChange / inputChange;
    return `Interval ${option.id}: (change in output)/(change in input) = (${formatNumber(end.output, 2)} - ${formatNumber(start.output, 2)}) / (${end.input} - ${start.input}) = ${formatNumber(outputChange, 2)} / ${inputChange} = ${formatNumber(rate, 4)} years per year.`;
  });
}

function findGreatestOptionId(
  rows: readonly Topic12TableAverageRateRow[],
  options: readonly Topic12TableAverageRateChoiceOption[],
): string {
  const rates = options.map((option) => {
    const start = rows.find((row) => row.input === option.startInput)!;
    const end = rows.find((row) => row.input === option.endInput)!;
    return (end.output - start.output) / (end.input - start.input);
  });
  const greatestIndex = rates.reduce((bestIndex, rate, index) => rate > rates[bestIndex]! ? index : bestIndex, 0);
  return options[greatestIndex]!.id;
}

export function generateTopic12TableAverageRateChoice(seed: number): Topic12TableAverageRateChoiceVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative integer');
  }

  if (seed === 0) {
    const options = buildOptions(SOURCE_ROWS);
    return {
      seed: 0,
      prompt: PROMPT,
      inputLabel: INPUT_LABEL,
      outputLabel: OUTPUT_LABEL,
      rows: SOURCE_ROWS,
      options,
      correctOptionId: findGreatestOptionId(SOURCE_ROWS, options),
      solutionSteps: buildSolutionSteps(SOURCE_ROWS, options),
    };
  }

  const random = mulberry32(seed);
  const startYear = 1800 + Math.floor(random() * 9) * 25;
  const spacing = random() < 0.5 ? 25 : 50;
  const startingLifeExpectancy = roundToHundredth(40 + random() * 12);
  const greatestIndex = Math.floor(random() * 4);
  const changes = Array.from({ length: 4 }, (_, index) => roundToHundredth(
    index === greatestIndex ? 2.6 + random() * 0.8 : 0.6 + random() * 1.1,
  ));
  const rows = changes.reduce<Topic12TableAverageRateRow[]>((result, change, index) => {
    const previous = result[index]!;
    const input = startYear + (index + 1) * spacing;
    result.push({ input, output: roundToHundredth(previous.output + change) });
    return result;
  }, [{ input: startYear, output: startingLifeExpectancy }]);
  const options = buildOptions(rows);

  return {
    seed,
    prompt: GENERATED_PROMPT,
    inputLabel: INPUT_LABEL,
    outputLabel: OUTPUT_LABEL,
    rows,
    options,
    correctOptionId: findGreatestOptionId(rows, options),
    solutionSteps: buildSolutionSteps(rows, options),
  };
}

export function generateTopic12TableAverageRateChoiceOutput(seed: number): GeneratorOutput {
  const variant = generateTopic12TableAverageRateChoice(seed);
  const rendererProps = {
    prompt: variant.prompt,
    inputLabel: variant.inputLabel,
    outputLabel: variant.outputLabel,
    rows: variant.rows,
    options: variant.options,
    presentationMode: 'independent_practice' as const,
  };
  const expectedAnswer = { selectedOptionId: variant.correctOptionId };

  return {
    prompt: variant.prompt,
    data: { seed, rendererProps },
    expectedAnswer,
    solutionSteps: variant.solutionSteps.map((description) => ({ description })),
    gradingMetadata: {
      partAnswers: expectedAnswer,
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: 'exact_match' },
    },
  };
}
