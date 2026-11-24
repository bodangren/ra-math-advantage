// Phase S4 acceptance r2: independent comparison of the s4-acceptance2 sweep results.
// Read-only. For each log it calls the key() function of gates.sh (sourced, not run) on
// the base log and on the new log, and prints the keys that are new or lost.
// It also compares high and critical advisory IDs, the BM2 bundle step, and the size totals.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const REPO = "/home/daniebo/Desktop/ra-math-advantage";
const TRACK = "openrouter-sdk-ai-layer_20261114";
const GATES = path.join(REPO, "measure/runs", TRACK, "gates");
const SCRIPT = path.join(REPO, "measure/tracks", TRACK, "gates.sh");
const NEW = process.argv[2] || "s4-acceptance2";
const BASES = (process.argv[3] || "s3,s4-r3").split(",");

const LOGS = [
  "lint-ai-tutoring", "lint-practice-core", "lint-integrated-math-3", "lint-bus-math-v2", "step-format-check",
  "test-ai-tutoring", "test-practice-core", "test-integrated-math-3", "test-bus-math-v2", "step-scripts-suite", "step-audit-suites",
  "typecheck-ai-tutoring", "typecheck-practice-core", "typecheck-integrated-math-3", "typecheck-bus-math-v2",
  "step-boundary", "step-ci-check", "step-tree",
  "build-ai-tutoring", "build-practice-core", "build-integrated-math-3", "build-bus-math-v2",
  "step-bundle-size-im3", "step-bundle-bm2", "step-workerd-probe",
];

function keys(file) {
  const run = spawnSync("bash", ["-c", 'source "$1"; key "$2"', "x", SCRIPT, file], { encoding: "utf8" });
  return new Set((run.stdout || "").split("\n").filter(Boolean));
}

for (const base of BASES) {
  const rows = [];
  for (const name of LOGS) {
    const a = path.join(GATES, base, name + ".log");
    const b = path.join(GATES, NEW, name + ".log");
    if (!fs.existsSync(a) || !fs.existsSync(b)) {
      rows.push({ log: name, note: "missing in " + (fs.existsSync(a) ? NEW : base) });
      continue;
    }
    const ka = keys(a);
    const kb = keys(b);
    const added = [...kb].filter((k) => !ka.has(k));
    const lost = [...ka].filter((k) => !kb.has(k));
    rows.push({ log: name, base_keys: ka.size, new_keys: kb.size, added: added.length, lost: lost.length, added_sample: added.slice(0, 3) });
  }
  const withAdded = rows.filter((r) => r.added);
  console.log("== key comparison, base " + base + " vs " + NEW);
  console.log(JSON.stringify({ logs_compared: rows.length, logs_with_added_keys: withAdded.length, rows }, null, 1));
}

// Advisory IDs (high and critical) in the base and the new audit report.
function advisoryIds(dir) {
  const file = path.join(GATES, dir, "audit.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const ids = new Set();
  for (const [pkg, v] of Object.entries(data.vulnerabilities || {})) {
    if (v.severity !== "high" && v.severity !== "critical") continue;
    for (const via of v.via || []) {
      if (typeof via === "object") ids.add(v.severity + ":" + pkg + ":" + (via.source || via.url || via.title));
    }
  }
  return { ids, meta: data.metadata && data.metadata.vulnerabilities };
}
const baseAudit = advisoryIds("s3");
const newAudit = advisoryIds(NEW);
console.log("== npm audit");
console.log(
  JSON.stringify(
    {
      base_summary: baseAudit.meta,
      new_summary: newAudit.meta,
      new_high_or_critical_ids: [...newAudit.ids].filter((i) => !baseAudit.ids.has(i)),
      lost_high_or_critical_ids: [...baseAudit.ids].filter((i) => !newAudit.ids.has(i)),
      high_or_critical_ids_in_new: newAudit.ids.size,
    },
    null,
    1,
  ),
);

// BM2 bundle step and the size records.
console.log("== bundle and size records");
for (const base of ["s3", "s4-r3"]) {
  const pick = (dir, f) => (fs.existsSync(path.join(GATES, dir, f)) ? fs.readFileSync(path.join(GATES, dir, f), "utf8") : "");
  const bundleLines = (dir) => pick(dir, "step-bundle-bm2.log").split("\n").filter((l) => /Total dist\/server|over budget|budget/i.test(l));
  const totals = (dir, app) => pick(dir, "sizes-" + app + ".txt").split("\n").filter((l) => l.startsWith("TOTAL"));
  console.log(
    JSON.stringify(
      {
        base,
        bundle_bm2_same_lines: JSON.stringify(bundleLines(base)) === JSON.stringify(bundleLines(NEW)),
        bundle_bm2_new: bundleLines(NEW),
        sizes_im3_base: totals(base, "integrated-math-3"),
        sizes_im3_new: totals(NEW, "integrated-math-3"),
        sizes_bm2_base: totals(base, "bus-math-v2"),
        sizes_bm2_new: totals(NEW, "bus-math-v2"),
      },
      null,
      1,
    ),
  );
}
