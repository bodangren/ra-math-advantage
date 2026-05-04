import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve(__dirname, '../../convex/schema.ts');
const schemaSource = fs.readFileSync(schemaPath, 'utf-8');

function findRawVAnyMatches(source: string): string[] {
  const lines = source.split('\n');
  const matches: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('v.any()') && !line.includes('v.record')) {
      matches.push(`${i + 1}: ${line.trim()}`);
    }
  }
  return matches;
}

function findVRecordStringVAny(source: string): { line: number; snippet: string; table: string; field: string }[] {
  const lines = source.split('\n');
  const results: { line: number; snippet: string; table: string; field: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('v.record(v.string(), v.any())')) {
      const snippet = line.trim();
      const fieldMatch = snippet.match(/^(\w+):\s*v\./);
      const field = fieldMatch ? fieldMatch[1] : 'unknown';
      let table = 'unknown';
      for (let j = i - 1; j >= 0 && j >= i - 40; j--) {
        const prevLine = lines[j].trim();
        const tableMatch = prevLine.match(/^(\w+):\s*defineTable/);
        if (tableMatch) {
          table = tableMatch[1];
          break;
        }
      }
      results.push({ line: i + 1, snippet, table, field });
    }
  }
  return results;
}

describe('Convex Schema v.any() Field Audit (source-level)', () => {
  describe('bare v.any() fields — must be explicitly whitelisted', () => {
    const whitelistedVAnyLines = [
      /rawAnswer:\s*v\.any\(\)/,
      /interactionHistory.*v\.any\(\)/,
    ];

    const rawVAnyMatches = findRawVAnyMatches(schemaSource);

    it('only whitelisted bare v.any() fields exist', () => {
      const violations = rawVAnyMatches.filter((match) =>
        !whitelistedVAnyLines.some((pattern) => pattern.test(match))
      );
      const whitelisted = rawVAnyMatches.filter((match) =>
        whitelistedVAnyLines.some((pattern) => pattern.test(match))
      );

      if (violations.length > 0) {
        console.error(
          `\nUNWHITELISTED v.any() fields found:\n${violations.join('\n')}` +
          `\nWhitelisted (intentionally polymorphic):\n${whitelisted.join('\n')}`
        );
      }

      expect(violations).toEqual([]);
    });

    it('rawAnswer is whitelisted (polymorphic answer type)', () => {
      const hasRawAnswer = rawVAnyMatches.some((m) => /rawAnswer/.test(m));
      expect(hasRawAnswer).toBe(true);
    });

    it('interactionHistory is whitelisted (variable-shape interaction events)', () => {
      const hasInteractionHistory = rawVAnyMatches.some((m) => /interactionHistory/.test(m));
      expect(hasInteractionHistory).toBe(true);
    });
  });

  describe('v.record(v.string(), v.any()) fields — bounded records', () => {
    const vRecordFields = findVRecordStringVAny(schemaSource);

    it('general-purpose metadata fields use v.record() not bare v.any()', () => {
      const metadataFields = vRecordFields.filter((f) => f.field === 'metadata');
      const metadataTables = metadataFields.map((f) => f.table);
      expect(metadataTables).toContain('profiles');
      expect(metadataTables).toContain('classes');
      expect(metadataTables).toContain('lessons');
      expect(metadataTables).toContain('phase_versions');
      expect(metadataTables).toContain('resources');
      expect(metadataTables).toContain('problem_families');
    });

    it('organizations.settings uses v.record() not bare v.any()', () => {
      const settingsField = vRecordFields.find((f) => f.table === 'organizations' && f.field === 'settings');
      expect(settingsField).toBeDefined();
    });

    it('phase_sections.content uses phaseSectionContentValidator (strict union)', () => {
      expect(schemaSource).toMatch(/content:\s*phaseSectionContentValidator/);
    });

    it('activities.props uses activityPropsValidator (strict union)', () => {
      expect(schemaSource).toMatch(/props:\s*activityPropsValidator/);
    });

    it('activity_submissions uses submissionDataValidator (typed)', () => {
      expect(schemaSource).toMatch(/submissionData:\s*submissionDataValidator/);
    });

    it('student_spreadsheet_responses fields use record validators', () => {
      const ssFields = vRecordFields.filter((f) => f.table === 'student_spreadsheet_responses');
      const fieldNames = ssFields.map((f) => f.field);
      expect(fieldNames).toContain('spreadsheetData');
      expect(fieldNames).toContain('draftData');
    });

    it('srs_sessions.config is typed (has sessionConfigValidator)', () => {
      expect(schemaSource).toMatch(/config:\s*sessionConfigValidator/);
    });

    it('srs_review_log.evidence uses srsEvidenceValidator', () => {
      expect(schemaSource).toMatch(/evidence:\s*srsEvidenceValidator/);
    });

    it('srs_review_log stateBefore/stateAfter use srsCardStatePickValidator', () => {
      expect(schemaSource).toMatch(/stateBefore:\s*srsCardStatePickValidator/);
      expect(schemaSource).toMatch(/stateAfter:\s*srsCardStatePickValidator/);
    });

    it('srs_cards.state uses srsCardStateLiteralValidator', () => {
      expect(schemaSource).toMatch(/state:\s*srsCardStateLiteralValidator/);
    });

    it('srs_cards fields are individually typed (no generic record)', () => {
      const cardsFields = vRecordFields.filter((f) => f.table === 'srs_cards');
      expect(cardsFields).toHaveLength(0);
    });

    it('due_reviews.fsrsState uses fsrsStateValidator (strict object)', () => {
      expect(schemaSource).toMatch(/fsrsState:\s*fsrsStateValidator/);
    });

    it('study_preferences.preferences uses v.record() not bare v.any()', () => {
      const prefsField = vRecordFields.find((f) => f.table === 'study_preferences' && f.field === 'preferences');
      expect(prefsField).toBeDefined();
    });

    it('submissionPartValidator exists as validator', () => {
      expect(schemaSource).toMatch(/submissionPartValidator/);
    });

    it('submissionDataValidator exists as validator', () => {
      expect(schemaSource).toMatch(/submissionDataValidator/);
    });

    it('gradingConfigValidator exists as validator', () => {
      expect(schemaSource).toMatch(/gradingConfigValidator/);
    });

    it('activity_completions.completionData exists as typed validator', () => {
      expect(schemaSource).toMatch(/completionData:\s*v\.optional\(\s*v\.object/);
    });

    it('student_spreadsheet_responses.lastValidationResult is typed', () => {
      expect(schemaSource).toMatch(/lastValidationResult:\s*v\.optional\(\s*v\.object/);
    });

    it('srs_review_log.rating uses srsRatingValidator', () => {
      expect(schemaSource).toMatch(/rating:\s*srsRatingValidator/);
    });
  });

  describe('section-type content validators exist', () => {
    it('textContentValidator is defined', () => {
      expect(schemaSource).toMatch(/export const textContentValidator/);
    });
    it('calloutContentValidator is defined', () => {
      expect(schemaSource).toMatch(/export const calloutContentValidator/);
    });
    it('activityContentValidator is defined', () => {
      expect(schemaSource).toMatch(/export const activityContentValidator/);
    });
    it('videoContentValidator is defined', () => {
      expect(schemaSource).toMatch(/export const videoContentValidator/);
    });
    it('imageContentValidator is defined', () => {
      expect(schemaSource).toMatch(/export const imageContentValidator/);
    });
    it('mathContentSectionValidators index is defined', () => {
      expect(schemaSource).toMatch(/export const mathContentSectionValidators/);
    });
  });

  describe('activity props validators exist', () => {
    it('graphingExplorerPropsValidator is defined', () => {
      expect(schemaSource).toMatch(/graphingExplorerPropsValidator/);
    });
    it('stepByStepSolverPropsValidator is defined', () => {
      expect(schemaSource).toMatch(/stepByStepSolverPropsValidator/);
    });
    it('comprehensionQuizPropsValidator is defined', () => {
      expect(schemaSource).toMatch(/comprehensionQuizPropsValidator/);
    });
    it('fillInTheBlankPropsValidator is defined', () => {
      expect(schemaSource).toMatch(/fillInTheBlankPropsValidator/);
    });
    it('rateOfChangeCalculatorPropsValidator is defined', () => {
      expect(schemaSource).toMatch(/rateOfChangeCalculatorPropsValidator/);
    });
    it('discriminantAnalyzerPropsValidator is defined', () => {
      expect(schemaSource).toMatch(/discriminantAnalyzerPropsValidator/);
    });
  });

  describe('strict union validators defined', () => {
    it('activityPropsValidator is defined', () => {
      expect(schemaSource).toMatch(/const activityPropsValidator = v\.union/);
    });
    it('phaseSectionContentValidator is defined', () => {
      expect(schemaSource).toMatch(/const phaseSectionContentValidator = v\.union/);
    });
    it('fsrsStateValidator is defined', () => {
      expect(schemaSource).toMatch(/const fsrsStateValidator = v\.object/);
    });
  });
});
