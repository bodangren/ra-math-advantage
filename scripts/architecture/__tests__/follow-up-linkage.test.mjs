import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../../../", import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, ROOT), "utf8"));
}

test("every architecture debt record is accepted by a registered dependent follow-up track", async () => {
  const manifest = await readJson("scripts/architecture/architecture.manifest.json");
  const registry = await readFile(new URL("measure/tracks.md", ROOT), "utf8");

  for (const debt of manifest.temporaryDebt) {
    const trackPath = `measure/tracks/${debt.followUpTrack}/`;
    const metadata = await readJson(`${trackPath}metadata.json`);
    const plan = await readFile(new URL(`${trackPath}plan.md`, ROOT), "utf8");

    assert.equal(
      metadata.track_id,
      debt.followUpTrack,
      `${debt.id} follow-up metadata must match its track`,
    );
    assert.notEqual(metadata.status, "archived", `${debt.id} cannot point at an archived track`);
    assert.ok(
      metadata.depends_on?.includes("monorepo-architecture-contracts_20260710"),
      `${debt.id} follow-up must depend on this architecture track`,
    );
    assert.match(
      registry,
      new RegExp(`tracks/${debt.followUpTrack.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`),
    );
    assert.ok(
      plan.includes(`\`${debt.id}\``),
      `${debt.followUpTrack} must explicitly accept ${debt.id}`,
    );
  }
});
