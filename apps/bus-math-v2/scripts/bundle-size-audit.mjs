import { readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const DIST_DIR = resolve(process.cwd(), 'dist');

const THRESHOLDS = [
  { pattern: 'server/index.js', threshold: 2500 * 1024 },
  { pattern: 'server/assets/vendor-monorepo-*.js', threshold: 700 * 1024 },
  { pattern: 'server/assets/vendor-*.js', threshold: 500 * 1024, exclude: 'vendor-monorepo-' },
  { pattern: 'server/assets/*.css', threshold: 200 * 1024 },
];

function findFiles(pattern, exclude) {
  const dir = pattern.substring(0, pattern.lastIndexOf('/'));
  const glob = pattern.substring(pattern.lastIndexOf('/') + 1);

  const fullDir = join(DIST_DIR, dir);
  try {
    const entries = readdirSync(fullDir);
    return entries
      .filter((f) => {
        if (exclude && f.startsWith(exclude)) return false;
        if (glob === '*.js') return f.endsWith('.js');
        if (glob === '*.css') return f.endsWith('.css');
        const prefix = glob.replace(/\*.*$/, '');
        const suffix = glob.replace(/^.*\*/, '');
        return f.startsWith(prefix) && f.endsWith(suffix);
      })
      .map((f) => ({ path: join(fullDir, f), name: f }));
  } catch {
    return [];
  }
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

let exitCode = 0;

function walkSize(dir) {
  let total = 0;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) total += walkSize(full);
      else total += statSync(full).size;
    }
  } catch { /* ignore */ }
  return total;
}

const totalSize = walkSize(join(DIST_DIR, 'server'));
const TOTAL_THRESHOLD = 3000 * 1024;
const totalStatus = totalSize > TOTAL_THRESHOLD ? 'EXCEEDS' : 'OK';
if (totalStatus === 'EXCEEDS') exitCode = 1;
console.log(`[${totalStatus}] Total dist/server: ${formatBytes(totalSize)} (threshold: ${formatBytes(TOTAL_THRESHOLD)})`);

for (const { pattern, threshold, exclude } of THRESHOLDS) {
  const files = findFiles(pattern, exclude);
  for (const file of files) {
    const size = statSync(file.path).size;
    const status = size > threshold ? 'EXCEEDS' : 'OK';
    if (status === 'EXCEEDS') exitCode = 1;
    console.log(`[${status}] ${pattern} → ${file.name}: ${formatBytes(size)} (threshold: ${formatBytes(threshold)})`);
  }
}

process.exit(exitCode);
