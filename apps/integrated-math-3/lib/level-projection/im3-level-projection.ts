import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  projectDisplayLevel,
  displayLevelSchema,
} from '@math-platform/knowledge-space-core/level-projection';
import type {
  KnowledgeState,
  DisplayLevelBand,
} from '@math-platform/knowledge-space-core/level-projection';

const CSV_PATH = resolve(__dirname, 'gse-to-im3-advantage.csv');

function loadLevels(): DisplayLevelBand {
  const raw = readFileSync(CSV_PATH, 'utf8');
  const rows = raw.split(/\r?\n/).filter((line) => line.length > 0).slice(1);
  const levels = rows.map((row) => {
    const [id, title, minMasteryStr] = row.split(',');
    if (!id || !title || minMasteryStr === undefined) {
      throw new Error(`Malformed CSV row in ${CSV_PATH}: "${row}"`);
    }
    const minMastery = Number(minMasteryStr);
    if (!Number.isFinite(minMastery)) {
      throw new Error(`Invalid minMastery "${minMasteryStr}" in ${CSV_PATH} row: "${row}"`);
    }
    return { id, title, minMastery };
  });
  return displayLevelSchema.parse(levels);
}

const levels = loadLevels();

export function projectIm3Level(state: KnowledgeState): string {
  return projectDisplayLevel(state, levels);
}
