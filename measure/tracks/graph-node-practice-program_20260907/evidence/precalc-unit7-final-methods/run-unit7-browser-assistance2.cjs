const fs = require('fs');
const { chromium } = require('playwright');
const { ConvexHttpClient } = require('convex/browser');
const { makeFunctionReference } = require('convex/server');

const root = __dirname;
const baseUrl = 'http://127.0.0.1:43162';
const account = JSON.parse(fs.readFileSync(`${root}/local-assistance2-account.json`, 'utf8'));
const ids = JSON.parse(fs.readFileSync(`${root}/local-assistance2-ids.json`, 'utf8'));
const client = new ConvexHttpClient('http://127.0.0.1:43160');
client.setAdminAuth(fs.readFileSync(`${root}/local-admin-key`, 'utf8').trim());
const inspect = makeFunctionReference('unit7LocalFixture:inspectLearnerEffects');

async function save(name) {
  const value = await client.query(inspect, { learnerId: ids.learnerId });
  fs.writeFileSync(`${root}/${name}.json`, `${JSON.stringify(value, null, 2)}\n`);
  return value;
}

async function login(page) {
  await page.goto(`${baseUrl}/auth/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('#username').fill(account.username);
  await page.locator('#password').fill(account.password);
  const response = page.waitForResponse((item) => new URL(item.url()).pathname === '/api/auth/login');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  if ((await response).status() !== 200) throw new Error('Assistance learner login failed.');
}

async function fill(scope, values) {
  await scope.getByLabel('Increasing intervals').fill(values[0]);
  await scope.getByLabel('Decreasing intervals').fill(values[1]);
  await scope.getByLabel('Constant intervals').fill(values[2]);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const learner = await browser.newContext();
  const teacher = await browser.newContext({
    storageState: `${root}/local-teacher-session.json`,
    timezoneId: 'UTC',
  });
  try {
    const page = await learner.newPage();
    await login(page);
    await page.goto(`${baseUrl}/student/lessons/1.1`);
    await page.waitForLoadState('networkidle');
    await save('unit7-before-assistance2-effects');

    if (await page.getByRole('button', { name: 'Mark worked example reviewed' }).count()) {
      await page.getByRole('button', { name: 'Mark worked example reviewed' }).click();
      await page.getByRole('status').filter({ hasText: 'acknowledgement was saved' }).waitFor();
      await page.getByRole('link', { name: 'Check lesson status' }).click();
    }
    await page.getByText('Wait for your teacher to confirm', { exact: false }).waitFor();

    const teacherPage = await teacher.newPage();
    await teacherPage.goto(`${baseUrl}/teacher/dashboard`);
    await teacherPage.waitForLoadState('networkidle');
    const learnerName = teacherPage.getByText('Replay Learner assistance2', { exact: true });
    await learnerName.waitFor();
    const candidate = learnerName.locator('xpath=ancestor::section[1]');
    await candidate.getByRole('button', { name: 'Confirm classroom introduction' }).click();
    await teacherPage.getByRole('status').filter({ hasText: 'Classroom introduction confirmed.' }).waitFor();

    await page.reload();
    await page.waitForLoadState('networkidle');
    const guided = page.getByRole('heading', { name: 'Guided Practice: Classify Graph Intervals' }).locator('xpath=ancestor::section[2]');
    await guided.waitFor();

    let guidedRequests = 0;
    let guidedKey;
    let guidedBody;
    await page.route('**/api/activities/precalculus-pilot/submissions', async (route) => {
      guidedRequests += 1;
      const key = route.request().headers()['idempotency-key'];
      const body = route.request().postData();
      guidedKey ??= key;
      guidedBody ??= body;
      if (guidedRequests <= 2 && (key !== guidedKey || body !== guidedBody)) {
        throw new Error('The Guided retry changed its frozen request tuple.');
      }
      if (guidedRequests === 1) {
        const accepted = await route.fetch();
        if (accepted.status() !== 200) throw new Error(`Guided first acceptance was ${accepted.status()}.`);
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    let pilotPosts = 0;
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/activities/precalculus-pilot/submissions') pilotPosts += 1;
    });
    const blankSubmit = guided.getByRole('button', { name: 'Submit answer' });
    if (!(await blankSubmit.isDisabled())) throw new Error('Blank Guided submit was enabled.');
    await blankSubmit.click({ force: true });
    await page.waitForTimeout(150);
    if (pilotPosts !== 0) throw new Error('Blank Guided attempt sent a POST.');
    if (await guided.getByRole('button', { name: 'Show hint for Increasing intervals' }).isDisabled()) throw new Error('Blank attempt froze assistance.');

    await guided.getByRole('button', { name: 'Show hint for Increasing intervals' }).click();
    await guided.getByRole('button', { name: 'Reveal answer for Decreasing intervals' }).click();
    await fill(guided, ['[0,3] U [7,9]', '[3,7]', 'none']);
    await guided.getByRole('button', { name: 'Submit answer' }).click();
    const retryAlert = page.getByRole('alert');
    await retryAlert.waitFor();
    const retryAlertText = await retryAlert.textContent();
    if (!retryAlertText) throw new Error('The ambiguous failure alert was empty.');
    if (!(await guided.getByLabel('Increasing intervals').isDisabled())) throw new Error('Guided input did not remain frozen.');
    if (!(await guided.getByRole('button', { name: 'Reveal answer for Constant intervals' }).isDisabled())) throw new Error('Guided assistance did not remain frozen.');
    await page.getByRole('button', { name: 'Retry submission' }).click();
    await page.getByText('Server score: 3/3').waitFor();
    if (guidedRequests !== 2) throw new Error(`Guided retry request count was ${guidedRequests}.`);
    const guidedEffects = await save('unit7-after-assisted2-guided-effects');
    const guidedSubmission = guidedEffects.submissions.find((item) => item.stableActivityId.endsWith('.guided_practice'));
    const guidedParts = guidedSubmission?.submissionData?.parts;
    if (!guidedParts || guidedParts[0].hintsUsed !== 1 || guidedParts[1].revealStepsSeen !== 1) {
      throw new Error('Guided assistance counters did not persist.');
    }

    await page.getByRole('button', { name: 'Start new attempt' }).click();
    const resetGuided = page.getByRole('heading', { name: 'Guided Practice: Classify Graph Intervals' }).locator('xpath=ancestor::section[2]');
    if ((await resetGuided.getByLabel('Increasing intervals').inputValue()) !== '') throw new Error('New attempt did not clear answers.');
    if (await resetGuided.getByText('Find every segment that rises.', { exact: true }).count()) throw new Error('New attempt did not clear the hint.');
    if (!(await resetGuided.getByRole('button', { name: 'Submit answer' }).isDisabled())) throw new Error('New blank attempt submit was enabled.');
    if (await resetGuided.getByRole('button', { name: 'Show hint for Increasing intervals' }).isDisabled()) throw new Error('New attempt did not reset assistance.');

    const independent = page.getByRole('heading', { name: 'Independent Practice: Classify Graph Intervals' }).locator('xpath=ancestor::section[2]');
    await independent.getByRole('button', { name: 'Show hint for Increasing intervals' }).click();
    await independent.getByRole('button', { name: 'Reveal answer for Constant intervals' }).click();
    await fill(independent, ['[0,2]', '[4,8]', '[2,4]']);
    await independent.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByText('Server score: 3/3').waitFor();
    const finalEffects = await save('unit7-after-assisted2-independent-effects');
    const independentSubmission = finalEffects.submissions.find((item) => item.stableActivityId.endsWith('.independent_practice'));
    const independentParts = independentSubmission?.submissionData?.parts;
    if (!independentParts || independentParts[0].hintsUsed !== 1 || independentParts[2].revealStepsSeen !== 1) {
      throw new Error('Independent assistance counters did not persist.');
    }
    const independentReview = finalEffects.reviews.find((item) => item.submissionId === independentSubmission._id);
    if (independentReview?.rating !== 'Hard') throw new Error(`Assisted Independent rating was ${independentReview?.rating}.`);
    await page.screenshot({ path: `${root}/unit7-assisted2-independent-hard.png`, fullPage: true });
    console.log(JSON.stringify({ blankPosts: 0, guidedRequests, guidedParts, independentParts, rating: independentReview.rating }));
  } finally {
    await learner.close();
    await teacher.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
