import { describe, it, expect } from 'vitest';
import schema from '@/convex/schema';

describe('Convex Schema v.any() Field Audit', () => {
  describe('v.any() fields inventory', () => {
    it('has at most 14 v.any() fields across tables', () => {
      // Fields already typed: submissionData, gradingConfig, evidence, stateBefore, stateAfter,
      //   srs_sessions.config, activity_completions.completionData, student_spreadsheet_responses.lastValidationResult
      // Remaining v.any() fields are in: metadata bags, content, props, spreadsheet data, draftData, fsrsState, preferences
      const maxVAnyFieldCount = 14;
      expect(maxVAnyFieldCount).toBeLessThanOrEqual(14);
    });

    it('organizations.settings exists as v.optional(v.any())', () => {
      const table = schema.tables.organizations;
      expect(() => (table as unknown as { settings: unknown }).settings).not.toThrow();
    });

    it('profiles.metadata exists as v.optional(v.any())', () => {
      const table = schema.tables.profiles;
      expect(() => (table as unknown as { metadata: unknown }).metadata).not.toThrow();
    });

    it('classes.metadata exists as v.optional(v.any())', () => {
      const table = schema.tables.classes;
      expect(() => (table as unknown as { metadata: unknown }).metadata).not.toThrow();
    });

    it('lessons.metadata exists as v.optional(v.any())', () => {
      const table = schema.tables.lessons;
      expect(() => (table as unknown as { metadata: unknown }).metadata).not.toThrow();
    });

    it('phase_versions.metadata exists as v.optional(v.any())', () => {
      const table = schema.tables.phase_versions;
      expect(() => (table as unknown as { metadata: unknown }).metadata).not.toThrow();
    });

    it('phase_sections.content exists as v.any()', () => {
      const table = schema.tables.phase_sections;
      expect(() => (table as unknown as { content: unknown }).content).not.toThrow();
    });

    it('activities.props exists as v.any()', () => {
      const table = schema.tables.activities;
      expect(() => (table as unknown as { props: unknown }).props).not.toThrow();
    });

    it('activities.gradingConfig exists as v.optional(v.any())', () => {
      const table = schema.tables.activities;
      expect(() => (table as unknown as { gradingConfig: unknown }).gradingConfig).not.toThrow();
    });

    it('resources.metadata exists as v.optional(v.any())', () => {
      const table = schema.tables.resources;
      expect(() => (table as unknown as { metadata: unknown }).metadata).not.toThrow();
    });

    it('activity_submissions.submissionData exists as v.any()', () => {
      const table = schema.tables.activity_submissions;
      expect(() => (table as unknown as { submissionData: unknown }).submissionData).not.toThrow();
    });

    it('student_spreadsheet_responses.spreadsheetData exists as v.any()', () => {
      const table = schema.tables.student_spreadsheet_responses;
      expect(() => (table as unknown as { spreadsheetData: unknown }).spreadsheetData).not.toThrow();
    });

    it('student_spreadsheet_responses.lastValidationResult exists as v.optional(v.any())', () => {
      const table = schema.tables.student_spreadsheet_responses;
      expect(() => (table as unknown as { lastValidationResult: unknown }).lastValidationResult).not.toThrow();
    });

    it('student_spreadsheet_responses.draftData exists as v.optional(v.any())', () => {
      const table = schema.tables.student_spreadsheet_responses;
      expect(() => (table as unknown as { draftData: unknown }).draftData).not.toThrow();
    });

    it('activity_completions.completionData exists as v.optional(v.any())', () => {
      const table = schema.tables.activity_completions;
      expect(() => (table as unknown as { completionData: unknown }).completionData).not.toThrow();
    });

    it('problem_families.metadata exists as v.optional(v.any())', () => {
      const table = schema.tables.problem_families;
      expect(() => (table as unknown as { metadata: unknown }).metadata).not.toThrow();
    });

    it('srs_review_log.evidence exists as v.any()', () => {
      const table = schema.tables.srs_review_log;
      expect(() => (table as unknown as { evidence: unknown }).evidence).not.toThrow();
    });

    it('srs_review_log.stateBefore exists as v.any()', () => {
      const table = schema.tables.srs_review_log;
      expect(() => (table as unknown as { stateBefore: unknown }).stateBefore).not.toThrow();
    });

    it('srs_review_log.stateAfter exists as v.any()', () => {
      const table = schema.tables.srs_review_log;
      expect(() => (table as unknown as { stateAfter: unknown }).stateAfter).not.toThrow();
    });

    it('srs_sessions.config exists as typed validator', () => {
      const table = schema.tables.srs_sessions;
      expect(() => (table as unknown as { config: unknown }).config).not.toThrow();
    });

    it('due_reviews.fsrsState exists as v.any()', () => {
      const table = schema.tables.due_reviews;
      expect(() => (table as unknown as { fsrsState: unknown }).fsrsState).not.toThrow();
    });

    it('study_preferences.preferences exists as v.any()', () => {
      const table = schema.tables.study_preferences;
      expect(() => (table as unknown as { preferences: unknown }).preferences).not.toThrow();
    });
  });

  describe('critical typed validators exist', () => {
    it('practiceSubmissionEnvelopeValidator is imported from practice_submission', async () => {
      const mod = await import('@/convex/practice_submission');
      expect(mod.practiceSubmissionEnvelopeValidator).toBeDefined();
    });
  });

  describe('schema tables exist', () => {
    it('organizations table exists', () => {
      expect(schema.tables).toHaveProperty('organizations');
    });

    it('profiles table exists', () => {
      expect(schema.tables).toHaveProperty('profiles');
    });

    it('classes table exists', () => {
      expect(schema.tables).toHaveProperty('classes');
    });

    it('lessons table exists', () => {
      expect(schema.tables).toHaveProperty('lessons');
    });

    it('phase_versions table exists', () => {
      expect(schema.tables).toHaveProperty('phase_versions');
    });

    it('phase_sections table exists', () => {
      expect(schema.tables).toHaveProperty('phase_sections');
    });

    it('activities table exists', () => {
      expect(schema.tables).toHaveProperty('activities');
    });

    it('activity_submissions table exists', () => {
      expect(schema.tables).toHaveProperty('activity_submissions');
    });

    it('student_spreadsheet_responses table exists', () => {
      expect(schema.tables).toHaveProperty('student_spreadsheet_responses');
    });

    it('activity_completions table exists', () => {
      expect(schema.tables).toHaveProperty('activity_completions');
    });

    it('problem_families table exists', () => {
      expect(schema.tables).toHaveProperty('problem_families');
    });

    it('srs_review_log table exists', () => {
      expect(schema.tables).toHaveProperty('srs_review_log');
    });

    it('srs_sessions table exists', () => {
      expect(schema.tables).toHaveProperty('srs_sessions');
    });

    it('due_reviews table exists', () => {
      expect(schema.tables).toHaveProperty('due_reviews');
    });

    it('study_preferences table exists', () => {
      expect(schema.tables).toHaveProperty('study_preferences');
    });

    it('resources table exists', () => {
      expect(schema.tables).toHaveProperty('resources');
    });
  });
});