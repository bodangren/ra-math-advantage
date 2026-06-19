/**
 * Interaction mode for a primitive.
 */
export type PrimitiveMode = 'static' | 'interactive' | 'readonly';

/**
 * Base props every math primitive accepts. Primitives are CONTROLLED:
 * they render `value` and report edits via `onChange`. They emit no
 * practice.v1 envelope and hold no submission state.
 */
export interface MathPrimitiveProps<TValue> {
  /** Current controlled value. */
  value: TValue;
  /** Called when the user edits the value. No-op/absent in non-interactive modes. */
  onChange?: (next: TValue) => void;
  /** 'interactive' = editable (default); 'readonly'/'static' = display only. */
  mode?: PrimitiveMode;
  /** Hard-disable all interaction regardless of mode. */
  disabled?: boolean;
}
