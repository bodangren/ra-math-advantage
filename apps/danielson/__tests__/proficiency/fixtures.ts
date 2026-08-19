export const FIXED_NOW = '2026-08-19T00:00:00.000Z';
export const FIXED_NOW_MS = Date.parse(FIXED_NOW);
export const DAY_MS = 24 * 60 * 60 * 1000;

export type FixtureNode = {
  id: string;
  kind: 'domain' | 'content_group' | 'instructional_unit' | 'skill';
  title: string;
  domain: string;
  sourceRefs: Array<{ source: string; location?: string }>;
  reviewStatus: 'approved' | 'reviewed' | 'draft';
  metadata: Record<string, unknown>;
};

export type FixtureEdge = {
  id: string;
  type: 'contains' | 'prerequisite_for';
  sourceId: string;
  targetId: string;
  weight: number;
  confidence: 'high';
  sourceRefs: Array<{ source: string }>;
  reviewStatus: 'approved' | 'reviewed';
  metadata: Record<string, unknown>;
};

export type FixtureGraph = {
  nodes: FixtureNode[];
  edges: FixtureEdge[];
};

export const DANIELSON_COMPONENT_IDS = [
  '1a', '1b', '1c', '1d', '1e', '1f',
  '2a', '2b', '2c', '2d', '2e',
  '3a', '3b', '3c', '3d', '3e',
  '4a', '4b', '4c', '4d', '4e', '4f',
] as const;

export const RUNTIME_ONLY_TECHNIQUES = [
  { id: 'concept-mapping', source: 'Visible Learning' },
  { id: 'student-centered-research', source: 'Visible Learning' },
  { id: 'differentiated-instruction', source: 'Marzano' },
  { id: 'cultural-competency', source: 'Edutopia' },
  { id: 'learning-goals', source: 'Marzano' },
  { id: 'strategic-investment', source: 'TLAC 3.0' },
  { id: 'student-friendly-rubrics', source: 'Hattie' },
  { id: 'resource-curation', source: 'DangRenBo' },
  { id: 'case-study-analysis', source: 'DangRenBo' },
  { id: 'professional-networks', source: 'Edutopia' },
  { id: 'scaffolding-complex-tasks', source: 'Edutopia' },
  { id: 'exit-tickets', source: 'TLAC 3.0' },
  { id: 'high-expectations', source: 'TLAC 3.0' },
  { id: 'student-pride', source: 'Edutopia' },
  { id: 'tight-transitions', source: 'TLAC 3.0' },
  { id: 'threshold', source: 'Wong / TLAC' },
  { id: 'be-seen-looking', source: 'TLAC 3.0' },
  { id: 'invisible-columns-space', source: 'TLAC 3.0' },
  { id: 'front-table', source: 'DangRenBo' },
  { id: 'visual-aids', source: 'Edutopia' },
  { id: 'vocabulary-movement', source: 'Uncommon Schools' },
  { id: 'ratio-thinking', source: 'TLAC 3.0' },
  { id: 'retrieval-practice-routine', source: 'Uncommon Schools' },
  { id: 'show-me-assessment', source: 'TLAC 3.0' },
  { id: 'self-assessment-checks', source: 'Marzano' },
  { id: 'plan-for-error-flex', source: 'TLAC 3.0' },
  { id: 'hinge-points-flex', source: 'Visible Learning' },
  { id: 'red-yellow-green', source: 'Teaching Channel' },
  { id: 'reflection-logs-4a', source: 'HDKWA PD Portal' },
  { id: 'video-reflection', source: 'Teaching Channel' },
  { id: 'smart-ledgers-4b', source: 'DangRenBo' },
  { id: 'gradebook-transparency', source: 'Edutopia' },
  { id: 'home-contributions-4c', source: 'Visible Learning' },
  { id: 'newsletters', source: 'Edutopia' },
  { id: 'professional-community-4d', source: 'Visible Learning' },
  { id: 'action-research-teams', source: 'Marzano' },
  { id: 'professional-growth-4e', source: 'Visible Learning' },
  { id: 'pd-leadership', source: 'DangRenBo' },
  { id: 'firm-calm-finesse-4f', source: 'TLAC 3.0' },
  { id: 'advocacy', source: 'Edutopia' },
] as const;

export const APPROVED_STANDALONE_SOURCE_HASH = '4704ae10511d27c4b3cc7951c0aadfe48558aa86e1148f8ba4f116383fe7cb1b';
export const RUNTIME_ARRAY_SOURCE_HASH = '9cecd83e24dfba10bcc6e765ae9b0a5a9083d08aff8b5e16c0b67b8b4220e705';

const sourceRefs = [{ source: 'Danielson Framework for Teaching 2022' }];

export function createFixtureGraph(): FixtureGraph {
  const root: FixtureNode = {
    id: 'danielson.framework.2022',
    kind: 'domain',
    title: 'Framework for Teaching 2022',
    domain: 'danielson',
    sourceRefs,
    reviewStatus: 'approved',
    metadata: {},
  };
  const domains = [1, 2, 3, 4].map((number) => ({
    id: `danielson.framework.domain.${number}`,
    kind: 'content_group' as const,
    title: `Domain ${number}`,
    domain: 'danielson',
    sourceRefs,
    reviewStatus: 'approved' as const,
    metadata: { domainNumber: number },
  }));
  const components = DANIELSON_COMPONENT_IDS.map((componentId) => ({
    id: `danielson.framework.component.${componentId}`,
    kind: 'instructional_unit' as const,
    title: `Component ${componentId}`,
    domain: 'danielson',
    sourceRefs,
    reviewStatus: 'approved' as const,
    metadata: { componentId },
  }));
  const skills: FixtureNode[] = [
    'double-plan',
    'change-the-pace',
    'exemplar-planning',
  ].map((techniqueId) => ({
    id: `danielson.tlac.skill.${techniqueId}`,
    kind: 'skill' as const,
    title: techniqueId,
    domain: 'danielson',
    sourceRefs: [{ source: 'Teach Like a Champion 3.0' }],
    reviewStatus: 'approved' as const,
    metadata: { techniqueId },
  }));
  const edges: FixtureEdge[] = [
    ...domains.map((domain) => ({
      id: `danielson.edge.contains.root.${domain.id.split('.').at(-1)}`,
      type: 'contains' as const,
      sourceId: root.id,
      targetId: domain.id,
      weight: 1,
      confidence: 'high' as const,
      sourceRefs,
      reviewStatus: 'approved' as const,
      metadata: {},
    })),
    ...components.map((component) => ({
      id: `danielson.edge.contains.domain-${component.metadata.componentId?.toString().charAt(0)}.${component.metadata.componentId}`,
      type: 'contains' as const,
      sourceId: `danielson.framework.domain.${component.metadata.componentId?.toString().charAt(0)}`,
      targetId: component.id,
      weight: 1,
      confidence: 'high' as const,
      sourceRefs,
      reviewStatus: 'approved' as const,
      metadata: {},
    })),
    ...skills.map((skill) => ({
      id: `danielson.edge.contains.1e.${skill.metadata.techniqueId}`,
      type: 'contains' as const,
      sourceId: 'danielson.framework.component.1e',
      targetId: skill.id,
      weight: 1,
      confidence: 'high' as const,
      sourceRefs: [{ source: 'Teach Like a Champion 3.0' }],
      reviewStatus: 'approved' as const,
      metadata: {},
    })),
  ];

  return { nodes: [root, ...domains, ...components, ...skills], edges };
}

export const TEACHER_ID = 'teacher_profiles:one';
export const OBSERVER_ID = 'accounts:observer';
export const ORGANIZATION_ID = 'organizations:school';
export const COMPONENT_1E = 'danielson.framework.component.1e';
export const SKILL_IDS = [
  'danielson.tlac.skill.change-the-pace',
  'danielson.tlac.skill.double-plan',
  'danielson.tlac.skill.exemplar-planning',
] as const;

export function createRatedEvidence(overrides: Record<string, unknown> = {}) {
  return {
    kind: 'rated',
    idempotencyKey: 'observation-q1-001',
    organizationId: ORGANIZATION_ID,
    teacherId: TEACHER_ID,
    sourceRecordId: 'observation_records:q1-001',
    formalObservationId: 'formal_observations:q1-001',
    sourceType: 'formal_q1',
    componentId: COMPONENT_1E,
    targetSkillIds: [...SKILL_IDS],
    observerId: OBSERVER_ID,
    occurredAt: FIXED_NOW,
    sourceVersion: 'danielson-2022',
    provenanceGroupId: 'provenance:q1-001',
    rating: 3,
    ...overrides,
  };
}

export function createNoEvidence(overrides: Record<string, unknown> = {}) {
  const rated = createRatedEvidence();
  return {
    ...rated,
    kind: 'not_enough_evidence',
    idempotencyKey: 'observation-q1-no-evidence',
    ...overrides,
    rating: undefined,
  };
}

export function createStableDueCard(overrides: Record<string, unknown> = {}) {
  return {
    cardId: 'teacher_srs_cards:stable-double-plan',
    studentId: TEACHER_ID,
    objectiveId: SKILL_IDS[1],
    variantKey: SKILL_IDS[1],
    stability: 500,
    difficulty: 4,
    state: 'review',
    dueDate: '2026-08-01T00:00:00.000Z',
    elapsedDays: 18,
    scheduledDays: 180,
    reps: 12,
    lapses: 0,
    lastReview: '2026-08-01T00:00:00.000Z',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

export type TeacherState = {
  teacherId: string;
  idempotency: Array<{ key: string; fingerprint: string }>;
  observationOutcomes: Array<Record<string, unknown>>;
  cards: Array<Record<string, unknown>>;
  reviews: Array<Record<string, unknown>>;
  proficiency: Array<Record<string, unknown>>;
  knowledgeState: Array<Record<string, unknown>>;
  priority: Array<Record<string, unknown>>;
  annotations: Array<Record<string, unknown>>;
};

export type TeacherEvidenceCommit = {
  teacherId: string;
  idempotency: { key: string; fingerprint: string };
  outcome: Record<string, unknown>;
  cards?: Array<Record<string, unknown>>;
  reviews?: Array<Record<string, unknown>>;
  proficiency?: Array<Record<string, unknown>>;
  knowledgeState?: Array<Record<string, unknown>>;
  priority?: Array<Record<string, unknown>>;
  annotation?: Record<string, unknown>;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class MemoryTeacherProficiencyPort {
  readonly commits: TeacherEvidenceCommit[] = [];
  private readonly states = new Map<string, TeacherState>();

  constructor(initial: Partial<TeacherState> = {}) {
    this.states.set(TEACHER_ID, {
      teacherId: TEACHER_ID,
      idempotency: [],
      observationOutcomes: [],
      cards: [],
      reviews: [],
      proficiency: [],
      knowledgeState: [],
      priority: [],
      annotations: [],
      ...clone(initial),
    });
  }

  async getTeacherState(teacherId: string): Promise<TeacherState> {
    const current = this.states.get(teacherId) ?? {
      teacherId,
      idempotency: [],
      observationOutcomes: [],
      cards: [],
      reviews: [],
      proficiency: [],
      knowledgeState: [],
      priority: [],
      annotations: [],
    };
    return clone(current);
  }

  async commitTeacherEvidence(commit: TeacherEvidenceCommit): Promise<void> {
    const state = await this.getTeacherState(commit.teacherId);
    state.idempotency.push(commit.idempotency);
    state.observationOutcomes.push(clone(commit.outcome));
    state.cards = clone(commit.cards ?? state.cards);
    state.reviews = [...state.reviews, ...clone(commit.reviews ?? [])];
    state.proficiency = clone(commit.proficiency ?? state.proficiency);
    state.knowledgeState = clone(commit.knowledgeState ?? state.knowledgeState);
    state.priority = clone(commit.priority ?? state.priority);
    if (commit.annotation) state.annotations.push(clone(commit.annotation));
    this.states.set(commit.teacherId, state);
    this.commits.push(clone(commit));
  }

  async snapshot(teacherId = TEACHER_ID): Promise<string> {
    return JSON.stringify(await this.getTeacherState(teacherId));
  }
}
