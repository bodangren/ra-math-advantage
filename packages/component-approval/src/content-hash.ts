/**
 * Computes SHA-256 hash of a component's content for change detection.
 * @param message - String message to hash
 * @returns Hex-encoded SHA-256 hash string
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export type ComponentKind = "example" | "activity" | "practice";

export interface HashableComponent {
  componentKind: ComponentKind;
  componentKey?: string;
  props?: Record<string, unknown>;
  gradingConfig?: Record<string, unknown>;
}

/**
 * Computes a SHA-256 content hash for a component to detect changes.
 * @param component - Component with kind, key, props, and grading config
 * @returns Hex-encoded SHA-256 hash string
 */
export async function computeComponentContentHash(component: HashableComponent): Promise<string> {
  const hashable = {
    componentKind: component.componentKind,
    componentKey: component.componentKey,
    props: component.props,
    gradingConfig: component.gradingConfig,
  };

  const sorted = deepSortKeys(hashable);
  const json = JSON.stringify(sorted);
  return sha256(json);
}

/**
 * Recursively sorts object keys for stable JSON serialization.
 * @param obj - Value to recursively sort
 * @returns Object with all keys sorted alphabetically
 */
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
