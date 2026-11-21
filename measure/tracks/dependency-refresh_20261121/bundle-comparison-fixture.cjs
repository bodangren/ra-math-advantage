// Regression fixture for the gates.sh bundle comparison.
// Extracts the production comparison from gates.sh and runs two cases:
// a current report with a baseline budget entry removed must fail;
// a current report with every baseline entry present must pass.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repo = path.resolve(__dirname, "../../..");
const gates = fs.readFileSync(path.join(repo, "measure/tracks/dependency-refresh_20261121/gates.sh"), "utf8");
const bundleStart = gates.indexOf("bundle() {");
const match = gates.slice(bundleStart).match(/^\s*node -e '\n([\s\S]*?)\n\s*' "\$OUT"/m);
if (!match) {
  console.error("FIXTURE SETUP FAIL: could not extract the bundle comparison from gates.sh");
  process.exit(2);
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dep-refresh-bundle-fixture-"));
const script = path.join(dir, "compare.cjs");
fs.writeFileSync(script, match[1] + "\n");
const out = path.join(dir, "out");
const base = path.join(dir, "base");
fs.mkdirSync(out);
fs.mkdirSync(base);
const name = "integrated-math-3";
const source = path.join(repo, "apps/integrated-math-3/scripts/bundle-size-audit.mjs");

const ssr = "[OK] server/ssr/index.js → index.js: 292.85 KB (threshold: 700.00 KB)";
const client = "[OK] client/assets/page-*.js → page-abc12345.js: 100.00 KB (threshold: 900.00 KB)";
fs.writeFileSync(path.join(base, `step-bundle-${name}.log`), `${ssr}\n${client}\n`);
fs.writeFileSync(path.join(out, `step-total-${name}.log`), "TOTAL_BYTES=1000000\n");
fs.writeFileSync(path.join(base, `step-total-${name}.log`), "TOTAL_BYTES=1000000\n");

function run(current) {
  fs.writeFileSync(path.join(out, `step-bundle-${name}.log`), current);
  // Match the production `node -e '<script>' <out> <base> <name> <source> <record>` call.
  const r = spawnSync(process.execPath, ["-e", match[1], out, base, name, source, "0"], { encoding: "utf8" });
  if (r.error) throw r.error;
  return { status: r.status, output: (r.stdout || "") + (r.stderr || "") };
}

const missing = run(`${client}\n`);
const complete = run(`${ssr}\n${client}\n`);
let pass = true;
if (missing.status === 0) {
  console.error(`MISSING_ENTRY=FAIL: the comparison accepted a report without ${ssr}`);
  console.error(missing.output.trim());
  pass = false;
} else {
  console.log(`MISSING_ENTRY=PASS: status ${missing.status}`);
}
if (complete.status !== 0) {
  console.error(`COMPLETE=FAIL: the comparison rejected a complete report, status ${complete.status}`);
  console.error(complete.output.trim());
  pass = false;
} else {
  console.log("COMPLETE=PASS: status 0");
}
fs.rmSync(dir, { recursive: true, force: true });
console.log(pass ? "FIXTURE=PASS" : "FIXTURE=FAIL");
process.exit(pass ? 0 : 1);
