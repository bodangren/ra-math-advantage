'use client';

/**
 * Phase 3 — Composer UI & Preview
 *
 * The teacher-facing lesson composer. Wraps the pure `composerReducer`
 * state machine and renders a controlled UI for phases / sections /
 * activities. Calls the Phase 2 client adapter via the `client` prop —
 * never imports Convex handlers directly. This boundary lets the test
 * suite mock the client at a thin seam without bypassing validation
 * or lifecycle rules.
 *
 * Design / accessibility:
 * - Uses `card-workbook` shell and `section-label` labels per DESIGN.md.
 * - Every input has a programmatic label; field errors are associated
 *   via `aria-describedby` or visible error text.
 * - All actions (add / remove / reorder / save / preview / submit /
 *   edit-draft) are keyboard-operable semantic buttons.
 * - No `dangerouslySetInnerHTML`: authored free-text strings are passed
 *   through `SanitizedText` from the Phase 1 sanitizer module.
 */

import { useCallback, useMemo, useState } from 'react';
import { CalloutBox } from '@/components/textbook/CalloutBox';
import { SanitizedText } from '@/lib/teacher/content-authoring/sanitize-authored-text';
import {
  type ComposerActivity,
  type ComposerPhase,
  type ComposerSection,
  type ComposerState,
  type FormField,
  canPreviewComposerState,
  canSaveComposerState,
  composerReducer,
  createComposerState,
  deriveActivityFormFields,
  sanitizeComposerState,
} from '@/lib/teacher/content-authoring/composer-state';
import {
  getTeacherAuthoringStatusView,
  type TeacherAuthoringStatusView,
} from '@/lib/teacher/content-authoring/get-teacher-authoring-status-view';
import type { TeacherFacingStatus } from '../../../../convex/teacher/content-authoring';

export interface LessonComposerClient {
  saveTeacherDraft: (...args: unknown[]) => Promise<unknown>;
  submitDraftForReview: (...args: unknown[]) => Promise<unknown>;
  editRejectedDraft: (...args: unknown[]) => Promise<unknown>;
}

export interface LessonComposerProps {
  initialDraft: unknown;
  client: LessonComposerClient;
  teacherId: string;
  initialStatus?: {
    teacherFacingStatus: TeacherFacingStatus;
    rejectionComment?: string;
    lessonId: string;
    lessonVersionId: string;
  };
  /**
   * Optional handler invoked when the teacher clicks the enabled
   * "Preview draft" button. The page host (e.g. ClientComposer) is
   * responsible for navigating the teacher into preview mode — the
   * composer itself only signals the intent. Kept optional so
   * existing callers that did not pass it continue to compile.
   */
  onPreview?: () => void;
}

const COMPONENT_KEYS: ReadonlyArray<string> = [
  'graphing-explorer',
  'comprehension-quiz',
  'fill-in-the-blank',
  'rate-of-change-calculator',
  'discriminant-analyzer',
  'step-by-step-solver',
];

const PHASE_TYPES: ReadonlyArray<string> = [
  'explore',
  'vocabulary',
  'learn',
  'key_concept',
  'worked_example',
  'guided_practice',
  'independent_practice',
  'assessment',
  'discourse',
  'reflection',
];

function statusViewOrDefault(
  dto: LessonComposerProps['initialStatus'],
): TeacherAuthoringStatusView | null {
  if (!dto) return null;
  try {
    return getTeacherAuthoringStatusView(dto);
  } catch {
    return null;
  }
}

export function LessonComposer({
  initialDraft,
  client,
  teacherId,
  initialStatus,
  onPreview,
}: LessonComposerProps) {
  const [state, setState] = useState<ComposerState>(() =>
    createComposerState(initialDraft),
  );
  const [status] = useState<TeacherAuthoringStatusView | null>(() =>
    statusViewOrDefault(initialStatus),
  );
  const [lastAction, setLastAction] = useState<string>('idle');

  const saveable =
    canSaveComposerState(state) && (status === null || status.canSave);
  const previewable =
    canPreviewComposerState(state) && (status === null || status.canSave);

  const dispatch = useCallback(
    (action: Parameters<typeof composerReducer>[1]) => {
      setState((prev) => composerReducer(prev, action));
    },
    [],
  );

  const onAddPhase = useCallback(() => {
    dispatch({
      type: 'ADD_PHASE',
      payload: { title: 'New phase', phaseType: 'explore' },
    });
    setLastAction('add_phase');
  }, [dispatch]);

  const onAddSection = useCallback(
    (phaseId: string) => {
      dispatch({ type: 'ADD_SECTION', payload: { phaseId, title: 'New section' } });
      setLastAction('add_section');
    },
    [dispatch],
  );

  const onAddSectionToLast = useCallback(() => {
    const lastPhase = state.lesson.phases[state.lesson.phases.length - 1];
    if (!lastPhase) {
      onAddPhase();
      return;
    }
    onAddSection(lastPhase.id);
  }, [state.lesson.phases, onAddSection, onAddPhase]);

  const onAddActivity = useCallback(
    (phaseId: string, sectionId: string, componentKey: string) => {
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: { phaseId, sectionId, componentKey, props: defaultPropsFor(componentKey) },
      });
      setLastAction('add_activity');
    },
    [dispatch],
  );

  const onAddActivityToLast = useCallback(() => {
    const lastPhase = state.lesson.phases[state.lesson.phases.length - 1];
    const lastSection = lastPhase?.sections[lastPhase.sections.length - 1];
    if (!lastPhase || !lastSection) {
      onAddSectionToLast();
      return;
    }
    onAddActivity(lastPhase.id, lastSection.id, 'graphing-explorer');
  }, [state.lesson.phases, onAddActivity, onAddSectionToLast]);

  const onRemovePhase = useCallback(
    (phaseId: string) => {
      dispatch({ type: 'REMOVE_PHASE', payload: { phaseId } });
      setLastAction('remove_phase');
    },
    [dispatch],
  );

  const onRemoveSection = useCallback(
    (phaseId: string, sectionId: string) => {
      dispatch({ type: 'REMOVE_SECTION', payload: { phaseId, sectionId } });
      setLastAction('remove_section');
    },
    [dispatch],
  );

  const onRemoveActivity = useCallback(
    (phaseId: string, sectionId: string, activityId: string) => {
      dispatch({ type: 'REMOVE_ACTIVITY', payload: { phaseId, sectionId, activityId } });
      setLastAction('remove_activity');
    },
    [dispatch],
  );

  const onReorderPhases = useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatch({ type: 'REORDER_PHASES', payload: { fromIndex, toIndex } });
      setLastAction('reorder_phase');
    },
    [dispatch],
  );

  const onReorderSections = useCallback(
    (phaseId: string, fromIndex: number, toIndex: number) => {
      dispatch({ type: 'REORDER_SECTIONS', payload: { phaseId, fromIndex, toIndex } });
      setLastAction('reorder_section');
    },
    [dispatch],
  );

  const onReorderActivities = useCallback(
    (phaseId: string, sectionId: string, fromIndex: number, toIndex: number) => {
      dispatch({ type: 'REORDER_ACTIVITIES', payload: { phaseId, sectionId, fromIndex, toIndex } });
      setLastAction('reorder_activity');
    },
    [dispatch],
  );

  const onPropsChange = useCallback(
    (activityId: string, props: Record<string, unknown>) => {
      dispatch({ type: 'UPDATE_ACTIVITY_PROPS', payload: { activityId, props } });
    },
    [dispatch],
  );

  const onTitleChange = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      lesson: { ...prev.lesson, title: value },
      dirty: true,
    }));
  }, []);

  const onSave = useCallback(async () => {
    if (!saveable) return;
    const sanitizedState = sanitizeComposerState(state);
    await client.saveTeacherDraft({
      teacherId,
      draft: {
        title: sanitizedState.lesson.title,
        phases: sanitizedState.lesson.phases.map((phase) => ({
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
      },
      idempotencyKey: `composer-${Date.now()}`,
    });
  }, [client, saveable, state, teacherId]);

  const onSubmit = useCallback(async () => {
    if (!status?.canSubmit) return;
    await client.submitDraftForReview({ teacherId });
  }, [client, status, teacherId]);

  const onEditRejected = useCallback(async () => {
    if (!status?.canEditAfterReject) return;
    await client.editRejectedDraft({
      teacherId,
      idempotencyKey: `composer-${Date.now()}`,
    });
  }, [client, status, teacherId]);

  const activityErrorsById = useMemo(() => buildActivityErrorMap(state), [state]);

  return (
    <div className="space-y-6 card-workbook p-6" data-testid="lesson-composer-root">
      <header className="space-y-2">
        <h2 className="font-display text-2xl font-semibold">Lesson composer</h2>
        <p className="text-sm text-muted-foreground">
          Authoring — teacher <span className="font-mono">{teacherId}</span>
        </p>
      </header>

      <StatusStrip status={status} action={lastAction} />

      <div className="space-y-3">
        <label htmlFor="lesson-title" className="block text-sm font-medium">
          Lesson title
        </label>
        <input
          id="lesson-title"
          type="text"
          value={state.lesson.title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={status ? !status.canEdit : undefined}
          className="block w-full rounded-md border border-border bg-card px-3 py-2 text-base"
          aria-describedby="lesson-title-help"
        />
        <p id="lesson-title-help" className="text-xs text-muted-foreground">
          The title students and teachers see on the lesson card.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAddPhase}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label="Add phase"
        >
          Add phase
        </button>
        <button
          type="button"
          onClick={onAddSectionToLast}
          className="px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors"
          aria-label="Add section"
        >
          Add section
        </button>
        <button
          type="button"
          onClick={onAddActivityToLast}
          className="px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors"
          aria-label="Add activity"
        >
          Add activity
        </button>
        <button
          type="button"
          disabled={!saveable}
          onClick={() => void onSave()}
          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Save draft"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={!previewable}
          onClick={() => onPreview?.()}
          className="px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Preview draft"
        >
          Preview
        </button>
        <button
          type="button"
          disabled={!(status?.canSubmit)}
          onClick={() => void onSubmit()}
          className="px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Submit for review"
        >
          Submit for review
        </button>
        {status?.canEditAfterReject && (
          <button
            type="button"
            onClick={() => void onEditRejected()}
            className="px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            aria-label="Edit draft after rejection"
          >
            Edit draft
          </button>
        )}
      </div>

      {state.errors.length > 0 && (
        <CalloutBox variant="caution" title="Validation issues">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {state.errors.map((err, idx) => (
              <li key={`${err.componentKey ?? 'root'}-${idx}`} role="alert">
                {err.componentKey && (
                  <span className="font-mono text-xs mr-1">[{err.componentKey}]</span>
                )}
                <span className="font-mono text-xs mr-1">
                  {err.path.length > 0 ? `${err.path.join('.')}: ` : ''}
                </span>
                {err.message}
              </li>
            ))}
          </ul>
        </CalloutBox>
      )}

      <div className="space-y-4">
        {state.lesson.phases.map((phase, phaseIndex) => (
          <PhaseBlock
            key={phase.id}
            phase={phase}
            phaseIndex={phaseIndex}
            totalPhases={state.lesson.phases.length}
            errorsByActivity={activityErrorsById}
            onAddSection={() => onAddSection(phase.id)}
            onRemoveSection={(sectionId) => onRemoveSection(phase.id, sectionId)}
            onAddActivity={(sectionId, key) => onAddActivity(phase.id, sectionId, key)}
            onRemoveActivity={(sectionId, activityId) =>
              onRemoveActivity(phase.id, sectionId, activityId)
            }
            onReorderSections={(from, to) => onReorderSections(phase.id, from, to)}
            onReorderActivities={(sectionId, from, to) =>
              onReorderActivities(phase.id, sectionId, from, to)
            }
            onPropsChange={onPropsChange}
            onRemovePhase={() => onRemovePhase(phase.id)}
            onReorderPhase={(from, to) => onReorderPhases(from, to)}
          />
        ))}
      </div>
    </div>
  );
}

interface PhaseBlockProps {
  phase: ComposerPhase;
  phaseIndex: number;
  totalPhases: number;
  errorsByActivity: Map<string, ComposerActivityError[]>;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  onAddActivity: (sectionId: string, componentKey: string) => void;
  onRemoveActivity: (sectionId: string, activityId: string) => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
  onReorderActivities: (sectionId: string, fromIndex: number, toIndex: number) => void;
  onPropsChange: (activityId: string, props: Record<string, unknown>) => void;
  onRemovePhase: () => void;
  onReorderPhase: (fromIndex: number, toIndex: number) => void;
}

interface ComposerActivityError {
  path: string[];
  message: string;
  componentKey?: string;
}

function buildActivityErrorMap(state: ComposerState): Map<string, ComposerActivityError[]> {
  const map = new Map<string, ComposerActivityError[]>();
  for (const err of state.errors) {
    if (!err.componentKey) continue;
    // Path looks like ['phases', '0', 'sections', '1', 'activities', '0', 'equation'].
    // We try to find the matching activity id from the path index.
    const activityIdx = err.path.indexOf('activities');
    if (activityIdx === -1) continue;
    const idx = Number(err.path[activityIdx + 1]);
    if (!Number.isFinite(idx)) continue;
    // For now, key by componentKey+path to keep error grouping simple.
    const key = `${err.componentKey}:${err.path.slice(0, activityIdx + 2).join('.')}`;
    const entry: ComposerActivityError = {
      path: err.path.slice(activityIdx + 2),
      message: err.message,
      componentKey: err.componentKey,
    };
    const arr = map.get(key) ?? [];
    arr.push(entry);
    map.set(key, arr);
  }
  return map;
}

function defaultPropsFor(componentKey: string): Record<string, unknown> {
  switch (componentKey) {
    case 'graphing-explorer':
      return { equation: 'x^2' };
    case 'comprehension-quiz':
      return {
        questions: [
          {
            id: 'q1',
            prompt: 'Question?',
            correctAnswer: 'A',
          },
        ],
      };
    case 'fill-in-the-blank':
      return {
        template: 'A quadratic has degree {{blank:degree}}.',
        blanks: [{ id: 'degree', correctAnswer: '2' }],
      };
    case 'rate-of-change-calculator':
      return {
        sourceType: 'table',
        data: { x: [1, 2, 3], y: [2, 4, 6] },
        interval: { start: 1, end: 3 },
      };
    case 'discriminant-analyzer':
      return { equation: 'x^2 + 3x - 4 = 0' };
    case 'step-by-step-solver':
      return {
        problemType: 'factoring',
        equation: 'x^2 + 3x - 4 = 0',
      };
    default:
      return {};
  }
}

function PhaseBlock(props: PhaseBlockProps) {
  const { phase, phaseIndex, totalPhases, errorsByActivity } = props;
  return (
    <section
      className="card-workbook p-5 space-y-3"
      data-testid={`phase-${phaseIndex + 1}`}
      aria-label={`Phase ${phaseIndex + 1}: ${phase.title}`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-display text-xl font-semibold">{phase.title}</h3>
        <div className="flex items-center gap-2">
          <select
            aria-label={`Phase ${phaseIndex + 1} placement`}
            className="rounded-md border border-border bg-card px-2 py-1 text-sm"
            defaultValue={phase.phaseType ?? 'explore'}
          >
            {PHASE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => props.onRemovePhase()}
            className="px-3 py-1 rounded-md border border-border text-sm hover:bg-muted/50 transition-colors"
            aria-label={`Remove phase ${phase.title}`}
          >
            Remove
          </button>
          {phaseIndex > 0 && (
            <button
              type="button"
              onClick={() => props.onReorderPhase(phaseIndex, phaseIndex - 1)}
              className="px-3 py-1 rounded-md border border-border text-sm hover:bg-muted/50 transition-colors"
              aria-label={`Reorder phase ${phase.title} up`}
            >
              Reorder up
            </button>
          )}
          {phaseIndex < totalPhases - 1 && (
            <button
              type="button"
              onClick={() => props.onReorderPhase(phaseIndex, phaseIndex + 1)}
              className="px-3 py-1 rounded-md border border-border text-sm hover:bg-muted/50 transition-colors"
              aria-label={`Reorder phase ${phase.title} down`}
            >
              Reorder down
            </button>
          )}
        </div>
      </div>

      {phase.sections.map((section, sectionIndex) => (
        <SectionBlock
          key={section.id}
          section={section}
          sectionIndex={sectionIndex}
          totalSections={phase.sections.length}
          errorsByActivity={errorsByActivity}
          onAddActivity={(key) => props.onAddActivity(section.id, key)}
          onRemoveActivity={(activityId) => props.onRemoveActivity(section.id, activityId)}
          onReorderActivities={(from, to) =>
            props.onReorderActivities(section.id, from, to)
          }
          onPropsChange={props.onPropsChange}
          onRemoveSection={() => props.onRemoveSection(section.id)}
          onReorderSections={(from, to) =>
            props.onReorderSections(from, to)
          }
        />
      ))}

      <div>
        <button
          type="button"
          onClick={props.onAddSection}
          className="px-3 py-1 rounded-md border border-border text-sm hover:bg-muted/50 transition-colors"
          aria-label="Insert section here"
        >
          Insert section here
        </button>
      </div>
    </section>
  );
}

interface SectionBlockProps {
  section: ComposerSection;
  sectionIndex: number;
  totalSections: number;
  errorsByActivity: Map<string, ComposerActivityError[]>;
  onAddActivity: (componentKey: string) => void;
  onRemoveActivity: (activityId: string) => void;
  onReorderActivities: (fromIndex: number, toIndex: number) => void;
  onPropsChange: (activityId: string, props: Record<string, unknown>) => void;
  onRemoveSection: () => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
}

function SectionBlock(props: SectionBlockProps) {
  const { section, sectionIndex, totalSections } = props;
  return (
    <div
      className="rounded-md border border-border p-3 space-y-2"
      data-testid={`section-${sectionIndex + 1}`}
      aria-label={`Section ${sectionIndex + 1}: ${section.title}`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="font-medium">{section.title}</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={props.onRemoveSection}
            className="px-2 py-1 rounded-md border border-border text-xs hover:bg-muted/50 transition-colors"
            aria-label={`Remove section ${section.title}`}
          >
            Remove
          </button>
          {sectionIndex > 0 && (
            <button
              type="button"
              onClick={() => props.onReorderSections(sectionIndex, sectionIndex - 1)}
              className="px-2 py-1 rounded-md border border-border text-xs hover:bg-muted/50 transition-colors"
              aria-label={`Reorder section ${section.title} up`}
            >
              Reorder up
            </button>
          )}
          {sectionIndex < totalSections - 1 && (
            <button
              type="button"
              onClick={() => props.onReorderSections(sectionIndex, sectionIndex + 1)}
              className="px-2 py-1 rounded-md border border-border text-xs hover:bg-muted/50 transition-colors"
              aria-label={`Reorder section ${section.title} down`}
            >
              Reorder down
            </button>
          )}
        </div>
      </div>
      {typeof section.markdown === 'string' && section.markdown.length > 0 && (
        <SanitizedText html={section.markdown} as="p" />
      )}
      {typeof section.callout === 'string' && section.callout.length > 0 && (
        <CalloutBox variant="remember">
          <SanitizedText html={section.callout} />
        </CalloutBox>
      )}

      <div className="space-y-3">
        {section.activities.map((activity, activityIndex) => {
          const errorKey = `${activity.componentKey}:activities.${activityIndex}`;
          const errors = props.errorsByActivity.get(errorKey) ?? [];
          return (
            <ActivityBlock
              key={activity.id}
              activity={activity}
              activityIndex={activityIndex}
              totalActivities={section.activities.length}
              errors={errors}
              onPropsChange={(newProps) => props.onPropsChange(activity.id, newProps)}
              onRemove={() => props.onRemoveActivity(activity.id)}
              onReorder={(from, to) => props.onReorderActivities(from, to)}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="section-label">Insert activity</span>
        {COMPONENT_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => props.onAddActivity(key)}
            className="px-2 py-1 rounded-md border border-border text-xs hover:bg-muted/50 transition-colors"
            aria-label={`Insert activity ${key} into this section`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ActivityBlockProps {
  activity: ComposerActivity;
  activityIndex: number;
  totalActivities: number;
  errors: ComposerActivityError[];
  onPropsChange: (props: Record<string, unknown>) => void;
  onRemove: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function ActivityBlock(props: ActivityBlockProps) {
  const { activity, activityIndex, totalActivities } = props;
  const fields = useMemo<FormField[]>(() => {
    try {
      return deriveActivityFormFields(activity.componentKey);
    } catch {
      return [];
    }
  }, [activity.componentKey]);

  const setField = (name: string, value: unknown) => {
    props.onPropsChange({ [name]: value });
  };

  const errorIds = props.errors
    .map((e) => e.path.join('.'))
    .filter((id, idx, arr) => arr.indexOf(id) === idx);

  return (
    <div
      className="rounded-md border border-border p-3 space-y-2"
      data-testid={`activity-${activityIndex + 1}`}
      aria-label={`Activity ${activityIndex + 1}: ${activity.componentKey}`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <span className="section-label">{activity.componentKey}</span>
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            id <SanitizedText html={activity.id} />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={props.onRemove}
            className="px-2 py-1 rounded-md border border-border text-xs hover:bg-muted/50 transition-colors"
            aria-label={`Remove activity ${activityIndex + 1}`}
          >
            Remove
          </button>
          {activityIndex > 0 && (
            <button
              type="button"
              onClick={() => props.onReorder(activityIndex, activityIndex - 1)}
              className="px-2 py-1 rounded-md border border-border text-xs hover:bg-muted/50 transition-colors"
              aria-label={`Reorder activity ${activityIndex + 1} up`}
            >
              Reorder up
            </button>
          )}
          {activityIndex < totalActivities - 1 && (
            <button
              type="button"
              onClick={() => props.onReorder(activityIndex, activityIndex + 1)}
              className="px-2 py-1 rounded-md border border-border text-xs hover:bg-muted/50 transition-colors"
              aria-label={`Reorder activity ${activityIndex + 1} down`}
            >
              Reorder down
            </button>
          )}
        </div>
      </div>

      {fields.map((field) => {
        const fieldId = `${activity.id}-${field.name}`;
        const errorKey = field.name;
        const fieldError = props.errors.find((e) => e.path[e.path.length - 1] === errorKey);
        return (
          <FieldRenderer
            key={field.name}
            id={fieldId}
            field={field}
            value={activity.props[field.name]}
            onChange={(value) => setField(field.name, value)}
            error={fieldError?.message}
          />
        );
      })}

      {props.errors.length > 0 && (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
          {props.errors.map((err, idx) => (
            <div key={idx} data-testid={`activity-error-${idx}`}>
              <span className="font-mono text-xs mr-1">[{err.path.join('.')}]</span>
              {err.message}
            </div>
          ))}
        </div>
      )}
      {errorIds.map((id) => (
        <span key={id} className="sr-only" data-testid={`error-anchor-${id}`}>
          field {id} has errors
        </span>
      ))}
    </div>
  );
}

interface FieldRendererProps {
  id: string;
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

function FieldRenderer({ id, field, value, onChange, error }: FieldRendererProps) {
  const common = {
    id,
    name: field.name,
    'aria-describedby': error ? `${id}-error` : undefined,
    className: 'w-full rounded-md border border-border bg-card px-3 py-2 text-sm',
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {field.name}
        {field.required ? <span className="text-destructive"> *</span> : null}
        {field.kind !== 'string' && (
          <span className="ml-2 text-[10px] uppercase tracking-wider">{field.kind}</span>
        )}
      </label>
      {field.kind === 'string' && (
        <input
          {...common}
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.kind === 'number' && (
        <input
          {...common}
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => {
            const parsed = e.target.value === '' ? undefined : Number(e.target.value);
            onChange(parsed);
          }}
        />
      )}
      {field.kind === 'boolean' && (
        <input
          {...common}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      )}
      {field.kind === 'enum' && (
        <select
          {...common}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— select —</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
      {field.kind === 'array' && (
        <div className="text-sm text-muted-foreground" data-testid={`${id}-array-hint`}>
          Array{field.itemFields && field.itemFields.length > 0 && (
            <ul className="list-disc pl-5 mt-1">
              {field.itemFields.map((child) => (
                <li key={child.name}>
                  {child.name}
                  {child.required ? <span className="text-destructive"> *</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {(field.kind === 'object' || field.kind === 'tuple' || field.kind === 'union') && (
        <div className="text-sm text-muted-foreground">
          <em>{field.name}</em> ({field.kind})
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface StatusStripProps {
  status: TeacherAuthoringStatusView | null;
  action: string;
}

function StatusStrip({ status }: StatusStripProps) {
  if (!status) {
    return (
      <div className="section-label">No status</div>
    );
  }
  return (
    <div className="card-workbook p-3 flex flex-wrap items-center gap-2" role="status">
      <span
        className="section-label"
        data-testid={`composer-status-${status.teacherFacingStatus}`}
      >
        {status.label}
      </span>
      {status.isPublishReady && status.teacherFacingStatus !== 'published' && (
        <span className="text-sm text-accent">Ready to publish</span>
      )}
      {status.teacherFacingStatus === 'published' && (
        <span className="text-sm text-muted-foreground">Available to assign to a class</span>
      )}
      {typeof status.rejectionComment === 'string' && (
        <CalloutBox variant="caution" title="Reviewer comment">
          <SanitizedText html={status.rejectionComment} />
        </CalloutBox>
      )}
    </div>
  );
}
