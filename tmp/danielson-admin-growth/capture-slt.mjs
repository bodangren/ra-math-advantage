import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
const env=parseEnv(readFileSync('apps/danielson/.env.local','utf8'));
const out='outputs/danielson-slt_20260907/build/screens';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
async function login(username){const p=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});await p.goto('http://localhost:3014/auth/login');await p.waitForLoadState('networkidle');await p.getByLabel('Username').fill(username);await p.getByLabel('Password',{exact:true}).fill(env.DANIELSON_DEMO_PASSWORD);await p.getByRole('button',{name:'Sign in'}).click();await p.waitForURL('http://localhost:3014/');return p;}
async function go(p,path){await p.goto('http://localhost:3014'+path);await p.waitForLoadState('networkidle');}
async function snap(p,name,loc=p.locator('main')){await loc.screenshot({path:out+'/'+name+'.png'});}
const p=await login('demo.head');
await go(p,'/reports');await snap(p,'portfolio');
await p.getByRole('link',{name:'Noah Williams',exact:true}).click();await p.waitForURL('**/reports/teachers/*');await p.waitForLoadState('networkidle');await snap(p,'report');await snap(p,'graph',p.locator('section').filter({has:p.getByRole('heading',{name:'Teacher proficiency graph'})}).first());
writeFileSync(out+'/report.txt',await p.locator('main').innerText());
await p.getByRole('link',{name:'Open coaching cycles'}).click();await p.waitForURL('**/coaching/*');await p.waitForLoadState('networkidle');
await p.setViewportSize({width:900,height:1100});await p.getByText('Start a coaching cycle',{exact:true}).click();
await p.getByLabel('Agreed teaching action').fill('Pause after each question. Ask students to explain their reasoning.');
await p.getByLabel('School support and rehearsal').fill('Rehearse questions with the coach before the next lesson.');
await p.getByLabel('Follow-up date').fill('2026-09-18');
const options=await p.getByLabel('Baseline observation').locator('option').evaluateAll(ns=>ns.map(n=>({value:n.value,text:n.textContent})));
if(options[1])await p.getByLabel('Baseline observation').selectOption(options[1].value);
await p.getByText('Start a coaching cycle',{exact:true}).focus();await snap(p,'coaching-form',p.locator('details').first());
const evidence=await p.locator('section').filter({has:p.getByRole('heading',{name:'Published evidence available for selection'})}).getByRole('link').first().getAttribute('href');
await go(p,evidence);await snap(p,'observation');await p.getByLabel('Public comment',{exact:true}).fill('Students explained their answers. Next, ask a second student to compare the reasoning. Rehearse the questions with your coach.');await p.getByRole('heading',{name:'Feedback and teacher response'}).click();await snap(p,'feedback',p.locator('section').filter({has:p.getByRole('heading',{name:'Feedback and teacher response'})}));
await go(p,'/calibration');await p.getByLabel('Observer A rating').selectOption('2');await p.getByLabel('Observer B rating').selectOption('3');await p.getByRole('button',{name:'Compare ratings'}).click();await snap(p,'calibration',p.locator('section').first());
await go(p,'/learn/cold-call');await snap(p,'learn');
await go(p,'/observations');writeFileSync(out+'/queue.txt',await p.locator('main').innerText());await snap(p,'queue');
const draftLinks=await p.locator('a[href*="/observations/drafts/"]').evaluateAll(ns=>ns.map(n=>({href:n.getAttribute('href'),text:n.textContent})));
writeFileSync(out+'/drafts.json',JSON.stringify(draftLinks));
if(draftLinks[0]){await go(p,draftLinks.find(x=>x.text.includes('walkthrough'))?.href??draftLinks[0].href);await p.getByText('FFT 2022 component summary',{exact:true}).first().click();await snap(p,'rating',p.locator('fieldset').first());await p.setViewportSize({width:430,height:932});await snap(p,'rating-mobile',p.locator('fieldset').first());}
const a=await login('demo.sysadmin');await go(a,'/admin/accounts');await a.getByLabel('Name or username').fill('Noah');await a.getByRole('button',{name:'Find accounts'}).click();await a.waitForLoadState('networkidle');await a.getByRole('link',{name:'Manage Noah Williams'}).click();await a.waitForURL('**/admin/accounts/*');await a.waitForLoadState('networkidle');await a.setViewportSize({width:900,height:1000});await snap(a,'account');await snap(a,'assignments',a.locator('section').filter({has:a.getByRole('heading',{name:'Current assignments'})}));writeFileSync(out+'/account.txt',await a.locator('main').innerText());
await browser.close();console.log('Captured current demo screens. Form changes remained unsaved.');
