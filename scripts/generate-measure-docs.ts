import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');
const GRAPH_DB = path.resolve(REPO_ROOT, 'graph.db');
const OUTPUT_DIR = path.resolve(REPO_ROOT, 'measure/generated');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function hasBuildGraph(): boolean {
  try {
    execSync('which build-graph', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function runQuery(sql: string) {
  const cmd = `build-graph query --json ${GRAPH_DB} "${sql.replace(/"/g, '\\"')}"`;
  const output = execSync(cmd).toString();
  return JSON.parse(output);
}

function generateRoutes() {
  console.log('Generating routes.md...');
  const routes = runQuery(`
    SELECT name, file_path, tags 
    FROM nodes 
    WHERE type = 'route' 
    ORDER BY file_path, name
  `);

  let md = '# App Routes\n\n| Route | File | Parameters |\n|-------|------|------------|\n';
  for (const route of routes) {
    const relativePath = path.relative(REPO_ROOT, route.file_path);
    const params = route.tags ? JSON.parse(route.tags).join(', ') : '-';
    md += `| ${route.name} | \`${relativePath}\` | ${params} |\n`;
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'routes.md'), md);
}

function generateArchitecture() {
  console.log('Generating architecture.json...');
  const nodes = runQuery(`
    SELECT id, type, name, file_path, package_id
    FROM nodes
    WHERE type IN ('file', 'package')
  `);

  const apps = fs.readdirSync(path.join(REPO_ROOT, 'apps'));
  const packages = fs.readdirSync(path.join(REPO_ROOT, 'packages'));

  const arch = {
    apps: apps.map(app => ({
      name: app,
      path: `apps/${app}`,
    })),
    packages: packages.map(pkg => ({
      name: pkg,
      path: `packages/${pkg}`,
    })),
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'architecture.json'), JSON.stringify(arch, null, 2));
}

if (!hasBuildGraph()) {
  console.warn('[generate] build-graph CLI not found — skipping generation.');
  process.exit(0);
}

try {
  generateRoutes();
  generateArchitecture();
  console.log('Successfully generated Measure documentation.');
} catch (err) {
  console.error('Error generating Measure documentation:', err);
  process.exit(1);
}
