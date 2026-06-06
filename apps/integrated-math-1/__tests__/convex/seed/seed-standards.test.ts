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
