const fs = require('fs');
const { chromium } = require('playwright');
const { ConvexHttpClient } = require('convex/browser');
const { makeFunctionReference } = require('convex/server');

const root = __dirname;
const baseUrl = 'http://127.0.0.1:43162';
const account = JSON.parse(fs.readFileSync(`${root}/local-pendingguard-account.json`, 'utf8'));
const ids = JSON.parse(fs.readFileSync(`${root}/local-pendingguard-ids.json`, 'utf8'));
const client = new ConvexHttpClient('http://127.0.0.1:43160');
client.setAdminAuth(fs.readFileSync(`${root}/local-admin-key`, 'utf8').trim());
const inspect = makeFunctionReference('unit7LocalFixture:inspectLearnerEffects');

async function effects() {
  return client.query(inspect, { learnerId: ids.learnerId });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${baseUrl}/auth/login`);
    await page.waitForLoadState('networkidle');
    await page.locator('#username').fill(account.username);
    await page.locator('#password').fill(account.password);
    const loginResponse = page.waitForResponse((response) => (
      new URL(response.url()).pathname === '/api/auth/login'
      && response.request().method() === 'POST'
    ));
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    if ((await loginResponse).status() !== 200) throw new Error('Replay learner login failed.');

    await page.goto(`${baseUrl}/student/lessons/1.1`);
    await page.waitForLoadState('networkidle');
    const before = await effects();
    fs.writeFileSync(`${root}/unit7-before-pending-guard-effects.json`, `${JSON.stringify(before, null, 2)}\n`);

    let requestCount = 0;
    let firstIdentity;
    let firstBody;
    let releaseFirst;
    const firstMayFinish = new Promise((resolve) => { releaseFirst = resolve; });
    let markFirstStarted;
    const firstStarted = new Promise((resolve) => { markFirstStarted = resolve; });
    await page.route('**/api/activities/precalculus-topic-1-1/submissions', async (route) => {
      requestCount += 1;
      const identity = route.request().headers()['idempotency-key'];
      const body = route.request().postData();
      firstIdentity ??= identity;
      firstBody ??= body;
      if (identity !== firstIdentity || body !== firstBody) {
        throw new Error('The visible retry changed its request tuple.');
      }
      if (requestCount === 1) {
        markFirstStarted();
        await firstMayFinish;
        const accepted = await route.fetch();
        if (accepted.status() !== 200) throw new Error(`Initial server acceptance was ${accepted.status()}.`);
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    const button = page.getByRole('button', { name: 'Mark worked example reviewed' });
    await button.evaluate((element) => {
      element.click();
      element.click();
    });
    await firstStarted;
    await page.waitForTimeout(250);
    if (requestCount !== 1) throw new Error(`Pending double click made ${requestCount} requests.`);
    releaseFirst();
    await page.getByRole('alert').filter({ hasText: 'Unable to save' }).waitFor();
    await page.getByRole('button', { name: 'Retry worked example review' }).click();
    await page.getByRole('status').filter({ hasText: 'acknowledgement was saved' }).waitFor();
    if (requestCount !== 2) throw new Error(`Ambiguous retry made ${requestCount} requests.`);

    const after = await effects();
    fs.writeFileSync(`${root}/unit7-after-pending-guard-effects.json`, `${JSON.stringify(after, null, 2)}\n`);
    const counts = Object.fromEntries(Object.entries(after).map(([key, value]) => [key, value.length]));
    if (after.submissions.length !== 1) throw new Error('Replay learner must have one persisted acknowledgement.');
    if (after.evidence.length !== 0 || after.receipts.length !== 0 || after.cards.length !== 0 || after.reviews.length !== 0) {
      throw new Error('Acknowledgement created an ineligible learner effect.');
    }
    await page.screenshot({ path: `${root}/unit7-pending-guard-success.png`, fullPage: true });
    console.log(JSON.stringify({ loginStatus: 200, pendingRequestCount: 1, totalRequestCount: requestCount, counts }));
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
