/**
 * Phase 3 — Composer UI & Preview
 *
 * Pure, app-local composer state model. Phase 3 owns the in-memory state
 * for the teacher lesson composer: phases, sections, activities, and the
 * structured validation errors that come back from `validateActivityConfig`.
 *
 * Boundary rules this module preserves:
 *
 *  - Reuses Phase 1 `normalizeLessonDraft` for initial canonicalization so
 *    IDs and order match what Phase 2 persistence expects.
 *  - Reuses Phase 1 `validateActivityConfig` for prop validation. The
 *    composer NEVER invents a parallel validator or strips invalid fields
 *    silently.
 *  - Reuses Phase 1 `sanitizeAuthoringText`/`sanitizeLessonDraft` for
 *    string sanitization. The composer sanitizes string props before
 *    storing so Phase 2 (hash + approval queue) sees the canonical
 *    sanitized source of truth.
 *  - Field derivation for activity forms is driven by `getPropsSchema`
 *    and `SCHEMA_REGISTRY`. Unknown / placeholder keys
 *    (`equation-solver`, `drag-drop-categorization`) fail closed.
 *  - Reducer never mutates arrays in place; every action returns a new
 *    state object that Phase 3 React components can diff cheaply.
 */

import {
  normalizeLessonDraft,
  type AuthoringActivity,
  type AuthoringLesson,
  type AuthoringPhase,
  type AuthoringPhaseType,
  type AuthoringSection,
} from "./authoring-model";
import {
  validateActivityConfig,
} from "./activity-config-validation";
import {
  sanitizeAuthoringText,
  sanitizeLessonDraft,
} from "./sanitize-authored-text";
import { SCHEMA_REGISTRY, getPropsSchema } from "../../activities/schemas";

/* ------------------------------------------------------------------------ */
/*  Shape — composer-facing view of the lesson model                         */
/* ------------------------------------------------------------------------ */

export interface ComposerActivity {
  id: string;
  componentKey: string;
  props: Record<string, unknown>;
}

export interface ComposerSection {
  id: string;
  title: string;
  markdown?: string;
  callout?: string;
  activities: ComposerActivity[];
}

export interface ComposerPhase {
  id: string;
  title: string;
  phaseType?: AuthoringPhaseType;
  sections: ComposerSection[];
}

export interface ComposerLesson {
  title: string;
  phases: ComposerPhase[];
}

export interface ComposerError {
  /** The activity componentKey the error is bound to. Undefined for
   *  structural errors that fire outside a specific activity config. */
  componentKey?: string;
  /** Path of the failing field, e.g. `['questions', '0', 'prompt']`. */
  path: string[];
  message: string;
}

export interface ComposerState {
  lesson: ComposerLesson;
  errors: ComposerError[];
  dirty: boolean;
}

/* ------------------------------------------------------------------------ */
/*  Form field derivation — schema-driven                                   */
/* ------------------------------------------------------------------------ */

export type FormFieldKind =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "tuple"
  | "object"
  | "union";

export interface FormField {
  name: string;
  kind: FormFieldKind;
  required: boolean;
  options?: string[];
  itemFields?: FormField[];
  variantFields?: FormField[];
}

const KNOWN_KEYS = new Set(Object.keys(SCHEMA_REGISTRY));

function unwrapOptional(schema: unknown): { inner: unknown; isOptional: boolean } {
  if (!schema || typeof schema !== "object") return { inner: schema, isOptional: false };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anySchema = schema as any;
  if (anySchema.def?.type === "optional") {
    return { inner: anySchema.def.innerType, isOptional: true };
  }
  return { inner: schema, isOptional: false };
}

function enumOptions(schema: { options?: string[]; entries?: Record<string, string> }): string[] {
  if (Array.isArray(schema.options)) return schema.options;
  if (schema.entries && typeof schema.entries === "object") {
    return Object.values(schema.entries);
  }
  return [];
}

function deriveField(name: string, rawSchema: unknown, requiredHint: boolean): FormField {
  const { inner, isOptional } = unwrapOptional(rawSchema);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = (inner as any)?.def;
  const required = requiredHint && !isOptional;

  if (!def) {
    return { name, kind: "string", required };
  }

  switch (def.type) {
    case "string":
      return { name, kind: "string", required };
    case "number":
      return { name, kind: "number", required };
    case "boolean":
      return { name, kind: "boolean", required };
    case "enum": {
      const options = enumOptions(def);
      return { name, kind: "enum", required, options };
    }
    case "tuple":
      return { name, kind: "tuple", required };
    case "array": {
      const element = def.element as { shape?: Record<string, unknown> } | undefined;
      let itemFields: FormField[] | undefined;
      if (element?.shape) {
        itemFields = Object.entries(element.shape).map(([childName, childSchema]) =>
          deriveField(childName, childSchema, true),
        );
      }
      return { name, kind: "array", required, itemFields };
    }
    case "object":
      return { name, kind: "object", required };
    case "union": {
      const options = Array.isArray(def.options) ? def.options : [];
      const variantFields = options.map((variant: { shape?: Record<string, unknown> }, idx: number) => {
        if (variant.shape) {
          return Object.entries(variant.shape).map(([childName, childSchema]) =>
            deriveField(childName, childSchema, true),
          );
        }
        return deriveField(`variant_${idx}`, variant, true);
      }).flat();
      return { name, kind: "union", required, variantFields };
    }
    default:
      return { name, kind: "object", required };
  }
}

/**
 * Derive the list of form fields for a given activity component key. The
 * shape comes from the registered Zod schema in `SCHEMA_REGISTRY` — this
 * helper does NOT hard-code or mock that registry.
 *
 * @throws when the key is not in `SCHEMA_REGISTRY`, including placeholder
 *         runtime keys (`equation-solver`, `drag-drop-categorization`).
 */
export function deriveActivityFormFields(componentKey: string): FormField[] {
  if (typeof componentKey !== "string" || componentKey.length === 0) {
    throw new Error(
      `Cannot derive form fields for empty activity key. Use a canonical key from SCHEMA_REGISTRY.`,
    );
  }
  if (!KNOWN_KEYS.has(componentKey)) {
    throw new Error(
      `No schema is registered for activity key '${componentKey}'. Use a canonical activity key.`,
    );
  }
  const schema = getPropsSchema(componentKey);
  if (!schema) {
    throw new Error(
      `No schema is registered for activity key '${componentKey}'. Use a canonical activity key.`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shape = (schema as any).shape as Record<string, unknown> | undefined;
  if (!shape) {
    throw new Error(
      `Schema for activity key '${componentKey}' is not an object schema and cannot be used to derive fields.`,
    );
  }
  return Object.entries(shape).map(([name, fieldSchema]) =>
    deriveField(name, fieldSchema, true),
  );
}

/* ------------------------------------------------------------------------ */
/*  State initialization                                                    */
/* ------------------------------------------------------------------------ */

function mapActivity(activity: AuthoringActivity): ComposerActivity {
  return {
    id: activity.id,
    componentKey: activity.componentKey,
    props: { ...activity.props },
  };
}

function mapSection(section: AuthoringSection): ComposerSection {
  const out: ComposerSection = {
    id: section.id,
    title: section.title,
    activities: section.activities.map(mapActivity),
  };
  if (typeof section.markdown === "string") out.markdown = section.markdown;
  if (typeof section.callout === "string") out.callout = section.callout;
  return out;
}

function mapPhase(phase: AuthoringPhase): ComposerPhase {
  const out: ComposerPhase = {
    id: phase.id,
    title: phase.title,
    sections: phase.sections.map(mapSection),
  };
  if (phase.phaseType) out.phaseType = phase.phaseType;
  return out;
}

function mapLesson(lesson: AuthoringLesson): ComposerLesson {
  return {
    title: lesson.title,
    phases: lesson.phases.map(mapPhase),
  };
}

/**
 * Create a composer state from a raw teacher draft. The draft is run
 * through `normalizeLessonDraft` so the resulting state matches the shape
 * Phase 2 persistence expects. If the initial draft is invalid, errors
 * are surfaced and the lesson tree is empty; subsequent reducer actions
 * can still mutate the empty tree.
 */
export function createComposerState(input: unknown): ComposerState {
  const normalized = normalizeLessonDraft(input);
  if (!normalized.success) {
    const title =
      typeof input === "object" &&
      input !== null &&
      "title" in input &&
      typeof (input as { title?: unknown }).title === "string"
        ? ((input as { title: string }).title ?? "")
        : "";
    return {
      lesson: { title, phases: [] },
      errors: normalized.errors.map((e) => ({
        componentKey: undefined,
        path: e.path.map((p) => String(p)),
        message: e.message,
      })),
      dirty: false,
    };
  }
  return {
    lesson: mapLesson(normalized.data),
    errors: [],
    dirty: false,
  };
}

/* ------------------------------------------------------------------------ */
/*  Reducer                                                                  */
/* ------------------------------------------------------------------------ */

let idCounter = 0;

/** Generate a fresh, deterministic ID for an inserted node. Test-stable
 *  enough not to collide with the stable IDs from `normalizeLessonDraft`. */
function freshId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_gen_${idCounter}`;
}

export type ComposerAction =
  | { type: "ADD_PHASE"; payload: { title: string; phaseType?: AuthoringPhaseType } }
  | { type: "REMOVE_PHASE"; payload: { phaseId: string } }
  | { type: "REORDER_PHASES"; payload: { fromIndex: number; toIndex: number } }
  | { type: "ADD_SECTION"; payload: { phaseId: string; title: string } }
  | { type: "REMOVE_SECTION"; payload: { phaseId: string; sectionId: string } }
  | {
      type: "REORDER_SECTIONS";
      payload: { phaseId: string; fromIndex: number; toIndex: number };
    }
  | {
      type: "ADD_ACTIVITY";
      payload: {
        phaseId: string;
        sectionId: string;
        componentKey: string;
        props: Record<string, unknown>;
      };
    }
  | {
      type: "REMOVE_ACTIVITY";
      payload: { phaseId: string; sectionId: string; activityId: string };
    }
  | {
      type: "REORDER_ACTIVITIES";
      payload: { phaseId: string; sectionId: string; fromIndex: number; toIndex: number };
    }
  | {
      type: "UPDATE_ACTIVITY_PROPS";
      payload: { activityId: string; props: Record<string, unknown> };
    };

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
  const sanitized = sanitizeLessonDraft(props);
  return sanitized && typeof sanitized === "object" && !Array.isArray(sanitized)
    ? (sanitized as Record<string, unknown>)
    : {};
}

/**
 * Pure reducer for the composer state. Every action returns a NEW state
 * object; input arrays are never mutated.
 */
export function composerReducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case "ADD_PHASE": {
      const phases = state.lesson.phases.map((p) => ({ ...p, sections: p.sections.map((s) => ({ ...s, activities: s.activities.map((a) => ({ ...a })) })) }));
      phases.push({
        id: freshId("phase"),
        title: action.payload.title,
        phaseType: action.payload.phaseType,
        sections: [],
      });
      return {
        lesson: { ...state.lesson, phases },
        errors: [],
        dirty: true,
      };
    }
    case "REMOVE_PHASE": {
      const phases = state.lesson.phases.filter((p) => p.id !== action.payload.phaseId);
      // Run a re-normalize pass so we surface any structural error the
      // removal caused (e.g. empty lesson).
      const reNormalize = normalizeLessonDraft({
        title: state.lesson.title,
        phases: phases.map((phase) => ({
          title: phase.title,
          phaseType: phase.phaseType,
          sections: phase.sections.map((section) => ({
            title: section.title,
            markdown: section.markdown,
            callout: section.callout,
            activities: section.activities.map((activity) => ({
              componentKey: activity.componentKey,
              props: activity.props,
            })),
          })),
        })),
      });
      const errors: ComposerError[] = reNormalize.success
        ? []
        : reNormalize.errors.map((e) => ({
            path: e.path.map((p) => String(p)),
            message: e.message,
          }));
      return {
        lesson: { ...state.lesson, phases },
        errors,
        dirty: true,
      };
    }
    case "REORDER_PHASES": {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex === toIndex) return state;
      const phases = reorder(state.lesson.phases, fromIndex, toIndex);
      return {
        lesson: { ...state.lesson, phases },
        errors: state.errors,
        dirty: true,
      };
    }
    case "ADD_SECTION": {
      const phases = state.lesson.phases.map((phase) => {
        if (phase.id !== action.payload.phaseId) return phase;
        return {
          ...phase,
          sections: [
            ...phase.sections,
            {
              id: freshId("sec"),
              title: action.payload.title,
              activities: [],
            },
          ],
        };
      });
      return {
        lesson: { ...state.lesson, phases },
        errors: [],
        dirty: true,
      };
    }
    case "REMOVE_SECTION": {
      const phases = state.lesson.phases.map((phase) => {
        if (phase.id !== action.payload.phaseId) return phase;
        return {
          ...phase,
          sections: phase.sections.filter((s) => s.id !== action.payload.sectionId),
        };
      });
      const reNormalize = normalizeLessonDraft({
        title: state.lesson.title,
        phases: phases.map((phase) => ({
          title: phase.title,
          phaseType: phase.phaseType,
          sections: phase.sections.map((section) => ({
            title: section.title,
            markdown: section.markdown,
            callout: section.callout,
            activities: section.activities.map((activity) => ({
              componentKey: activity.componentKey,
              props: activity.props,
            })),
          })),
        })),
      });
      const errors: ComposerError[] = reNormalize.success
        ? []
        : reNormalize.errors.map((e) => ({
            path: e.path.map((p) => String(p)),
            message: e.message,
          }));
      return {
        lesson: { ...state.lesson, phases },
        errors,
        dirty: true,
      };
    }
    case "REORDER_SECTIONS": {
      const { phaseId, fromIndex, toIndex } = action.payload;
      if (fromIndex === toIndex) return state;
      const phases = state.lesson.phases.map((phase) => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          sections: reorder(phase.sections, fromIndex, toIndex),
        };
      });
      return {
        lesson: { ...state.lesson, phases },
        errors: state.errors,
        dirty: true,
      };
    }
    case "ADD_ACTIVITY": {
      if (!KNOWN_KEYS.has(action.payload.componentKey)) {
        return {
          ...state,
          errors: [
            ...state.errors,
            {
              componentKey: action.payload.componentKey,
              path: [],
              message: `Unknown activity key '${action.payload.componentKey}'. Use a canonical key from SCHEMA_REGISTRY. equation-solver and drag-drop-categorization are placeholders.`,
            },
          ],
          dirty: true,
        };
      }
      const phases = state.lesson.phases.map((phase) => {
        if (phase.id !== action.payload.phaseId) return phase;
        return {
          ...phase,
          sections: phase.sections.map((section) => {
            if (section.id !== action.payload.sectionId) return section;
            const sanitized = sanitizeProps(action.payload.props);
            const newActivity: ComposerActivity = {
              id: freshId("act"),
              componentKey: action.payload.componentKey,
              props: sanitized,
            };
            // The validation pass below (post-add) catches any
            // activity-level errors. We deliberately do not return
            // early on invalid added activities so the composer can
            // surface them through `state.errors` for the UI to render.
            return {
              ...section,
              activities: [...section.activities, newActivity],
            };
          }),
        };
      });
      // Compute errors across the post-add tree.
      const errors: ComposerError[] = [];
      for (const phase of phases) {
        for (const section of phase.sections) {
          for (const activity of section.activities) {
            const result = validateActivityConfig(activity.componentKey, activity.props);
            if (!result.success) {
              for (const err of result.errors) {
                errors.push({
                  componentKey: err.componentKey,
                  path: err.path,
                  message: err.message,
                });
              }
            }
          }
        }
      }
      return {
        lesson: { ...state.lesson, phases },
        errors,
        dirty: true,
      };
    }
    case "REMOVE_ACTIVITY": {
      const phases = state.lesson.phases.map((phase) => {
        if (phase.id !== action.payload.phaseId) return phase;
        return {
          ...phase,
          sections: phase.sections.map((section) => {
            if (section.id !== action.payload.sectionId) return section;
            return {
              ...section,
              activities: section.activities.filter(
                (a) => a.id !== action.payload.activityId,
              ),
            };
          }),
        };
      });
      const reNormalize = normalizeLessonDraft({
        title: state.lesson.title,
        phases: phases.map((phase) => ({
          title: phase.title,
          phaseType: phase.phaseType,
          sections: phase.sections.map((section) => ({
            title: section.title,
            markdown: section.markdown,
            callout: section.callout,
            activities: section.activities.map((activity) => ({
              componentKey: activity.componentKey,
              props: activity.props,
            })),
          })),
        })),
      });
      const errors: ComposerError[] = reNormalize.success
        ? []
        : reNormalize.errors.map((e) => ({
            path: e.path.map((p) => String(p)),
            message: e.message,
          }));
      return {
        lesson: { ...state.lesson, phases },
        errors,
        dirty: true,
      };
    }
    case "REORDER_ACTIVITIES": {
      const { phaseId, sectionId, fromIndex, toIndex } = action.payload;
      if (fromIndex === toIndex) return state;
      const phases = state.lesson.phases.map((phase) => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          sections: phase.sections.map((section) => {
            if (section.id !== sectionId) return section;
            return {
              ...section,
              activities: reorder(section.activities, fromIndex, toIndex).map((a) => ({
                ...a,
                props: { ...a.props },
              })),
            };
          }),
        };
      });
      return {
        lesson: { ...state.lesson, phases },
        errors: state.errors,
        dirty: true,
      };
    }
    case "UPDATE_ACTIVITY_PROPS": {
      const sanitizedInput = sanitizeProps(action.payload.props);
      let errors: ComposerError[] = [];
      let touched = false;
      const phases = state.lesson.phases.map((phase) => {
        const sections = phase.sections.map((section) => {
          const activities = section.activities.map((activity) => {
            if (activity.id !== action.payload.activityId) return activity;
            touched = true;
            const merged: Record<string, unknown> = {
              ...activity.props,
              ...sanitizedInput,
            };
            // One more sanitize pass over the merged result so any
            // leftover unsafe authored text cannot leak to persistence.
            const cleanMerged = sanitizeProps(merged);
            const result = validateActivityConfig(activity.componentKey, cleanMerged);
            if (!result.success) {
              for (const err of result.errors) {
                errors.push({
                  componentKey: err.componentKey,
                  path: err.path,
                  message: err.message,
                });
              }
              // Keep prior valid props when validation fails — see
              // test "leaves the prior valid draft intact when props
              // are invalid". The sanitizer-only case (valid schema,
              // but unsanitized string) still updates because the
              // validation passes.
              return activity;
            }
            return { ...activity, props: { ...cleanMerged } };
          });
          return { ...section, activities };
        });
        return { ...phase, sections };
      });
      // If the updated activity wasn't in the tree (test scenario), do
      // not add errors beyond what's already there.
      if (!touched) {
        errors = state.errors;
      }
      return {
        lesson: { ...state.lesson, phases },
        errors,
        dirty: true,
      };
    }
  }
}

/* ------------------------------------------------------------------------ */
/*  Save / preview gating                                                   */
/* ------------------------------------------------------------------------ */

/** True when the lesson draft is structurally valid and every activity
 *  validates against its canonical schema. The reducer keeps prior valid
 *  props on invalid updates so this can be evaluated cleanly. */
export function canSaveComposerState(state: ComposerState): boolean {
  if (state.errors.length > 0) return false;
  // Validate every activity through the canonical validator; sanitize
  // props before checking (the reducer already does this, but be safe).
  for (const phase of state.lesson.phases) {
    if (phase.sections.length === 0) return false;
    for (const section of phase.sections) {
      if (section.activities.length === 0) return false;
      for (const activity of section.activities) {
        const result = validateActivityConfig(activity.componentKey, activity.props);
        if (!result.success) return false;
      }
    }
  }
  return true;
}

/** True when the lesson draft can be previewed. Preview requires every
 *  activity to satisfy its canonical schema so the preview surface
 *  cannot render invalid configurations as if they were student-ready. */
export function canPreviewComposerState(state: ComposerState): boolean {
  return canSaveComposerState(state);
}

/**
 * Sanitize the entire draft's free-text leaves. The reducer sanitizes
 * incrementally as props are edited; this pass is intended for save-time
 * defense in depth and is exported so the composer can pass the
 * canonical sanitized draft to the Phase 2 client adapter.
 */
export function sanitizeComposerState(state: ComposerState): ComposerState {
  const sanitized = sanitizeLessonDraft(state.lesson);
  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) {
    return state;
  }
  const lesson = sanitized as unknown as { title: string; phases: AuthoringPhase[] };
  return {
    lesson: {
      title: lesson.title,
      phases: state.lesson.phases.map((phase, phaseIdx) => {
        const phaseFromSanitized = lesson.phases?.[phaseIdx];
        return {
          id: phase.id,
          title: phase.title,
          phaseType: phase.phaseType,
          sections: phase.sections.map((section, sectionIdx) => {
            const sanitizedSection = phaseFromSanitized?.sections?.[sectionIdx];
            const nextSection: ComposerSection = {
              id: section.id,
              title: sanitizedSection?.title ?? section.title,
              activities: section.activities.map((activity, activityIdx) => {
                const sanitizedActivity = sanitizedSection?.activities?.[activityIdx];
                return {
                  id: activity.id,
                  componentKey: activity.componentKey,
                  props:
                    sanitizedActivity && typeof sanitizedActivity === "object"
                      ? { ...(sanitizedActivity.props as Record<string, unknown>) }
                      : { ...activity.props },
                };
              }),
            };
            if (typeof sanitizedSection?.markdown === "string") {
              nextSection.markdown = sanitizedSection.markdown;
            } else if (typeof section.markdown === "string") {
              nextSection.markdown = section.markdown;
            }
            if (typeof sanitizedSection?.callout === "string") {
              nextSection.callout = sanitizedSection.callout;
            } else if (typeof section.callout === "string") {
              nextSection.callout = section.callout;
            }
            return nextSection;
          }),
        };
      }),
    },
    errors: state.errors,
    dirty: state.dirty,
  };
}

/** String sanitization helper exposed to tests for direct assertion. */
export { sanitizeAuthoringText };
