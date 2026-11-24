// Phase S4 acceptance r2: sweep driver.
// Usage: node acceptance2-sweep-driver.cjs          start a detached run and return at once
//        node acceptance2-sweep-driver.cjs --run    run in the foreground (the detached child does this)
// The run executes gates.sh for lint, test, and checks-all with GATES_BASE=s3 and the
// label s4-acceptance2. gates.sh calls heavy-run.sh itself for each job. The driver
// captures the output of each gate through a pipe (no shell redirection) and writes the
// exit codes to gates/s4-acceptance2/sweep.exit as JSON.
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const REPO = "/home/daniebo/Desktop/ra-math-advantage";
const TRACK = "openrouter-sdk-ai-layer_20261114";
const LABEL = "s4-acceptance2";
const OUT = path.join(REPO, "measure/runs", TRACK, "gates", LABEL);
const GATES = path.join(REPO, "measure/tracks", TRACK, "gates.sh");
const EXIT_FILE = path.join(OUT, "sweep.exit");

fs.mkdirSync(OUT, { recursive: true });

if (!process.argv.includes("--run")) {
  const child = spawn(process.execPath, [__filename, "--run"], {
    cwd: REPO,
    detached: true,
    stdio: "ignore",
    env: process.env,
  });
  child.unref();
  console.log("detached sweep driver started, pid " + child.pid + ", exit file " + EXIT_FILE);
  process.exit(0);
}

const results = { started: new Date().toISOString(), order: ["lint", "test", "checks-all"], codes: {}, done: false };
function save() {
  fs.writeFileSync(EXIT_FILE, JSON.stringify(results) + "\n", "utf8");
}
save();

for (const gate of results.order) {
  results.current = gate;
  results.currentStarted = new Date().toISOString();
  save();
  const run = spawnSync("bash", [GATES, gate, LABEL], {
    cwd: REPO,
    env: Object.assign({}, process.env, { GATES_BASE: "s3" }),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  fs.writeFileSync(path.join(OUT, "driver-" + gate + ".log"), (run.stdout || "") + (run.stderr || ""), "utf8");
  results.codes[gate] = run.status === null ? "signal:" + run.signal : run.status;
  save();
}
results.current = null;
results.done = true;
results.finished = new Date().toISOString();
save();
