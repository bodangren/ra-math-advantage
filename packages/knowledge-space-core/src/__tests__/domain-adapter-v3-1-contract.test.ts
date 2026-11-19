import { describe, expect, it } from "vitest";

import {
  DOMAIN_ADAPTER_V31_CONTRACT_VERSION,
  ageBandPolicySchema,
  domainAdapterV31DeclarationsSchema,
  guessFloorPolicySchema,
  isAgeBandPolicy,
  isDomainAdapterV31Declarations,
  isGuessFloorPolicy,
  isPlacementProbeInstrumentPolicy,
  placementProbeInstrumentPolicySchema,
} from "../index";
import type { DomainAdapter, KnowledgeSpaceNode } from "../index";

const validDeclarations = {
  contractVersion: "domain-adapter.v3.1",
  guessFloors: {
    policyVersion: "answer-formats.2026-07",
    byAnswerFormat: {
      "vendor/choice:4": 0.25,
      "opaque-free-response": 0,
    },
  },
  ageBands: {
    policyVersion: "learner-age-bands.v2",
    bands: [
      { populationKey: "younger", minAgeYearsInclusive: 0, maxAgeYearsExclusive: 13 },
      { populationKey: "older", minAgeYearsInclusive: 13, maxAgeYearsExclusive: 19 },
    ],
  },
  placementProbeInstruments: {
    policyVersion: "placement-instruments.v4",
    instruments: [
      {
        instrumentId: "placement-bank-a",
        instrumentVersion: "2026.3",
        highFidelity: true,
      },
    ],
  },
} as const;

describe("v3.1 domain-adapter declarations", () => {
  it("accepts versioned, domain-neutral declarations through strict runtime schemas", () => {
    const parsed = domainAdapterV31DeclarationsSchema.parse(validDeclarations);

    expect(DOMAIN_ADAPTER_V31_CONTRACT_VERSION).toBe("domain-adapter.v3.1");
    expect(parsed.guessFloors.byAnswerFormat["vendor/choice:4"]).toBe(0.25);
    expect(parsed.ageBands.bands[1].populationKey).toBe("older");
    expect(parsed.placementProbeInstruments?.instruments[0].highFidelity).toBe(true);
    expect(isDomainAdapterV31Declarations(parsed)).toBe(true);
  });

  it("treats answer-format identifiers as opaque while enforcing floors in [0, 1)", () => {
    expect(isGuessFloorPolicy(validDeclarations.guessFloors)).toBe(true);
    expect(
      guessFloorPolicySchema.safeParse({
        policyVersion: "v1",
        byAnswerFormat: { "provider/custom.format#7": 0.125 },
      }).success,
    ).toBe(true);

    for (const invalidFloor of [-0.001, 1, Number.POSITIVE_INFINITY]) {
      expect(
        guessFloorPolicySchema.safeParse({
          policyVersion: "v1",
          byAnswerFormat: { opaque: invalidFloor },
        }).success,
      ).toBe(false);
    }

    expect(
      guessFloorPolicySchema.safeParse({
        policyVersion: "v1",
        byAnswerFormat: {},
      }).success,
    ).toBe(false);
    expect(
      guessFloorPolicySchema.safeParse({
        policyVersion: "v1",
        byAnswerFormat: { "": 0 },
      }).success,
    ).toBe(false);
  });

  it("requires unique, non-overlapping half-open age bands for FSRS population keys", () => {
    expect(isAgeBandPolicy(validDeclarations.ageBands)).toBe(true);
    expect(
      ageBandPolicySchema.safeParse({
        policyVersion: "v1",
        bands: [
          { populationKey: "a", minAgeYearsInclusive: 6, maxAgeYearsExclusive: 12 },
          { populationKey: "b", minAgeYearsInclusive: 11, maxAgeYearsExclusive: 18 },
        ],
      }).success,
    ).toBe(false);
    expect(
      ageBandPolicySchema.safeParse({
        policyVersion: "v1",
        bands: [
          { populationKey: "same", minAgeYearsInclusive: 6, maxAgeYearsExclusive: 12 },
          { populationKey: "same", minAgeYearsInclusive: 12, maxAgeYearsExclusive: 18 },
        ],
      }).success,
    ).toBe(false);
    expect(
      ageBandPolicySchema.safeParse({
        policyVersion: "v1",
        bands: [{ populationKey: "invalid", minAgeYearsInclusive: 18, maxAgeYearsExclusive: 18 }],
      }).success,
    ).toBe(false);
  });

  it("only declares explicitly versioned high-fidelity placement instruments", () => {
    expect(isPlacementProbeInstrumentPolicy(validDeclarations.placementProbeInstruments)).toBe(
      true,
    );
    expect(
      placementProbeInstrumentPolicySchema.safeParse({
        policyVersion: "v1",
        instruments: [
          {
            instrumentId: "probe-a",
            instrumentVersion: "1",
            highFidelity: false,
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      placementProbeInstrumentPolicySchema.safeParse({
        policyVersion: "v1",
        instruments: [
          { instrumentId: "probe-a", instrumentVersion: "1", highFidelity: true },
          { instrumentId: "probe-a", instrumentVersion: "2", highFidelity: true },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects undeclared fields instead of silently accepting contract drift", () => {
    expect(
      domainAdapterV31DeclarationsSchema.safeParse({
        ...validDeclarations,
        domainSpecificContent: { curriculum: "must-not-live-in-core" },
      }).success,
    ).toBe(false);
    expect(
      domainAdapterV31DeclarationsSchema.safeParse({
        ...validDeclarations,
        guessFloors: {
          ...validDeclarations.guessFloors,
          fallback: 0.5,
        },
      }).success,
    ).toBe(false);
  });

  it("preserves existing DomainAdapter implementations and adds v3.1 declarations optionally", () => {
    const validateNodeMetadata = (_node: KnowledgeSpaceNode) => ({ valid: true });
    const legacyAdapter = {
      domain: "legacy.domain",
      validateNodeMetadata,
    } satisfies DomainAdapter;
    const v31Adapter = {
      ...legacyAdapter,
      v31: validDeclarations,
    } satisfies DomainAdapter;

    expect(legacyAdapter.domain).toBe("legacy.domain");
    expect(domainAdapterV31DeclarationsSchema.safeParse(v31Adapter.v31).success).toBe(true);
  });
});
