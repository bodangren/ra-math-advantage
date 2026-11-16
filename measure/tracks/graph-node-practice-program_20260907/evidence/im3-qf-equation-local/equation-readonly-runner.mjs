import { chromium } from 'file:///tmp/im3-lesson18-recovery-v6l3h06f/node_modules/@playwright/test/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.LOCAL_APP_URL;
const savedUsername = process.env.QF_SAVED_USERNAME;
const pendingUsername = process.env.QF_PENDING_USERNAME;
const demoPassword = process.env.QF_DEMO_PASSWORD;
const evidenceDir = process.env.QF_EQUATION_EVIDENCE_DIR ?? '/tmp/im3-qf-equation-browser-evidence';
if (!baseURL || !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(baseURL)) {
  throw new Error('LOCAL_APP_URL must be an explicit loopback HTTP URL');
}
if (!savedUsername || !pendingUsername || !demoPassword || savedUsername === pendingUsername) {
  throw new Error('Set distinct QF_SAVED_USERNAME and QF_PENDING_USERNAME values and QF_DEMO_PASSWORD');
}
await fs.mkdir(evidenceDir, { recursive: true });

const modes = [
  { mode: 'guided_practice', slug: 'qf-browser-guided', label: 'guided' },
  { mode: 'independent_practice', slug: 'qf-browser-independent', label: 'independent' },
];
const attemptPattern = /\/api\/activities\/quadratic-formula\/attempt(?:\?|$)/;
const submissionPattern = /\/api\/activities\/submissions(?:\?|$)/;
const records = [];
const attemptedRequests = [];
const blockedResources = [];
let cloudRequests = 0;
let externalRequests = 0;

function normalizeEquation(value) {
  return value.replace(/\s+/g, '');
}
function requireCompleteEquation(value, context) {
  if (typeof value !== 'string' || !/\S\s=\s0$/.test(value)) {
    throw new Error(`${context}: expected a complete equation with terminal = 0`);
  }
}
async function writeJson(name, value) {
  await fs.writeFile(path.join(evidenceDir, name), `${JSON.stringify(value, null, 2)}\n`);
}
async function installNetwork(page, actor) {
  page.on('request', request => {
    if (!attemptPattern.test(request.url()) && !submissionPattern.test(request.url())) return;
    attemptedRequests.push({ actor, endpoint: attemptPattern.test(request.url()) ? 'attempt' : 'submission', method: request.method(), mode: new URL(request.url()).searchParams.get('mode') });
  });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.protocol === 'http:' && (url.hostname === '127.0.0.1' || url.hostname === 'localhost')) return route.continue();
    externalRequests += 1;
    blockedResources.push({origin:url.origin, path:url.pathname});
    if (/\.convex\.(cloud|site)$/.test(url.hostname)) cloudRequests += 1;
    return route.abort();
  });
  page.on('response', async response => {
    const request = response.request();
    if (!attemptPattern.test(response.url()) && !submissionPattern.test(response.url())) return;
    let body = null;
    try { body = await response.json(); } catch {}
    records.push({
      actor,
      endpoint: attemptPattern.test(response.url()) ? 'attempt' : 'submission',
      method: request.method(),
      status: response.status(),
      state: body?.state,
      mode: body?.mode ?? new URL(response.url()).searchParams.get('mode'),
      attemptOrdinal: body?.attemptOrdinal,
      equation: body?.props?.equation,
    });
  });
}
async function login(page, username) {
  const initialSession = page.waitForResponse(response => response.url().endsWith('/api/auth/session'));
  await page.goto('/auth/login');
  await initialSession;
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(demoPassword);
  const loginResponse = page.waitForResponse(response => response.url().endsWith('/api/auth/login'));
  await page.getByRole('button', { name: 'Sign In' }).click();
  const loginResult = await loginResponse;
  if (!loginResult.ok()) throw new Error(`Login failed with status ${loginResult.status()}`);
  const session = await page.request.get('/api/auth/session');
  const data = session.ok() ? await session.json() : null;
  if (!session.ok() || !data?.authenticated || data?.profile?.role !== 'student') {
    throw new Error('Expected an authenticated student session');
  }
}
function latestAttempt(actor, mode, method, after = 0) {
  return [...records].reverse().find((row, reverseIndex) => {
    const originalIndex = records.length - 1 - reverseIndex;
    return row.actor === actor && row.endpoint === 'attempt' && row.mode === mode
      && row.method === method && originalIndex >= after;
  });
}
async function waitAttempt(actor, mode, method, after) {
  for (let count = 0; count < 100; count += 1) {
    const row = latestAttempt(actor, mode, method, after);
    if (row) return row;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`${actor} ${mode}: no ${method} attempt response was captured`);
}
async function renderedEquation(region) {
  const values = await region.locator('annotation[encoding="application/x-tex"]').allTextContents();
  return values.find(value => /=\s*0\s*$/.test(value)) ?? null;
}
async function checkSaved(page, spec) {
  const mark = records.length;
  await page.goto(`/student/lesson/${spec.slug}`);
  const region = page.getByRole('region', { name: 'Quadratic Formula saved result' });
  await region.waitFor({ timeout: 30000 });
  const response = await waitAttempt('saved', spec.mode, 'GET', mark);
  const publicEquation = response?.equation;
  requireCompleteEquation(publicEquation, `${spec.label} saved response`);
  const equationParagraph = region.getByText(publicEquation, { exact: true });
  await equationParagraph.waitFor();
  const shown = await equationParagraph.textContent();
  if (!shown || normalizeEquation(shown) !== normalizeEquation(publicEquation)) {
    throw new Error(`${spec.label}: saved DOM equation does not equal the public response`);
  }
  await page.screenshot({ path: path.join(evidenceDir, `saved-${spec.label}.png`), fullPage: true });
  return { mode: spec.mode, state: response.state, equation: publicEquation, renderedEquation: shown };
}
async function readNoAttempt(page, spec) {
  const mark = records.length;
  await page.goto(`/student/lesson/${spec.slug}`);
  await page.getByText('Start this activity when you are ready.').waitFor({ timeout: 30000 });
  const response = await waitAttempt('pending', spec.mode, 'GET', mark);
  if (response.state !== 'no_attempt') {
    throw new Error(`${spec.label}: the pending learner already has QF attempt state ${response?.state ?? 'missing'}`);
  }
  return { mode: spec.mode, state: response.state };
}
async function readPending(page, spec) {
  const mark = records.length;
  await page.goto(`/student/lesson/${spec.slug}`);
  const form = page.getByRole('form', { name: 'Quadratic Formula response' });
  await form.waitFor({ timeout: 30000 });
  const response = await waitAttempt('pending', spec.mode, 'GET', mark);
  if (response.state !== 'pending' || response.attemptOrdinal !== 1) throw Error('Expected retained first pending attempt');
  requireCompleteEquation(response.equation, `${spec.label} pending response`);
  const shown = await renderedEquation(form.locator('xpath=..'));
  if (!shown || normalizeEquation(shown) !== normalizeEquation(response.equation)) throw Error('Pending equation mismatch');
  await page.screenshot({path:path.join(evidenceDir, `pending-${spec.label}.png`),fullPage:true});
  return {mode:spec.mode,state:response.state,attemptOrdinal:response.attemptOrdinal,equation:response.equation,renderedEquation:shown};
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const savedContext = await browser.newContext({ baseURL });
  const savedPage = await savedContext.newPage();
  await installNetwork(savedPage, 'saved');
  await login(savedPage, savedUsername);
  const saved = [];
  for (const spec of modes) saved.push(await checkSaved(savedPage, spec));
  await savedContext.close();

  const pendingContext = await browser.newContext({ baseURL });
  const pendingPage = await pendingContext.newPage();
  await installNetwork(pendingPage, 'pending');
  await login(pendingPage, pendingUsername);
  const preflight = [];
  // The first run created these attempts. This run only reads them.
  const pending = [];
  for (const spec of modes) pending.push(await readPending(pendingPage, spec));
  await pendingContext.close();

  const savedMutations = attemptedRequests.filter(row => row.actor === 'saved' && row.method !== 'GET');
  const pendingStarts = attemptedRequests.filter(row => row.actor === 'pending' && row.endpoint === 'attempt' && row.method === 'POST');
  const submissions = attemptedRequests.filter(row => row.endpoint === 'submission');
  if (savedMutations.length !== 0) throw new Error('Saved learner flow made a mutation request');
  if (pendingStarts.length !== 0) throw new Error(`Expected zero pending Start requests, found ${pendingStarts.length}`);
  if (submissions.length !== 0) throw new Error('Display verification sent a learner submission');
  await writeJson('blocked-resources.json', blockedResources);
  if (cloudRequests !== 0 || blockedResources.some(resource => resource.origin !== 'https://fonts.googleapis.com' || resource.path !== '/css2')) throw new Error(`Blocked ${externalRequests} external requests, including ${cloudRequests} Convex cloud requests`);

  const result = {
    saved,
    pendingPreflight: preflight,
    pending,
    counts: { savedMutationRequests: 0, pendingStartRequests: 0, submissionRequests: 0, blockedFontRequests: externalRequests, cloudRequests: 0 },
  };
  await writeJson('browser-result.json', result);
  await writeJson('browser-network.json', { requests: attemptedRequests, responses: records });
  console.log(JSON.stringify({ ok: true, ...result.counts }));
} finally {
  await browser.close();
}
