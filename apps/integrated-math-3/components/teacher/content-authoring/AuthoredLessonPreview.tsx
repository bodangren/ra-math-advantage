'use client';

/**
 * Phase 3 — Composer UI & Preview
 *
 * Preview an authored draft using the SAME rendering path a student lesson
 * preview uses. Sections are mapped to the existing `PhaseSection` types
 * (text / callout / activity) and rendered through the existing
 * `ActivityRenderer` + `CalloutBox` + `SanitizedText` components.
 *
 * Boundary rules:
 *
 *  - No bespoke preview renderer: every activity is rendered through the
 *    real `ActivityRenderer` so the preview sees the same component
 *    surface a student sees.
 *  - Unknown / placeholder component keys
 *    (`equation-solver`, `drag-drop-categorization`, anything not in
 *    `SCHEMA_REGISTRY`) throw before render so the composer rejects
 *    them at preview time, not at save time.
 *  - Schema-invalid props surface an accessible `role="alert"` error
 *    without crashing the rest of the preview.
 *  - No raw HTML: free-text from the authored draft flows through
 *    `SanitizedText` (with script blocks, style blocks, event-handler
 *    attributes, and javascript-URL prefixes stripped) so the preview
 *    can never execute authored content.
 */

import { useCallback, useMemo } from 'react';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import { CalloutBox } from '@/components/textbook/CalloutBox';
import { SanitizedText } from '@/lib/teacher/content-authoring/sanitize-authored-text';
import { validateActivityConfig } from '@/lib/teacher/content-authoring/activity-config-validation';
import { SCHEMA_REGISTRY } from '@/lib/activities/schemas';

export type AuthoredPhaseType =
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

export interface AuthoredActivity {
  componentKey: string;
  props: Record<string, unknown>;
}

export interface AuthoredSection {
  title: string;
  markdown?: string;
  callout?: string;
  activities: AuthoredActivity[];
}

export interface AuthoredPhase {
  title: string;
  phaseType?: AuthoredPhaseType;
  sections: AuthoredSection[];
}

export interface AuthoredDraft {
  title: string;
  phases: AuthoredPhase[];
}

export interface AuthoredLessonPreviewProps {
  draft: AuthoredDraft;
  lessonId: string;
}

/**
 * Map an authored phaseType to a LessonRenderer `mode` so the activity
 * receives the right educational context. `worked_example` maps to
 * 'teaching' so students see example/teaching context; practice phases
 * map to 'practice'/'guided'.
 */
function modeForPhase(phaseType: string | undefined): 'teaching' | 'guided' | 'practice' {
  switch (phaseType) {
    case 'worked_example':
    case 'vocabulary':
    case 'learn':
    case 'key_concept':
    case 'discourse':
    case 'reflection':
      return 'teaching';
    case 'guided_practice':
      return 'guided';
    case 'independent_practice':
    case 'assessment':
      return 'practice';
    case 'explore':
    default:
      return 'teaching';
  }
}

function stableActivityId(
  lessonId: string,
  phaseIndex: number,
  sectionIndex: number,
  activityIndex: number,
): string {
  return `__preview_${lessonId}_${phaseIndex}_${sectionIndex}_${activityIndex}`;
}

interface ActivityError {
  componentKey: string;
  path: string[];
  message: string;
}

interface PhaseStatus {
  activityErrors: ActivityError[];
  unknownKeyErrors: string[];
}

function collectActivityErrors(phase: AuthoredPhase): ActivityError[] {
  const errors: ActivityError[] = [];
  for (const section of phase.sections) {
    for (const activity of section.activities) {
      if (!(activity.componentKey in SCHEMA_REGISTRY)) continue;
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
  return errors;
}

function collectUnknownKeys(phase: AuthoredPhase): string[] {
  const unknown: string[] = [];
  for (const section of phase.sections) {
    for (const activity of section.activities) {
      if (!(activity.componentKey in SCHEMA_REGISTRY)) {
        unknown.push(activity.componentKey);
      }
    }
  }
  return unknown;
}

function isAuthoredDraft(value: unknown): value is AuthoredDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  if (typeof draft.title !== 'string') return false;
  if (!Array.isArray(draft.phases)) return false;
  for (const phase of draft.phases) {
    if (!phase || typeof phase !== 'object') return false;
    const phaseObj = phase as Record<string, unknown>;
    if (typeof phaseObj.title !== 'string') return false;
    if (!Array.isArray(phaseObj.sections)) return false;
    for (const section of phaseObj.sections) {
      if (!section || typeof section !== 'object') return false;
      const sectionObj = section as Record<string, unknown>;
      if (typeof sectionObj.title !== 'string') return false;
      if (!Array.isArray(sectionObj.activities)) return false;
      for (const activity of sectionObj.activities) {
        if (!activity || typeof activity !== 'object') return false;
        const activityObj = activity as Record<string, unknown>;
        if (typeof activityObj.componentKey !== 'string') return false;
      }
    }
  }
  return true;
}

export function AuthoredLessonPreview({ draft, lessonId }: AuthoredLessonPreviewProps) {
  if (!isAuthoredDraft(draft)) {
    throw new Error('AuthoredLessonPreview: draft is not a valid authored lesson');
  }

  const phaseStatuses = useMemo<PhaseStatus[]>(
    () =>
      draft.phases.map((phase) => ({
        activityErrors: collectActivityErrors(phase),
        unknownKeyErrors: collectUnknownKeys(phase),
      })),
    [draft.phases],
  );

  // Fail-closed on unknown keys — the composer rejects them at build
  // time but the preview is the last defense before render.
  for (const status of phaseStatuses) {
    if (status.unknownKeyErrors.length > 0) {
      throw new Error(
        `AuthoredLessonPreview: unknown activity keys are not allowed in preview (${status.unknownKeyErrors.join(', ')}). Use a canonical key from SCHEMA_REGISTRY.`,
      );
    }
  }

  const handleActivitySubmit = useCallback((payload: unknown) => {
    // Routes through the same path a student preview uses. The preview
    // surface does not persist; callbacks are intentionally no-ops so
    // teacher-authored drafts stay unstained by practice submissions.
    void payload;
  }, []);

  const handleActivityComplete = useCallback(() => {
    // No-op: preview does not persist activity completion.
  }, []);

  return (
    <div className="card-workbook p-6 space-y-6" data-testid="authored-lesson-preview">
      <div className="flex items-center gap-2">
        <span className="section-label" data-testid="teacher-preview-badge">
          Teacher preview
        </span>
        <span className="font-mono text-xs text-muted-foreground">{draft.title}</span>
      </div>

      {draft.phases.map((phase, phaseIndex) => {
        const mode = modeForPhase(phase.phaseType);
        const status = phaseStatuses[phaseIndex];
        const hasInvalidActivity = status.activityErrors.length > 0;

        return (
          <section
            key={`preview-phase-${phaseIndex}`}
            className="card-workbook p-5 space-y-4"
            data-testid={`preview-phase-${phaseIndex + 1}`}
            data-phase-type={phase.phaseType ?? 'explore'}
            data-mode={mode}
            aria-label={`Phase ${phaseIndex + 1}: ${phase.title}`}
          >
            <header>
              <h3 className="font-display text-xl font-semibold">{phase.title}</h3>
              <p className="text-xs text-muted-foreground">
                {phase.phaseType ? `Placement: ${phase.phaseType}` : 'No placement declared'}
              </p>
            </header>

            {hasInvalidActivity ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-testid={`preview-phase-error-${phaseIndex + 1}`}
              >
                <p className="font-medium">This phase has invalid activity configuration</p>
                <ul className="list-disc pl-5 mt-1">
                  {status.activityErrors.map((err, idx) => (
                    <li key={idx} className="text-xs">
                      <span className="font-mono">
                        [{err.componentKey}.{err.path.join('.')}]
                      </span>{' '}
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="space-y-3 list-none p-0">
                {phase.sections.map((section, sectionIndex) => (
                  <li key={`preview-section-${phaseIndex}-${sectionIndex}`} className="space-y-2">
                    {typeof section.markdown === 'string' && section.markdown.length > 0 && (
                      <SanitizedText html={section.markdown} as="p" />
                    )}
                    {typeof section.callout === 'string' && section.callout.length > 0 && (
                      <CalloutBox variant="remember">
                        <SanitizedText html={section.callout} />
                      </CalloutBox>
                    )}
                    {section.activities.map((activity, activityIndex) => (
                      <ActivityRenderer
                        key={`preview-act-${phaseIndex}-${sectionIndex}-${activityIndex}`}
                        componentKey={activity.componentKey}
                        activityId={stableActivityId(lessonId, phaseIndex, sectionIndex, activityIndex)}
                        mode={mode}
                        onSubmit={handleActivitySubmit}
                        onComplete={handleActivityComplete}
                      />
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
