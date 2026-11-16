# Danielson Reporting and Proficiency Graph Contract

## Current proficiency projection

`CurrentProficiency` remains the only report proficiency source. It contains
the existing state, domains, components, and skills. It also contains:

```ts
priorityTargets: Array<{
  rank: 1 | 2 | 3;
  skillId: string;
  reason: 'below_proficient' | 'approved_plan_priority' | 'gbf_phase_priority'
    | 'overdue' | 'evidence_gap' | 'due';
}>;
```

The list contains at most three entries. `rankPriorityTargets()` in
`lib/observations/queue.ts` owns the order. The report projection must not add
a second priority rule or a second Convex read.

Each component contains its current state. When formal component evidence
supplies that state, the component also contains the raw rating, mapped points,
and source record ID. Skill evidence remains authoritative when it exists.

## Graph model

The graph is a presentation-only projection of `CurrentProficiency`.

The graph calculates one display score for each rated node. It uses the existing
raw 1–4 ratings. It does not store a new score.

- A skill uses its raw rating.
- A component uses the mean of its rated skills. It uses its formal component
  rating when it has no rated skill.
- A domain uses the mean of its rated components.
- The framework uses the mean of all rated components.
- Missing evidence is excluded from the mean. It is not a zero.
- Each score is rounded to one decimal place for display.

- The collapsed graph contains one Danielson root, four domains, and 22
  components.
- The collapsed graph has 27 nodes and 26 hierarchy edges.
- The root is at `(0, 0)`.
- Domains use equal angles on the first radius.
- Components use stable order on their domain arc.
- One component can expand at a time.
- An expanded component adds only its direct skills and hierarchy edges.
- Every rated node shows its 1–4 display score inside the node.
- Components show their formal rating and points when formal evidence supplies
  their current state. They include an evidence link when the source record
  exists.
- Skills include state, rating, points, due state, due date, overdue days,
  priority rank, priority reason, and an evidence link when available.
- The graph model contains no comments, responses, PIP text, or private data.

The score color uses these ranges:

- 1.0 through 1.9: red;
- 2.0 through 2.9: yellow;
- 3.0 through 3.9: green;
- 4.0: blue;
- no rated evidence: neutral.

State text stays visible. Color is not the only state indicator.

The layout uses pure deterministic arithmetic. It does not use random values,
force simulation, a graph library, browser measurement, or stored coordinates.

## Interaction

The native SVG graph supports node selection, component expansion and collapse,
pointer drag panning, wheel zoom, Zoom in, Zoom out, Fit graph, Reset view, and
native full screen. Zoom has tested minimum and maximum limits. Interaction
state remains in React state. It is not stored in Convex or browser storage.

Selecting a framework, domain, or component shows its title, state, and display
score when present. Selecting a component also shows its formal rating, points,
and evidence link when present. Selecting a skill
shows its rating, points, due state, due date when present, overdue days,
priority rank and reason when present, and its evidence link when present.

## Accessibility

Use native buttons for graph controls. Give each interactive SVG node a useful
accessible name. Support Enter and Space. Show a visible focus ring. Keep
status text outside the SVG. Keep the existing detailed proficiency list below
the graph as the non-visual companion view. The graph must remain readable
without drag, wheel, color, or full screen. Respect reduced motion.
