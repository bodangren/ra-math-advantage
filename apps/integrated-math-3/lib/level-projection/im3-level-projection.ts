import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  projectDisplayLevel,
} from '@math-platform/knowledge-space-core/level-projection';
import type {
  KnowledgeState,
  DisplayLevel,
} from '@math-platform/knowledge-space-core/level-projection';

const CSV_PATH = resolve(__dirname, 'gse-to-im3-advantage.csv');

function loadLevels(): DisplayLevel[] {
  const raw = readFileSync(CSV_PATH, 'utf8');
  const rows = raw.split(/\r?\n/).filter((line) => line.length > 0).slice(1);
  return rows.map((row) => {
    const [id, title, minMasteryStr] = row.split(',');
    return {
      id: id!,
      title: title!,
      minMastery: Number(minMasteryStr),
    };
  });
}

const levels = loadLevels();

export function projectIm3Level(state: KnowledgeState): string {
  return projectDisplayLevel(state, levels);
}
