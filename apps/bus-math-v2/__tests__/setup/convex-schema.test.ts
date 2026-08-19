import { describe, it, expect } from 'vitest';
import schema from '../../convex/schema';

describe('Convex Schema Translation', () => {
  it('should export a valid convex schema with all expected tables', () => {
    // Convex's defineSchema returns a schema object with a tables property
    expect(schema).toBeDefined();

    // Verify table count after learning_evidence table addition
    const tableNames = Object.keys(schema.tables);
    expect(tableNames.length).toBe(37);

    // Check study tables
    expect(tableNames).toContain('study_preferences');
    expect(tableNames).toContain('term_mastery');
    expect(tableNames).toContain('due_reviews');
    expect(tableNames).toContain('study_sessions');
    expect(tableNames).toContain('practice_test_results');

    // Check component approval tables
    expect(tableNames).toContain('componentApprovals');
    expect(tableNames).toContain('componentReviews');

    // Check chatbot rate limits table
    expect(tableNames).toContain('chatbot_rate_limits');

    // Check login rate limits table
    expect(tableNames).toContain('login_rate_limits');

    // Check api rate limits table
    expect(tableNames).toContain('api_rate_limits');

    // Check learning evidence table and its app-owned query indexes
    expect(tableNames).toContain('learning_evidence');
    const learningEvidenceTable = schema.tables.learning_evidence;
    expect(Object.keys(learningEvidenceTable.validator.fields)).toEqual([
      'studentId',
      'contractVersion',
      'nodeId',
      'activityId',
      'attemptOrdinal',
      'origin',
      'mode',
      'occurredAt',
      'gradedEvidence',
      'idempotencyKey',
      'fingerprint',
      'createdAt',
    ]);
    expect(learningEvidenceTable.indexes).toEqual(expect.arrayContaining([
      {
        indexDescriptor: 'by_student_and_idempotency_key',
        fields: ['studentId', 'idempotencyKey'],
      },
      {
        indexDescriptor: 'by_student_and_node',
        fields: ['studentId', 'nodeId'],
      },
    ]));

    // Check SRS tables
    expect(tableNames).toContain('srs_cards');
    expect(tableNames).toContain('srs_review_log');
    expect(tableNames).toContain('srs_interventions');
    expect(Object.keys(schema.tables.srs_cards.validator.fields)).toContain('problemFamilyId');
    expect(Object.keys(schema.tables.srs_review_log.validator.fields)).toContain('problemFamilyId');
    expect(Object.keys(schema.tables.srs_interventions.validator.fields)).toContain('problemFamilyId');

    // Check some specific core tables
    expect(tableNames).toContain('organizations');
    expect(tableNames).toContain('profiles');
    expect(tableNames).toContain('lessons');
    expect(tableNames).toContain('activities');
    expect(tableNames).toContain('student_progress');
    expect(tableNames).toContain('competency_standards');
    expect(tableNames).toContain('auth_credentials');
  });
});
