export const PIP_SOURCE_CONTRACT = {
  sourceId: "school.pip-form.2026-08-19",
  sourceVersion: "1.0.0",
  title: "Performance Improvement Plan",
  schoolValues: ["Courage", "Adaptability", "Persistence"],
  fields: [
    "teacher",
    "position",
    "department",
    "supervisor",
    "planEndDate",
    "reviewMeetingDate",
    "purpose",
    "areasOfConcern",
    "expectedStandard",
    "requiredActions",
    "evidenceOfImprovement",
    "schoolSupport",
    "successfulCompletionCriteria",
    "insufficientImprovementConsequences",
    "acknowledgmentText",
    "teacherAcknowledgment",
    "supervisorAcknowledgment",
  ],
  fixedText: {
    insufficientImprovementConsequences:
      "Failure to demonstrate sustained improvement during this period may result in further disciplinary action, which may include additional warnings or termination of employment in accordance with school policy.",
    acknowledgmentText:
      "This plan is intended to support professional improvement and ensure alignment with the instructional standards of the school.",
  },
} as const;
