import type { DanielsonRole } from '../foundation/authorization';
import type { ObservationPriorityReason, ObservationType } from '../observations/contracts';
import { DANIELSON_COMPONENT_IDS } from '../proficiency/graph';

export const DEMO_USERNAMES = [
  'demo.sysadmin',
  'demo.slt',
  'demo.head',
  'demo.hod.math',
  'demo.coach.primary',
  'demo.teacher.new',
  'demo.teacher.developing',
  'demo.teacher.experienced',
  'demo.teacher.pip',
  'demo.teacher.growth',
] as const;

export const DEMO_TEACHER_USERNAMES = [
  'demo.slt',
  'demo.hod.math',
  'demo.teacher.new',
  'demo.teacher.developing',
  'demo.teacher.experienced',
  'demo.teacher.pip',
  'demo.teacher.growth',
] as const;

export type DemoUsername = (typeof DEMO_USERNAMES)[number];
export type DemoTeacherUsername = (typeof DEMO_TEACHER_USERNAMES)[number];
export type DemoExperience = 'new' | 'developing' | 'experienced';
export type DemoExpectedState = 'below_proficient' | 'proficient' | 'not_enough_evidence';

export type DemoObservation = {
  id: string;
  teacherUsername: DemoTeacherUsername;
  observationType: ObservationType;
  schoolYear: string;
  sourceVersion: string;
  frameworkVersion: string;
  observedAt: string;
  componentId: string;
  targetSkillIds: string[];
  rating: 1 | 2 | 3 | 4 | null;
  componentRatings?: Array<{ componentId: string; rating: 1 | 2 | 3 | 4 }>;
  priorityReason: ObservationPriorityReason;
  evidenceNote: string | null;
};

export type DemoPip = {
  state: 'active' | 'closed';
  outcome: 'successful' | 'insufficient_improvement' | null;
  approvedAt: string;
  closedAt: string | null;
  planEndDate: string;
  reviewMeetingDate: string;
  targetCount: number;
  targets: Array<{ componentId: string; skillId: string; expectedRating: 3 | 4 }>;
  purpose: string;
  areasOfConcern: string;
  requiredActions: string;
  evidenceOfImprovement: string;
  schoolSupport: string;
  successfulCompletionCriteria: string;
  closureNote: string | null;
};

export type DemoGbf = {
  state: 'in_progress';
  assignedSkillIds: string[];
  unresolvedGapSkillIds: string[];
};

export type DemoAccount = {
  username: DemoUsername;
  displayName: string;
  roles: DanielsonRole[];
  sharedSessionRole: 'teacher' | 'admin';
};

export type DemoTeacher = {
  username: DemoTeacherUsername;
  displayName: string;
  position: string;
  departmentKeys: string[];
  experience: DemoExperience;
  expectedState: DemoExpectedState;
  walkthroughPriorityCount: number;
  formalObservationTypes: ObservationType[];
  responseCount: number;
  observations: DemoObservation[];
  publicComments: string[];
  privateComments: string[];
  responses: string[];
  gbf: DemoGbf | null;
  pip: DemoPip | null;
};

export type DemoScenario = {
  referenceTime: number;
  organization: { slug: 'danielson-school'; name: 'Danielson School' };
  accounts: DemoAccount[];
  departments: Array<{ key: string; name: string }>;
  departmentMemberships: Array<{ teacherUsername: DemoTeacherUsername; departmentKey: string }>;
  hodAssignment: { accountUsername: 'demo.hod.math'; departmentKey: 'mathematics' };
  coachAssignments: Array<{ accountUsername: 'demo.coach.primary'; teacherUsername: DemoTeacherUsername }>;
  teachers: DemoTeacher[];
};

function daysBefore(referenceTime: number, days: number): string {
  return new Date(referenceTime - days * 86_400_000).toISOString();
}

function calendarDate(value: string): string {
  return value.slice(0, 10);
}

function observation(input: {
  id: string;
  teacherUsername: DemoTeacherUsername;
  observationType: ObservationType;
  observedAt: string;
  componentId: string;
  targetSkillIds?: string[];
  rating?: 1 | 2 | 3 | 4 | null;
  componentRatings?: Array<{ componentId: string; rating: 1 | 2 | 3 | 4 }>;
  priorityReason?: ObservationPriorityReason;
  evidenceNote?: string | null;
}): DemoObservation {
  return {
    id: input.id,
    teacherUsername: input.teacherUsername,
    observationType: input.observationType,
    schoolYear: '2026-2027',
    sourceVersion: 'danielson-observation.v1',
    frameworkVersion: 'danielson-2022',
    observedAt: input.observedAt,
    componentId: input.componentId,
    targetSkillIds: input.targetSkillIds ?? [],
    rating: input.rating ?? null,
    ...(input.componentRatings ? { componentRatings: input.componentRatings } : {}),
    priorityReason: input.priorityReason ?? (input.rating !== null && input.rating !== undefined && input.rating < 3
      ? 'below_proficient'
      : 'due'),
    evidenceNote: input.evidenceNote ?? null,
  };
}

function formalComponentRatings(rating: 3 | 4) {
  return DANIELSON_COMPONENT_IDS.map((componentId) => ({
    componentId: `danielson.framework.component.${componentId}`,
    rating,
  }));
}

function activePip(referenceTime: number): DemoPip {
  return {
    state: 'active',
    outcome: null,
    approvedAt: daysBefore(referenceTime, 25),
    closedAt: null,
    planEndDate: calendarDate(daysBefore(referenceTime, -65)),
    reviewMeetingDate: calendarDate(daysBefore(referenceTime, -10)),
    targetCount: 2,
    targets: [
      { componentId: 'danielson.framework.component.3b', skillId: 'danielson.tlac.skill.cold-call', expectedRating: 3 },
      { componentId: 'danielson.framework.component.3b', skillId: 'danielson.tlac.skill.stretch-it', expectedRating: 3 },
    ],
    purpose: 'Support consistent evidence-based discussion and student thinking.',
    areasOfConcern: 'Walkthrough evidence shows inconsistent questioning and follow-through.',
    requiredActions: 'Use the two target techniques in each weekly walkthrough.',
    evidenceOfImprovement: 'Submit current walkthrough evidence for both target skills.',
    schoolSupport: 'Weekly coaching and a scheduled review meeting.',
    successfulCompletionCriteria: 'Meet the expected rating on both target skills.',
    closureNote: null,
  };
}

function closedPip(referenceTime: number): DemoPip {
  return {
    state: 'closed',
    outcome: 'successful',
    approvedAt: daysBefore(referenceTime, 55),
    closedAt: daysBefore(referenceTime, 8),
    planEndDate: calendarDate(daysBefore(referenceTime, -5)),
    reviewMeetingDate: calendarDate(daysBefore(referenceTime, 10)),
    targetCount: 2,
    targets: [
      { componentId: 'danielson.framework.component.3e', skillId: 'danielson.tlac.skill.plan-for-error', expectedRating: 3 },
      { componentId: 'danielson.framework.component.3d', skillId: 'danielson.tlac.skill.show-me', expectedRating: 3 },
    ],
    purpose: 'Support reliable lesson preparation and whole-class assessment.',
    areasOfConcern: 'Earlier evidence showed rating 2 on both target skills.',
    requiredActions: 'Plan likely errors and collect whole-class response evidence.',
    evidenceOfImprovement: 'Show a rating improvement on at least one target skill.',
    schoolSupport: 'Coaching, planning time, and a review conference.',
    successfulCompletionCriteria: 'Reach rating 3 on both target skills or show sustained progress.',
    closureNote: 'Lina met the expected standard and sustained the improvement.',
  };
}

/** Build the complete deterministic fixture used by local seed and tests. */
export function buildDemoScenario(referenceTime: number): DemoScenario {
  if (!Number.isFinite(referenceTime)) throw new Error('referenceTime must be finite');
  const accounts: DemoAccount[] = [
    { username: 'demo.sysadmin', displayName: 'Casey Rivera', roles: ['sysadmin'], sharedSessionRole: 'admin' },
    { username: 'demo.slt', displayName: 'Alex Morgan', roles: ['slt', 'teacher'], sharedSessionRole: 'admin' },
    { username: 'demo.head', displayName: 'Robin Taylor', roles: ['school_head'], sharedSessionRole: 'admin' },
    { username: 'demo.hod.math', displayName: 'Jordan Lee', roles: ['hod', 'teacher'], sharedSessionRole: 'admin' },
    { username: 'demo.coach.primary', displayName: 'Sam Okafor', roles: ['coach'], sharedSessionRole: 'admin' },
    { username: 'demo.teacher.new', displayName: 'Maya Chen', roles: ['teacher'], sharedSessionRole: 'teacher' },
    { username: 'demo.teacher.developing', displayName: 'Noah Williams', roles: ['teacher'], sharedSessionRole: 'teacher' },
    { username: 'demo.teacher.experienced', displayName: 'Sofia Patel', roles: ['teacher'], sharedSessionRole: 'teacher' },
    { username: 'demo.teacher.pip', displayName: 'Ethan Brooks', roles: ['teacher'], sharedSessionRole: 'teacher' },
    { username: 'demo.teacher.growth', displayName: 'Lina Park', roles: ['teacher'], sharedSessionRole: 'teacher' },
  ];
  const teachers: DemoTeacher[] = [
    {
      username: 'demo.slt', displayName: 'Alex Morgan', position: 'Senior Leadership Team and Teacher',
      departmentKeys: ['mathematics'], experience: 'experienced', expectedState: 'proficient',
      walkthroughPriorityCount: 0, formalObservationTypes: ['formal_q4'], responseCount: 0,
      observations: [observation({ id: 'alex-q4', teacherUsername: 'demo.slt', observationType: 'formal_q4', observedAt: daysBefore(referenceTime, 20), componentId: 'danielson.framework.component.4a', rating: 3, componentRatings: formalComponentRatings(3) })],
      publicComments: ['Alex published a clear reflection on the Q4 observation.'], privateComments: [], responses: [], gbf: null, pip: null,
    },
    {
      username: 'demo.hod.math', displayName: 'Jordan Lee', position: 'Head of Mathematics',
      departmentKeys: ['mathematics'], experience: 'experienced', expectedState: 'proficient',
      walkthroughPriorityCount: 0, formalObservationTypes: ['formal_q4'], responseCount: 0,
      observations: [
        observation({ id: 'jordan-walkthrough', teacherUsername: 'demo.hod.math', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 30), componentId: 'danielson.framework.component.1e', targetSkillIds: ['danielson.tlac.skill.double-plan'], rating: 4 }),
        observation({ id: 'jordan-q4', teacherUsername: 'demo.hod.math', observationType: 'formal_q4', observedAt: daysBefore(referenceTime, 12), componentId: 'danielson.framework.component.4a', rating: 3, componentRatings: formalComponentRatings(3) }),
      ],
      publicComments: [], privateComments: [], responses: [], gbf: null, pip: null,
    },
    {
      username: 'demo.teacher.new', displayName: 'Maya Chen', position: 'Teacher',
      departmentKeys: ['primary-school'], experience: 'new', expectedState: 'not_enough_evidence',
      walkthroughPriorityCount: 3, formalObservationTypes: [], responseCount: 0,
      observations: [observation({ id: 'maya-ne', teacherUsername: 'demo.teacher.new', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 4), componentId: 'danielson.framework.component.1a', targetSkillIds: ['danielson.tlac.skill.exemplar-planning'], rating: null, priorityReason: 'evidence_gap', evidenceNote: 'Collect another sample during the next walkthrough.' })],
      publicComments: [], privateComments: [], responses: [],
      gbf: { state: 'in_progress', assignedSkillIds: ['danielson.tlac.skill.routine-building', 'danielson.tlac.skill.strong-voice'], unresolvedGapSkillIds: ['danielson.tlac.skill.routine-building'] },
      pip: null,
    },
    {
      username: 'demo.teacher.developing', displayName: 'Noah Williams', position: 'Teacher',
      departmentKeys: ['primary-school'], experience: 'developing', expectedState: 'below_proficient',
      walkthroughPriorityCount: 3, formalObservationTypes: [], responseCount: 0,
      observations: [
        observation({ id: 'noah-walkthrough-1', teacherUsername: 'demo.teacher.developing', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 18), componentId: 'danielson.framework.component.3b', targetSkillIds: ['danielson.tlac.skill.cold-call'], rating: 1 }),
        observation({ id: 'noah-walkthrough-2', teacherUsername: 'demo.teacher.developing', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 10), componentId: 'danielson.framework.component.3b', targetSkillIds: ['danielson.tlac.skill.stretch-it'], rating: 2 }),
        observation({ id: 'noah-walkthrough-3', teacherUsername: 'demo.teacher.developing', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 5), componentId: 'danielson.framework.component.3c', targetSkillIds: ['danielson.tlac.skill.turn-and-talk'], rating: 2 }),
      ],
      publicComments: [], privateComments: [], responses: [], gbf: null, pip: null,
    },
    {
      username: 'demo.teacher.experienced', displayName: 'Sofia Patel', position: 'Teacher',
      departmentKeys: ['mathematics'], experience: 'experienced', expectedState: 'proficient',
      walkthroughPriorityCount: 0, formalObservationTypes: ['formal_q1', 'formal_q4'], responseCount: 0,
      observations: [
        observation({ id: 'sofia-q1', teacherUsername: 'demo.teacher.experienced', observationType: 'formal_q1', observedAt: daysBefore(referenceTime, 60), componentId: 'danielson.framework.component.1e', rating: 3 }),
        observation({ id: 'sofia-q4', teacherUsername: 'demo.teacher.experienced', observationType: 'formal_q4', observedAt: daysBefore(referenceTime, 12), componentId: 'danielson.framework.component.4a', rating: 4, componentRatings: formalComponentRatings(4) }),
      ],
      publicComments: ['Sofia shows sustained practice across the school year.'], privateComments: [], responses: [], gbf: null, pip: null,
    },
    {
      username: 'demo.teacher.pip', displayName: 'Ethan Brooks', position: 'Teacher',
      departmentKeys: ['mathematics'], experience: 'developing', expectedState: 'below_proficient',
      walkthroughPriorityCount: 3, formalObservationTypes: [], responseCount: 0,
      observations: [
        observation({ id: 'ethan-walkthrough-1', teacherUsername: 'demo.teacher.pip', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 20), componentId: 'danielson.framework.component.3b', targetSkillIds: ['danielson.tlac.skill.cold-call'], rating: 2 }),
        observation({ id: 'ethan-walkthrough-2', teacherUsername: 'demo.teacher.pip', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 3), componentId: 'danielson.framework.component.3b', targetSkillIds: ['danielson.tlac.skill.stretch-it'], rating: 3 }),
      ],
      publicComments: ['Ethan has a clear support plan for the current review period.'], privateComments: ['Leadership will review Ethan\'s target evidence weekly.'], responses: [], gbf: null, pip: activePip(referenceTime),
    },
    {
      username: 'demo.teacher.growth', displayName: 'Lina Park', position: 'Teacher',
      departmentKeys: ['primary-school'], experience: 'experienced', expectedState: 'proficient',
      walkthroughPriorityCount: 0, formalObservationTypes: ['formal_q4'], responseCount: 1,
      observations: [
        observation({ id: 'lina-walkthrough-1', teacherUsername: 'demo.teacher.growth', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 42), componentId: 'danielson.framework.component.3e', targetSkillIds: ['danielson.tlac.skill.plan-for-error'], rating: 2 }),
        observation({ id: 'lina-walkthrough-2', teacherUsername: 'demo.teacher.growth', observationType: 'walkthrough', observedAt: daysBefore(referenceTime, 20), componentId: 'danielson.framework.component.3e', targetSkillIds: ['danielson.tlac.skill.plan-for-error'], rating: 3 }),
        observation({ id: 'lina-q4', teacherUsername: 'demo.teacher.growth', observationType: 'formal_q4', observedAt: daysBefore(referenceTime, 12), componentId: 'danielson.framework.component.4a', rating: 3, componentRatings: formalComponentRatings(3) }),
      ],
      publicComments: [], privateComments: [], responses: ['I used the planning check before the next lesson and saw a stronger result.'], gbf: null, pip: closedPip(referenceTime),
    },
  ];

  return {
    referenceTime,
    organization: { slug: 'danielson-school', name: 'Danielson School' },
    accounts,
    departments: [
      { key: 'mathematics', name: 'Mathematics' },
      { key: 'primary-school', name: 'Primary School' },
    ],
    departmentMemberships: teachers.flatMap((teacher) => teacher.departmentKeys.map((departmentKey) => ({
      teacherUsername: teacher.username,
      departmentKey,
    }))),
    hodAssignment: { accountUsername: 'demo.hod.math', departmentKey: 'mathematics' },
    coachAssignments: teachers
      .filter((teacher) => teacher.departmentKeys.includes('primary-school'))
      .map((teacher) => ({ accountUsername: 'demo.coach.primary' as const, teacherUsername: teacher.username })),
    teachers,
  };
}
