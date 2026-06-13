import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  projectDisplayLevel,
  type KnowledgeState,
  type DisplayLevel,
} from '@math-platform/knowledge-space-core/level-projection';

const CSV_PATH = path.resolve(__dirname, 'gse-to-im3-advantage.csv');

function loadLevels(): DisplayLevel[] {
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
  const [, ...dataLines] = lines;
  return dataLines.map((line) => {
    const [id, title, minStr] = line.split(',');
    return { id: id!, title: title!, minMastery: Number(minStr) };
  });
}

const levels = loadLevels();

export function projectIm3Level(state: KnowledgeState): string {
  return projectDisplayLevel(state, levels);
}
