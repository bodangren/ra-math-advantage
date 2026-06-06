import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
const CI_WORKFLOW_PATH = path.join(REPO_ROOT, ".github/workflows/ci.yml");

const TARGET_JOB = "im1-im2-precalc";
const INTEGRITY_RED_TRACK_ID = "im1-im2-standards-backfill_20260605";

interface AppTarget {
  name: string;
  prefix: string;
  bare: string;
}

const TARGET_APPS: AppTarget[] = [
  { name: "IM1", prefix: "apps/integrated-math-1", bare: "integrated-math-1" },
  { name: "IM2", prefix: "apps/integrated-math-2", bare: "integrated-math-2" },
];

function readCiWorkflow(): string {
  if (!fs.existsSync(CI_WORKFLOW_PATH)) {
    throw new Error(`CI workflow not found at ${CI_WORKFLOW_PATH}`);
  }
  return fs.readFileSync(CI_WORKFLOW_PATH, "utf8");
}

function extractJobSection(workflowText: string, jobId: string): string {
  const pattern = new RegExp(
    `^  ${jobId}:[\\s\\S]*?(?=\\n  [a-zA-Z][a-zA-Z0-9_-]*:)`,
    "m"
  );
  const match = workflowText.match(pattern);
  if (!match) {
    throw new Error(
      `Job '${jobId}' not found in CI workflow at ${CI_WORKFLOW_PATH}`
    );
  }
  return match[0];
}

function getRunLines(jobSection: string): string[] {
  const out: string[] = [];
  for (const line of jobSection.split("\n")) {
    const m = line.match(/^\s+run:\s*(.*)$/);
    if (m) {
      out.push(m[1]);
    }
  }
  return out;
}

function jobRunsTestForApp(jobSection: string, app: AppTarget): boolean {
  const runLines = getRunLines(jobSection);
  return runLines.some((runContent) => {
    const mentionsTest = /\btest\b/i.test(runContent);
    const mentionsApp =
      runContent.includes(app.prefix) ||
      runContent.includes(app.bare) ||
      runContent.includes("${{ matrix.app.prefix }}");
    return mentionsTest && mentionsApp;
  });
}

describe(`standards-integrity CI wiring (Phase 4 — track ${INTEGRITY_RED_TRACK_ID})`, () => {
  const workflow = readCiWorkflow();
  const jobSection = extractJobSection(workflow, TARGET_JOB);

  it("CI workflow defines the im1-im2-precalc job that contains the IM1/IM2 matrix", () => {
    expect(jobSection.length).toBeGreaterThan(0);
    expect(jobSection).toContain(`${TARGET_JOB}:`);
  });

  for (const app of TARGET_APPS) {
    it(`im1-im2-precalc job runs a test step for ${app.name} (${app.prefix})`, () => {
      const hasTestStep = jobRunsTestForApp(jobSection, app);
      const matrixVar = "${{ matrix.app.prefix }}";
      const message = [
        `Expected im1-im2-precalc job in .github/workflows/ci.yml to contain a`,
        `\`run:\` step that invokes tests for ${app.name} (${app.prefix}).`,
        `Per test-strategy.md §5 P4 ("CI + Closure"), the integrity test must`,
        `run on every push via the per-app \`npm run ws:<app>:test\` path.`,
        `Add a step such as \`run: npm test --prefix ${matrixVar}\` or`,
        `\`run: npm run ws:${app.bare}:test\` so the standards-integrity check`,
        `is enforced in CI.`,
      ].join(" ");
      expect(hasTestStep, message).toBe(true);
    });
  }
});
