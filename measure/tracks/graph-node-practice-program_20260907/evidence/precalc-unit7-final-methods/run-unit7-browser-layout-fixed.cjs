const fs = require('fs');
const { chromium } = require('playwright');
const { ConvexHttpClient } = require('convex/browser');
const { makeFunctionReference } = require('convex/server');

const root = __dirname;
const client = new ConvexHttpClient('http://127.0.0.1:43160');
client.setAdminAuth(fs.readFileSync(`${root}/local-admin-key`, 'utf8').trim());
const change = makeFunctionReference('unit7LocalFixture:switchSourceTitle');
const inspect = makeFunctionReference('unit7LocalFixture:inspectLearnerEffects');
const account = JSON.parse(fs.readFileSync(`${root}/local-dateproof-account.json`, 'utf8'));
const ids = JSON.parse(fs.readFileSync(`${root}/local-dateproof-ids.json`, 'utf8'));

function identities(value) {
  return Object.fromEntries(Object.entries(value).map(([key, rows]) => [key, rows.map((row) => row._id).sort()]));
}

(async () => {
  const before = await client.query(inspect, { learnerId: ids.learnerId });
  fs.writeFileSync(`${root}/unit7-before-stale-submit-effects.json`, `${JSON.stringify(before, null, 2)}\n`);
  await client.mutation(change, { title: 'Q37 stale submit proof title' });
  const browser = await chromium.launch({ headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const context = await browser.newContext({ timezoneId: 'Asia/Shanghai' });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:43162/auth/login');
    await page.waitForLoadState('networkidle');
    await page.locator('#username').fill(account.username);
    await page.locator('#password').fill(account.password);
    const login = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/auth/login');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    if ((await login).status() !== 200) throw new Error('Stale proof login failed.');
    await page.goto('http://127.0.0.1:43162/student/lessons/1.1');
    await page.waitForLoadState('networkidle');
    await page.getByText('This worked example is not available.').waitFor();
    if (await page.getByRole('heading', { name: /Guided Practice: Classify/ }).count()) throw new Error('Stale source showed Guided practice.');
    const results = [];
    for (const mode of ["guided_practice", "independent_practice"]) {
    const result = await page.evaluate(async (mode) => {
      const answers = { increasingIntervals: '[0,3] U [7,9]', decreasingIntervals: '[3,7]', constantIntervals: 'none' };
      const body = {
        contractVersion: 'practice.v1',
        activityId: 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.' + mode,
        mode, status: 'submitted', attemptNumber: 1,
        submittedAt: new Date().toISOString(), answers,
        parts: Object.entries(answers).map(([partId, rawAnswer]) => ({
          partId, rawAnswer, hintsUsed: 0, revealStepsSeen: 0, changedCount: 1,
        })),
      };
      const response = await fetch('/api/activities/precalculus-pilot/submissions', {
        method: 'POST', headers: { 'content-type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(body),
      });
      return { status: response.status, body: await response.json() };
    }, mode);
    if (result.status !== 409 || result.body.error !== 'Practice is not available') throw new Error(`Stale ${mode} submission returned ${result.status}.`);
    results.push({ mode, ...result });
    }
    await page.getByText('This worked example is not available.').screenshot({ path: `${root}/unit7-stale-submit-rejected-banner.png` });
    const layout = await page.evaluate(() => ({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, overflow: [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().right > innerWidth).slice(0, 8).map(e => ({ tag: e.tagName, className: String(e.className), width: e.getBoundingClientRect().width, text: e.textContent.slice(0, 80) })) }));
    if (layout.documentWidth > layout.viewport) throw new Error("Lesson still overflows viewport");
    await page.locator(".katex").filter({ has: page.locator(".hide-tail") }).first().screenshot({ path: `${root}/unit7-math-layout-fixed.png` });
    fs.writeFileSync(`${root}/unit7-page-layout-fixed.json`, JSON.stringify(layout, null, 2));
    const after = await client.query(inspect, { learnerId: ids.learnerId });
    fs.writeFileSync(`${root}/unit7-after-stale-submit-effects.json`, `${JSON.stringify(after, null, 2)}\n`);
    if (JSON.stringify(identities(after)) !== JSON.stringify(identities(before))) {
      throw new Error('Rejected stale submission changed persisted row identities.');
    }
    fs.writeFileSync(`${root}/unit7-stale-submit-result.json`, `${JSON.stringify({ results, persistedIdentitiesUnchanged: true }, null, 2)}\n`);
    console.log(JSON.stringify({ results, persistedIdentitiesUnchanged: true }));
  } finally {
    await context.close();
    await browser.close();
    await client.mutation(change, { title: 'Topic 1.1: Identify Graph Intervals with Your Teacher' });
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
