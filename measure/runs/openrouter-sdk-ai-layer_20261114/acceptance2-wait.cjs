// Phase S4 acceptance r2: wait helper. Prints the state of a JSON exit file.
// Usage: node acceptance2-wait.cjs <exit-file> <max-seconds> [timing-file]
// Returns when the exit file holds "done": true, or after the maximum number of seconds.
const fs = require("node:fs");

const exitFile = process.argv[2];
const maxSeconds = Number(process.argv[3] || 590);
const timingFile = process.argv[4];

function read() {
  try {
    return JSON.parse(fs.readFileSync(exitFile, "utf8"));
  } catch (err) {
    return null;
  }
}

const start = Date.now();
let state = read();
while (!(state && state.done) && Date.now() - start < maxSeconds * 1000) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
  state = read();
}
console.log(new Date().toISOString() + " state: " + JSON.stringify(state));
if (timingFile) {
  try {
    const lines = fs.readFileSync(timingFile, "utf8").trim().split("\n");
    console.log("timing tail:\n" + lines.slice(-6).join("\n"));
  } catch (err) {
    console.log("timing file not readable yet");
  }
}
