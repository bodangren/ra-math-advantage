// @vitest-environment node
import { describe, it, expect } from "vitest";
import { EventEmitter } from "node:events";
import path from "node:path";
const script = () =>
  import(path.resolve(import.meta.dirname, "../../scripts/dev-stack.mjs"));
function child() {
  return Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
  });
}
describe("development startup", () => {
  it("uses explicit app ports and local backend", async () => {
    const { createProcesses } = await script();
    const processes = createProcesses(process.cwd());
    expect(processes[0].args).toEqual([
      "--no-install",
      "convex",
      "dev",
      "--local-cloud-port",
      "3222",
      "--local-site-port",
      "3223",
    ]);
    expect(processes[1].args).toEqual([
      "--no-install",
      "vinext",
      "dev",
      "--port",
      "3002",
    ]);
    expect(
      processes.every((p: { cwd: string }) => p.cwd === process.cwd()),
    ).toBe(true);
  });
  it("recognizes readiness split across output chunks", async () => {
    const { waitForOutput } = await script();
    const proc = child();
    const ready = waitForOutput(proc, /functions ready/i, 100);
    proc.stdout.emit("data", "Convex func");
    proc.stdout.emit("data", "tions ready");
    await expect(ready).resolves.toBeUndefined();
    expect(proc.listenerCount("exit")).toBe(0);
  });
  it("fails if the child exits before readiness", async () => {
    const { waitForOutput } = await script();
    const proc = child();
    const ready = waitForOutput(proc, /ready/, 100);
    proc.emit("exit", 1);
    await expect(ready).rejects.toThrow(/exited/);
    expect(proc.stdout.listenerCount("data")).toBe(0);
  });
});
