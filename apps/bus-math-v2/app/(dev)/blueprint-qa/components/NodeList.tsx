'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { SkillNode } from '../types';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';

interface NodeListProps {
  nodes: SkillNode[];
  blueprintsByNodeId: Map<string, KnowledgeBlueprint>;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

function hasGenerator(node: SkillNode, blueprintsByNodeId: Map<string, KnowledgeBlueprint>): boolean {
  return !!(node.generatorKey || blueprintsByNodeId.get(node.id)?.generatorKey);
}

function getModuleLabel(node: SkillNode): string {
  const mod = node.metadata?.module as string | undefined;
  const lesson = node.metadata?.lesson as string | undefined;
  if (mod && lesson) return `M${mod}.L${lesson}`;
  if (mod) return `M${mod}`;
  return '';
}

export function NodeList({ nodes, blueprintsByNodeId, selectedNodeId, onSelectNode }: NodeListProps) {
  const [search, setSearch] = useState('');

  const skillNodes = useMemo(() => {
    return nodes.filter((n) => n.kind === 'skill');
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    if (!search.trim()) return skillNodes;
    const q = search.toLowerCase();
    return skillNodes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q),
    );
  }, [skillNodes, search]);

  return (
    <div className="sticky top-8 space-y-4 rounded-2xl border bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Skills</h2>
        <span className="text-xs text-slate-400">{skillNodes.length} total</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by title or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
        />
      </div>

      <div className="max-h-[calc(100vh-16rem)] space-y-0.5 overflow-y-auto">
        {filteredNodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const hasGen = hasGenerator(node, blueprintsByNodeId);
          const blueprint = blueprintsByNodeId.get(node.id);
          const moduleLabel = getModuleLabel(node);

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-xs leading-tight transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="mt-0.5 shrink-0">{hasGen ? '\uD83D\uDFE2' : '\uD83D\uDD34'}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{node.title}</div>
                <div className={`mt-0.5 truncate ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                  {moduleLabel && <span>{moduleLabel} &middot; </span>}
                  {hasGen
                    ? <span>{node.generatorKey || blueprint?.generatorKey}</span>
                    : <span>no generator</span>}
                </div>
              </div>
            </button>
          );
        })}
        {filteredNodes.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-slate-400">No skills match &quot;{search}&quot;</p>
        )}
      </div>
    </div>
  );
}
