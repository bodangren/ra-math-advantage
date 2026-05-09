# Specification: Skill Graph Program — Knowledge Space Blueprint and Generator Contract

## Overview

Define how a knowledge-space node becomes a worked example, guided practice activity, and independent algorithmic practice activity. This track creates reusable blueprint and generator contracts that make “infinite replay” possible without hand-building one React component per skill, and without distributing proprietary domain maps.

## Functional Requirements

1. Add blueprint contracts under `packages/knowledge-space-practice/src/blueprints/`.
2. Define `KnowledgeBlueprint` with:
   - `nodeId`
   - `sourceNodeIds`
   - `alignmentNodeIds`
   - `rendererKey`
   - `rendererModeMap`
   - `workedExampleSpec`
   - `guidedPracticeSpec`
   - `independentPracticeSpec`
   - `generatorKey`
   - `gradingSpec`
   - `misconceptionTags`
   - `reviewStatus`
   - `metadata`
3. Define `WorkedExampleSpec`:
   - prompt
   - givens
   - target
   - steps
   - explanation
   - visual artifacts if needed
4. Define `GuidedPracticeSpec`:
   - scaffolded prompt
   - step prompts
   - hints
   - checks per step
   - reveal policy
5. Define `IndependentPracticeSpec`:
   - variant parameters
   - generator input constraints
   - answer schema
   - grading rules
   - replay policy
6. Define deterministic generator contract:
   - input: `nodeId`, `seed`, `difficulty`, optional `learnerContext`
   - output: prompt, data, expected answer, solution steps, grading metadata
   - same input must produce same output
7. Define generator readiness validation:
   - every independent-practice-ready node has a generator.
   - generator output validates against a renderer/component props schema supplied by an adapter.
   - grading metadata can build generic evidence parts and, through an adapter, `practice.v1` parts.
8. Include examples for at least:
   - synthetic algebraic step-by-step node
   - synthetic graphing node
   - synthetic English/GSE-style reading or language-function node

## Non-Functional Requirements

- Domain-neutral contract in shared package.
- No app imports.
- No dependency changes.
- Pure deterministic generator interface.
- Explicit support for future review/approval workflows.
- No proprietary math maps, Pearson/GSE descriptors, standards catalogs, or curriculum files in the reusable package.

## Acceptance Criteria

- [ ] Blueprint schemas and TypeScript types exist.
- [ ] Generator interface and validation helpers exist.
- [ ] Fixtures cover worked, guided, and independent modes.
- [ ] Tests prove deterministic generator behavior.
- [ ] Tests prove blueprint outputs can map to generic evidence parts and, through an adapter, `practice.v1` submission parts.
- [ ] Documentation explains how to create a new blueprint.
- [ ] Documentation states domain packages own actual maps, descriptors, generators, and renderer bindings.

## Out of Scope

- Full course blueprint generation.
- React UI changes.
- Teacher UI changes.
- Live database changes.
