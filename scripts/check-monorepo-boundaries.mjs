#!/usr/bin/env node

import { checkRepositoryArchitecture } from './architecture/manifest-enforcer.mjs';

const repositoryRoot = new URL('../', import.meta.url);
const asOf = process.env.ARCHITECTURE_AS_OF ?? new Date().toISOString().slice(0, 10);
const result = await checkRepositoryArchitecture(repositoryRoot, { asOf });

if (result.violations.length > 0) {
  for (const violation of result.violations) console.error(violation.message);
  console.error(`[MONOREPO ARCHITECTURE VIOLATION] ${result.violations.length} violation(s) found.`);
  process.exit(1);
}

console.log(`[OK] Architecture manifest covers ${result.workspaceCount} workspaces; ${result.scannedImportCount} internal imports checked; package DAG acyclic.`);
