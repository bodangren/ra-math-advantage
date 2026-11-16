const fs = require('fs');
const { chromium } = require('playwright');
const { ConvexHttpClient } = require('convex/browser');
const { makeFunctionReference } = require('convex/server');

const root = __dirname;
const baseUrl = 'http://127.0.0.1:43162';
const ids = JSON.parse(fs.readFileSync(`${root}/local-ids.json`, 'utf8'));
const client = new ConvexHttpClient('http://127.0.0.1:43160');
client.setAdminAuth(fs.readFileSync(`${root}/local-admin-key`, 'utf8').trim());
const inspect = makeFunctionReference('unit7LocalFixture:inspectLearnerEffects');

async function saveEffects(name) {
  const effects = await client.query(inspect, { learnerId: ids.learnerId });
  fs.writeFileSync(`${root}/${name}.json`, `${JSON.stringify(effects, null, 2)}\n`);
  return Object.fromEntries(Object.entries(effects).map(([key, value]) => [key, value.length]));
}

async function fillAnswers(scope, values) {
  await scope.getByLabel('Increasing intervals').fill(values[0]);
  await scope.getByLabel('Decreasing intervals').fill(values[1]);
  await scope.getByLabel('Constant intervals').fill(values[2]);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const learner = await browser.newContext({ storageState: `${root}/local-student-session.json` });
  const teacher = await browser.newContext({ storageState: `${root}/local-teacher-session.json` });
  try {
    const page = await learner.newPage();
    await page.goto(`${baseUrl}/student/lessons/1.1`);
    await page.waitForLoadState('networkidle');
    const phaseLinks = await page.getByRole('navigation', { name: 'Lesson phases' }).getByRole('link').allTextContents();
    if (phaseLinks.length !== 7) throw new Error(`Expected 7 phase links, found ${phaseLinks.length}`);
    const graphDescription = await page.getByRole('img', { name: /Interval graph/ }).locator('desc').textContent();
    if (!graphDescription.includes('(0, 1), (3, 7), (7, 2), (9, 6)')) throw new Error('Worked graph points are not exact');
    if (!await page.getByText('Authored worked example A:', { exact: false }).isVisible()) throw new Error('Ordinary Worked body is missing');
    const worked = page.getByRole('heading', { name: 'Worked Example', exact: true }).locator('..');
    await worked.getByLabel('Your work and explanation').fill('Browser verification response for the ordinary mixed-phase path.');
    await worked.getByRole('button', { name: 'Submit response' }).click();
    await worked.getByRole('status').filter({ hasText: 'Response saved for teacher review.' }).waitFor();

    let acknowledgementRequests = 0;
    let firstKey;
    await page.route('**/api/activities/precalculus-topic-1-1/submissions', async (route) => {
      acknowledgementRequests += 1;
      const key = route.request().headers()['idempotency-key'];
      firstKey ??= key;
      if (key !== firstKey) throw new Error('Worked retry changed its request identity');
      if (acknowledgementRequests === 1) {
        await route.fetch();
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });
    await page.getByRole('button', { name: 'Mark worked example reviewed' }).click();
    await page.getByRole('alert').filter({ hasText: 'Unable to save' }).waitFor();
    await page.getByRole('button', { name: 'Retry worked example review' }).click();
    await page.getByRole('status').filter({ hasText: 'acknowledgement was saved' }).waitFor();
    if (acknowledgementRequests !== 2) throw new Error('Worked ambiguous retry request count is wrong');
    await page.screenshot({ path: `${root}/unit7-learner-waiting.png`, fullPage: true });
    await page.getByRole('link', { name: 'Check lesson status' }).click();
    await page.getByText('Wait for your teacher to confirm', { exact: false }).waitFor();
    if (await page.getByRole('heading', { name: /Guided Practice: Classify/ }).count()) throw new Error('Practice unlocked before teacher confirmation');
    console.log('after acknowledgement', await saveEffects('unit7-after-acknowledgement-effects'));

    const teacherPage = await teacher.newPage();
    await teacherPage.goto(`${baseUrl}/teacher/dashboard`);
    await teacherPage.waitForLoadState('networkidle');
    await teacherPage.getByText('Q37 Learner', { exact: true }).waitFor();
    await teacherPage.screenshot({ path: `${root}/unit7-teacher-candidate.png`, fullPage: true });
    await teacherPage.getByRole('button', { name: 'Confirm classroom introduction' }).click();
    await teacherPage.getByRole('status').filter({ hasText: 'Classroom introduction confirmed.' }).waitFor();
    await teacherPage.reload();
    await teacherPage.getByText('No Topic 1.1 classroom introductions are waiting for confirmation.').waitFor();
    console.log('after teacher', await saveEffects('unit7-after-teacher-effects'));

    await page.reload();
    await page.getByRole('heading', { name: 'Guided Practice: Classify Graph Intervals' }).waitFor();
    await page.screenshot({ path: `${root}/unit7-practice-unlocked.png`, fullPage: true });

    const guided = page.getByRole('heading', { name: 'Guided Practice: Classify Graph Intervals' }).locator('..');
    await fillAnswers(guided, ['wrong', 'wrong', 'wrong']);
    await guided.getByRole('button', { name: 'Submit answer' }).click();
    await guided.getByText('Server score: 0/3').waitFor();
    await guided.getByRole('button', { name: 'Start new attempt' }).click();
    await fillAnswers(guided, ['[0,3] U [7,9]', '[3,7]', 'none']);
    await guided.getByRole('button', { name: 'Submit answer' }).click();
    await guided.getByText('Server score: 3/3').waitFor();
    console.log('after guided', await saveEffects('unit7-after-guided-effects'));

    const independent = page.getByRole('heading', { name: 'Independent Practice: Classify Graph Intervals' }).locator('..');
    await fillAnswers(independent, ['wrong', 'wrong', 'wrong']);
    await independent.getByRole('button', { name: 'Submit answer' }).click();
    await independent.getByText('Server score: 0/3').waitFor();
    await independent.getByRole('button', { name: 'Start new attempt' }).click();
    await fillAnswers(independent, ['[0,2]', '[4,8]', '[2,4]']);
    await independent.getByRole('button', { name: 'Submit answer' }).click();
    await independent.getByText('Server score: 3/3').waitFor();
    await page.screenshot({ path: `${root}/unit7-independent-complete.png`, fullPage: true });
    console.log('after independent', await saveEffects('unit7-after-independent-effects'));
  } finally {
    await learner.close();
    await teacher.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
