#!/usr/bin/env node
// @ts-check

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCALE_HOT_PATHS = [
  'daily-practice',
  'gradebook',
  'heatmap',
  'proficiency',
  'curriculum-summaries',
];

const DRIVER_FUNCTIONS = {
  'daily-practice': 'queue/getDailyPracticeQueueHandler',
  gradebook: 'lib/teacher/gradebook-export:exportGradebook',
  heatmap: 'lib/teacher/competency-heatmap:buildCompetencyHeatmap',
  proficiency: 'convex/objectiveProficiency:getObjectiveProficiencyHandler',
  'curriculum-summaries': 'lib/scale/curriculum-summary:summarizeCurriculum',
};

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(SCRIPT_DIR, '../..');

const BASELINE_BUDGET_LIMITS = {
  'daily-practice': { maxDocsRead: 50_000, maxBytesRead: 100_000_000, maxFnTimeMs: 5_000, maxOccConflicts: 5 },
  gradebook: { maxDocsRead: 50_000, maxBytesRead: 100_000_000, maxFnTimeMs: 5_000, maxOccConflicts: 5 },
  heatmap: { maxDocsRead: 50_000, maxBytesRead: 100_000_000, maxFnTimeMs: 5_000, maxOccConflicts: 5 },
  proficiency: { maxDocsRead: 50_000, maxBytesRead: 100_000_000, maxFnTimeMs: 5_000, maxOccConflicts: 5 },
  'curriculum-summaries': { maxDocsRead: 50_000, maxBytesRead: 100_000_000, maxFnTimeMs: 5_000, maxOccConflicts: 5 },
};

const INFLATED_COST = {
  'daily-practice': { docsRead: 999_999, bytesRead: 999_999_999, fnTimeMs: 9_999, occConflicts: 50 },
  gradebook: { docsRead: 999_999, bytesRead: 999_999_999, fnTimeMs: 9_999, occConflicts: 50 },
  heatmap: { docsRead: 999_999, bytesRead: 999_999_999, fnTimeMs: 9_999, occConflicts: 50 },
  proficiency: { docsRead: 999_999, bytesRead: 999_999_999, fnTimeMs: 9_999, occConflicts: 50 },
  'curriculum-summaries': { docsRead: 999_999, bytesRead: 999_999_999, fnTimeMs: 9_999, occConflicts: 50 },
};

function parseArgs(argv) {
  const options = {
    paths: SCALE_HOT_PATHS,
    deployment: process.env.IM3_SCALE_URL || '',
    once: false,
    out: resolve(APP_ROOT, 'scale-report.json'),
    evaluate: false,
    injectRegression: false,
    baseline: '',
  };

  for (const arg of argv) {
    if (arg === '--once') {
      options.once = true;
    } else if (arg === '--evaluate') {
      options.evaluate = true;
    } else if (arg === '--inject-regression') {
      options.injectRegression = true;
    } else if (arg.startsWith('--paths=')) {
      options.paths = arg.slice('--paths='.length).split(',').filter(Boolean);
    } else if (arg.startsWith('--deployment=')) {
      options.deployment = arg.slice('--deployment='.length);
    } else if (arg.startsWith('--out=')) {
      options.out = resolve(APP_ROOT, arg.slice('--out='.length));
    } else if (arg.startsWith('--baseline=')) {
      options.baseline = arg.slice('--baseline='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function validateOptions(options) {
  if (!options.deployment) {
    throw new Error('Missing isolated scale deployment. Pass --deployment=$IM3_SCALE_URL or set IM3_SCALE_URL.');
  }

  for (const path of options.paths) {
    if (!SCALE_HOT_PATHS.includes(path)) {
      throw new Error(`Unknown hot path: ${path}`);
    }
  }
}

function runConvexInsights(path, deployment) {
  const fn = DRIVER_FUNCTIONS[path];
  const result = spawnSync(
    'npx',
    ['convex', 'insights', '--deployment', deployment, '--function', fn, '--format', 'json'],
    { cwd: APP_ROOT, encoding: 'utf8' },
  );

  if (result.status !== 0) {
    throw new Error(`npx convex insights failed for ${path}: ${result.stderr || result.stdout}`);
  }

  return JSON.parse(result.stdout);
}

function parseInsights(json, path) {
  const totals = json?.totals;
  if (!totals || typeof totals !== 'object') {
    throw new Error(`Missing totals object for ${path}`);
  }

  return {
    path,
    docsRead: totals.databaseDocsRead,
    bytesRead: totals.databaseBytesRead,
    fnTimeMs: totals.functionExecutionTimeMs,
    occConflicts: totals.occConflicts,
  };
}

export function buildReport(options) {
  const records = options.paths.map((path) =>
    parseInsights(runConvexInsights(path, options.deployment), path),
  );

  return {
    generatedAt: new Date().toISOString(),
    deployment: options.deployment,
    paths: records,
  };
}

function buildBudget(path) {
  const limits = BASELINE_BUDGET_LIMITS[path];
  return {
    path,
    maxDocsRead: limits.maxDocsRead,
    maxBytesRead: limits.maxBytesRead,
    maxFnTimeMs: limits.maxFnTimeMs,
    maxOccConflicts: limits.maxOccConflicts,
  };
}

function evaluateRecord(record, budget) {
  if (record.path !== budget.path) {
    throw new Error(
      `Cannot evaluate record path "${record.path}" against budget path "${budget.path}"`,
    );
  }
  const deltas = [];
  for (const [metric, limitKey] of [
    ['docsRead', 'maxDocsRead'],
    ['bytesRead', 'maxBytesRead'],
    ['fnTimeMs', 'maxFnTimeMs'],
    ['occConflicts', 'maxOccConflicts'],
  ]) {
    if (record[metric] > budget[limitKey]) {
      deltas.push({ metric, actual: record[metric], limit: budget[limitKey] });
    }
  }
  return { path: record.path, pass: deltas.length === 0, deltas };
}

function loadBaseline(baselineArg) {
  const baselinePath = resolve(APP_ROOT, baselineArg);
  if (!existsSync(baselinePath)) {
    throw new Error(`Baseline file not found: ${baselinePath}`);
  }
  const raw = readFileSync(baselinePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.paths)) {
    throw new Error('Baseline file must contain a "paths" array');
  }
  return parsed;
}

function buildReportFromBaseline(baseline, options) {
  return {
    generatedAt: new Date().toISOString(),
    deployment: options.deployment,
    paths: baseline.paths.filter((rec) => options.paths.includes(rec.path)),
  };
}

function buildInjectedReport(options) {
  return {
    generatedAt: new Date().toISOString(),
    deployment: options.deployment,
    paths: options.paths.map((path) => ({
      path,
      ...INFLATED_COST[path],
    })),
  };
}

function runEvaluation(report, options) {
  const perPath = options.paths.map((path) => {
    const record = report.paths.find((rec) => rec.path === path);
    if (!record) {
      throw new Error(`Missing record for path "${path}" in evaluation report`);
    }
    return evaluateRecord(record, buildBudget(path));
  });
  return {
    pass: perPath.every((entry) => entry.pass),
    perPath,
  };
}

function formatFailure(result) {
  const failing = result.perPath.filter((entry) => !entry.pass);
  const lines = [];
  lines.push('Scale budget evaluation FAILED — regression detected.');
  for (const entry of failing) {
    const deltaStr = entry.deltas
      .map((d) => `${d.metric}=${d.actual} (limit ${d.limit})`)
      .join(', ');
    lines.push(`  ${entry.path}: ${deltaStr}`);
  }
  return lines.join('\n');
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    validateOptions(options);

    if (options.evaluate || options.injectRegression) {
      const baselineReport = options.evaluate
        ? buildReportFromBaseline(loadBaseline(options.baseline), options)
        : buildInjectedReport(options);
      const result = runEvaluation(baselineReport, options);

      mkdirSync(dirname(options.out), { recursive: true });
      writeFileSync(
        options.out,
        `${JSON.stringify({ generatedAt: new Date().toISOString(), result, paths: baselineReport.paths }, null, 2)}\n`,
      );

      if (!result.pass) {
        console.error(formatFailure(result));
        process.exit(1);
      }
      console.log(`Scale budget evaluation PASSED for ${options.paths.length} path(s).`);
      return;
    }

    const report = buildReport(options);
    mkdirSync(dirname(options.out), { recursive: true });
    writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`Wrote scale report: ${options.out}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
