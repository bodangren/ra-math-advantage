import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'precalc-generator-'));
  const files = ['scripts/generate-curriculum-implementation.mjs', 'curriculum/source/college-board/ced-topic-index.json', 'curriculum/implementation/exceptions.json', 'curriculum/implementation/practice-v1/activity-map.json',
    ...[1, 2, 3, 4].map(unit => `curriculum/implementation/class-period-packages/unit-${unit}.json`),
    ...[1, 2, 3].map(unit => `curriculum/source/passwater/unit-${unit}.md`)];
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.join(process.cwd(), file), path.join(root, file));
  }
  return root;
}
it('preserves every authored activity and class period on regeneration', () => {
  const root = fixture();
  try {
    const files = ['curriculum/implementation/practice-v1/activity-map.json', ...[1, 2, 3, 4].map(unit => `curriculum/implementation/class-period-packages/unit-${unit}.json`)];
    const before = files.map(file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')));
    const run = spawnSync(process.execPath, [path.join(root, 'scripts/generate-curriculum-implementation.mjs')], { encoding: 'utf8' });
    expect(run.status, run.stderr).toBe(0);
    expect(files.map(file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')))).toEqual(before);
  } finally { fs.rmSync(root, { recursive: true }); }
});
it('fails the audit when a topic has no class period', () => {
  const root = fixture();
  try {
    const file = path.join(root, 'curriculum/implementation/class-period-packages/unit-1.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data.periods = data.periods.filter((period: { cedTopic?: { id: string } }) => period.cedTopic?.id !== '1.1');
    fs.writeFileSync(file, JSON.stringify(data));
    const run = spawnSync(process.execPath, [path.join(root, 'scripts/generate-curriculum-implementation.mjs'), '--check'], { encoding: 'utf8' });
    expect(run.status).not.toBe(0);
    expect(run.stderr).toContain('source-backed-package-count');
    expect(JSON.parse(fs.readFileSync(file, 'utf8'))).toEqual(data);
  } finally { fs.rmSync(root, { recursive: true }); }
});
