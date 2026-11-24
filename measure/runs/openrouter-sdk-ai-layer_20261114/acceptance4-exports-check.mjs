// Phase acceptance r4: compare the generator output with the committed blobs of HEAD.
// Read-only. It writes no file, and it does not call generateArchitectureReports.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { renderGeneratedArchitectureReports } from "../../../scripts/architecture/generate-architecture-reports.mjs";
import { loadArchitectureManifest } from "../../../scripts/architecture/repository-graph.mjs";

const repo = new URL("../../../", import.meta.url).pathname;
const manifestUrl = new URL("../../../scripts/architecture/architecture.manifest.json", import.meta.url);
const asOf = process.env.ARCHITECTURE_AS_OF ?? new Date().toISOString().slice(0, 10);

const manifest = await loadArchitectureManifest(manifestUrl, { asOf });
const reports = renderGeneratedArchitectureReports(manifest);

const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
const manifestDirty = execFileSync(
  "git",
  ["status", "--short", "--", "scripts/architecture/architecture.manifest.json", "measure/generated/exports.md"],
  { cwd: repo, encoding: "utf8" },
).trim();
console.log(`HEAD ${head}`);
console.log(`manifest and exports.md dirty state (empty means clean): "${manifestDirty}"`);

let exportsMatchesHead = false;
for (const [name, content] of Object.entries(reports)) {
  const committed = execFileSync("git", ["show", `HEAD:measure/generated/${name}`], {
    cwd: repo,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const working = readFileSync(`${repo}measure/generated/${name}`, "utf8");
  const matchHead = committed === content;
  const matchWork = working === content;
  console.log(`${name}: generated==HEAD blob ${matchHead}; generated==working tree ${matchWork}`);
  if (name === "exports.md") exportsMatchesHead = matchHead;
}

const exportsText = reports["exports.md"];
const aiLine = exportsText.split("\n").find((line) => line.includes("@math-platform/ai-tutoring"));
console.log(`ai-tutoring row (generated): ${aiLine}`);
const headExports = execFileSync("git", ["show", "HEAD:measure/generated/exports.md"], {
  cwd: repo,
  encoding: "utf8",
});
console.log(`HEAD exports.md contains ./structured: ${headExports.includes("./structured")}`);
console.log(`EXPORTS_MATCHES_HEAD=${exportsMatchesHead}`);
process.exit(exportsMatchesHead ? 0 : 1);
