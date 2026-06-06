import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { APP_NAME, collectReferencedCodes } from "./referenced-codes";

const INVENTORY_PATH = path.resolve(
  __dirname,
  "../../../convex/seed/standards_inventory.json"
);

interface InventoryEntry {
  code: string;
  source: string;
  framework: string;
  citation?: string;
}

describe("standards-inventory (IM1)", () => {
  const referencedCodes = collectReferencedCodes();

  it("inventory file exists at the canonical provenance path", () => {
    expect(fs.existsSync(INVENTORY_PATH)).toBe(true);
  });

  it("inventory is valid JSON and is an array", () => {
    expect(fs.existsSync(INVENTORY_PATH)).toBe(true);
    const raw = fs.readFileSync(INVENTORY_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    expect(Array.isArray(parsed)).toBe(true);
  });

  it(`inventory contains an entry for every referenced ${APP_NAME} standard code`, () => {
    expect(fs.existsSync(INVENTORY_PATH)).toBe(true);
    const raw = fs.readFileSync(INVENTORY_PATH, "utf8");
    const parsed = JSON.parse(raw) as InventoryEntry[];
    const inventoriedCodes = new Set(parsed.map((entry) => entry.code));
    const missingFromInventory = referencedCodes.filter(
      (code) => !inventoriedCodes.has(code)
    );
    expect(missingFromInventory).toEqual([]);
  });

  it("every inventory entry has a non-empty source field (no LLM-invented provenance)", () => {
    expect(fs.existsSync(INVENTORY_PATH)).toBe(true);
    const raw = fs.readFileSync(INVENTORY_PATH, "utf8");
    const parsed = JSON.parse(raw) as InventoryEntry[];
    for (const entry of parsed) {
      expect(typeof entry.source).toBe("string");
      expect(entry.source.trim().length).toBeGreaterThan(0);
    }
  });

  it("every inventory entry has a non-empty framework field (CCSS-M or state framework)", () => {
    expect(fs.existsSync(INVENTORY_PATH)).toBe(true);
    const raw = fs.readFileSync(INVENTORY_PATH, "utf8");
    const parsed = JSON.parse(raw) as InventoryEntry[];
    for (const entry of parsed) {
      expect(typeof entry.framework).toBe("string");
      expect(entry.framework.trim().length).toBeGreaterThan(0);
    }
  });
});
