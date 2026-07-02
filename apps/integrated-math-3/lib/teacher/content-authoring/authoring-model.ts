/**
 * Phase 1 — Authoring Model & Schema-Driven Validation
 *
 * Pure, app-local authoring model for teacher lesson drafts. Phase 1 only
 * defines the shape and structure: ordered lesson → phases → sections →
 * activities, plus canonical `componentKey` membership and stable, derived
 * IDs. Validation of `props` against the canonical Zod schemas lives in
 * `activity-config-validation.ts` and is intentionally a separate step so
 * this model can stand alone for tests and UI scaffolding.
 *
 * Hard rules enforced here:
 *
 *   - Lesson must contain at least one phase.
 *   - Each phase must contain at least one section.
 *   - Each section must contain at least one activity.
 *   - Each activity's `componentKey` must be a canonical schema key registered
 *     in `SCHEMA_REGISTRY`. Placeholder runtime keys
 *     (`equation-solver`, `drag-drop-categorization`) and any unknown key
 *     are rejected before they can be saved as arbitrary
 *     `Record<string, unknown>` payloads.
 *   - Phases, sections, and activities are emitted in the same order as the
 *     input (no implicit sorting).
 *   - IDs are stable: two calls with the same input produce the same IDs.
 *     IDs are derived from the activity's position in the draft — they are
 *     placeholders for Phase 2 draft persistence to replace with real
 *     server-issued IDs.
 */

import { SCHEMA_REGISTRY } from '../../activities/schemas';

export interface AuthoringActivity {
  id: string;
  componentKey: string;
  props: Record<string, unknown>;
}

export interface AuthoringSection {
  id: string;
  title: string;
  markdown?: string;
  callout?: string;
  activities: AuthoringActivity[];
}

export type AuthoringPhaseType =
  | 'explore'
  | 'vocabulary'
  | 'learn'
  | 'key_concept'
  | 'worked_example'
  | 'guided_practice'
  | 'independent_practice'
  | 'assessment'
  | 'discourse'
  | 'reflection';

export interface AuthoringPhase {
  id: string;
  title: string;
  /**
   * Phase placement that drives the `ComponentKind` (`example|activity|practice`)
   * resolution during Phase 2's review-queue assembly. The schema is optional
   * here because Phase 1's pure normalization runs before Phase 2's
   * placement-aware persistence; the Phase 2 Convex handler rejects drafts
   * whose phases omit `phaseType`.
   */
  phaseType?: AuthoringPhaseType;
  sections: AuthoringSection[];
}

export interface AuthoringLesson {
  id: string;
  title: string;
  phases: AuthoringPhase[];
}

export interface AuthoringError {
  path: (string | number)[];
  message: string;
}

export type NormalizeLessonDraftResult =
  | { success: true; data: AuthoringLesson }
  | { success: false; errors: AuthoringError[] };

/** Derive a stable, position-based id for a node in the draft. */
function makeStableId(prefix: string, path: ReadonlyArray<string | number>): string {
  const segments = path.length > 0 ? path.join('_') : 'root';
  return `${prefix}_${segments}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function pushError(
  errors: AuthoringError[],
  path: (string | number)[],
  message: string,
): void {
  errors.push({ path, message });
}

/**
 * Normalize a teacher-authored lesson draft into the canonical
 * `AuthoringLesson` shape. Order is preserved; IDs are deterministic.
 *
 * Returns a discriminated union:
 *   - `{ success: true, data }` when the draft is structurally valid and
 *     every `componentKey` is a registered canonical schema key.
 *   - `{ success: false, errors }` otherwise. `errors` is non-empty and
 *     each entry has a structured `path` and human `message` so the
 *     composer UI (Phase 3) and the approval queue (Phase 2) can surface
 *     the failure to the teacher.
 */
export function normalizeLessonDraft(input: unknown): NormalizeLessonDraftResult {
  if (!isPlainObject(input)) {
    return {
      success: false,
      errors: [{ path: [], message: 'Lesson draft must be an object' }],
    };
  }

  const title = input.title;
  if (typeof title !== 'string' || title.length === 0) {
    return {
      success: false,
      errors: [{ path: ['title'], message: 'Lesson must have a non-empty title' }],
    };
  }

  const phasesInput = input.phases;
  if (!Array.isArray(phasesInput) || phasesInput.length === 0) {
    return {
      success: false,
      errors: [{ path: ['phases'], message: 'Lesson must contain at least one phase' }],
    };
  }

  const errors: AuthoringError[] = [];
  const normalizedPhases: AuthoringPhase[] = [];

  phasesInput.forEach((rawPhase, phaseIdx) => {
    if (!isPlainObject(rawPhase)) {
      pushError(errors, ['phases', phaseIdx], 'Phase must be an object');
      return;
    }

    const phaseTitle = rawPhase.title;
    if (typeof phaseTitle !== 'string' || phaseTitle.length === 0) {
      pushError(errors, ['phases', phaseIdx, 'title'], 'Phase must have a non-empty title');
      return;
    }

    const sectionsInput = rawPhase.sections;
    if (!Array.isArray(sectionsInput) || sectionsInput.length === 0) {
      pushError(
        errors,
        ['phases', phaseIdx, 'sections'],
        'Phase must contain at least one section',
      );
      return;
    }

    const normalizedSections: AuthoringSection[] = [];

    sectionsInput.forEach((rawSection, sectionIdx) => {
      if (!isPlainObject(rawSection)) {
        pushError(errors, ['phases', phaseIdx, 'sections', sectionIdx], 'Section must be an object');
        return;
      }

      const sectionTitle = rawSection.title;
      if (typeof sectionTitle !== 'string' || sectionTitle.length === 0) {
        pushError(
          errors,
          ['phases', phaseIdx, 'sections', sectionIdx, 'title'],
          'Section must have a non-empty title',
        );
        return;
      }

      const activitiesInput = rawSection.activities;
      if (!Array.isArray(activitiesInput) || activitiesInput.length === 0) {
        pushError(
          errors,
          ['phases', phaseIdx, 'sections', sectionIdx, 'activities'],
          'Section must contain at least one activity',
        );
        return;
      }

      const normalizedActivities: AuthoringActivity[] = [];

      activitiesInput.forEach((rawActivity, activityIdx) => {
        if (!isPlainObject(rawActivity)) {
          pushError(
            errors,
            ['phases', phaseIdx, 'sections', sectionIdx, 'activities', activityIdx],
            'Activity must be an object',
          );
          return;
        }

        const componentKey = rawActivity.componentKey;
        if (typeof componentKey !== 'string' || componentKey.length === 0) {
          pushError(
            errors,
            ['phases', phaseIdx, 'sections', sectionIdx, 'activities', activityIdx, 'componentKey'],
            'Activity must have a non-empty componentKey',
          );
          return;
        }

        if (!(componentKey in SCHEMA_REGISTRY)) {
          pushError(
            errors,
            ['phases', phaseIdx, 'sections', sectionIdx, 'activities', activityIdx, 'componentKey'],
            `Activity key '${componentKey}' is not a registered canonical schema key. Authoring only accepts canonical activity keys.`,
          );
          return;
        }

        const rawProps = rawActivity.props;
        const props: Record<string, unknown> =
          isPlainObject(rawProps) ? { ...rawProps } : {};

        normalizedActivities.push({
          id: makeStableId('act', [phaseIdx, sectionIdx, activityIdx]),
          componentKey,
          props,
        });
      });

      if (normalizedActivities.length === 0) {
        return;
      }

      const normalizedSection: AuthoringSection = {
        id: makeStableId('sec', [phaseIdx, sectionIdx]),
        title: sectionTitle,
        activities: normalizedActivities,
      };

      if (typeof rawSection.markdown === 'string') {
        normalizedSection.markdown = rawSection.markdown;
      }
      if (typeof rawSection.callout === 'string') {
        normalizedSection.callout = rawSection.callout;
      }

      normalizedSections.push(normalizedSection);
    });

    if (normalizedSections.length === 0) {
      return;
    }

    normalizedPhases.push({
      id: makeStableId('phase', [phaseIdx]),
      title: phaseTitle,
      phaseType: typeof rawPhase.phaseType === 'string' ? rawPhase.phaseType : undefined,
      sections: normalizedSections,
    });
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  if (normalizedPhases.length === 0) {
    return {
      success: false,
      errors: [{ path: ['phases'], message: 'Lesson must contain at least one phase' }],
    };
  }

  return {
    success: true,
    data: {
      id: makeStableId('lesson', []),
      title,
      phases: normalizedPhases,
    },
  };
}
