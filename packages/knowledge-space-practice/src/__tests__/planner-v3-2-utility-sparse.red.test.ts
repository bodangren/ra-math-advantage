import { describe, expect, it, vi } from "vitest";

import { bindDomainUtilityProviderV3_2 } from "../planner/v3-2-domain-utility-contract";
import {
  createDomainUtilityRegistryV3_2,
  createSyntheticUtilityProviderV3_2,
  resolveDomainUtilityV3_2,
} from "../planner/v3-2-domain-utility";
import { planRecommendationsV3_2 } from "../planner/v3-2-recommendations";

const context = {
  schemaVersion: "planner.learner-context.v3.2" as const,
  learnerId: "student.1",
  domain: "english.cefr",
  asOf: "2026-07-10T00:00:00.000Z",
  attributes: {},
};
const releaseIdentity = (domain: string) => ({
  domain,
  graphReleaseId: `${domain}.release`,
  graphContentHash: `sha256:${domain}`,
  precomputeInputHash: `sha256:${domain}:input`,
});

function boundProvider(domain = "english.cefr") {
  const getUtility = vi.fn((nodeId: string) => ({
    utility: nodeId === "make" ? 0.98 : 0.08,
    signals: [
      {
        source: "wordfreq-en",
        sourceVersion: "3.1",
        value: nodeId === "make" ? 6.2 : 2.1,
        weight: 1,
      },
    ],
  }));
  const provider = {
    providerKey: `${domain}.frequency-utility`,
    version: "1.0.0",
    getUtility,
  };
  return {
    getUtility,
    bound: bindDomainUtilityProviderV3_2(
      {
        domain,
        graphReleaseId: `${domain}.release`,
        graphContentHash: `sha256:${domain}`,
        precomputeInputHash: `sha256:${domain}:input`,
        providerKey: provider.providerKey,
        providerVersion: provider.version,
      },
      provider,
    ),
  };
}

describe("planner.v3.2 utility provider behavior", () => {
  it("returns versioned provider identity and non-empty signal provenance", () => {
    const { bound } = boundProvider();
    const result = resolveDomainUtilityV3_2({
      registry: createDomainUtilityRegistryV3_2([bound]),
      domain: "english.cefr",
      graphReleaseIdentity: releaseIdentity("english.cefr"),
      nodeId: "make",
      context,
    });
    expect(result).toMatchObject({
      kind: "provider",
      providerKey: "english.cefr.frequency-utility",
      providerVersion: "1.0.0",
      utility: 0.98,
      weightsRenormalized: false,
      signals: [{ source: "wordfreq-en", sourceVersion: "3.1", value: 6.2, weight: 1 }],
    });
  });

  it("is explicitly inert when no provider is registered", () => {
    expect(
      resolveDomainUtilityV3_2({
        registry: createDomainUtilityRegistryV3_2([]),
        domain: "math",
        graphReleaseIdentity: releaseIdentity("math"),
        nodeId: "skill.a",
        context: { ...context, domain: "math" },
      }),
    ).toEqual({
      schemaVersion: "planner.utility-resolution.v3.2",
      kind: "inert",
      utility: 0,
      releaseIdentity: releaseIdentity("math"),
      signals: [],
      reason: "no-provider",
      weightsRenormalized: false,
    });
  });

  it("isolates adapters by domain and never calls an unrelated provider", () => {
    const english = boundProvider("english.cefr");
    const math = boundProvider("math");
    const registry = createDomainUtilityRegistryV3_2([english.bound, math.bound]);
    resolveDomainUtilityV3_2({
      registry,
      domain: "math",
      graphReleaseIdentity: releaseIdentity("math"),
      nodeId: "make",
      context: { ...context, domain: "math" },
    });
    expect(math.getUtility).toHaveBeenCalledOnce();
    expect(english.getUtility).not.toHaveBeenCalled();
  });

  it("rejects malformed runtime provider output instead of losing provenance", () => {
    const provider = {
      providerKey: "bad.provider",
      version: "1",
      getUtility: () => ({ utility: 2, signals: [] }),
    };
    const bound = bindDomainUtilityProviderV3_2(
      {
        domain: "bad",
        graphReleaseId: "bad.1",
        graphContentHash: "sha256:bad",
        precomputeInputHash: "sha256:bad-input",
        providerKey: provider.providerKey,
        providerVersion: provider.version,
      },
      provider,
    );
    expect(() =>
      resolveDomainUtilityV3_2({
        registry: createDomainUtilityRegistryV3_2([bound]),
        domain: "bad",
        graphReleaseIdentity: releaseIdentity("bad"),
        nodeId: "x",
        context: { ...context, domain: "bad" },
      }),
    ).toThrow();
  });

  it("ships a deterministic offline synthetic reference provider", () => {
    const provider = createSyntheticUtilityProviderV3_2({
      providerKey: "synthetic.utility",
      version: "1",
      source: "fixture",
      sourceVersion: "1",
      utilityByNode: { a: 0.75 },
    });
    expect(provider.getUtility("a", context)).toEqual(provider.getUtility("a", context));
    expect(provider.getUtility("a", context)).toMatchObject({
      utility: 0.75,
      signals: [{ source: "fixture", sourceVersion: "1" }],
    });
  });
});

describe("planner.v3.2 sparse-domain ranking behavior", () => {
  const fallbackGroup = (nodeId: string) => ({
    groupId: nodeId,
    ancestorNodeId: null,
    ancestorKind: "self_fallback" as const,
    distance: 0,
  });
  const resolution = (utility: number) =>
    utility === 0
      ? {
          schemaVersion: "planner.utility-resolution.v3.2" as const,
          kind: "inert" as const,
          releaseIdentity: releaseIdentity("english.cefr"),
          utility: 0 as const,
          signals: [] as [],
          reason: "no-provider" as const,
          weightsRenormalized: false as const,
        }
      : {
          schemaVersion: "planner.utility-resolution.v3.2" as const,
          kind: "provider" as const,
          releaseIdentity: releaseIdentity("english.cefr"),
          providerKey: "english.cefr.frequency",
          providerVersion: "1",
          utility,
          signals: [{ source: "wordfreq-en", sourceVersion: "3.1", value: utility, weight: 1 }],
          weightsRenormalized: false as const,
        };
  const sparseRelease = (nodeIds: string[]) => ({
    schemaVersion: "planner.graph-release-output.v3.2" as const,
    ...releaseIdentity("english.cefr"),
    goalNodeIds: [],
    skillCount: nodeIds.length,
    skillsWithPrerequisiteInEdge: 0,
    prerequisiteInEdgeRatio: 0,
    sparseThreshold: 0.05 as const,
    rankingMode: "utility-led" as const,
    maxReach: 0,
    reachByNode: nodeIds.map((nodeId) => ({
      nodeId,
      downstreamReach: 0,
      normalizedUnlockValue: 0,
      goalDistance: null,
      goalProximity: 0,
      diversityGroup: fallbackGroup(nodeId),
    })),
  });

  it("uses readiness only as a gate and ranks 0.7 utility plus 0.3 weakness fit", () => {
    const result = planRecommendationsV3_2({
      graphRelease: sparseRelease(["make", "environment", "hitherto", "blocked"]),
      readyThreshold: 0.8,
      requestedCount: 5,
      candidates: [
        { nodeId: "make", readiness: 0.8, weaknessFit: 0, utilityResolution: resolution(0.98) },
        {
          nodeId: "environment",
          readiness: 1,
          weaknessFit: 0.5,
          utilityResolution: resolution(0.71),
        },
        { nodeId: "hitherto", readiness: 1, weaknessFit: 0, utilityResolution: resolution(0.08) },
        { nodeId: "blocked", readiness: 0.79, weaknessFit: 1, utilityResolution: resolution(1) },
      ],
    });
    expect(
      result.recommendations.map((entry) => [entry.score.nodeId, entry.score.composite]),
    ).toEqual([
      ["make", 0.686],
      ["environment", 0.647],
      ["hitherto", 0.056],
    ]);
    expect(result.utilityResolutions.make).toMatchObject({
      kind: "provider",
      providerKey: "english.cefr.frequency",
      providerVersion: "1",
      signals: [{ source: "wordfreq-en", sourceVersion: "3.1" }],
    });
  });

  it("keeps missing utility at zero without hidden sparse-weight renormalization", () => {
    const result = planRecommendationsV3_2({
      graphRelease: sparseRelease(["weak"]),
      readyThreshold: 0.8,
      requestedCount: 1,
      candidates: [
        { nodeId: "weak", readiness: 1, weaknessFit: 0.5, utilityResolution: resolution(0) },
      ],
    });
    expect(result.recommendations[0]?.score).toMatchObject({
      composite: 0.15,
      weights: { a: 0, b: 0, c: 0, d: 0.3, e: 0.7 },
    });
  });
});
