import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// Phase 1 — Documentation reconciliation (Red)
// ---------------------------------------------------------------------------

const MEASURE_DIR = resolve(__dirname, "../../../../measure");
const KNOWLEDGE_SPACE_MD = resolve(MEASURE_DIR, "knowledge-space.md");
const INDEX_MD = resolve(MEASURE_DIR, "index.md");
const V3_SPEC_DIR = resolve(__dirname, "../../../../kst-srs.v3.2");
const V3_SPEC = resolve(V3_SPEC_DIR, "SPECIFICATION.md");
const V3_MIGRATION = resolve(V3_SPEC_DIR, "MIGRATION-v3.md");
const V3_PROVENANCE = resolve(V3_SPEC_DIR, "provenance.json");

const sha256 = (path: string): string =>
  createHash("sha256").update(readFileSync(path)).digest("hex");

describe("docs reconciliation", () => {
  it("measure/knowledge-space.md points at the canonical v3.2 SPECIFICATION.md", () => {
    const content = readFileSync(KNOWLEDGE_SPACE_MD, "utf-8");
    expect(content).toMatch(/kst-srs\.v3\.2\/SPECIFICATION\.md/);
  });

  it("measure/index.md contains a Knowledge Space Contract row", () => {
    const content = readFileSync(INDEX_MD, "utf-8");
    expect(content).toMatch(/Knowledge Space Contract/);
    expect(content).toMatch(/\.\.\/kst-srs\.v3\.2\/SPECIFICATION\.md/);
  });

  it("vendored v3.2 files match their hash-stamped provenance manifest", () => {
    const provenance = JSON.parse(readFileSync(V3_PROVENANCE, "utf-8")) as {
      contractVersion: string;
      files: Array<{ path: string; sha256: string }>;
    };

    expect(provenance.contractVersion).toBe("kst-srs.v3.2");
    expect(provenance.files).toEqual([
      {
        path: "SPECIFICATION.md",
        upstreamPath: "../mastery-advantage/SPECIFICATION.md",
        sha256: "e227f55846565901530b08466188b18f348cf32333e57bed933b099eb0d5ee43",
      },
      {
        path: "MIGRATION-v3.md",
        upstreamPath: "../mastery-advantage/MIGRATION-v3.md",
        sha256: "600a692325f64df6d5b057c68478dfb589795f27c4da3c3149a8f76cb793a647",
      },
    ]);
    expect(sha256(V3_SPEC)).toBe(provenance.files[0]!.sha256);
    expect(sha256(V3_MIGRATION)).toBe(provenance.files[1]!.sha256);
  });

  it("measure/knowledge-space.md no longer claims to be the source of truth for KST theory", () => {
    const content = readFileSync(KNOWLEDGE_SPACE_MD, "utf-8");
    expect(content.toLowerCase()).not.toMatch(/source of truth/);
  });
});
