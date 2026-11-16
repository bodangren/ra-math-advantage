import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const app=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const text=readFileSync(resolve(app,'curriculum/modules/module-8-lesson-4'),'utf8');
const problem=(n:number)=>text.split(`### Problem ${n}\n`)[1]?.split(/\n### Problem |\n## /)[0]??'';
describe('Lesson 8-4 source restoration',()=>{
 it('restores all 16 numbered problems',()=>expect([...text.matchAll(/^### Problem (\d+)$/gm)].map(m=>+m[1])).toEqual(Array.from({length:16},(_,i)=>i+1)));
 it('restores exact table data',()=>{for(const v of ['8,000','8,480','8,989','9,528','10,100','9,500','9,975','10,474','10,997','11,547'])expect(problem(6)).toContain(v);for(const v of ['114','111','108','105','120','115','110','106'])expect(problem(12)).toContain(v)});
 it('preserves rate wording and subparts',()=>{for(const [n,vals] of [[1,['2.1%','quarterly compounded interest rate of 0.8%','a.','b.','c.']],[2,['3.2% per year','0.33% per month','a.','b.','c.']],[9,['2.3% interest compounded semi-annually','4.2% interest compounded annually']],[10,['1.13% interest compounded quarterly']],[11,['0.5% interest compounded monthly']],[16,['0.13% monthly interest rate','1% annual interest rate','Why is Marsha incorrect?']]] as const)for(const v of vals)expect(problem(n)).toContain(v)});
 it('labels added interpretation and model notes',()=>{expect(text).toContain('**Added interpretation note:**');expect(text.match(/\*\*Added model note:\*\*/g)).toHaveLength(2);expect(text).not.toContain('The source uses each stated percent');expect(text).not.toContain('The table values are rounded')});
 it('preserves the cooling equation and requested action',()=>{for(const v of ['T(t) = 72 + (212 - 72)(2.72)^(-0.4t)','coefficient of `t` in the exponent is 1'])expect(problem(13)).toContain(v);expect(problem(13)).not.toContain('0.670150')});
 it('keeps answers out of learner prompts',()=>{for(const v of ['3.238605','4.6529','1.571202','Answer:'])expect(text).not.toContain(v)});
 it('keeps both original table images',()=>{for(const n of [1,2])expect(readFileSync(resolve(app,`public/curriculum/module-8-lesson-4/source-image-${n}.png`)).length).toBeGreaterThan(1000)});
});
