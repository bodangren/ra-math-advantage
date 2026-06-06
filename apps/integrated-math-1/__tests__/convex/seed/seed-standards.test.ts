import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CODE_REGEX, collectReferencedCodes } from "./referenced-codes";

const APP_ROOT = path.resolve(__dirname, "../../..");
const SEED_DIR = path.join(APP_ROOT, "convex/seed");
const SEED_STANDARDS_PATH = path.join(SEED_DIR, "seed_standards.ts");
const SEED_ORCHESTRATOR_PATH = path.join(APP_ROOT, "convex/seed.ts");
const INVENTORY_PATH = path.join(SEED_DIR, "standards_inventory.json");

interface RawStandardEntry {
  code: string;
  description: string;
  studentFriendlyDescription?: string;
  category?: string;
  isActive: boolean;
}

interface InventoryEntry {
  code: string;
  source: string;
  framework: string;
  citation?: string;
}

const STANDARD_OBJECT_RE =
  /\{\s*code:\s*"([^"]+)"\s*,\s*description:\s*"([^"]+)"(?:\s*,\s*studentFriendlyDescription:\s*"([^"]*)")?(?:\s*,\s*category:\s*"([^"]*)")?(?:\s*,\s*isActive:\s*(true|false))?\s*,?\s*\}/g;

function parseSeedStandards(): RawStandardEntry[] {
  const text = fs.readFileSync(SEED_STANDARDS_PATH, "utf8");
  const entries: RawStandardEntry[] = [];
  STANDARD_OBJECT_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = STANDARD_OBJECT_RE.exec(text)) !== null) {
    entries.push({
      code: match[1],
      description: match[2],
      studentFriendlyDescription: match[3],
      category: match[4],
      isActive: match[5] === "true",
    });
  }
  return entries;
}

describe("seed-standards (IM1) — Phase 2 shape contract", () => {
  const entries = parseSeedStandards();

  it("seed_standards.ts parses to at least 77 standard entries", () => {
    expect(entries.length).toBeGreaterThanOrEqual(77);
  });

  it("every standard code matches the widened IM1 format regex", () => {
    for (const entry of entries) {
      expect(entry.code, `bad code: ${entry.code}`).toMatch(CODE_REGEX);
    }
  });

  it("every standard has a non-empty description", () => {
    for (const entry of entries) {
      expect(
        entry.description.trim().length,
        `empty description for ${entry.code}`
      ).toBeGreaterThan(0);
    }
  });

  it("every standard has a non-empty studentFriendlyDescription", () => {
    for (const entry of entries) {
      expect(
        entry.studentFriendlyDescription?.trim().length ?? 0,
        `missing student-friendly description for ${entry.code}`
      ).toBeGreaterThan(0);
    }
  });

  it("every standard has a non-empty category", () => {
    for (const entry of entries) {
      expect(
        entry.category?.trim().length ?? 0,
        `missing category for ${entry.code}`
      ).toBeGreaterThan(0);
    }
  });

  it("every standard is active (isActive=true)", () => {
    for (const entry of entries) {
      expect(entry.isActive, `inactive standard ${entry.code}`).toBe(true);
    }
  });

  it("all standard codes are unique (no duplicate definitions in seed_standards.ts)", () => {
    const codes = entries.map((entry) => entry.code);
    const dupes = codes.filter(
      (code, index) => codes.indexOf(code) !== index
    );
    expect(dupes, "duplicate code definitions detected").toEqual([]);
  });

  it("seed_standards definitions cover every referenced standard code", () => {
    const definedCodes = new Set(entries.map((entry) => entry.code));
    const referenced = collectReferencedCodes();
    const missing = referenced.filter((code) => !definedCodes.has(code));
    expect(missing).toEqual([]);
  });

  it("inventory entry count matches seed_standards unique code count", () => {
    expect(fs.existsSync(INVENTORY_PATH)).toBe(true);
    const inventory = JSON.parse(
      fs.readFileSync(INVENTORY_PATH, "utf8")
    ) as InventoryEntry[];
    const uniqueDefinedCodes = new Set(entries.map((entry) => entry.code));
    expect(new Set(inventory.map((e) => e.code)).size).toBe(
      uniqueDefinedCodes.size
    );
  });
});

describe("seed-standards (IM1) — Phase 2 seedAll orchestration wiring", () => {
  const orchestratorSource = fs.readFileSync(SEED_ORCHESTRATOR_PATH, "utf8");

  it("seed.ts references the seedStandards internalMutation by name", () => {
    expect(
      orchestratorSource,
      `${SEED_ORCHESTRATOR_PATH} does not mention 'seedStandards'`
    ).toMatch(/seedStandards/);
  });

  it("seed.ts:seedAll invokes seedInternal.seedStandards", () => {
    expect(
      orchestratorSource,
      "seedAll must runMutation(seedInternal.seedStandards, ...) to populate competency_standards"
    ).toMatch(/seedInternal\.seedStandards/);
  });

  it("seedStandards invocation appears before the lesson_standards loop", () => {
    const standardsIndex = orchestratorSource.indexOf(
      "seedInternal.seedStandards"
    );
    const lessonStandardsIndex = orchestratorSource.search(
      /seedInternal\[\s*fn\s*\][\s\S]*?lessonStandards|LessonStandards/
    );
    expect(
      standardsIndex,
      "seedStandards invocation not found in seed.ts"
    ).toBeGreaterThanOrEqual(0);
    expect(
      lessonStandardsIndex,
      "lesson_standards loop not found in seed.ts"
    ).toBeGreaterThanOrEqual(0);
    expect(
      standardsIndex < lessonStandardsIndex,
      "seedStandards must run BEFORE the lesson_standards loop so link inserts can find existing standards"
    ).toBe(true);
  });
});

describe("seed-standards (IM1) — Phase 2 seedAll strict wiring contract", () => {
  const orchestratorSource = fs.readFileSync(SEED_ORCHESTRATOR_PATH, "utf8");

  it("seed.ts:seedAll calls runMutation(seedInternal.seedStandards, {}) mirroring IM2's pattern", () => {
    // IM2's reference pattern (apps/integrated-math-2/convex/seed.ts:90):
    //   await ctx.runMutation(seedInternal.seedStandards, {})
    // The substring test in the previous block accepts stray occurrences
    // (e.g. a comment). This test rejects those by requiring the full
    // Convex mutation-call signature with runMutation wrapper.
    const strictCall = /runMutation\(\s*seedInternal\.seedStandards\s*,\s*\{\s*\}\s*\)/;
    expect(
      orchestratorSource,
      "seedAll must runMutation(seedInternal.seedStandards, {}) (IM2 pattern) so the Convex runtime actually executes the seedStandards mutation"
    ).toMatch(strictCall);
  });

  it("seed.ts:seedAll positions the seedStandards call AFTER the seedUnits call", () => {
    // IM2's order: seedUnits → seedStandards → lessons → lessonStandards.
    // The previous ordering block only checks seedStandards < lesson_standards.
    // This test pins the upstream boundary: seedUnits must run first so the
    // demo-org / profiles rows exist before any other seeding that might
    // depend on them.
    const seedUnitsIndex = orchestratorSource.indexOf(
      "runMutation(seedInternal.seedUnits"
    );
    const seedStandardsIndex = orchestratorSource.indexOf(
      "seedInternal.seedStandards"
    );
    expect(
      seedUnitsIndex,
      "seedAll must runMutation(seedInternal.seedUnits, {}) first"
    ).toBeGreaterThanOrEqual(0);
    expect(
      seedStandardsIndex,
      "seedStandards invocation not found in seed.ts"
    ).toBeGreaterThanOrEqual(0);
    expect(
      seedUnitsIndex < seedStandardsIndex,
      "seedUnits must run BEFORE seedStandards so demo-org/profiles are seeded first (IM2 order)"
    ).toBe(true);
  });

  it("seed.ts:seedAll wraps the seedStandards call in try/catch for failure observability", () => {
    // IM2 wraps the call (apps/integrated-math-2/convex/seed.ts:89-100) in
    // try { ... } catch (error) { ... } and pushes a failure row to
    // results.standards. A bare `await runMutation(...)` would let the
    // internalAction abort mid-loop and skip the lesson_standards inserts,
    // hiding the silent-gap bug that originally motivated this track.
    const tryIndex = orchestratorSource.indexOf("try {");
    const callIndex = orchestratorSource.indexOf("seedInternal.seedStandards");
    const catchIndex = orchestratorSource.indexOf("catch (");
    const allPresent =
      tryIndex >= 0 && callIndex >= 0 && catchIndex >= 0;
    expect(
      allPresent,
      "seedAll must contain try { ... seedInternal.seedStandards ... } catch (...) so a seedStandards failure is surfaced via results.standards (IM2 pattern)"
    ).toBe(true);
    if (allPresent) {
      expect(
        tryIndex < callIndex && callIndex < catchIndex,
        "try-block must contain the seedInternal.seedStandards call, and the catch clause must follow (IM2 pattern)"
      ).toBe(true);
    }
  });
});
