import { readFile } from "node:fs/promises";

import { ARCHITECTURE_RULE_IDS } from "./policy-contract.mjs";

function object(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value;
}

function nonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty trimmed string`);
  }
  return value;
}

function parseCorpus(rawCorpus) {
  const corpus = object(rawCorpus, "fixture corpus");
  if (corpus.schemaVersion !== "lms-architecture-fixtures.v1") {
    throw new Error(`Unsupported fixture corpus version: ${String(corpus.schemaVersion)}`);
  }
  if (!Array.isArray(corpus.fixtures) || corpus.fixtures.length === 0) {
    throw new Error("Fixture corpus must contain fixtures");
  }
  const ids = new Set();
  for (const [index, rawFixture] of corpus.fixtures.entries()) {
    const fixture = object(rawFixture, `fixtures[${index}]`);
    const id = nonEmptyString(fixture.id, `fixtures[${index}].id`);
    if (ids.has(id)) throw new Error(`Duplicate fixture ID: ${id}`);
    ids.add(id);
    const ruleId = nonEmptyString(fixture.expectedRuleId, `fixtures[${index}].expectedRuleId`);
    if (!ARCHITECTURE_RULE_IDS.includes(ruleId)) throw new Error(`Unknown rule ID: ${ruleId}`);
    nonEmptyString(fixture.sourceFile, `fixtures[${index}].sourceFile`);
    nonEmptyString(fixture.expectedMessageIncludes, `fixtures[${index}].expectedMessageIncludes`);
    if (ruleId === "package-cycle") {
      if (fixture.input !== null) throw new Error(`Cycle fixture ${id} must have null input`);
      detectPackageCycles(fixture.graph);
    } else {
      object(fixture.input, `fixtures[${index}].input`);
      if (fixture.graph !== null) throw new Error(`Import fixture ${id} must have null graph`);
    }
  }
  return corpus;
}

export async function loadNegativeFixtureCorpus(source) {
  if (source instanceof URL) return parseCorpus(JSON.parse(await readFile(source, "utf8")));
  return parseCorpus(source);
}

function canonicalCycle(cycle) {
  const nodes = cycle.slice(0, -1);
  const rotations = nodes.map((_, index) => [...nodes.slice(index), ...nodes.slice(0, index)]);
  rotations.sort((a, b) => a.join("\0").localeCompare(b.join("\0")));
  return [...rotations[0], rotations[0][0]];
}

export function detectPackageCycles(rawGraph) {
  const graph = object(rawGraph, "package graph");
  const nodes = Object.keys(graph).sort();
  const nodeSet = new Set(nodes);
  for (const node of nodes) {
    if (!Array.isArray(graph[node])) throw new TypeError(`Edges for ${node} must be an array`);
    for (const target of graph[node]) {
      if (!nodeSet.has(target)) throw new Error(`Unknown package ${target} referenced by ${node}`);
    }
  }

  const state = new Map();
  const stack = [];
  const cycles = new Map();
  function visit(node) {
    state.set(node, "visiting");
    stack.push(node);
    for (const target of [...graph[node]].sort()) {
      if (state.get(target) === "visiting") {
        const cycle = canonicalCycle([...stack.slice(stack.indexOf(target)), target]);
        cycles.set(cycle.join(" -> "), cycle);
      } else if (state.get(target) !== "visited") {
        visit(target);
      }
    }
    stack.pop();
    state.set(node, "visited");
  }
  for (const node of nodes) {
    if (state.get(node) === undefined) visit(node);
  }
  return [...cycles.values()].sort((a, b) => a.join("\0").localeCompare(b.join("\0")));
}
