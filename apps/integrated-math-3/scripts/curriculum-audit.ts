import fs from 'node:fs';
import path from 'node:path';
import { runCurriculumAudit } from '../lib/curriculum/audit';

const rootDir = process.cwd();
const report = runCurriculumAudit(rootDir);
const outDir = path.join(rootDir, 'curriculum', 'implementation', 'audit');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify(report, null, 2));

if (!report.pass) {
  process.exitCode = 1;
}

