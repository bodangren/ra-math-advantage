// Phase 5 — Red-phase tests for the User Manual Verification checkpoint
// artifacts of Track 5 (Adaptive Placement).
//
// Per measure/workflow.md §70-104 "Phase Completion Verification and
// Checkpointing Protocol", Phase 5 — Docs & Doctor must produce:
//   1. A `measure(checkpoint): Checkpoint end of Phase 5` commit on the
//      track's branch.
//   2. A git notes payload attached to that commit containing the
//      auditable verification report (boundary lint, tsc --noEmit, full
//      test suite, manual verification plan).
//   3. A plan.md update that appends `[checkpoint: <sha>]` to the
//      `## Phase 5 — Docs & Doctor` heading.
//   4. The same plan.md commit that records the new checkpoint SHA on the
//      "Measure - User Manual Verification 'Phase 5'" task.
//
// These are concrete, testable artifacts. They are currently missing
// (the User Manual Verification task has not been run for Phase 5), so
// each test in this file is expected to fail Red until the supervisor /
// user runs the workflow protocol and produces the checkpoint.
//
// Lock-in contract: once the protocol runs, these tests must continue to
// pass for the lifetime of the track (regression coverage for the
// checkpoint shape).

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const REPO_ROOT = resolve(__dirname, '../../../../..');
const PLAN_PATH = join(
  REPO_ROOT,
  'measure',
  'tracks',
  'adaptive-placement_20260521',
  'plan.md',
);
const PHASE_5_HEADING = '## Phase 5 — Docs & Doctor';
const PHASE_5_CHECKPOINT_PREFIX = 'measure(checkpoint): Checkpoint end of Phase 5';
const TASK_LINE = "Task: Measure - User Manual Verification 'Phase 5'";

function readUtf8(path: string): string {
  return readFileSync(path, 'utf-8');
}

function gitRevParse(args: string[]): string {
  const out = execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return out.trim();
}

function listCommitsMatching(matcher: RegExp): string[] {
  // %H%x1f%s%x1e  =>  "<sha>\x1f<subject>\x1e" per record
  const raw = execFileSync(
    'git',
    ['log', '--all', '--pretty=format:%H%x1f%s%x1e'],
    { cwd: REPO_ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const shas: string[] = [];
  for (const record of raw.split('\x1e')) {
    const trimmed = record.replace(/^\n+|\n+$/g, '');
    if (!trimmed) continue;
    const sep = trimmed.indexOf('\x1f');
    if (sep < 0) continue;
    const sha = trimmed.slice(0, sep);
    const subject = trimmed.slice(sep + 1);
    if (matcher.test(subject)) shas.push(sha);
  }
  return shas;
}

function gitNotesGet(sha: string): string {
  try {
    return execFileSync('git', ['notes', 'show', sha], {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Phase 5 plan heading + task status
// ---------------------------------------------------------------------------

describe('Phase 5 plan heading and task status', () => {
  it('plan.md exists at the canonical Adaptive Placement track path', () => {
    expect(existsSync(PLAN_PATH)).toBe(true);
  });

  it("plan.md still has the '## Phase 5 — Docs & Doctor' heading", () => {
    const plan = readUtf8(PLAN_PATH);
    expect(plan).toContain(PHASE_5_HEADING);
  });

  it('Phase 5 heading is annotated with a [checkpoint: <sha>] marker', () => {
    const plan = readUtf8(PLAN_PATH);
    const headingLine = plan
      .split('\n')
      .find((line) => line.startsWith(PHASE_5_HEADING));
    expect(headingLine, 'Phase 5 heading line').toBeDefined();
    expect(
      headingLine!,
      'Phase 5 heading must end with `[checkpoint: <sha>]` after the protocol runs',
    ).toMatch(/\[checkpoint:\s*[0-9a-f]{7,}\s*\]\s*$/);
  });

  it("the 'Measure - User Manual Verification \\'Phase 5\\'' task is marked [x] with a commit SHA", () => {
    const plan = readUtf8(PLAN_PATH);
    const taskLine = plan
      .split('\n')
      .find((line) => line.includes(TASK_LINE));
    expect(taskLine, 'Phase 5 verification task line').toBeDefined();
    expect(
      taskLine!,
      'task line must be [x] and record a 7-char commit SHA',
    ).toMatch(/^-\s*\[x\]\s+Task:.*\(\s*[0-9a-f]{7}\s*\)\s*$/);
  });
});

// ---------------------------------------------------------------------------
// Phase 5 checkpoint commit + git note
// ---------------------------------------------------------------------------

describe('Phase 5 checkpoint commit and git note', () => {
  it('a `measure(checkpoint): Checkpoint end of Phase 5` commit exists', () => {
    const shas = listCommitsMatching(
      new RegExp(`^${PHASE_5_CHECKPOINT_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    );
    expect(
      shas,
      'Expected at least one Phase 5 checkpoint commit; found none in `git log --all`',
    ).toHaveLength(1);
  });

  it('the Phase 5 checkpoint commit has a git notes report attached', () => {
    const shas = listCommitsMatching(
      new RegExp(`^${PHASE_5_CHECKPOINT_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    );
    expect(shas, 'Phase 5 checkpoint commit must exist before notes can be attached').toHaveLength(1);
    const notes = gitNotesGet(shas[0]);
    expect(notes, 'git notes payload for the Phase 5 checkpoint commit').not.toBe('');
  });

  it('the Phase 5 git note mentions boundary lint, tsc --noEmit, and the full test suite', () => {
    const shas = listCommitsMatching(
      new RegExp(`^${PHASE_5_CHECKPOINT_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    );
    expect(shas, 'Phase 5 checkpoint commit must exist before notes can be attached').toHaveLength(1);
    const notes = gitNotesGet(shas[0]).toLowerCase();
    expect(notes, 'boundary lint section').toContain('boundary');
    expect(notes, 'tsc --noEmit section').toContain('tsc');
    expect(notes, 'test suite section').toContain('test');
  });

  it('the Phase 5 git note lists a manual verification plan with command outcomes', () => {
    const shas = listCommitsMatching(
      new RegExp(`^${PHASE_5_CHECKPOINT_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    );
    expect(shas, 'Phase 5 checkpoint commit must exist before notes can be attached').toHaveLength(1);
    const notes = gitNotesGet(shas[0]);
    expect(notes, 'manual verification plan section').toMatch(/manual verification|verification plan/i);
    // Step outcomes are recorded as "OK" or "FAIL" markers per workflow.md §4.
    expect(notes, 'expected outcome marker (OK or PASS)').toMatch(/\b(OK|PASS|✅)\b/);
  });

  it('the recorded checkpoint SHA in plan.md matches the actual Phase 5 checkpoint commit', () => {
    const plan = readUtf8(PLAN_PATH);
    const headingLine = plan
      .split('\n')
      .find((line) => line.startsWith(PHASE_5_HEADING));
    const recorded = headingLine?.match(/\[checkpoint:\s*([0-9a-f]{7,})\s*\]/)?.[1];
    if (!recorded) {
      // If the heading has no checkpoint yet, defer the equality check — the
      // marker-absence test above already fails Red in that case.
      expect(
        headingLine,
        'Phase 5 heading must have a [checkpoint: <sha>] marker; cannot compare SHAs',
      ).toMatch(/\[checkpoint:/);
      return;
    }
    const shas = listCommitsMatching(
      new RegExp(`^${PHASE_5_CHECKPOINT_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    );
    expect(shas, 'Phase 5 checkpoint commit must exist').toHaveLength(1);
    expect(
      shas[0].startsWith(recorded),
      `plan-recorded SHA ${recorded} must be a prefix of the actual commit ${shas[0]}`,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Sanity guard: git is reachable so the artifact tests are not silently
// passing because of an infra error.
// ---------------------------------------------------------------------------

describe('Phase 5 checkpoint test harness sanity', () => {
  it('git is on the repository at the expected root', () => {
    const toplevel = gitRevParse(['rev-parse', '--show-toplevel']);
    expect(topsAreEqual(toplevel, REPO_ROOT)).toBe(true);
  });
});

function topsAreEqual(a: string, b: string): boolean {
  const norm = (p: string) => p.replace(/\/+$/, '');
  return norm(a) === norm(b);
}
