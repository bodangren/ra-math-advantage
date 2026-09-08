const fs = require('fs');
const { chromium } = require('playwright');
const { ConvexHttpClient } = require('convex/browser');
const { makeFunctionReference } = require('convex/server');

const root = __dirname;
const baseUrl = 'http://127.0.0.1:43162';
const account = JSON.parse(fs.readFileSync(`${root}/local-dateproof-account.json`, 'utf8'));
const ids = JSON.parse(fs.readFileSync(`${root}/local-dateproof-ids.json`, 'utf8'));
const client = new ConvexHttpClient('http://127.0.0.1:43160');
client.setAdminAuth(fs.readFileSync(`${root}/local-admin-key`, 'utf8').trim());
const inspect = makeFunctionReference('unit7LocalFixture:inspectLearnerEffects');

async function save(name) {
  const value = await client.query(inspect, { learnerId: ids.learnerId });
  fs.writeFileSync(`${root}/${name}.json`, `${JSON.stringify(value, null, 2)}\n`);
  return value;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const learner = await browser.newContext({ timezoneId: 'Asia/Shanghai' });
  const teacher = await browser.newContext({
    storageState: `${root}/local-teacher-session.json`,
    timezoneId: 'Asia/Shanghai',
  });
  try {
    const learnerPage = await learner.newPage();
    await learnerPage.goto(`${baseUrl}/auth/login`);
    await learnerPage.waitForLoadState('networkidle');
    await learnerPage.locator('#username').fill(account.username);
    await learnerPage.locator('#password').fill(account.password);
    const login = learnerPage.waitForResponse((response) => new URL(response.url()).pathname === '/api/auth/login');
    await learnerPage.getByRole('button', { name: 'Sign In', exact: true }).click();
    if ((await login).status() !== 200) throw new Error('Date proof learner login failed.');
    await learnerPage.goto(`${baseUrl}/student/lessons/1.1`);
    await learnerPage.waitForLoadState('networkidle');
    await learnerPage.getByRole('button', { name: 'Mark worked example reviewed' }).click();
    await learnerPage.getByRole('status').filter({ hasText: 'acknowledgement was saved' }).waitFor();
    const before = await save('unit7-before-teacher-date-proof-effects');
    if (before.submissions.length !== 1 || before.evidence.length !== 0) {
      throw new Error('Date proof learner did not start at the expected acknowledgement state.');
    }

    const teacherPage = await teacher.newPage();
    const consoleErrors = [];
    teacherPage.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await teacherPage.goto(`${baseUrl}/teacher/dashboard`);
    await teacherPage.waitForLoadState('networkidle');
    if (await teacherPage.getByTestId('vinext-dev-error-overlay').count()) {
      throw new Error('The teacher dashboard displayed a development error overlay.');
    }
    if (consoleErrors.some((message) => message.includes('Hydration failed'))) {
      throw new Error('The teacher dashboard reported a hydration mismatch.');
    }
    const learnerName = teacherPage.getByText('Replay Learner dateproof', { exact: true });
    const candidate = learnerName.locator('xpath=ancestor::section[1]');
    await learnerName.waitFor();
    const timestamp = candidate.locator('time');
    if (!(await timestamp.textContent())?.endsWith(' UTC')) {
      throw new Error('The teacher timestamp did not show its UTC label.');
    }
    await teacherPage.screenshot({ path: `${root}/unit7-teacher-date-clean-before.png`, fullPage: true });
    await candidate.getByRole('button', { name: 'Confirm classroom introduction' }).click();
    await candidate.getByRole('status').filter({ hasText: 'Classroom introduction confirmed.' }).waitFor();
    await teacherPage.screenshot({ path: `${root}/unit7-teacher-date-clean-after.png`, fullPage: true });
    if (consoleErrors.some((message) => message.includes('Hydration failed'))) {
      throw new Error('The teacher action reported a hydration mismatch.');
    }

    const after = await save('unit7-after-teacher-date-proof-effects');
    if (after.submissions.length !== 1 || after.evidence.length !== 1
      || after.receipts.length !== 0 || after.cards.length !== 0 || after.reviews.length !== 0) {
      throw new Error('Teacher confirmation created an unexpected learner effect.');
    }
    if (after.evidence[0].origin !== 'teacher_led') {
      throw new Error('Teacher confirmation did not create teacher-led evidence.');
    }
    console.log(JSON.stringify({
      timezone: 'Asia/Shanghai',
      hydrationErrors: 0,
      overlays: 0,
      timestamp: await timestamp.textContent(),
      before: { submissions: before.submissions.length, evidence: before.evidence.length },
      after: { submissions: after.submissions.length, evidence: after.evidence.length,
        receipts: after.receipts.length, cards: after.cards.length, reviews: after.reviews.length },
    }));
  } finally {
    await learner.close();
    await teacher.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
