#!/usr/bin/env node
/**
 * Bundle Size Check
 *
 * Measures the IM3 RSC worker entry chunk and warns if it exceeds thresholds.
 * Run this after `npm run build` in apps/integrated-math-3.
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist/server/assets');
const WORKER_ENTRY_PATTERN = /worker-entry-.*\.js$/;

const WARNING_THRESHOLD_KB = 800;
const ERROR_THRESHOLD_KB = 1000;

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Dist directory not found: ${DIST_DIR}`);
    console.error('Run npm run build first.');
    process.exit(1);
  }

  const files = fs.readdirSync(DIST_DIR);
  const workerFiles = files.filter((f) => WORKER_ENTRY_PATTERN.test(f));

  if (workerFiles.length === 0) {
    console.error('No worker entry file found in dist/server/assets');
    process.exit(1);
  }

  let maxSize = 0;
  let maxFile = '';

  for (const file of workerFiles) {
    const filePath = path.join(DIST_DIR, file);
    const stats = fs.statSync(filePath);
    const sizeKB = stats.size / 1024;

    if (sizeKB > maxSize) {
      maxSize = sizeKB;
      maxFile = file;
    }
  }

  console.log(`Worker entry: ${maxFile} = ${formatSize(maxSize * 1024)}`);

  if (maxSize > ERROR_THRESHOLD_KB) {
    console.error(
      `ERROR: Worker entry (${formatSize(maxSize * 1024)}) exceeds ` +
        `${ERROR_THRESHOLD_KB} KB limit. Code-splitting required.`
    );
    process.exit(1);
  }

  if (maxSize > WARNING_THRESHOLD_KB) {
    console.warn(
      `WARNING: Worker entry (${formatSize(maxSize * 1024)}) exceeds ` +
        `${WARNING_THRESHOLD_KB} KB warning threshold.`
    );
    // Non-zero exit for CI visibility, but not a hard failure
    process.exit(2);
  }

  console.log(`Bundle size OK (< ${WARNING_THRESHOLD_KB} KB)`);
  process.exit(0);
}

main();
