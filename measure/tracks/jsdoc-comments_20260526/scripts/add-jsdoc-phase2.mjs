#!/usr/bin/env node
/**
 * Phase 2: Add JSDoc to remaining NULL functions in large files.
 * These were missed by the first script because the function line was
 * far from the graph-reported line_start.
 */
import { readFileSync, writeFileSync } from "fs";

const remainingFunctions = [
  // published-manifest.ts
  { file: "apps/bus-math-v2/lib/curriculum/published-manifest.ts", name: "validatePublishedCurriculumLesson", line: 1812 },
  { file: "apps/bus-math-v2/lib/curriculum/published-manifest.ts", name: "buildPublishedCurriculumManifest", line: 1844 },
  { file: "apps/bus-math-v2/lib/curriculum/published-manifest.ts", name: "buildPublishedCurriculumSeedPlan", line: 1888 },
  // question-banks.ts
  { file: "apps/bus-math-v2/lib/practice-tests/question-banks.ts", name: "getUnitConfig", line: 640, arrow: true },
  // errors.ts
  { file: "apps/bus-math-v2/lib/practice/engine/errors.ts", name: "buildTrialBalanceErrorScenario", line: 653 },
  { file: "apps/bus-math-v2/lib/practice/engine/errors.ts", name: "generateTrialBalanceErrorScenarios", line: 736 },
  { file: "apps/bus-math-v2/lib/practice/engine/errors.ts", name: "formatTrialBalanceBalanceAnswer", line: 791 },
  { file: "apps/bus-math-v2/lib/practice/engine/errors.ts", name: "formatTrialBalanceLargerColumn", line: 795 },
  { file: "apps/bus-math-v2/lib/practice/engine/errors.ts", name: "formatTrialBalanceDifference", line: 803 },
  // adjusting-calculations.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/adjusting-calculations.ts", name: "buildAdjustingCalculationsReviewFeedback", line: 565 },
  // classification.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/classification.ts", name: "buildClassificationReviewFeedback", line: 311 },
  { file: "apps/bus-math-v2/lib/practice/engine/families/classification.ts", name: "buildClassificationReviewPlacements", line: 346 },
  // cycle-decisions.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/cycle-decisions.ts", name: "buildCycleDecisionReviewFeedback", line: 496 },
  // depreciation-presentation.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/depreciation-presentation.ts", name: "buildDepreciationPresentationReviewFeedback", line: 414 },
  // financial-analysis.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/financial-analysis.ts", name: "buildFinancialAnalysisReviewFeedback", line: 291 },
  // journal-entry.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/journal-entry.ts", name: "buildJournalEntryReviewFeedback", line: 744 },
  // merchandising-entries.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/merchandising-entries.ts", name: "buildMerchandisingEntryReviewFeedback", line: 408 },
  // normal-balance.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/normal-balance.ts", name: "buildNormalBalanceReviewFeedback", line: 290 },
  // posting-balances.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/posting-balances.ts", name: "buildPostingBalanceReviewFeedback", line: 328 },
  // statement-construction.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/statement-construction.ts", name: "buildStatementConstructionReviewFeedback", line: 637 },
  // statement-subtotals.ts
  { file: "apps/bus-math-v2/lib/practice/engine/families/statement-subtotals.ts", name: "buildStatementSubtotalsReviewFeedback", line: 745 },
  // merchandising.ts
  { file: "apps/bus-math-v2/lib/practice/engine/merchandising.ts", name: "generateMerchandisingTimeline", line: 559 },
  { file: "apps/bus-math-v2/lib/practice/engine/merchandising.ts", name: "solveMerchandisingTimeline", line: 592 },
  // transactions.ts
  { file: "apps/bus-math-v2/lib/practice/engine/transactions.ts", name: "listTransactionArchetypes", line: 576 },
  { file: "apps/bus-math-v2/lib/practice/engine/transactions.ts", name: "getTransactionArchetype", line: 580 },
  { file: "apps/bus-math-v2/lib/practice/engine/transactions.ts", name: "buildTransactionEvent", line: 584 },
  { file: "apps/bus-math-v2/lib/practice/engine/transactions.ts", name: "generateTransactionEvent", line: 614 },
  // mock-factories.ts (arrow functions)
  { file: "apps/bus-math-v2/lib/test-utils/mock-factories.ts", name: "now", line: 66, arrow: true },
  { file: "apps/bus-math-v2/lib/test-utils/mock-factories.ts", name: "defaultLessonMetadata", line: 71, arrow: true },
  { file: "apps/bus-math-v2/lib/test-utils/mock-factories.ts", name: "defaultPhaseContent", line: 80, arrow: true },
  // validation.ts (arrow function)
  { file: "apps/bus-math-v2/lib/db/validation.ts", name: "formatZodIssues", line: 22, arrow: true },
];

const JSDOC_MAP = {
  validatePublishedCurriculumLesson: "/**\n * Validates a published curriculum lesson has correct phase sequences and activity schemas.\n * @param lesson - The lesson to validate\n * @returns The validated lesson\n * @throws {Error} If phase sequence is invalid or activity props fail schema validation\n */",
  buildPublishedCurriculumManifest: "/**\n * Builds the complete published curriculum manifest from authored and generated lessons.\n * @returns The manifest with all lessons sorted by unit and order index\n */",
  buildPublishedCurriculumSeedPlan: "/**\n * Builds and returns the published curriculum manifest as a seed plan.\n * @returns The published curriculum manifest\n */",
  getUnitConfig: "/**\n * Gets the unit configuration for a given unit number.\n * @param unitNumber - The unit number (1-8)\n * @returns The unit config or undefined if not found\n */",
  buildTrialBalanceErrorScenario: "/**\n * Builds a single trial balance error scenario using the specified or random archetype.\n * @param seed - Random seed for reproducibility\n * @param config - Optional configuration for archetype, amount range, and balanced scenarios\n * @returns A complete trial balance error scenario\n */",
  generateTrialBalanceErrorScenarios: "/**\n * Generates multiple trial balance error scenarios using weighted random selection.\n * @param seed - Random seed for reproducibility\n * @param config - Optional configuration for scenario count, amount range, and error type weights\n * @returns Array of trial balance error scenarios\n */",
  formatTrialBalanceBalanceAnswer: "/**\n * Formats the balance answer label for display.\n * @param answer - The balance answer type\n * @returns Human-readable label string\n */",
  formatTrialBalanceLargerColumn: "/**\n * Formats the larger column label for display.\n * @param column - The column identifier\n * @returns Human-readable column label\n */",
  formatTrialBalanceDifference: "/**\n * Formats the numeric difference for display.\n * @param difference - The numeric difference value\n * @returns Formatted difference string\n */",
  buildAdjustingCalculationsReviewFeedback: "/**\n * Builds review feedback for an adjusting calculations practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The scenario that was presented\n * @returns Structured review feedback\n */",
  buildClassificationReviewFeedback: "/**\n * Builds review feedback for a classification practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The classification scenario\n * @returns Structured review feedback\n */",
  buildClassificationReviewPlacements: "/**\n * Builds the expected placements for a classification review.\n * @param scenario - The classification scenario\n * @returns Array of expected account placements\n */",
  buildCycleDecisionReviewFeedback: "/**\n * Builds review feedback for a cycle decision practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The cycle decision scenario\n * @returns Structured review feedback\n */",
  buildDepreciationPresentationReviewFeedback: "/**\n * Builds review feedback for a depreciation presentation practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The depreciation scenario\n * @returns Structured review feedback\n */",
  buildFinancialAnalysisReviewFeedback: "/**\n * Builds review feedback for a financial analysis practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The financial analysis scenario\n * @returns Structured review feedback\n */",
  buildJournalEntryReviewFeedback: "/**\n * Builds review feedback for a journal entry practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The journal entry scenario\n * @returns Structured review feedback\n */",
  buildMerchandisingEntryReviewFeedback: "/**\n * Builds review feedback for a merchandising entry practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The merchandising entry scenario\n * @returns Structured review feedback\n */",
  buildNormalBalanceReviewFeedback: "/**\n * Builds review feedback for a normal balance practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The normal balance scenario\n * @returns Structured review feedback\n */",
  buildPostingBalanceReviewFeedback: "/**\n * Builds review feedback for a posting balance practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The posting balance scenario\n * @returns Structured review feedback\n */",
  buildStatementConstructionReviewFeedback: "/**\n * Builds review feedback for a statement construction practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The statement construction scenario\n * @returns Structured review feedback\n */",
  buildStatementSubtotalsReviewFeedback: "/**\n * Builds review feedback for a statement subtotals practice submission.\n * @param submission - The student submission to evaluate\n * @param scenario - The statement subtotals scenario\n * @returns Structured review feedback\n */",
  generateMerchandisingTimeline: "/**\n * Generates a merchandising timeline scenario with buyer and seller events.\n * @param seed - Random seed for reproducibility\n * @returns A complete merchandising timeline with events and solution\n */",
  solveMerchandisingTimeline: "/**\n * Solves a merchandising timeline by computing the correct accounting entries.\n * @param timeline - The merchandising timeline to solve\n * @returns Solution with correct entries and explanations\n */",
  listTransactionArchetypes: "/**\n * Lists all available transaction archetypes.\n * @returns Array of transaction archetype definitions\n */",
  getTransactionArchetype: "/**\n * Gets a transaction archetype by its identifier.\n * @param id - The archetype identifier\n * @returns The matching archetype or undefined\n */",
  buildTransactionEvent: "/**\n * Builds a transaction event from the specified archetype and seed.\n * @param archetypeId - The archetype to use\n * @param seed - Random seed for reproducibility\n * @returns A complete transaction event with journal lines and solution\n */",
  generateTransactionEvent: "/**\n * Generates a random transaction event using a randomly selected archetype.\n * @param seed - Random seed for reproducibility\n * @returns A complete transaction event\n */",
  now: "/** Returns the current date. */",
  defaultLessonMetadata: "/** Returns default lesson metadata for testing. */",
  defaultPhaseContent: "/** Returns default phase content blocks for testing. */",
  formatZodIssues: "/**\n * Formats Zod validation issues into structured error objects.\n * @param issues - Array of Zod issues to format\n * @returns Array of formatted validation errors\n */",
};

const ROOT = process.cwd();
let totalAdded = 0;

for (const fn of remainingFunctions) {
  const filePath = `${ROOT}/${fn.file}`;
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Find the function declaration - search wider range
  let funcIdx = -1;
  for (let i = Math.max(0, fn.line - 10); i < Math.min(lines.length, fn.line + 20); i++) {
    const line = lines[i];
    if (fn.arrow) {
      // Arrow function: export const name = or const name =
      if (line.includes(`const ${fn.name} =`) || line.includes(`const ${fn.name}=`)) {
        funcIdx = i;
        break;
      }
    } else {
      // Regular function: export function name or function name
      if (line.includes(`function ${fn.name}(`) || line.includes(`function ${fn.name} (`)) {
        funcIdx = i;
        break;
      }
    }
  }

  if (funcIdx === -1) {
    console.log(`  SKIP: ${fn.file}:${fn.name} - function not found near line ${fn.line}`);
    continue;
  }

  // Check if there's already a JSDoc comment above
  let checkIdx = funcIdx - 1;
  while (checkIdx >= 0 && lines[checkIdx].trim() === "") checkIdx--;
  if (checkIdx >= 0 && (lines[checkIdx].trim().endsWith("*/") || lines[checkIdx].trim().startsWith("*") || lines[checkIdx].trim().startsWith("/**"))) {
    // Already has JSDoc - but is it on the right line? Check if build-graph would see it.
    // For arrow functions, build-graph may not see JSDoc above const.
    if (!fn.arrow) {
      console.log(`  SKIP: ${fn.file}:${fn.name} - already has JSDoc`);
      continue;
    }
    // For arrow functions, the JSDoc is already there but build-graph can't see it.
    // We need to convert to a regular function declaration.
    console.log(`  CONVERT: ${fn.file}:${fn.name} - arrow function, converting to regular function`);
  }

  const jsdoc = JSDOC_MAP[fn.name];
  if (!jsdoc) {
    console.log(`  SKIP: ${fn.file}:${fn.name} - no JSDoc template`);
    continue;
  }

  const indent = lines[funcIdx].match(/^(\s*)/)[1];
  const jsdocLines = jsdoc.split("\n").map(l => indent + l);

  // Add blank line before JSDoc if needed
  const prevLine = lines[funcIdx - 1]?.trim();
  if (prevLine && prevLine !== "" && !prevLine.endsWith("*/")) {
    jsdocLines.unshift("");
  }

  lines.splice(funcIdx, 0, ...jsdocLines);
  writeFileSync(filePath, lines.join("\n"));
  totalAdded++;
  console.log(`  ADD: ${fn.file}:${fn.name} - JSDoc added`);
}

console.log(`\nDone: ${totalAdded} JSDoc blocks added`);
