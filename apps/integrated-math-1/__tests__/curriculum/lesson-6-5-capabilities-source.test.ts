import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import canonical from '../../curriculum/skill-graph/nodes.json';
import draft from '../../curriculum/skill-graph/draft-nodes.json';
import graph from '../../curriculum/skill-graph/edges.json';
import standards from '../../curriculum/skill-graph/standard-edges.json';
import catalog from '../../curriculum/skill-graph/blueprints.json';
import gaps from '../../curriculum/skill-graph/generator-gap-queue.json';
import activityMap from '../../curriculum/skill-graph/projection/practice-v1-activity-map.json';
import srs from '../../curriculum/skill-graph/projection/srs-input.json';
import teacher from '../../curriculum/skill-graph/projection/teacher-evidence-map.json';
const source = readFileSync(resolve(import.meta.dirname, '../../curriculum/modules/module-6-lesson-5'), 'utf8');
const legacy = ['math.im1.skill.6.5.graph-linear-inequalities-in-two-variables-written-in-slope','math.im1.skill.6.5.write-systems-of-inequalities-that-correspond-to-a-given-gra'];
const ex = [
 ['math.im1.example.6.5.022','Example 1: Graph Inequalities in Slope-Intercept and Standard Form',1,'6-5, Examples 1 and 2 — Graph inequalities in slope-intercept and standard form'],
 ['math.im1.example.6.5.023','Example 2: Graph Inequalities in Slope-Intercept and Standard Form',2,'6-5, Examples 1 and 2 — Graph inequalities in slope-intercept and standard form'],
 ['math.im1.example.6.5.024','Example 3: Write and Graph Inequalities from Context',3,'6-5, Example 3 — Write and graph inequalities from context'],
 ['math.im1.example.6.5.025','Example 3: Duplicate source identity',3,'6-5, Example 3 — Duplicate of math.im1.example.6.5.024'],
 ['math.im1.example.6.5.026','Example 4: Graph Special-Case Inequalities',4,'6-5, Example 4 — Graph special-case inequalities'],
] as const;
const defs = [
 ['graph-linear-inequalities-in-slope-intercept-form','Graph linear inequalities in slope-intercept form',['math.im1.example.6.5.022','math.im1.example.6.5.023']],
 ['rewrite-and-graph-linear-inequalities-from-standard-form-wit','Rewrite and graph linear inequalities from standard form with a positive y coefficient',['math.im1.example.6.5.022','math.im1.example.6.5.023']],
 ['use-boundary-inclusion-and-a-valid-test-point-to-select-a-so','Use boundary inclusion and a valid test point to select a solution half-plane',['math.im1.example.6.5.022','math.im1.example.6.5.023','math.im1.example.6.5.026']],
 ['graph-one-variable-inequalities-as-horizontal-or-vertical-ha','Graph one-variable inequalities as horizontal or vertical half-planes',['math.im1.example.6.5.026']],
 ['model-a-contextual-constraint-with-one-two-variable-linear-i','Model a contextual constraint with one two-variable linear inequality and state the source-supported variable domain',['math.im1.example.6.5.024']],
 ['check-whether-an-ordered-pair-satisfies-a-two-variable-inequ','Check whether an ordered pair satisfies a two-variable inequality',['math.im1.example.6.5.024']],
 ['find-and-interpret-feasible-integer-solutions-to-one-context','Find and interpret feasible integer solutions to one contextual linear inequality',[]],
 ['optimize-a-discrete-integer-quantity-under-one-contextual-li','Optimize a discrete integer quantity under one contextual linear inequality',[]],
 ['analyze-a-continuous-bound-and-whether-an-endpoint-is-attain','Analyze a continuous bound and whether an endpoint is attained',[]],
 ['construct-a-two-variable-linear-inequality-from-required-sol','Construct a two-variable linear inequality from required solution and nonsolution points',[]],
 ['analyze-and-explain-errors-in-a-graph-of-a-two-variable-ineq','Analyze and explain errors in a graph of a two-variable inequality',[]],
].map(([slug,title,refs])=>[`math.im1.skill.6.5.${slug}`,title,refs] as const);
const reused = new Map([
 ['math.im1.skill.4.3.rewrite-standard-form-equations-in-slope-intercept-form',['math.im1.example.6.5.022','math.im1.example.6.5.023']],
 ['math.im1.skill.4.3.graph-linear-functions-from-slope-intercept-or-standard-form',['math.im1.example.6.5.022','math.im1.example.6.5.023','math.im1.example.6.5.026']],
 ['math.im1.skill.6.1.interpret-inequality-solutions-in-context',[]],
]);
describe('Lesson 6-5 source capabilities',()=>{
 it('restores source math and qualification limits',()=>{ for(const text of ['`(2, 51000)`, `(8, 69200)`, `(5, 50000)`, and `(10, 61000)`','Problem 15 is `2y + 6 >= 0`','Part c asks for three different purchase combinations','from 33 through 41 meets','jogs for 2 hours at `x` miles per hour','zero jogging speed is an explicit modeling assumption','`(-1,2)`, `(0,1)`, and `(3,-2)`','Reiko is correct','`y <= -x + 1`','Problems 29 and 31']) expect(source).toContain(text); expect(source).not.toContain('could not be described'); });
 it('preserves source IDs and rejects the duplicate',()=>{ for(const doc of [canonical,draft,graph,standards]) for(const [id,title,num,rawText] of ex){ const row=doc.nodes.find(n=>n.id===id); expect(row).toMatchObject({title,metadata:{exampleNumber:num,rawText}}); if(id.endsWith('.025')) expect(row).toMatchObject({reviewStatus:'rejected',independentPracticeReady:false}); else expect(row).toMatchObject({reviewStatus:'draft'}); }});
 it('adds eleven draft inactive source-only capabilities',()=>{ for(const [id,title,sourceNodeIds] of defs){ const copies=[canonical,draft,graph,standards].map(doc=>doc.nodes.find(n=>n.id===id)); expect(copies.every(n=>n?.title===title&&n.reviewStatus==='draft'&&n.independentPracticeReady===false)).toBe(true); expect(copies.slice(1)).toEqual([copies[0],copies[0],copies[0]]); expect(catalog.blueprints.find(b=>b.nodeId===id)).toEqual({nodeId:id,sourceNodeIds,alignmentNodeIds:[],reviewStatus:'draft',metadata:{course:'im1',module:'6',lesson:'5'}}); expect(graph.edges.filter(e=>e.sourceId===id||e.targetId===id)).toEqual([expect.objectContaining({type:'contains',sourceId:'math.im1.lesson.6.5',targetId:id,reviewStatus:'draft'})]); }});
 it('keeps legacy planning rows and removes placeholder activities',()=>{ for(const id of legacy){ expect(draft.nodes.find(n=>n.id===id)).toMatchObject({reviewStatus:'draft',independentPracticeReady:false}); const bp=catalog.blueprints.find(b=>b.nodeId===id); expect(bp).toEqual(expect.objectContaining({sourceNodeIds:[],reviewStatus:'draft'})); expect(bp).not.toHaveProperty('rendererKey'); expect(activityMap.activities.filter(a=>a.nodeId===id)).toHaveLength(0); expect(srs.srsInputs.filter(x=>x.nodeId===id)).toHaveLength(1); } expect(srs.srsInputs.find(x=>x.nodeId===legacy[0])?.prerequisites).toEqual([]); expect(activityMap.srsInputs.filter(x=>defs.some(([id])=>id===x.nodeId))).toHaveLength(11); });
 it('adds exact reuse containment and removes sequence prerequisites',()=>{ for(const [id,refs] of reused){ expect(catalog.blueprints.find(b=>b.nodeId===id)?.sourceNodeIds).toEqual(expect.arrayContaining(refs)); expect(graph.edges).toContainEqual(expect.objectContaining({type:'contains',sourceId:'math.im1.lesson.6.5',targetId:id,reviewStatus:'draft'})); } expect(graph.edges.some(e=>e.id==='math.im1.edge.1258'||e.id==='math.im1.edge.1259')).toBe(false); const target='math.im1.skill.7.1.graph-systems-of-linear-equations-and-determine-the-number-o'; expect(srs.srsInputs.find(x=>x.nodeId===target)?.prerequisites).toEqual([]); expect(activityMap.srsInputs.find(x=>x.nodeId===target)?.prerequisites).toEqual([]); });
 it('excludes rejected and legacy identities from activities',()=>{ const value=JSON.stringify(activityMap.activities); expect(value).not.toContain('math.im1.example.6.5.025'); expect((teacher.attemptArtifacts as readonly { nodeId: string }[]).some(row => row.nodeId === 'math.im1.example.6.5.025')).toBe(false); for(const id of legacy) expect(value).not.toContain(id); });
 it('appends gaps and keeps totals exact',()=>{ expect(defs.every(([id])=>gaps.queue.some(row=>row.nodeId===id))).toBe(true); expect(gaps.queue.find(row=>row.nodeId===legacy[0])?.gap.toLowerCase()).toContain('aggregate'); expect(gaps.queue.find(row=>row.nodeId===legacy[1])?.gap.toLowerCase()).toContain('not support'); expect(gaps.meta.totalSkills).toBe(gaps.queue.length); expect(graph.meta.totalNodes).toBe(graph.nodes.length); expect(graph.meta.totalEdges).toBe(graph.edges.length); });
});
