'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchGraphData } from './actions';
import type { GraphData, HarnessState, SkillNode, SubmissionEntry } from './types';
import { NodeList } from './components/NodeList';
import { GeneratorPanel } from './components/GeneratorPanel';
import { RendererPreview } from './components/RendererPreview';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';

export default function BlueprintQAPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [state, setState] = useState<HarnessState>({
    selectedNodeId: null,
    seed: 42,
    difficulty: 0.5,
    mode: 'independent_practice',
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  });

  useEffect(() => {
    fetchGraphData()
      .then(setGraphData)
      .catch((err) => setLoadError(`Failed to load graph data: ${err instanceof Error ? err.message : String(err)}`));
  }, []);

  const nodes = useMemo(() => graphData?.nodes ?? [], [graphData]);
  const blueprintsByNodeId = useMemo(() => {
    const map = new Map<string, KnowledgeBlueprint>();
    if (graphData?.blueprints) {
      for (const bp of graphData.blueprints) {
        map.set(bp.nodeId, bp);
      }
    }
    return map;
  }, [graphData]);

  const selectedNode = useMemo<SkillNode | null>(() => {
    if (!state.selectedNodeId) return null;
    return nodes.find((n) => n.id === state.selectedNodeId) ?? null;
  }, [nodes, state.selectedNodeId]);

  const selectedBlueprint = useMemo<KnowledgeBlueprint | null>(() => {
    if (!state.selectedNodeId) return null;
    return blueprintsByNodeId.get(state.selectedNodeId) ?? null;
  }, [blueprintsByNodeId, state.selectedNodeId]);

  const updateState = useCallback((patch: Partial<HarnessState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleIntercept = useCallback(
    (entry: SubmissionEntry) => {
      setState((prev) => ({ ...prev, lastSubmission: entry }));
    },
    [],
  );

  if (loadError) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h2 className="text-lg font-semibold">Failed to load graph data</h2>
            <pre className="mt-2 text-sm">{loadError}</pre>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 space-y-2 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Blueprint QA Harness</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Space Blueprint Preview</h1>
          <p className="text-sm text-slate-600">
            {nodes.length} nodes loaded &middot; {graphData?.blueprints.length ?? 0} blueprints
          </p>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <NodeList
              nodes={nodes}
              blueprintsByNodeId={blueprintsByNodeId}
              selectedNodeId={state.selectedNodeId}
              onSelectNode={(id) => updateState({ selectedNodeId: id })}
            />
          </div>
          <div className="col-span-5">
            <GeneratorPanel
              state={state}
              selectedNode={selectedNode}
              selectedBlueprint={selectedBlueprint}
              onUpdateState={updateState}
            />
          </div>
          <div className="col-span-4">
            <RendererPreview
              state={state}
              selectedNode={selectedNode}
              selectedBlueprint={selectedBlueprint}
              onIntercept={handleIntercept}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
