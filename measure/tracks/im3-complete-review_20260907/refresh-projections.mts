import { readFileSync, writeFileSync } from 'node:fs';
import { projectActivityMap, projectTeacherEvidence, projectSrsInputs } from '@math-platform/knowledge-space-practice';
const root = new URL('../../../apps/integrated-math-3/curriculum/skill-graph/', import.meta.url);
const read = (path: string) => JSON.parse(readFileSync(new URL(path,root),'utf8'));
const write = (path: string,value: unknown) => writeFileSync(new URL(path,root),JSON.stringify(value,null,2)+'\n');
for(let module=0;module<=9;module++) {
 const prefix = module ? `module-${module}/` : '';
 const allNodes = read(`${prefix}nodes.json`).nodes;
 const edgesDoc = read(`${prefix}edges.json`);
 const standards = module ? read(`${prefix}standard-edges.json`) : { nodes: [], edges: [] };
 const ownedNodes = module ? allNodes.filter(n => n.metadata?.module === String(module) || n.kind === 'domain') : allNodes;
 const ids = new Set(ownedNodes.map(n=>n.id));
 const nodes = [...ownedNodes,...standards.nodes.filter(n=>n.kind==='standard'&&!ids.has(n.id))];
 const edges = module ? [...edgesDoc.edges.filter(e=>ids.has(e.sourceId)||ids.has(e.targetId)),...standards.edges.filter(e=>ids.has(e.sourceId))] : edgesDoc.edges;
 const blueprints = read(`${prefix}blueprints.json`).blueprints;
 const previous = read(`${prefix}projection/practice-v1-activity-map.json`);
 const result = { ...previous, activities: projectActivityMap(nodes,edges,blueprints), srsInputs: projectSrsInputs(nodes,edges,blueprints), teacherEvidence: projectTeacherEvidence(nodes,edges) };
 write(`${prefix}projection/practice-v1-activity-map.json`,result);
 if (!module) {
  write('projection/srs-input.json',{srsInputs:result.srsInputs});
  write('projection/teacher-evidence-map.json',result.teacherEvidence);
 }
}
