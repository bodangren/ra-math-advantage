#!/usr/bin/env node

import { pathToFileURL } from "node:url";

import { auditWorkspaceParity } from "./inventory-audit.mjs";
import { loadLiveQualitySnapshot } from "./quality-inventory.mjs";

const snapshot = await loadLiveQualitySnapshot(pathToFileURL(`${process.cwd()}/`), {
  asOf: process.env.ARCHITECTURE_AS_OF ?? new Date().toISOString().slice(0, 10),
});
const violations = auditWorkspaceParity(snapshot);
if (violations.length > 0) {
  for (const violation of violations) console.error(violation.message);
  process.exit(1);
}
console.log(
  `[OK] Root and CI quality inventories cover ${snapshot.workspaces.length} workspaces exactly once.`,
);
