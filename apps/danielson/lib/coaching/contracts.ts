export type CoachingCycle = {
  _id: string; teacherProfileId: string; ownerAccountId: string; skillId: string;
  action: string; support: string; followUpDate: string; baselineObservationId: string;
  followUpObservationId: string | null; reflection: string; conclusion: string;
  state: 'active' | 'complete'; revision: number; createdAt: number;
};
export type CoachingEvidence = {
  observationId: string; observedAt: string;
  items: Array<{ skillId?: string; componentId: string; evidenceNote: string | null;
    outcome: { kind: 'rated'; rating: number } | { kind: 'not_enough_evidence' } | null }>;
};
