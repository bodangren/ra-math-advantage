export const PIP_SOURCE_CONTRACT = {
  sourceId: 'school.pip-form.2026-08-19',
  sourceVersion: '1.0.0',
  title: 'Performance Improvement Plan',
  schoolValues: ['Courage', 'Adaptability', 'Persistence'],
  fields: [
    'teacher',
    'position',
    'department',
    'supervisor',
    'planEndDate',
    'reviewMeetingDate',
    'purpose',
    'areasOfConcern',
    'expectedStandard',
    'requiredActions',
    'evidenceOfImprovement',
    'schoolSupport',
    'successfulCompletionCriteria',
    'insufficientImprovementConsequences',
    'acknowledgmentText',
    'teacherAcknowledgment',
    'supervisorAcknowledgment',
  ],
  fixedText: {
    insufficientImprovementConsequences:
      'Failure to demonstrate sustained improvement during this period may result in further disciplinary action, which may include additional warnings or termination of employment in accordance with school policy.',
    acknowledgmentText:
      'This plan is intended to support professional improvement and ensure alignment with the instructional standards of the school.',
  },
} as const;

export const PIP_SOURCE_CANONICAL_JSON = JSON.stringify(PIP_SOURCE_CONTRACT);
export const PIP_SOURCE_HASH =
  'c997419fcc7b922422dc505779c2ca8a145cb679c100606ce01fa9efdfebdbdb';

/** Reject a source object that differs from the reviewed canonical source. */
export function validatePipSourceContract(value: unknown) {
  return JSON.stringify(value) === PIP_SOURCE_CANONICAL_JSON
    ? { valid: true as const }
    : { valid: false as const, reason: 'source_hash_mismatch' as const };
}
