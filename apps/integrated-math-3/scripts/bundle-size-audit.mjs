import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const DIST_DIR = resolve(process.cwd(), 'dist');

const THRESHOLDS = {
  'server/assets/worker-entry-*.js': 850 * 1024,
  'server/ssr/index.js': 700 * 1024,
  'client/assets/page-*.js': 900 * 1024,
};

function findFiles(pattern) {
  const [dir, glob] = pattern.split('/*.js').length > 1 
    ? [pattern.replace('/*.js', ''), '*.js']
    : [pattern.substring(0, pattern.lastIndexOf('/')), pattern.substring(pattern.lastIndexOf('/') + 1)];
  
  const fullDir = join(DIST_DIR, dir);
  try {
    const entries = readdirSync(fullDir);
    return entries
      .filter((f) => {
        if (glob === '*.js') return f.endsWith('.js');
        // exact match with wildcard prefix/suffix
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

for (const [pattern, threshold] of Object.entries(THRESHOLDS)) {
  const files = findFiles(pattern);
  for (const file of files) {
    const size = statSync(file.path).size;
    const status = size > threshold ? 'EXCEEDS' : 'OK';
    if (status === 'EXCEEDS') exitCode = 1;
    console.log(`[${status}] ${pattern} → ${file.name}: ${formatBytes(size)} (threshold: ${formatBytes(threshold)})`);
  }
}

process.exit(exitCode);
