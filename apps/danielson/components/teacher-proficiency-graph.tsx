"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { learnHref } from "../lib/learn/href";
import type { CurrentProficiency, ReportingState } from "../lib/reporting/contracts";
import {
  buildProficiencyGraphModel,
  type ProficiencyGraphNode,
  type ProficiencyScoreBand,
} from "../lib/reporting/proficiency-graph";

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.8;
const VIEWBOX_SIZE = 1_900;

function stateLabel(state: ReportingState) {
  if (state === "below_proficient") return "Below Proficient";
  if (state === "not_enough_evidence") return "Not enough evidence";
  return "Proficient";
}

function formatDue(node: ProficiencyGraphNode) {
  if (!node.due) return "Current";
  return "Due";
}

function nodeRadius(node: ProficiencyGraphNode) {
  if (node.kind === "framework") return 48;
  if (node.kind === "domain") return 36;
  if (node.kind === "component") return 28;
  return 22;
}

function nodeLabel(node: ProficiencyGraphNode) {
  const score =
    node.displayScore === null
      ? ": No score"
      : `: Score ${node.displayScore.toFixed(1)} of 4: ${scoreBandLabel(node.scoreBand)}`;
  const rating =
    node.rawRating === null || node.rawRating === undefined
      ? ""
      : `: Rating ${node.rawRating}: ${node.points} points`;
  return `${node.title}: ${stateLabel(node.state)}${score}${rating}${node.due ? ": Due" : ""}`;
}

function nodeStatusLabel(node: ProficiencyGraphNode) {
  return `${stateLabel(node.state)}${node.due ? " · Due" : ""}`;
}

function scoreBandLabel(band: ProficiencyScoreBand) {
  if (band === "red") return "Red";
  if (band === "yellow") return "Yellow";
  if (band === "green") return "Green";
  if (band === "blue") return "Blue";
  return "No score";
}

function visibleNodeTitle(node: ProficiencyGraphNode) {
  if (node.kind === "component") return `${node.title.split(":", 1)[0]}:`;
  if (node.kind === "domain") return `${node.title.split(":", 1)[0]}:`;
  return node.title;
}

function formatViewValue(value: number) {
  return Number(value.toFixed(2));
}

function screenToViewBoxPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const transform = svg.getScreenCTM?.();
  if (transform) {
    const inverse = transform.inverse();
    return {
      x: inverse.a * clientX + inverse.c * clientY + inverse.e,
      y: inverse.b * clientX + inverse.d * clientY + inverse.f,
    };
  }
  const rect = svg.getBoundingClientRect();
  const size = Math.max(Math.min(rect.width, rect.height), 1);
  const offsetX = rect.left + (rect.width - size) / 2;
  const offsetY = rect.top + (rect.height - size) / 2;
  return {
    x: ((clientX - offsetX) * VIEWBOX_SIZE) / size - VIEWBOX_SIZE / 2,
    y: ((clientY - offsetY) * VIEWBOX_SIZE) / size - VIEWBOX_SIZE / 2,
  };
}

export function TeacherProficiencyGraph({
  currentProficiency,
}: {
  currentProficiency: CurrentProficiency;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [expandedComponentId, setExpandedComponentId] = useState<string | undefined>();
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [status, setStatus] = useState("Use the graph controls or select a node for details.");
  const model = useMemo(
    () => buildProficiencyGraphModel(currentProficiency, { expandedComponentId }),
    [currentProficiency, expandedComponentId],
  );
  const selectedNode = model.nodes.find((node) => node.id === selectedNodeId);

  function selectNode(node: ProficiencyGraphNode) {
    setSelectedNodeId(node.id);
    if (node.kind === "component") {
      const nextExpanded = expandedComponentId === node.id ? undefined : node.id;
      setExpandedComponentId(nextExpanded);
      setStatus(
        nextExpanded
          ? `Danielson component expanded: ${node.title}`
          : `Danielson component collapsed: ${node.title}`,
      );
      return;
    }
    setStatus(`Selected ${node.title}: ${stateLabel(node.state)}.`);
  }

  function handleNodeKeyDown(event: React.KeyboardEvent<SVGGElement>, node: ProficiencyGraphNode) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectNode(node);
  }

  function changeZoom(delta: number) {
    setView((previous) => ({
      ...previous,
      scale: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, previous.scale + delta)),
    }));
    setStatus("Graph zoom changed.");
  }

  function fitGraph() {
    const width = Math.max(model.bounds.width, 1);
    const height = Math.max(model.bounds.height, 1);
    const scale = Math.min(1.25, Math.max(MIN_ZOOM, Math.min(1_500 / width, 1_100 / height)));
    setView({ scale, x: 0, y: 0 });
    setStatus("Graph fitted to the available view.");
  }

  function resetView() {
    setView({ scale: 1, x: 0, y: 0 });
    setStatus("Graph view reset.");
  }

  function startPan(event: React.PointerEvent<SVGGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const point = screenToViewBoxPoint(svg, event.clientX, event.clientY);
    dragRef.current = {
      pointerId: event.pointerId,
      x: point.x,
      y: point.y,
      originX: view.x,
      originY: view.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function movePan(event: React.PointerEvent<SVGGElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const svg = svgRef.current;
    if (!svg) return;
    const point = screenToViewBoxPoint(svg, event.clientX, event.clientY);
    setView((previous) => ({
      ...previous,
      x: drag.originX + (point.x - drag.x),
      y: drag.originY + (point.y - drag.y),
    }));
  }

  function endPan(event: React.PointerEvent<SVGGElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function handleWheel(event: React.WheelEvent<SVGSVGElement>) {
    event.preventDefault();
    const pointer = screenToViewBoxPoint(event.currentTarget, event.clientX, event.clientY);
    const pointerX = pointer.x;
    const pointerY = pointer.y;
    setView((previous) => {
      const nextScale = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, previous.scale + (event.deltaY < 0 ? 0.1 : -0.1)),
      );
      const factor = nextScale / previous.scale;
      return {
        scale: nextScale,
        x: pointerX + (previous.x - pointerX) * factor,
        y: pointerY + (previous.y - pointerY) * factor,
      };
    });
    setStatus("Graph zoom changed around the pointer.");
  }

  async function requestFullScreen() {
    if (!containerRef.current?.requestFullscreen) {
      setStatus("Full screen is not available in this browser.");
      return;
    }
    try {
      await containerRef.current.requestFullscreen();
      setStatus("Graph is in full screen.");
    } catch {
      setStatus("Full screen could not be opened.");
    }
  }

  return (
    <section
      className="teacher-proficiency-graph card"
      aria-labelledby="teacher-proficiency-graph-heading"
    >
      <div className="teacher-proficiency-graph-heading">
        <div>
          <p className="eyebrow">Current proficiency</p>
          <h2 id="teacher-proficiency-graph-heading">Teacher proficiency graph</h2>
          <p className="muted">Select a component to expand its approved skills.</p>
        </div>
        <div className="teacher-proficiency-graph-controls" aria-label="Graph controls">
          <button type="button" onClick={() => changeZoom(0.1)}>
            Zoom in
          </button>
          <button type="button" onClick={() => changeZoom(-0.1)}>
            Zoom out
          </button>
          <button type="button" onClick={fitGraph}>
            Fit graph
          </button>
          <button type="button" onClick={resetView}>
            Reset view
          </button>
          <button type="button" onClick={() => void requestFullScreen()}>
            Full screen
          </button>
        </div>
      </div>
      <div
        className="teacher-proficiency-graph-legend"
        role="region"
        aria-label="Proficiency score colors"
      >
        <span>
          <i className="score-red" aria-hidden="true" />
          Red 1.0–1.9
        </span>
        <span>
          <i className="score-yellow" aria-hidden="true" />
          Yellow 2.0–2.9
        </span>
        <span>
          <i className="score-green" aria-hidden="true" />
          Green 3.0–3.9
        </span>
        <span>
          <i className="score-blue" aria-hidden="true" />
          Blue 4.0
        </span>
        <span>
          <i className="score-neutral" aria-hidden="true" />
          No score
        </span>
      </div>
      <div ref={containerRef} className="teacher-proficiency-graph-canvas">
        <svg
          ref={svgRef}
          role="group"
          aria-labelledby="teacher-proficiency-graph-svg-label"
          viewBox={`${-VIEWBOX_SIZE / 2} ${-VIEWBOX_SIZE / 2} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          onWheel={handleWheel}
        >
          <title id="teacher-proficiency-graph-svg-label">Teacher proficiency graph</title>
          <g
            data-testid="proficiency-graph-viewport"
            transform={`translate(${formatViewValue(view.x)} ${formatViewValue(view.y)}) scale(${formatViewValue(view.scale)})`}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
          >
            {model.edges.map((graphEdge) => {
              const source = model.nodes.find((node) => node.id === graphEdge.sourceId);
              const target = model.nodes.find((node) => node.id === graphEdge.targetId);
              if (!source || !target) return null;
              return (
                <line
                  key={graphEdge.id}
                  className="teacher-proficiency-graph-edge"
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                />
              );
            })}
            {model.nodes.map((node) => (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={nodeLabel(node)}
                className={`teacher-proficiency-graph-node teacher-proficiency-graph-node-${node.kind} state-${node.state} score-${node.scoreBand}${node.due ? " is-due" : ""}${selectedNodeId === node.id ? " is-selected" : ""}`}
                transform={`translate(${node.x} ${node.y})`}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerUp={(event) => {
                  event.stopPropagation();
                  selectNode(node);
                }}
                onKeyDown={(event) => handleNodeKeyDown(event, node)}
              >
                {node.kind === "component" ? <title>{node.title}</title> : null}
                <circle r={nodeRadius(node)} />
                {node.displayScore === null ? null : (
                  <text className="teacher-proficiency-graph-node-score" y="0.35em">
                    {node.displayScore.toFixed(1)}
                  </text>
                )}
                <text className="teacher-proficiency-graph-node-title" y={nodeRadius(node) + 20}>
                  {visibleNodeTitle(node)}
                </text>
                <text className="teacher-proficiency-graph-node-state" y={nodeRadius(node) + 37}>
                  {nodeStatusLabel(node)}
                </text>
                {node.kind === "skill" && node.priorityRank ? (
                  <text
                    className="teacher-proficiency-graph-node-priority"
                    y={nodeRadius(node) + 54}
                  >
                    Priority {node.priorityRank}
                  </text>
                ) : null}
              </g>
            ))}
          </g>
        </svg>
      </div>
      <p className="teacher-proficiency-graph-status" role="status">
        {status}
      </p>
      <p className="teacher-proficiency-graph-overall-status">
        Current state: <strong>{stateLabel(currentProficiency.state)}</strong>
      </p>
      {selectedNode ? (
        <aside
          className="teacher-proficiency-graph-detail"
          aria-label="Selected graph node details"
        >
          <h3>{selectedNode.title}:</h3>
          <p>Status: {stateLabel(selectedNode.state)}</p>
          {selectedNode.displayScore === null ? (
            <p>Score: No rated evidence</p>
          ) : (
            <p>Score: {selectedNode.displayScore.toFixed(1)} of 4</p>
          )}
          {selectedNode.rawRating !== null && selectedNode.rawRating !== undefined ? (
            <>
              <p>Rating: {selectedNode.rawRating}</p>
              <p>Points: {selectedNode.points}</p>
            </>
          ) : null}
          {selectedNode.kind === "skill" ? (
            <div className="teacher-proficiency-graph-detail-list">
              {selectedNode.rawRating === null || selectedNode.rawRating === undefined ? (
                <p>Rating: Not enough evidence</p>
              ) : null}
              <p>Evidence: {formatDue(selectedNode)}</p>
              {selectedNode.dueAt ? <p>Due date: {selectedNode.dueAt}</p> : null}
              {selectedNode.overdueDays && selectedNode.overdueDays > 0 ? (
                <p>Overdue by {selectedNode.overdueDays} days</p>
              ) : null}
              {selectedNode.priorityRank ? <p>Priority: {selectedNode.priorityRank}</p> : null}
              {selectedNode.priorityReason ? (
                <p>Priority reason: {selectedNode.priorityReason.replaceAll("_", " ")}</p>
              ) : null}
              <p>
                <Link href={learnHref(selectedNode.id)}>Learn {selectedNode.title}</Link>
              </p>
            </div>
          ) : null}
          {selectedNode.evidenceHref ? (
            <a href={selectedNode.evidenceHref}>Open evidence record</a>
          ) : null}
        </aside>
      ) : null}
      <p className="muted teacher-proficiency-graph-accessible-note">
        The detailed proficiency list below provides the same skill information without requiring
        graph interaction.
      </p>
    </section>
  );
}
