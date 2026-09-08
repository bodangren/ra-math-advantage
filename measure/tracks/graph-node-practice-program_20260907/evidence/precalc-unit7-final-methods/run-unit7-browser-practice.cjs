const fs = require('fs');
const { chromium } = require('playwright');
const { ConvexHttpClient } = require('convex/browser');
const { makeFunctionReference } = require('convex/server');
const root = __dirname;
const ids = JSON.parse(fs.readFileSync(`${root}/local-ids.json`, 'utf8'));
const client = new ConvexHttpClient('http://127.0.0.1:43160');
client.setAdminAuth(fs.readFileSync(`${root}/local-admin-key`, 'utf8').trim());
const inspect = makeFunctionReference('unit7LocalFixture:inspectLearnerEffects');
async function save(name) { const x = await client.query(inspect, { learnerId: ids.learnerId }); fs.writeFileSync(`${root}/${name}.json`, `${JSON.stringify(x, null, 2)}\n`); console.log(name, Object.fromEntries(Object.entries(x).map(([k,v]) => [k,v.length]))); }
async function fill(scope, a) { await scope.getByLabel('Increasing intervals').fill(a[0]); await scope.getByLabel('Decreasing intervals').fill(a[1]); await scope.getByLabel('Constant intervals').fill(a[2]); }
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({storageState:`${root}/local-student-session.json`,timezoneId:'UTC'});
 try {
  const page=await context.newPage();
  page.on('request',request=>{if(request.url().includes('/api/activities/precalculus-pilot/submissions')&&request.postData()){const body=JSON.parse(request.postData());fs.writeFileSync(`${root}/unit7-guided-request-shape.json`,JSON.stringify({keys:Object.keys(body),answerKeys:Object.keys(body.answers||{}),partIds:(body.parts||[]).map(x=>x.partId),answers:body.answers},null,2)+'\n')}});
  await page.goto('http://127.0.0.1:43162/student/lessons/1.1'); await page.waitForLoadState('networkidle');
  const guided=page.getByRole('heading',{name:'Guided Practice: Classify Graph Intervals'}).locator('xpath=ancestor::section[2]');
  await guided.waitFor(); await fill(guided,['[0,3] ∪ [7,9]','[3,7]','none']); await guided.getByRole('button',{name:'Submit answer'}).click(); await guided.getByText('Server score: 3/3').waitFor();
  await save('unit7-after-guided-effects');
  const independent=page.getByRole('heading',{name:'Independent Practice: Classify Graph Intervals'}).locator('xpath=ancestor::section[2]');
  await fill(independent,['wrong','wrong','wrong']); await independent.getByRole('button',{name:'Submit answer'}).click(); await independent.getByText('Server score: 0/3').waitFor();
  await independent.getByRole('button',{name:'Start new attempt'}).click(); await fill(independent,['[0,2]','[4,8]','[2,4]']); await independent.getByRole('button',{name:'Submit answer'}).click(); await independent.getByText('Server score: 3/3').waitFor();
  await page.screenshot({path:`${root}/unit7-independent-complete.png`,fullPage:true}); await save('unit7-after-independent-effects');
  await page.reload(); await page.getByText('Your submitted work (1)').waitFor(); await save('unit7-after-lesson-reload-effects');
 } finally { await context.close(); await browser.close(); }
})().catch(e=>{console.error(e.message);process.exitCode=1});
