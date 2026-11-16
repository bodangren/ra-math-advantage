const fs = require('fs');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ConvexHttpClient } = require('convex/browser');
const { makeFunctionReference } = require('convex/server');
const root = __dirname;
const client = new ConvexHttpClient('http://127.0.0.1:43160');
client.setAdminAuth(fs.readFileSync(`${root}/local-admin-key`, 'utf8').trim());
const ids = JSON.parse(fs.readFileSync(`${root}/local-ids.json`, 'utf8'));
const inspect = makeFunctionReference('unit7LocalFixture:inspectLearnerEffects');
const change = makeFunctionReference('unit7LocalFixture:switchSourceTitle');
(async () => {
 const before = await client.query(inspect, { learnerId: ids.learnerId });
 const browser = await chromium.launch({headless:true, executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const learner = await browser.newContext({storageState:`${root}/local-student-session.json`, timezoneId:'Asia/Shanghai'});
 const teacher = await browser.newContext({storageState:`${root}/local-teacher-session.json`, timezoneId:'Asia/Shanghai'});
 let writes=[]; const errors=[];
 learner.on('request', req => {if(req.method()==='POST' && new URL(req.url()).pathname.startsWith('/api/')) writes.push(new URL(req.url()).pathname);});
 const page=await learner.newPage();page.on('pageerror',e=>errors.push(e.message));
 const saved = [];
 try {
  await page.goto('http://127.0.0.1:43162/student/lessons/1.1');await page.waitForLoadState('networkidle');
  for(const mode of ['guided','independent']){
   const box=page.getByRole('heading',{name:`Saved ${mode} attempt`,exact:true}).locator('..');
   await box.waitFor();const text=await box.innerText();assert.match(text,/Attempt 2/);assert.match(text,/Saved score: 3\/3/);assert.match(text,/Evidence delivered\./);saved.push({mode,text});
  }
  assert.equal(await page.getByRole('button',{name:'Start new attempt',exact:true}).count(),2);
  assert.equal(await page.getByRole('button',{name:'Submit practice',exact:true}).count(),0);
  await page.reload();await page.waitForLoadState('networkidle');
  assert.equal(await page.getByRole('heading',{name:/^Saved (guided|independent) attempt$/}).count(),2);
  await page.getByText('Your submitted work (1)',{exact:false}).waitFor();
  assert.equal(await page.getByText('Browser verification response for the ordinary mixed-phase path.',{exact:true}).count(),1);
  await page.screenshot({path:`${root}/unit7-saved-lesson-reload.png`,fullPage:true});
  await page.goto('http://127.0.0.1:43162/student/dashboard');await page.waitForLoadState('networkidle');
  assert.equal(await page.getByText('Saved score: 3/3',{exact:true}).count(),2);
  assert.equal(await page.getByText('Attempt 2',{exact:true}).count(),2);
  await page.getByRole('heading',{name:'Guided practice',exact:true}).waitFor();await page.getByRole('heading',{name:'Independent practice',exact:true}).waitFor();
  await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.getByText('Saved score: 3/3',{exact:true}).count(),2);
  await page.screenshot({path:`${root}/unit7-saved-student-dashboard.png`,fullPage:true});
  await client.mutation(change,{title:'Q38 saved-history stale source proof'});
  await page.goto('http://127.0.0.1:43162/student/lessons/1.1');await page.waitForLoadState('networkidle');
  await page.getByText('This worked example is not available.').waitFor();
  assert.equal(await page.getByRole('heading',{name:/^Saved (guided|independent) attempt$/}).count(),2);
  assert.equal(await page.getByRole('button',{name:'Start new attempt',exact:true}).count(),0);
  assert.equal(await page.getByText('Saved score: 3/3',{exact:true}).count(),2);
  await page.screenshot({path:`${root}/unit7-saved-history-stale-source.png`,fullPage:true});
  await client.mutation(change,{title:'Topic 1.1: Identify Graph Intervals with Your Teacher'});
  const t=await teacher.newPage();t.on('pageerror',e=>errors.push(e.message));
  await t.goto('http://127.0.0.1:43162/teacher/dashboard');await t.waitForLoadState('networkidle');
  const section=t.getByRole('heading',{name:'Topic 1.1 classroom introductions'}).locator('..');
  const beforeText=await section.innerText();await t.reload();await t.waitForLoadState('networkidle');assert.equal(await section.innerText(),beforeText);
  await t.screenshot({path:`${root}/unit7-saved-teacher-dashboard.png`,fullPage:true});
  const after=await client.query(inspect,{learnerId:ids.learnerId});assert.deepEqual(after,before);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  const result={saved,readOnlyPostCount:writes.length,fullPersistedRowsUnchanged:true,historicalResultsVisibleWhileSourceStale:true,newAttemptControlsHiddenWhileSourceStale:true,teacherDashboardStable:true,pageErrors:errors};
  fs.writeFileSync(`${root}/unit7-saved-read-result.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{await client.mutation(change,{title:'Topic 1.1: Identify Graph Intervals with Your Teacher'});await learner.close();await teacher.close();await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
