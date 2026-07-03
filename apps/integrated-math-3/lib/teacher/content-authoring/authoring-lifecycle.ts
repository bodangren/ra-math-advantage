/**
 * Phase 4 — Verification
 *
 * Thin composition adapter that binds the Phase 3 composer state machine to
 * the Phase 2 Convex handler (`saveTeacherDraftHandler` /
 * `editRejectedDraftHandler`) and the Phase 3 preview surface
 * (`AuthoredLessonPreview`). It MUST NOT re-implement validation,
 * sanitization, hashing, or approval. Those concerns are owned by the
 * existing shipped Phase 1/2/3 surfaces, which the downstream consumers
 * invoke on whatever shape this seam emits.
 *
 * The seam:
 *
 *   1. Projects composer-shaped state — which carries `id` fields at every
 *      level for React keying and reducer identity — to the canonical
 *      handler/preview shape (no `id` fields) that
 *      `normalizeLessonDraft`, `AuthoredLessonPreview.isAuthoredDraft`, and
 *      the persistence path already accept.
 *   2. Adds a default `displayName: componentKey` per activity so the
 *      persisted `activities.displayName` column (Convex schema:
 *      `v.string()`, required) is always populated, matching the seed
 *      pattern (`<phase title> - <componentKey>` simplified for the
 *      composer-facing seam where the per-activity phase context is not
 *      readily available at this point).
 *
 * The downstream consumers are responsible for the actual contract work:
 *
 *   - `saveTeacherDraftHandler` runs `normalizeLessonDraft`,
 *     `sanitizeLessonDraft`, and `validateActivityConfig` over the payload
 *     and reuses `computeComponentContentHash` /
 *     `resolveComponentKind` for approval / hashing.
 *   - `AuthoredLessonPreview` re-validates each activity via
 *     `validateActivityConfig` and renders free-text through
 *     `SanitizedText`, which strips executable markup via
 *     `sanitizeAuthoringText`.
 *
 * No new logic lives here. This is a thin projection seam only.
 */

import type { ComposerState } from "./composer-state";

export interface TeacherDraftPayloadActivity {
  componentKey: string;
  props: Record<string, unknown>;
  /** Required by the Convex `activities.displayName` schema column. The
   *  composer doesn't carry a human label per activity, so the
   *  `componentKey` is used as a stable default. Phase 2 seed code uses
   *  a similar pattern (e.g. `<phase title> - <componentKey>`). */
  displayName: string;
}

export interface TeacherDraftPayloadSection {
  title: string;
  markdown?: string;
  callout?: string;
  activities: TeacherDraftPayloadActivity[];
}

export interface TeacherDraftPayloadPhase {
  title: string;
  phaseType?: string;
  sections: TeacherDraftPayloadSection[];
}

export interface TeacherDraftPayload {
  title: string;
  phases: TeacherDraftPayloadPhase[];
}

/**
 * Bind a Phase 3 `ComposerState` to the canonical draft payload consumed by
 * Phase 2's `saveTeacherDraftHandler` (and the
 * `editRejectedDraftHandler`-replay path) and Phase 3's
 * `AuthoredLessonPreview`.
 *
 * The projection:
 *
 *   - preserves `title`, `phaseType`, `markdown`, `callout`, and
 *     per-activity `componentKey` + `props`;
 *   - strips composer-specific `id` fields that the handler and preview
 *     do not need;
 *   - shallow-copies `props` so downstream mutations (e.g. sanitization
 *     in the handler) cannot leak back into the composer's state;
 *   - supplies a stable `displayName: componentKey` per activity so the
 *     `activities.displayName` schema column is populated.
 *
 * Validation, sanitization, hashing, and approval are NOT performed here
 * — those are owned by the shipped Phase 1/2 surfaces that the handler
 * and preview already invoke. This function is intentionally a one-pass
 * projection that does not duplicate their contracts.
 *
 * @param state Phase 3 composer state to bind.
 * @returns Canonical draft payload for the Phase 2 handler + Phase 3 preview.
 */
export function toTeacherDraftPayload(state: ComposerState): TeacherDraftPayload {
  return {
    title: state.lesson.title,
    phases: state.lesson.phases.map((phase) => ({
      title: phase.title,
      phaseType: phase.phaseType,
      sections: phase.sections.map((section) => {
        const next: TeacherDraftPayloadSection = {
          title: section.title,
          activities: section.activities.map((activity) => ({
            componentKey: activity.componentKey,
            props: { ...activity.props },
            displayName: activity.componentKey,
          })),
        };
        if (typeof section.markdown === "string") {
          next.markdown = section.markdown;
        }
        if (typeof section.callout === "string") {
          next.callout = section.callout;
        }
        return next;
      }),
    })),
  };
}
