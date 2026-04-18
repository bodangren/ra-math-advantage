#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONO_ROOT = join(__dirname, '..');
const RULES_FILE = join(__dirname, 'monorepo-boundary-rules.json');

const ruleConfig = JSON.parse(readFileSync(RULES_FILE, 'utf-8'));
const rules = ruleConfig.forbiddenPatterns;

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cts', '.mts'];

let hasViolations = false;

for (const rule of rules) {
  const searchDir = join(MONO_ROOT, rule.searchIn);

  const grepArgs = ['-rn', '--color=never'];

  for (const ext of CODE_EXTENSIONS) {
    grepArgs.push('--include', `*${ext}`);
  }

  grepArgs.push('-E', rule.pattern, searchDir);

  const result = spawnSync('grep', grepArgs, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (result.status === 1 && result.stdout.trim() === '') {
    continue;
  }

  if (result.status === 0 && result.stdout.trim() !== '') {
    hasViolations = true;
    console.log(`\n[${rule.severity.toUpperCase()}] ${rule.description}`);
    console.log(`Pattern: ${rule.pattern}`);
    console.log('---');
    console.log(result.stdout);
  } else if (result.status !== 0 && result.status !== 1) {
    console.error(`\n[ERROR] Failed to run grep for rule: ${rule.id}`);
    console.error(result.stderr);
    hasViolations = true;
  }
}

if (hasViolations) {
  console.log('\n[MONOREPO BOUNDARY VIOLATION] Check failed. See above for details.');
  process.exit(1);
} else {
  console.log('[OK] No monorepo boundary violations found.');
  process.exit(0);
}