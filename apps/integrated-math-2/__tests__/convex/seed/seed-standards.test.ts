import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CODE_REGEX, collectReferencedCodes } from "./referenced-codes";

const APP_ROOT = path.resolve(__dirname, "../../..");
const SEED_DIR = path.join(APP_ROOT, "convex/seed");
const SEED_STANDARDS_PATH = path.join(SEED_DIR, "seed_standards.ts");
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

function loadInventory(): InventoryEntry[] {
  if (!fs.existsSync(INVENTORY_PATH)) {
    throw new Error(`Inventory file not found at ${INVENTORY_PATH}`);
  }
  return JSON.parse(fs.readFileSync(INVENTORY_PATH, "utf8")) as InventoryEntry[];
}

describe("seed-standards (IM2) — Phase 3 shape contract", () => {
  const entries = parseSeedStandards();

  it("seed_standards.ts parses to at least 91 standard entries (FR2 minimum)", () => {
    expect(entries.length).toBeGreaterThanOrEqual(91);
  });

  it("every standard code matches the widened IM2 format regex", () => {
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

  it("seed_standards definitions cover every referenced standard code (FR3)", () => {
    const definedCodes = new Set(entries.map((entry) => entry.code));
    const referenced = collectReferencedCodes();
    const missing = referenced.filter((code) => !definedCodes.has(code));
    expect(
      missing,
      "referenced codes without a corresponding seed_standards definition"
    ).toEqual([]);
  });

  it("every standards_inventory entry has a corresponding seed_standards definition (source-grounded contract)", () => {
    // Per test-strategy §3 and lessons-learned (precalc-depth-remediation,
    // 2026-05-01), every authored definition must trace back to a
    // source-grounded inventory entry. The reverse direction (defined ⊆
    // inventory) is intentionally not required: seed_standards.ts may
    // include forward-looking definitions for planned modules (e.g., the
    // 11 extra codes beyond the 91 currently referenced in modules 1-13).
    const definedCodes = new Set(entries.map((entry) => entry.code));
    const inventory = loadInventory();
    const orphaned = inventory
      .map((entry) => entry.code)
      .filter((code) => !definedCodes.has(code));
    expect(
      orphaned,
      "inventory entries without a corresponding seed_standards definition"
    ).toEqual([]);
  });

  it("inventory framework is CCSS-M (Common Core State Standards — Mathematics)", () => {
    // Per spec.md NFR: "Definitions are source-grounded (no generic /
    // AI-invented descriptions); cite the source per the
    // curriculum-authoring lesson (precalc-depth-remediation)." The
    // inventory is the canonical provenance record; locking the framework
    // here guards against silent drift if a future contributor pulls from
    // a different source.
    const inventory = loadInventory();
    expect(inventory.length).toBeGreaterThan(0);
    const frameworks = new Set(inventory.map((entry) => entry.framework));
    expect(frameworks.size).toBe(1);
    expect(frameworks.has("CCSS-M")).toBe(true);
  });
});
