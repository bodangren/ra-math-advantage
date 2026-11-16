import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const root=resolve(import.meta.dirname,"../.."),graph=resolve(root,"curriculum/skill-graph"),read=(n:string)=>JSON.parse(readFileSync(resolve(graph,n),"utf8"));
const nodes=read("nodes.json").nodes,edges=read("edges.json").edges,blueprints=read("blueprints.json").blueprints,srs=read("projection/srs-input.json").srsInputs,activitySrs=read("projection/practice-v1-activity-map.json").srsInputs;
const slugs=["read-a-joint-frequency-from-a-two-way-frequency-table","read-a-marginal-frequency-from-a-two-way-frequency-table","calculate-a-difference-between-named-frequencies","construct-an-overall-two-way-relative-frequency-table","calculate-an-overall-joint-relative-frequency","calculate-an-overall-marginal-relative-frequency","calculate-a-conditional-relative-frequency-in-a-stated-direction","construct-a-conditional-relative-frequency-table-for-a-stated-conditioning-variable","interpret-a-joint-or-marginal-relative-frequency-in-context","interpret-a-conditional-relative-frequency-in-context","distinguish-reversed-conditional-questions","estimate-joint-and-marginal-counts-from-rounded-relative-frequencies-and-a-grand-total","compare-overall-and-conditional-relative-frequency-scaling","evaluate-association-between-two-categorical-variables-from-a-two-way-table","create-a-related-question-and-consistent-solution-from-an-accepted-two-way-table","compare-overall-and-conditional-two-way-relative-frequency-tables","evaluate-categorical-data-claims-with-conditional-evidence"];
const ids=slugs.map(s=>`math.im1.skill.9.7.${s}`);
describe("Lesson 9-7 capability graph",()=>{
 it("adds exactly 17 draft inactive atoms",()=>{expect(ids.map(id=>nodes.find((n:{id:string})=>n.id===id)?.reviewStatus)).toEqual(Array(17).fill("draft"));expect(nodes.filter((n:{id:string})=>n.id.startsWith("math.im1.skill.9.7.")&&ids.includes(n.id))).toHaveLength(17)});
 it("restores exact source identities",()=>{expect(nodes.find((n:{id:string})=>n.id.endsWith("9.7.023")).title).toBe("Example 1");expect(nodes.find((n:{id:string})=>n.id.endsWith("9.7.024")).title).toBe("Example 2");expect(nodes.find((n:{id:string})=>n.id.endsWith("9.7.025")).title).toBe("Example 3")});
 it("records exact broad reuse and no prerequisite",()=>{const id="math.im1.skill.9.7.construct-and-complete-two-way-frequency-tables-from-verbal";expect(edges.filter((e:{sourceId:string,targetId:string})=>e.sourceId==="math.im1.lesson.9.7"&&e.targetId===id)).toHaveLength(1);expect(edges.filter((e:{metadata?:{lesson?:string},type:string})=>e.metadata?.lesson==="9.7"&&e.type==="prerequisite")).toEqual([]);expect(edges.some((e:{id:string})=>e.id==="math.im1.edge.1277")).toBe(false)});
 it("preserves stage and ambiguity boundaries",()=>{const refs=(i:number)=>nodes.find((n:{id:string})=>n.id===ids[i]).sourceRefs.join(" ");expect(refs(0)).toContain("accepted Problem 1 or Problem 13 table");expect(refs(11)).toContain("no unique exact integer table");expect(refs(14)).toContain("accepted two-way table");expect(refs(6)).toContain("condition and denominator")});
 it("binds exact examples and removes the sequence prerequisite from projections",()=>{
  const byId=(id:string)=>blueprints.find((b:{nodeId:string})=>b.nodeId===id);
  const e1="math.im1.example.9.7.023",e2="math.im1.example.9.7.024",e3="math.im1.example.9.7.025";
  expect(byId("math.im1.skill.9.7.construct-and-complete-two-way-frequency-tables-from-verbal").sourceNodeIds).toEqual([e1]);
  for(const id of ids.slice(0,3)) expect(byId(id).sourceNodeIds).toEqual([e1]);
  for(const id of ids.slice(3,5)) expect(byId(id).sourceNodeIds).toEqual([e2]);
  expect(byId(ids[8]).sourceNodeIds).toEqual([e2]);
  for(const id of [ids[6],ids[7],ids[9],ids[10]]) expect(byId(id).sourceNodeIds).toEqual([e3]);
  expect(edges).toEqual(expect.arrayContaining([expect.objectContaining({sourceId:e3,targetId:"math.im1.lesson.9.7",type:"appears_in_context"}),expect.objectContaining({sourceId:"math.im1.lesson.9.7",targetId:e3,type:"contains"})]));
  const geometry="math.im1.skill.10.1.differentiate-between-synthetic-geometry-and-analytic-geomet";
  for(const rows of [srs,activitySrs]) expect(rows.find((x:{nodeId:string})=>x.nodeId===geometry).prerequisites).not.toContain("math.im1.skill.9.7.construct-and-complete-two-way-frequency-tables-from-verbal");
 });

});
