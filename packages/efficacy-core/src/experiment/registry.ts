import type { AssignVariant } from "./assign";

export type ExperimentStatus = "draft" | "active" | "archived";

export interface ExperimentEntry {
  id: string;
  name: string;
  status: ExperimentStatus;
  variants: AssignVariant[];
  createdAtMs: number;
}

const MAX_VARIANTS = 8;
const MAX_WEIGHT = 1_000_000;

function validateEntry(entry: ExperimentEntry): void {
  if (!entry.id || !entry.name) throw new Error("Experiment id and name are required");
  if (entry.variants.length === 0 || entry.variants.length > MAX_VARIANTS) {
    throw new Error(`Experiment variants exceed the limit of ${MAX_VARIANTS}`);
  }
  const variantIds = new Set<string>();
  for (const variant of entry.variants) {
    if (!variant.id || variantIds.has(variant.id))
      throw new Error("Variant ids must be unique and non-empty");
    if (!Number.isFinite(variant.weight) || variant.weight <= 0) {
      throw new Error("Variant weight must be a positive non-zero number");
    }
    if (variant.weight > MAX_WEIGHT) throw new Error(`Variant weight exceeds cap ${MAX_WEIGHT}`);
    variantIds.add(variant.id);
  }
}

export function createExperimentRegistry() {
  const entries = new Map<string, ExperimentEntry>();
  return {
    add(entry: ExperimentEntry): void {
      if (entries.has(entry.id)) throw new Error(`Experiment ${entry.id} already exists`);
      validateEntry(entry);
      entries.set(entry.id, structuredClone(entry));
    },
    get(id: string): ExperimentEntry | undefined {
      const entry = entries.get(id);
      return entry === undefined ? undefined : structuredClone(entry);
    },
    list(): ReadonlyMap<string, ExperimentEntry> {
      return new Map([...entries].map(([id, entry]) => [id, structuredClone(entry)]));
    },
    listActive(): readonly ExperimentEntry[] {
      return [...entries.values()]
        .filter(({ status }) => status === "active")
        .map((entry) => structuredClone(entry));
    },
    archive(id: string): void {
      const entry = entries.get(id);
      if (entry === undefined) throw new Error(`Unknown experiment ${id} not found`);
      entries.set(id, { ...entry, status: "archived" });
    },
  };
}
