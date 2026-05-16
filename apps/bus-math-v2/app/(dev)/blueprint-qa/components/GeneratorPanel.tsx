'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SlidersHorizontal, Code2, AlertTriangle } from 'lucide-react';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { HarnessState, SkillNode } from '../types';
import type { KnowledgeBlueprint, GeneratorOutput } from '@math-platform/knowledge-space-practice';

interface GeneratorPanelProps {
  state: HarnessState;
  selectedNode: SkillNode | null;
  selectedBlueprint: KnowledgeBlueprint | null;
  onUpdateState: (patch: Partial<HarnessState>) => void;
}

export function GeneratorPanel({ state, selectedNode, selectedBlueprint, onUpdateState }: GeneratorPanelProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatorKey = selectedBlueprint?.generatorKey ?? selectedNode?.generatorKey ?? null;

  const generate = useCallback(() => {
    if (!generatorKey || !selectedNode) {
      onUpdateState({ generatorOutput: null, generatorError: null });
      return;
    }

    setIsGenerating(true);
    try {
      const generator = getGenerator(generatorKey);
      const output: GeneratorOutput = generator.generate({
        nodeId: selectedNode.id,
        seed: state.seed,
        difficulty: state.difficulty,
      });
      onUpdateState({
        generatorOutput: output as unknown as Record<string, unknown>,
        generatorError: null,
      });
    } catch (err) {
      onUpdateState({
        generatorOutput: null,
        generatorError: err instanceof Error ? (err.stack ?? err.message) : String(err),
      });
    } finally {
      setIsGenerating(false);
    }
  }, [generatorKey, selectedNode, state.seed, state.difficulty, onUpdateState]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generate, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [generate]);

  return (
    <div className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Generator</h2>
        {isGenerating && <span className="text-xs text-slate-400">running...</span>}
      </div>

      {!selectedNode ? (
        <p className="text-xs text-slate-400">Select a skill from the sidebar to generate output.</p>
      ) : !generatorKey ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-700">
            No generator key assigned to this skill.{' '}
            {selectedBlueprint
              ? 'The blueprint exists but lacks a generatorKey field.'
              : 'No blueprint exists for this skill either.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Generator Key</label>
              <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700">
                {generatorKey}
              </code>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Mode</label>
              <select
                value={state.mode}
                onChange={(e) => onUpdateState({ mode: e.target.value as HarnessState['mode'] })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none"
              >
                <option value="worked_example">Worked Example</option>
                <option value="guided_practice">Guided Practice</option>
                <option value="independent_practice">Independent Practice</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Seed: {state.seed}
              </label>
              <input
                type="number"
                value={state.seed}
                onChange={(e) => onUpdateState({ seed: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Difficulty: {state.difficulty.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={state.difficulty}
                onChange={(e) => onUpdateState({ difficulty: parseFloat(e.target.value) })}
                className="w-full accent-slate-700"
              />
            </div>
          </div>
        </>
      )}

      {state.generatorError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="mb-1 text-xs font-semibold text-red-700">Generator Error</p>
          <pre className="max-h-48 overflow-auto rounded bg-red-100/50 p-2 text-xs text-red-800">
            {state.generatorError}
          </pre>
        </div>
      )}

      {state.generatorOutput && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Code2 className="size-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-600">Output</h3>
          </div>
          <pre className="max-h-[32rem] overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(state.generatorOutput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
