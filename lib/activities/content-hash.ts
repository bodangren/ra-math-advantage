import { createHash } from "crypto";

export type ComponentKind = "example" | "activity" | "practice";

export interface HashableComponent {
  componentKind: ComponentKind;
  componentKey?: string;
  props?: Record<string, unknown>;
  gradingConfig?: Record<string, unknown>;
}

export function computeComponentContentHash(component: HashableComponent): string {
  const hashable = {
    componentKind: component.componentKind,
    componentKey: component.componentKey,
    props: component.props,
    gradingConfig: component.gradingConfig,
  };

  const sorted = deepSortKeys(hashable);
  const json = JSON.stringify(sorted);
  return createHash("sha256").update(json).digest("hex");
}

function deepSortKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSortKeys);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    result[key] = deepSortKeys((obj as Record<string, unknown>)[key]);
  }
  return result;
}
