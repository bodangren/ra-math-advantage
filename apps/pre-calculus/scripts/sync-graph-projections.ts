import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projectActivityMap, projectSrsInputs } from "@math-platform/knowledge-space-practice";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../curriculum/skill-graph",
);
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(root, name + ".json"), "utf8"));
const write = (name: string, value: unknown) =>
  fs.writeFileSync(path.join(root, name + ".json"), JSON.stringify(value, null, 2) + "\n");
const nodes = read("nodes").nodes,
  edges = read("edges").edges,
  blueprints = read("blueprints").blueprints;
const activities = projectActivityMap(nodes, edges, blueprints),
  inputs = projectSrsInputs(nodes, edges, blueprints);
const activityMap = read("projection/practice-v1-activity-map");
write("projection/practice-v1-activity-map", { ...activityMap, activities, srsInputs: inputs });
write("projection/srs-input", { ...read("projection/srs-input"), inputs });
for (const name of ["edges", "standard-edges", "draft-nodes"]) {
  const doc = read(name);
  doc.nodes = nodes;
  if (doc.meta) {
    doc.meta.totalNodes = nodes.length;
    doc.meta.totalEdges = doc.edges.length;
  }
  write(name, doc);
}
console.log(`Wrote ${activities.length} activity projections and ${inputs.length} SRS inputs.`);
