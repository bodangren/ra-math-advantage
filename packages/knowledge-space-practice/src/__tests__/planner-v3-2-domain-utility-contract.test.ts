import { describe, expect, it } from 'vitest';

import {
  domainUtilityRegistryV3_2Schema,
  learnerUtilityContextV3_2Schema,
  prerequisiteSparseReleaseV3_2Schema,
  utilityProviderResultV3_2Schema,
  utilityResolutionV3_2Schema,
  utilitySignalV3_2Schema,
  type DomainUtilityProviderV3_2,
} from '../planner/v3-2-domain-utility-contract';

describe('planner.v3.2 domain utility contract', () => {
  it('requires finite weighted source provenance', () => {
    expect(utilitySignalV3_2Schema.parse({
      source: 'wordfreq-en', sourceVersion: '3.1', value: 6.2, weight: 1,
    })).toEqual({ source: 'wordfreq-en', sourceVersion: '3.1', value: 6.2, weight: 1 });
    expect(utilitySignalV3_2Schema.safeParse({ source: 'x', sourceVersion: '1', value: 1, weight: -1 }).success).toBe(false);
    expect(utilitySignalV3_2Schema.safeParse({ source: 'x', sourceVersion: '1', value: Number.NaN, weight: 1 }).success).toBe(false);
  });

  it('rejects provider scores without non-empty provenance', () => {
    expect(utilityProviderResultV3_2Schema.safeParse({ utility: 0.98, signals: [] }).success).toBe(false);
    expect(utilityProviderResultV3_2Schema.parse({
      utility: 0.98,
      signals: [{ source: 'wordfreq-en', sourceVersion: '3.1', value: 6.2, weight: 1 }],
    }).utility).toBe(0.98);
  });

  it('defines a deterministic serializable learner context and provider interface', () => {
    const context = learnerUtilityContextV3_2Schema.parse({
      schemaVersion: 'planner.learner-context.v3.2', learnerId: 'student.1', domain: 'english.cefr',
      asOf: '2026-07-10T00:00:00.000Z', attributes: { goal: 'B2', grade: 8, intervention: false },
    });
    const provider: DomainUtilityProviderV3_2 = {
      providerKey: 'english.cefr.frequency-utility', version: '1.0.0',
      getUtility: (_nodeId, ctx) => ({ utility: ctx.domain === 'english.cefr' ? 0.8 : 0, signals: [{ source: 'fixture', sourceVersion: '1', value: 0.8, weight: 1 }] }),
    };
    expect(provider.getUtility('word.make', context).utility).toBe(0.8);
  });

  it('makes no-provider resolution explicitly inert without hidden renormalization', () => {
    expect(utilityResolutionV3_2Schema.parse({
      schemaVersion: 'planner.utility-resolution.v3.2', kind: 'inert', utility: 0,
      signals: [], reason: 'no-provider', weightsRenormalized: false,
    }).kind).toBe('inert');
  });

  it('registers at most one versioned provider per domain adapter', () => {
    const registration = {
      domain: 'english.cefr', graphReleaseId: 'cefr.2026-07-10',
      providerKey: 'english.cefr.frequency-utility', providerVersion: '1.0.0',
    };
    expect(domainUtilityRegistryV3_2Schema.safeParse({
      schemaVersion: 'planner.utility-registry.v3.2', registrations: [registration],
    }).success).toBe(true);
    expect(domainUtilityRegistryV3_2Schema.safeParse({
      schemaVersion: 'planner.utility-registry.v3.2', registrations: [registration, { ...registration, providerVersion: '2.0.0' }],
    }).success).toBe(false);
  });
});

describe('planner.v3.2 prerequisite-sparse release contract', () => {
  it.each([
    [4, 100, 0.04, true, 'utility-led'],
    [5, 100, 0.05, false, 'normalized-prerequisite'],
  ] as const)('classifies %i/%i prerequisite-bearing skills', (withEdges, skills, ratio, sparse, mode) => {
    const parsed = prerequisiteSparseReleaseV3_2Schema.parse({
      schemaVersion: 'planner.sparse-release.v3.2', graphReleaseId: 'graph.1', domain: 'english.cefr',
      skillCount: skills, skillsWithPrerequisiteInEdge: withEdges, prerequisiteInEdgeRatio: ratio,
      sparseThreshold: 0.05, prerequisiteSparse: sparse, rankingMode: mode,
      readyThreshold: 0.8, sparseWeights: { utility: 0.7, weaknessFit: 0.3 },
      readinessIsGateOnly: sparse, syntheticPrerequisitesProhibited: true,
    });
    expect(parsed.prerequisiteSparse).toBe(sparse);
  });

  it('rejects synthetic-prerequisite and inconsistent sparse metadata', () => {
    expect(prerequisiteSparseReleaseV3_2Schema.safeParse({
      schemaVersion: 'planner.sparse-release.v3.2', graphReleaseId: 'graph.1', domain: 'english.cefr',
      skillCount: 100, skillsWithPrerequisiteInEdge: 0, prerequisiteInEdgeRatio: 0,
      sparseThreshold: 0.05, prerequisiteSparse: false, rankingMode: 'normalized-prerequisite',
      readyThreshold: 0.8, sparseWeights: { utility: 0.7, weaknessFit: 0.3 },
      readinessIsGateOnly: false, syntheticPrerequisitesProhibited: false,
    }).success).toBe(false);
    expect(prerequisiteSparseReleaseV3_2Schema.safeParse({
      schemaVersion: 'planner.sparse-release.v3.2', graphReleaseId: 'graph.1', domain: 'english.cefr',
      skillCount: 100, skillsWithPrerequisiteInEdge: 0, prerequisiteInEdgeRatio: 0,
      sparseThreshold: 0.9, prerequisiteSparse: true, rankingMode: 'utility-led',
      readyThreshold: 0.8, sparseWeights: { utility: 0.7, weaknessFit: 0.3 },
      readinessIsGateOnly: true, syntheticPrerequisitesProhibited: true,
    }).success).toBe(false);
  });
});
