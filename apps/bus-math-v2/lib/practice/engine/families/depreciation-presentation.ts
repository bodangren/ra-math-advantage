import { buildPracticeSubmissionEnvelopeFromGrade, type GradeResult, type ProblemDefinition, type ProblemFamily, type ProblemPartDefinition } from '@/lib/practice/engine/types';
import { normalizePracticeValue } from '@/lib/practice/contract';
import { generateAdjustmentScenario, type DepreciationAdjustmentScenario } from '@/lib/practice/engine/adjustments';

export type DepreciationPresentationLayout = 'direct' | 'derived';

export interface DepreciationPresentationAssetRegisterItem {
  id: string;
  label: string;
  value: number | string;
  note?: string;
  isLand: boolean;
  contrast?: boolean;
}

export interface DepreciationPresentationRow {
  id: string;
  label: string;
  kind: 'editable' | 'prefilled' | 'subtotal';
  value?: number;
  placeholder?: string;
  note?: string;
  sumOf?: string[];
}

export interface DepreciationPresentationSection {
  id: string;
  label: string;
  description?: string;
  rows: DepreciationPresentationRow[];
}

export interface DepreciationPresentationPart extends ProblemPartDefinition {
  id: string;
  kind: 'numeric';
  label: string;
  targetId: number;
  details: {
    layout: DepreciationPresentationLayout;
    rowRole: 'accumulated-depreciation' | 'net-presentation';
    explanation: string;
    tolerance: number;
    contrastLabel: string;
  };
}

export interface DepreciationPresentationDefinition extends ProblemDefinition {
  scenario: DepreciationAdjustmentScenario;
  layout: DepreciationPresentationLayout;
  assetRegister: DepreciationPresentationAssetRegisterItem[];
  sections: DepreciationPresentationSection[];
  rows: DepreciationPresentationRow[];
  parts: DepreciationPresentationPart[];
  scaffolding: {
    sectionLabel: string;
    guidance: string;
    registerCue: string;
    variantLabel: string;
  };
  workedExample?: Record<string, unknown>;
}

export type DepreciationPresentationResponse = Record<string, number | string | undefined>;

export interface DepreciationPresentationConfig {
  mode?: ProblemDefinition['mode'];
  layout?: DepreciationPresentationLayout;
  tolerance?: number;
}

export interface DepreciationPresentationReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

/**
 * Formats a numeric amount as a locale string for display.
 * @param amount - The numeric amount to format
 * @returns The formatted amount string
 */
function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

/**
 * Builds the computation chain for accumulated depreciation using the scenario parameters.
 * @param scenario - The depreciation adjustment scenario
 * @returns A formatted string showing the depreciation calculation
 */
function buildDepreciationChain(scenario: DepreciationAdjustmentScenario): string {
  const originalCost = scenario.depreciableBase + scenario.salvageValue;
  return `($${formatAmount(originalCost)} − $${formatAmount(scenario.salvageValue)}) ÷ ${scenario.usefulLifeMonths} × ${scenario.monthsUsed} = $${formatAmount(scenario.accumulatedDepreciation)}`;
}

/**
 * Builds the computation chain for net book value using the scenario parameters.
 * @param scenario - The depreciation adjustment scenario
 * @returns A formatted string showing the net book value calculation
 */
function buildNetBookValueChain(scenario: DepreciationAdjustmentScenario): string {
  const originalCost = scenario.depreciableBase + scenario.salvageValue;
  return `$${formatAmount(originalCost)} − $${formatAmount(scenario.accumulatedDepreciation)} = $${formatAmount(scenario.carryingAmount)}`;
}

/**
 * Builds feedback for a single part comparing student response to expected values.
 * @param definition - The problem definition
 * @param part - The part to build feedback for
 * @param studentResponse - The student's response map
 * @param gradeResultPart - The grade result for this part
 * @returns Feedback object with status and message
 */
function buildReviewFeedback(
  definition: DepreciationPresentationDefinition,
  part: DepreciationPresentationPart,
  studentResponse: DepreciationPresentationResponse,
  gradeResultPart: GradeResult['parts'][number],
): DepreciationPresentationReviewFeedback {
  const selectedValue = studentResponse[part.id];
  const scenario = definition.scenario;

  let chain: string | null = null;
  if (part.details.rowRole === 'accumulated-depreciation') {
    chain = buildDepreciationChain(scenario);
  } else if (part.details.rowRole === 'net-presentation') {
    chain = buildNetBookValueChain(scenario);
  }

  const baseMessage = gradeResultPart.isCorrect
    ? `${part.label} is correct.`
    : `${part.label} should be $${formatAmount(part.targetId)}.`;
  const message = chain ? `${baseMessage} ${chain}` : baseMessage;

  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    selectedLabel: selectedValue === undefined ? 'Not entered' : formatAmount(Number(selectedValue)),
    expectedLabel: formatAmount(part.targetId),
    misconceptionTags: gradeResultPart.misconceptionTags,
    message,
  };
}

/**
 * Generates a pseudorandom number generator using the mulberry32 algorithm.
 * @param seed - The seed value for the RNG
 * @returns A function that returns numbers in [0, 1)
 */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks a random element from an array using the given RNG.
 * @param items - The array to pick from
 * @param rng - The random number generator to use
 * @returns A randomly selected element
 */
function pick<T>(items: readonly T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

/**
 * Scores a numeric part by comparing expected value against student response within tolerance.
 * @param expected - The expected numeric value
 * @param actual - The student's actual response
 * @param tolerance - The acceptable difference threshold
 * @returns An object with isCorrect, score, and normalizedAnswer
 */
function scoreNumericPart(expected: number, actual: unknown, tolerance: number) {
  const parsed = Number(actual);
  if (!Number.isFinite(parsed)) {
    return {
      isCorrect: false,
      score: 0,
      normalizedAnswer: normalizePracticeValue(actual),
    };
  }

  const isCorrect = Math.abs(parsed - expected) <= tolerance;
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    normalizedAnswer: normalizePracticeValue(parsed),
  };
}

/**
 * Builds configuration for generating a depreciation scenario.
 * @param seed - The seed for randomization
 * @returns Configuration object with depreciation settings
 */
function buildScenarioConfig(seed: number) {
  const rng = mulberry32(seed ^ 0x7bb94f1d);
  return {
    scenarioKind: 'depreciation' as const,
    depreciation: {
      assetCategory: pick(['Equipment', 'Buildings'] as const, rng),
    },
  };
}

/**
 * Calculates the original asset cost by adding depreciable base and salvage value.
 * @param scenario - The depreciation adjustment scenario
 * @returns The original asset cost
 */
function getOriginalAssetCost(scenario: DepreciationAdjustmentScenario) {
  return scenario.depreciableBase + scenario.salvageValue;
}

/**
 * Creates a section row for the depreciation presentation.
 * @param id - Unique identifier for the row
 * @param label - Display label for the row
 * @param value - The numeric value (or undefined for editable)
 * @param kind - The row kind ('editable', 'prefilled', or 'subtotal')
 * @param note - Optional note describing the row
 * @param sumOf - Optional array of row IDs that this subtotal sums
 * @returns A configured DepreciationPresentationRow
 */
function createSectionRow(
  id: string,
  label: string,
  value: number | undefined,
  kind: DepreciationPresentationRow['kind'],
  note?: string,
  sumOf?: string[],
): DepreciationPresentationRow {
  return {
    id,
    label,
    kind,
    value,
    placeholder: kind === 'editable' ? '0' : undefined,
    note,
    sumOf,
  };
}

/**
 * Builds the asset register with land and depreciable asset information.
 * @param scenario - The depreciation adjustment scenario
 * @param layout - The presentation layout ('direct' or 'derived')
 * @returns Array of asset register items
 */
function buildAssetRegister(scenario: DepreciationAdjustmentScenario, layout: DepreciationPresentationLayout): DepreciationPresentationAssetRegisterItem[] {
  const originalCost = getOriginalAssetCost(scenario);
  const landValue = Math.max(1200, Math.round(originalCost * 0.35));
  return [
    {
      id: 'asset-register-land',
      label: 'Land',
      value: landValue,
      note: 'Land provides a contrast case because it is not depreciated.',
      isLand: true,
    },
    {
      id: 'asset-register-cost',
      label: scenario.assetCategory,
      value: originalCost,
      note: 'Use the cost and depreciation facts to present the asset.',
      isLand: false,
    },
    {
      id: 'asset-register-salvage',
      label: 'Salvage Value',
      value: scenario.salvageValue,
      note: 'The residual value limits the depreciable base.',
      isLand: false,
    },
    {
      id: 'asset-register-life',
      label: 'Useful Life (months)',
      value: scenario.usefulLifeMonths,
      note: layout === 'derived' ? 'Students derive the depreciation first.' : 'Students receive the depreciation directly.',
      isLand: false,
    },
    {
      id: 'asset-register-months',
      label: 'Months Used',
      value: scenario.monthsUsed,
      note: 'Use elapsed service time to complete the presentation.',
      isLand: false,
    },
  ];
}

/**
 * Builds the problem parts from a scenario based on the layout.
 * @param scenario - The depreciation adjustment scenario
 * @param layout - The presentation layout ('direct' or 'derived')
 * @param tolerance - The numeric tolerance for grading
 * @returns Array of DepreciationPresentationPart definitions
 */
function buildParts(
  scenario: DepreciationAdjustmentScenario,
  layout: DepreciationPresentationLayout,
  tolerance: number,
): DepreciationPresentationPart[] {
  const directPart: DepreciationPresentationPart = {
    id: 'net-book-value',
    kind: 'numeric',
    label: 'Net Book Value',
    prompt: 'What is the net book value?',
    expectedAnswerShape: 'number',
    canonicalAnswer: scenario.carryingAmount,
    explanation: 'Subtract accumulated depreciation from the asset cost.',
    misconceptionTags: ['depreciation-presentation', 'net-presentation-error'],
    standardCode: 'ACC-M7-N-PPE',
    artifactTarget: String(scenario.carryingAmount),
    targetId: scenario.carryingAmount,
    details: {
      layout,
      rowRole: 'net-presentation',
      explanation: 'Subtract accumulated depreciation from the cost to present the asset net.',
      tolerance,
      contrastLabel: 'Land is not depreciated.',
    },
  };

  if (layout === 'direct') {
    return [directPart];
  }

  return [
    {
      id: 'accumulated-depreciation',
      kind: 'numeric',
      label: 'Accumulated Depreciation',
      prompt: 'What is accumulated depreciation?',
      expectedAnswerShape: 'number',
      canonicalAnswer: scenario.accumulatedDepreciation,
      explanation: 'Use the monthly depreciation and months used to build accumulated depreciation.',
      misconceptionTags: ['depreciation-presentation', 'accumulated-depreciation-error'],
      standardCode: 'ACC-M7-N-PPE',
      artifactTarget: String(scenario.accumulatedDepreciation),
      targetId: scenario.accumulatedDepreciation,
      details: {
        layout,
        rowRole: 'accumulated-depreciation',
        explanation: 'Compute the accumulated depreciation before presenting the asset net.',
        tolerance,
        contrastLabel: 'Land is not depreciated.',
      },
    },
    directPart,
  ];
}

/**
 * Builds the statement sections with rows based on the presentation layout.
 * @param scenario - The depreciation adjustment scenario
 * @param layout - The presentation layout ('direct' or 'derived')
 * @returns Statement body with sections and rows
 */
function buildStatementSections(
  scenario: DepreciationAdjustmentScenario,
  layout: DepreciationPresentationLayout,
) {
  const originalCost = getOriginalAssetCost(scenario);
  const landValue = Math.max(1200, Math.round(originalCost * 0.35));

  if (layout === 'direct') {
    const sections: DepreciationPresentationSection[] = [
      {
        id: 'ppe',
        label: 'Property, plant, and equipment',
        description: 'Present the long-lived asset net of accumulated depreciation.',
        rows: [
          createSectionRow('land', 'Land', landValue, 'prefilled', 'Land is not depreciated.'),
          createSectionRow('asset-cost', scenario.assetCategory, originalCost, 'prefilled', 'Use the original asset cost.'),
          createSectionRow('accumulated-depreciation', 'Less: Accumulated depreciation', scenario.accumulatedDepreciation, 'prefilled', 'Subtract accumulated depreciation from cost.'),
          createSectionRow('net-book-value', 'Net Book Value', undefined, 'editable', 'Enter the net amount after depreciation.'),
          createSectionRow('total-ppe', 'Total PP&E', undefined, 'subtotal', 'Combine land and the asset net book value.', ['land', 'net-book-value']),
        ],
      },
    ];

    return {
      sections,
      rows: sections.flatMap((section) => section.rows),
    };
  }

  const sections: DepreciationPresentationSection[] = [
    {
      id: 'ppe',
      label: 'Property, plant, and equipment',
      description: 'Use the cue block to complete the net presentation.',
      rows: [
        createSectionRow('land', 'Land', landValue, 'prefilled', 'Land is not depreciated.'),
        createSectionRow('asset-cost', scenario.assetCategory, originalCost, 'prefilled', 'Use the original asset cost.'),
        createSectionRow('net-book-value', 'Net Book Value', undefined, 'editable', 'Present the asset net of depreciation.'),
        createSectionRow('total-ppe', 'Total PP&E', undefined, 'subtotal', 'Combine land and the net book value.', ['land', 'net-book-value']),
      ],
    },
  ];

  return {
    sections,
    rows: sections.flatMap((section) => section.rows),
  };
}

/**
 * Builds review feedback for a depreciation presentation practice submission.
 * @param submission - The student submission to evaluate
 * @param scenario - The depreciation scenario
 * @returns Structured review feedback
 */
export function buildDepreciationPresentationReviewFeedback(
  definition: DepreciationPresentationDefinition,
  studentResponse: DepreciationPresentationResponse,
  gradeResult: GradeResult,
): Record<string, DepreciationPresentationReviewFeedback> {
  return Object.fromEntries(
    gradeResult.parts.map((partResult) => {
      const part = definition.parts.find((entry) => entry.id === partResult.partId);
      if (!part) {
        return [
          partResult.partId,
          {
            status: partResult.isCorrect ? 'correct' : 'incorrect',
            selectedLabel: 'Not entered',
            expectedLabel: 'Unknown',
            misconceptionTags: partResult.misconceptionTags,
            message: 'Review data unavailable.',
          },
        ] as const;
      }

      return [part.id, buildReviewFeedback(definition, part, studentResponse, partResult)] as const;
    }),
  );
}

export const depreciationPresentationFamily: ProblemFamily<
  DepreciationPresentationDefinition,
  DepreciationPresentationResponse,
  DepreciationPresentationConfig
> = {
  generate(seed, config = {}) {
    const layout = config.layout ?? (seed % 2 === 0 ? 'direct' : 'derived');
    const scenario = generateAdjustmentScenario(seed, buildScenarioConfig(seed)) as DepreciationAdjustmentScenario;
    const assetRegister = buildAssetRegister(scenario, layout);
    const parts = buildParts(scenario, layout, config.tolerance ?? 0);
    const body = buildStatementSections(scenario, layout);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'depreciation-presentation',
      mode: config.mode ?? 'guided_practice',
      activityId: `depreciation-presentation-${layout}-${seed}`,
      prompt: {
        title:
          layout === 'direct'
            ? 'Present the depreciated asset'
            : 'Derive the depreciated asset presentation',
        stem:
          layout === 'direct'
            ? 'Use the given depreciation to present the asset net of accumulated depreciation.'
            : 'Use the asset register cue to derive the presentation and then place the net book value.',
      },
      scenario,
      layout,
      assetRegister,
      sections: body.sections,
      rows: body.rows,
      parts,
      scaffolding: {
        sectionLabel: 'Property, plant, and equipment',
        guidance:
          layout === 'direct'
            ? 'Present the asset net of accumulated depreciation.'
            : 'Read the register cue before entering the net presentation.',
        registerCue:
          layout === 'direct'
            ? 'The statement gives the accumulated depreciation directly.'
            : 'Use the cost, salvage value, and months used to work out accumulated depreciation first.',
        variantLabel: layout,
      },
      grading: {
        strategy: 'numeric',
        partialCredit: false,
      },
      analyticsConfig: {
        generator: 'depreciation-presentation-family',
        seed,
        layout,
      },
    };
  },

  solve(definition) {
    return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetId]));
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const scoreResult = scoreNumericPart(part.targetId, studentResponse[part.id], part.details.tolerance);
      return {
        partId: part.id,
        rawAnswer: studentResponse[part.id],
        normalizedAnswer: scoreResult.normalizedAnswer,
        isCorrect: scoreResult.isCorrect,
        score: scoreResult.score,
        maxScore: 1,
        misconceptionTags: scoreResult.isCorrect
          ? []
          : [`depreciation-presentation:${part.details.layout}:${part.details.rowRole}`],
      };
    });

    return {
      score: parts.reduce((sum, part) => sum + part.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((part) => part.isCorrect)
        ? 'The depreciation presentation is correct.'
        : 'Recheck the depreciation cue and the net presentation.',
    };
  },

  toEnvelope(definition, studentResponse, gradeResult) {
    return buildPracticeSubmissionEnvelopeFromGrade(
      {
        activityId: definition.activityId,
        mode: definition.mode,
      },
      studentResponse,
      gradeResult,
    );
  },
};
