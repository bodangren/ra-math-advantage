const fs=require('fs'); const assert=require('node:assert/strict');
const {chromium}=require('playwright');const {ConvexHttpClient}=require('convex/browser');const {makeFunctionReference}=require('convex/server');
const root=__dirname, base='http://127.0.0.1:43162';
const account=JSON.parse(fs.readFileSync(`${root}/local-dateproof-account.json`));const ids=JSON.parse(fs.readFileSync(`${root}/local-dateproof-ids.json`));
const client=new ConvexHttpClient('http://127.0.0.1:43160');client.setAdminAuth(fs.readFileSync(`${root}/local-admin-key`,'utf8').trim());const inspect=makeFunctionReference('unit7LocalFixture:inspectLearnerEffects');
(async()=>{
 const before=await client.query(inspect,{learnerId:ids.learnerId});
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const context=await browser.newContext({timezoneId:'Asia/Shanghai'});
 try{
  const page=await context.newPage();await page.goto(`${base}/auth/login`);await page.waitForLoadState('networkidle');await page.locator('#username').fill(account.username);await page.locator('#password').fill(account.password);const login=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/auth/login');await page.getByRole('button',{name:'Sign In',exact:true}).click();assert.equal((await login).status(),200);
  await page.goto(`${base}/student/lessons/1.1`);await page.waitForLoadState('networkidle');const saved=page.getByRole('heading',{name:'Saved guided attempt',exact:true}).locator('..');await saved.getByText('Evidence delivered.',{exact:true}).waitFor();await saved.locator('..').getByRole('button',{name:'Start new attempt',exact:true}).click();
  await page.route('**/api/learning-evidence/precalculus-pilot',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Local browser delivery interruption'})}));
  const guided=page.getByRole('heading',{name:'Guided Practice: Classify Graph Intervals',exact:true}).locator('xpath=ancestor::section[2]');await guided.getByLabel('Increasing intervals').fill('[0,3] U [7,9]');await guided.getByLabel('Decreasing intervals').fill('[3,7]');await guided.getByLabel('Constant intervals').fill('none');await guided.getByRole('button',{name:'Submit answer',exact:true}).click();await guided.getByRole('alert').waitFor();
  const after=await client.query(inspect,{learnerId:ids.learnerId});assert.equal(after.submissions.length,before.submissions.length+1);for(const k of Object.keys(before).filter(k=>k!=='submissions'))assert.deepEqual(after[k],before[k]);console.log('Created one pending Guided result through the real browser; no receipt or other effect.');
 }finally{await context.close();await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
