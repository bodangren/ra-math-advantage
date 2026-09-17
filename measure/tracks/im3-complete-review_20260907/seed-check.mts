import { readdirSync, writeFileSync } from 'node:fs';
import { getPropsSchema } from '../../../apps/integrated-math-3/lib/activities/schemas/index.ts';
import { gradeServerOwnedSubmission } from '../../../apps/integrated-math-3/lib/activities/server-grading.ts';
const seedRoot = new URL('../../../apps/integrated-math-3/convex/seed/', import.meta.url);
const results=[];
for(const file of readdirSync(seedRoot).filter(f=>/^seed_lesson_\d+_\d+\.ts$/.test(f))){
 const writes=[];
 const db={
  query(table){
   let rows=()=>writes.filter(w=>w.table===table).map(w=>({_id:w.id,...w.data}));
   const chain={withIndex(_name,fn){const source=rows;const filters=[];const q={eq(field,value){filters.push([field,value]);return q}};fn?.(q);rows=()=>source().filter(row=>filters.every(([field,value])=>row[field]===value));return chain},filter(){return chain},order(){return chain},unique:async()=>rows()[0]??null,first:async()=>rows()[0]??null,collect:async()=>rows(),take:async n=>rows().slice(0,n)};
   return chain;
  },
  get:async id=>{const row=writes.find(w=>w.id===id);return row?{_id:id,...row.data}:null},
  insert:async(table,data)=>{const id=`mock-${writes.length}`;writes.push({table,data,id});return id},
  patch:async(id,data)=>{const row=writes.find(w=>w.id===id);if(row)Object.assign(row.data,data)},
  delete:async()=>{},
 };

 try {
  const mod=await import(new URL(file,seedRoot).href);
  const entry=Object.values(mod).find(v=>v && typeof v._handler==='function');
  await entry._handler({db,scheduler:{runAfter:async()=>{}},runMutation:async()=>null},{});
  const activities=writes.filter(w=>w.table==='activities');
  results.push({file,activities:activities.length,phases:writes.filter(w=>w.table==='phase_versions').length,invalid:activities.flatMap(a=>{const parsed=getPropsSchema(a.data.componentKey)?.safeParse(a.data.props);return parsed?.success?[]:[{id:a.id,key:a.data.componentKey,issues:parsed?.error.issues.map(i=>({path:i.path,message:i.message}))}]}),withoutServerGrade:activities.filter(a=>{try{const g=gradeServerOwnedSubmission({id:a.id,...a.data},{contractVersion:'practice.v1',activityId:a.id,mode:'independent_practice',status:'graded',parts:[{partId:'q1',rawAnswer:0,isCorrect:true,score:1,maxScore:1}],submittedAt:new Date().toISOString()});return g.score===undefined}catch{return false}}).length,emptySolvers:activities.filter(a=>a.data.componentKey==='step-by-step-solver'&&a.data.props.steps?.length===0).length});
 }catch(error){results.push({file,error:String(error)})}
}
writeFileSync('/tmp/im3-review-seed-check.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({files:results.length,completed:results.filter(r=>!r.error).length,activities:results.reduce((n,r)=>n+(r.activities??0),0),invalid:results.reduce((n,r)=>n+(r.invalid?.length??0),0),withoutServerGrade:results.reduce((n,r)=>n+(r.withoutServerGrade??0),0),emptySolvers:results.reduce((n,r)=>n+(r.emptySolvers??0),0),errors:results.filter(r=>r.error)},null,2));
