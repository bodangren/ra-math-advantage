#!/usr/bin/env node
/**
 * CI/CD Validation Script
 *
 * Validates GitHub Actions workflow files for common anti-patterns:
 * - continue-on-error swallowing failures in app gate jobs
 * - Redundant || true + continue-on-error double-silencing
 * - Production deploy without staging gate or approval
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const WORKFLOWS_DIR = '.github/workflows';
let exitCode = 0;

function fail(message) {
  console.error(`FAIL: ${message}`);
  exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

// ---------------------------------------------------------------------------
// 1. Validate CI workflow
// ---------------------------------------------------------------------------
const ciPath = path.join(WORKFLOWS_DIR, 'ci.yml');
if (!fs.existsSync(ciPath)) {
  fail(`ci.yml not found at ${ciPath}`);
} else {
  const ciContent = fs.readFileSync(ciPath, 'utf8');
  const ci = yaml.load(ciContent);

  // 1a. No job-level continue-on-error on app gate jobs (im3, bm2)
  const appGateJobs = ['im3', 'bm2'];
  for (const jobName of appGateJobs) {
    const job = ci.jobs?.[jobName];
    if (job?.['continue-on-error']) {
      fail(
        `ci.yml job '${jobName}' has continue-on-error: true — failures will be silently swallowed`
      );
    } else {
      pass(`ci.yml job '${jobName}' does not have continue-on-error`);
    }
  }

  // 1b. No step-level || true in app gate jobs
  for (const jobName of appGateJobs) {
    const job = ci.jobs?.[jobName];
    if (!job?.steps) continue;
    for (const step of job.steps) {
      const run = step.run || '';
      if (run.includes('|| true')) {
        fail(
          `ci.yml job '${jobName}' step '${step.name}' uses '|| true' — suppresses failures`
        );
      }
    }
    pass(`ci.yml job '${jobName}' has no '|| true' step commands`);
  }

  // 1c. Package matrix should NOT have continue-on-error at step level either
  const packagesJob = ci.jobs?.packages;
  if (packagesJob?.steps) {
    for (const step of packagesJob.steps) {
      const run = step.run || '';
      if (run.includes('|| true')) {
        fail(
          `ci.yml job 'packages' step '${step.name}' uses '|| true' — suppresses failures`
        );
      }
    }
    pass(`ci.yml job 'packages' has no '|| true' step commands`);
  }
}

// ---------------------------------------------------------------------------
// 2. Validate Cloudflare deploy workflow
// ---------------------------------------------------------------------------
const deployPath = path.join(WORKFLOWS_DIR, 'cloudflare-deploy.yml');
if (!fs.existsSync(deployPath)) {
  fail(`cloudflare-deploy.yml not found at ${deployPath}`);
} else {
  const deployContent = fs.readFileSync(deployPath, 'utf8');
  const deploy = yaml.load(deployContent);

  // 2a. Must have workflow_dispatch with environment choice OR staging job
  const hasWorkflowDispatch = deploy.on?.workflow_dispatch != null;
  const hasStagingJob = Object.keys(deploy.jobs || {}).some((name) =>
    name.toLowerCase().includes('staging')
  );
  const hasEnvironment = Object.values(deploy.jobs || {}).some(
    (job) => job.environment != null
  );

  if (!hasWorkflowDispatch && !hasStagingJob && !hasEnvironment) {
    fail(
      `cloudflare-deploy.yml deploys to production on every push without staging gate, workflow_dispatch, or environment approval`
    );
  } else {
    pass(`cloudflare-deploy.yml has deployment gating (workflow_dispatch/staging/environment)`);
  }
}

// ---------------------------------------------------------------------------
// 3. Summary
// ---------------------------------------------------------------------------
if (exitCode === 0) {
  console.log('\nAll CI/CD validations passed.');
} else {
  console.log('\nSome CI/CD validations failed. See above.');
}
process.exit(exitCode);
