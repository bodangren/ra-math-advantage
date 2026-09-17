'use client';

import { notFound } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Download, FileSearch, ShieldAlert } from 'lucide-react';
import { fetchGraphData } from './data';
import { BlueprintSpecPanel } from './components/BlueprintSpecPanel';
import { GeneratorPanel } from './components/GeneratorPanel';
import { RendererPreview, getStudentPreviewProblem } from './components/RendererPreview';
import { ReviewDecisionControls } from './components/ReviewDecisionControls';
import { SourcePagePanel } from './components/SourcePagePanel';
import {
  buildReviewExport,
  compareCurriculumNodes,
  getWorkedExamplesForSkill,
  isSkillApproved,
  resolvePdfReference,
} from './review-utils';
import type {
  CourseKey,
  GraphData,
  HarnessState,
  PracticeMode,
  ReviewDecision,
  ReviewBlueprint,
  ReviewStore,
  SkillNode,
  SubmissionEntry,
} from './types';

const COURSE_OPTIONS: Array<{ key: CourseKey; label: string }> = [
  { key: 'im1', label: 'IM1' },
  { key: 'im2', label: 'IM2' },
  { key: 'im3', label: 'IM3' },
  { key: 'precalc', label: 'AP Precalculus' },
  { key: 'bm2', label: 'Business Math' },
];

const STORAGE_KEY = 'blueprint-qa-review.v2';
const STORAGE_EVENT = 'blueprint-qa-review-change';
const EMPTY_REVIEW_STORE: ReviewStore = {};

type CourseReviewStore = Partial<Record<CourseKey, ReviewStore>>;

interface PdfSelection {
  subjectId: string;
  documentKey: string;
  page: number;
}

function readReviewSnapshot(): string {
  if (typeof window === 'undefined') return '{}';
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '{}';
  } catch {
    return '{}';
  }
}

function subscribeToReviewStore(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

function parseReviewStores(snapshot: string): CourseReviewStore {
  try {
    return JSON.parse(snapshot) as CourseReviewStore;
  } catch {
    return {};
  }
}

function nodeModule(node: SkillNode): string {
  return String(node.metadata.module ?? node.metadata.unit ?? 'Unassigned');
}

function nodeLesson(node: SkillNode): string {
  return String(node.metadata.lesson ?? 'Unassigned');
}

function uniqueInOrder(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function newHarnessState(): HarnessState {
  return {
    selectedNodeId: null,
    seed: 42,
    difficulty: 0.5,
    mode: 'worked_example',
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };
}

function decisionLabel(mode: PracticeMode): string {
  if (mode === 'worked_example') return 'Worked example';
  if (mode === 'guided_practice') return 'Guided practice';
  return 'Independent practice';
}

export default function BlueprintQAPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const [courseKey, setCourseKey] = useState<CourseKey>('im3');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [pdfSelection, setPdfSelection] = useState<PdfSelection | null>(null);
  const [state, setState] = useState<HarnessState>(newHarnessState);
  const reviewSnapshot = useSyncExternalStore(subscribeToReviewStore, readReviewSnapshot, () => '{}');
  const reviewStores = useMemo(() => parseReviewStores(reviewSnapshot), [reviewSnapshot]);

  useEffect(() => {
    let active = true;

    fetchGraphData(courseKey)
      .then((data) => {
        if (active) setGraphData(data);
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      active = false;
    };
  }, [courseKey]);

  const blueprintsByNodeId = useMemo(() => {
    const map = new Map<string, ReviewBlueprint>();
    for (const blueprint of graphData?.blueprints ?? []) map.set(blueprint.nodeId, blueprint);
    return map;
  }, [graphData]);

  const skills = useMemo(
    () => (graphData?.nodes ?? []).filter((node) => node.kind === 'skill').sort(compareCurriculumNodes),
    [graphData],
  );
  const modules = useMemo(() => uniqueInOrder(skills.map(nodeModule)), [skills]);
  const activeModule = selectedModule ?? modules[0] ?? null;
  const lessons = useMemo(
    () => uniqueInOrder(skills.filter((node) => nodeModule(node) === activeModule).map(nodeLesson)),
    [activeModule, skills],
  );
  const activeLesson = selectedLesson && lessons.includes(selectedLesson) ? selectedLesson : lessons[0] ?? null;
  const lessonSkills = useMemo(
    () => skills.filter((node) => nodeModule(node) === activeModule && nodeLesson(node) === activeLesson),
    [activeLesson, activeModule, skills],
  );
  const selectedNode = useMemo(
    () => lessonSkills.find((node) => node.id === state.selectedNodeId) ?? lessonSkills[0] ?? null,
    [lessonSkills, state.selectedNodeId],
  );
  const selectedBlueprint = selectedNode ? blueprintsByNodeId.get(selectedNode.id) ?? null : null;
  const selectedActivity = useMemo(
    () => (graphData?.activities ?? []).find(
      (activity) => activity.nodeId === selectedNode?.id && activity.mode === state.mode,
    ) ?? null,
    [graphData, selectedNode?.id, state.mode],
  );
  const studentPreviewProblem = getStudentPreviewProblem(selectedActivity);
  const examples = useMemo(
    () => selectedNode
      ? getWorkedExamplesForSkill(graphData?.nodes ?? [], selectedNode, selectedBlueprint?.sourceNodeIds ?? [])
      : [],
    [graphData, selectedBlueprint, selectedNode],
  );
  const selectedExample = examples.find((example) => example.id === selectedExampleId) ?? examples[0] ?? null;
  const moduleDocuments = useMemo(
    () => (graphData?.sourceDocuments ?? []).filter(
      (document) => document.module === '*' || document.module === activeModule,
    ),
    [activeModule, graphData],
  );
  const exactPdfReference = selectedExample
    ? resolvePdfReference(selectedExample, graphData?.sourceDocuments ?? [])
    : null;
  const pdfSubjectId = selectedExample?.id ?? `${courseKey}:${activeModule ?? 'none'}`;
  const hasManualPdfSelection = pdfSelection?.subjectId === pdfSubjectId;
  const activeDocumentKey = hasManualPdfSelection
    ? pdfSelection.documentKey
    : exactPdfReference?.documentKey ?? moduleDocuments[0]?.key ?? null;
  const activePdfPage = hasManualPdfSelection ? pdfSelection.page : exactPdfReference?.page ?? 1;
  const effectiveState = state.selectedNodeId === selectedNode?.id
    ? state
    : { ...state, selectedNodeId: selectedNode?.id ?? null };

  const updateState = useCallback((patch: Partial<HarnessState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const courseReviews = reviewStores[courseKey] ?? EMPTY_REVIEW_STORE;
  const selectedReview = selectedNode ? courseReviews[selectedNode.id] : undefined;
  const approvedCount = skills.filter((skill) => isSkillApproved(courseReviews[skill.id])).length;

  const updateSkillReview = useCallback((
    skillNodeId: string,
    update: (current: ReviewStore[string]) => ReviewStore[string],
  ) => {
    const current = parseReviewStores(readReviewSnapshot());
    const next = (() => {
      const courseStore = current[courseKey] ?? {};
      const existing = courseStore[skillNodeId] ?? { sourceAlignments: {} };
      return {
        ...current,
        [courseKey]: { ...courseStore, [skillNodeId]: update(existing) },
      };
    })();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, [courseKey]);

  const updateSourceDecision = useCallback((decision: ReviewDecision) => {
    if (!selectedNode || !selectedExample) return;
    updateSkillReview(selectedNode.id, (current) => ({
      ...current,
      sourceAlignments: { ...current.sourceAlignments, [selectedExample.id]: decision },
    }));
  }, [selectedExample, selectedNode, updateSkillReview]);

  const updateModalityDecision = useCallback((decision: ReviewDecision) => {
    if (!selectedNode) return;
    updateSkillReview(selectedNode.id, (current) => ({ ...current, [state.mode]: decision }));
  }, [selectedNode, state.mode, updateSkillReview]);

  const exportReview = useCallback(() => {
    const output = buildReviewExport(courseKey, courseReviews);
    const url = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `curriculum-review-${courseKey}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [courseKey, courseReviews]);

  const handleSubmission = useCallback((entry: SubmissionEntry) => {
    setState((current) => ({ ...current, lastSubmission: entry }));
  }, []);

  const selectCourse = useCallback((nextCourseKey: CourseKey) => {
    if (nextCourseKey === courseKey) return;
    setGraphData(null);
    setLoadError(null);
    setSelectedModule(null);
    setSelectedLesson(null);
    setSelectedExampleId(null);
    setPdfSelection(null);
    setState(newHarnessState());
    setCourseKey(nextCourseKey);
  }, [courseKey]);

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#FDFCF5] p-6 text-[#0A1C1A]">
        <div role="alert" className="mx-auto max-w-5xl border border-[#A34A36] bg-red-50 p-5 text-[#7A2E20]">
          <h1 className="font-serif text-2xl">The curriculum graph did not load</h1>
          <p className="mt-2 font-mono text-sm">{loadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCF5] p-4 text-[#0A1C1A] lg:p-6">
      <div className="mx-auto max-w-[1900px]">
        <header className="border border-[#8A958E] bg-[#EEEADF] p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#365451]">
                <FileSearch className="size-4" aria-hidden="true" /> Curriculum alignment review
              </p>
              <h1 className="mt-2 font-serif text-3xl">Source, skill, and modality workbench</h1>
              <p className="mt-2 max-w-3xl text-sm text-[#365451]">
                Compare one source example with one mastery skill. Review the worked example, guided practice, and independent practice. This page does not edit the graph.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-sm">{approvedCount}/{skills.length} skills approved</p>
              <button
                type="button"
                onClick={exportReview}
                className="inline-flex items-center gap-2 border border-[#2D7D46] bg-[#2D7D46] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={Object.keys(courseReviews).length === 0}
              >
                <Download className="size-4" aria-hidden="true" /> Export review JSON
              </button>
            </div>
          </div>
          <nav aria-label="Course" className="mt-5 flex flex-wrap gap-2">
            {COURSE_OPTIONS.map((course) => (
              <button
                key={course.key}
                type="button"
                aria-pressed={courseKey === course.key}
                onClick={() => selectCourse(course.key)}
                className="border border-[#8A958E] bg-[#FDFCF5] px-3 py-2 text-sm font-semibold aria-pressed:border-[#0A1C1A] aria-pressed:bg-[#0A1C1A] aria-pressed:text-white"
              >
                {course.label}
              </button>
            ))}
          </nav>
        </header>

        {!graphData ? (
          <p role="status" className="border-x border-b border-[#8A958E] p-6">Loading curriculum graph…</p>
        ) : graphData.unavailableReason ? (
          <section className="mt-5 flex gap-3 border border-amber-400 bg-amber-50 p-5 text-amber-950">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-serif text-xl">Course review is not ready</h2>
              <p className="mt-1">{graphData.unavailableReason}</p>
              <p className="mt-1 text-sm">Do not substitute problem families or lesson objectives for approved mastery skills.</p>
            </div>
          </section>
        ) : (
          <div className="mt-5 grid gap-5 xl:grid-cols-[18rem_minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
            <aside className="self-start border border-[#C9C4B5] bg-[#EEEADF] xl:sticky xl:top-4">
              <div className="border-b border-[#C9C4B5] p-4">
                <h2 className="font-serif text-xl">{graphData.courseLabel}</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-xs font-semibold text-[#365451]">
                    Module or unit
                    <select
                      value={activeModule ?? ''}
                      onChange={(event) => {
                        setSelectedModule(event.target.value);
                        setSelectedLesson(null);
                        setSelectedExampleId(null);
                        setPdfSelection(null);
                        setState((current) => ({ ...newHarnessState(), mode: current.mode }));
                      }}
                      className="mt-1 block w-full border border-[#8A958E] bg-white p-2 text-sm"
                    >
                      {modules.map((module) => <option key={module} value={module}>{module}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-[#365451]">
                    Lesson
                    <select
                      value={activeLesson ?? ''}
                      onChange={(event) => {
                        setSelectedLesson(event.target.value);
                        setSelectedExampleId(null);
                        setPdfSelection(null);
                        setState((current) => ({ ...newHarnessState(), mode: current.mode }));
                      }}
                      className="mt-1 block w-full border border-[#8A958E] bg-white p-2 text-sm"
                    >
                      {lessons.map((lesson) => <option key={lesson} value={lesson}>{lesson}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="max-h-[42vh] overflow-auto border-b border-[#C9C4B5] p-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#365451]">Skills</p>
                {lessonSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => {
                      setSelectedExampleId(null);
                      setPdfSelection(null);
                      setState((current) => ({ ...newHarnessState(), selectedNodeId: skill.id, mode: current.mode }));
                    }}
                    aria-pressed={selectedNode?.id === skill.id}
                    className="mb-1 block w-full border-l-4 border-transparent px-2 py-2 text-left aria-pressed:border-[#C98A1A] aria-pressed:bg-white"
                  >
                    <span className="block text-sm font-semibold">{skill.title}</span>
                    <span className="mt-1 block break-all font-mono text-[10px] text-[#526764]">{skill.id}</span>
                    {isSkillApproved(courseReviews[skill.id]) && <span className="mt-1 block text-xs font-semibold text-[#2D7D46]">Approved</span>}
                  </button>
                ))}
              </div>

              <div className="max-h-[34vh] overflow-auto p-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#365451]">Worked examples</p>
                {examples.length === 0 && <p className="px-2 py-3 text-sm text-amber-800">No same-lesson example is available.</p>}
                {examples.map((example) => {
                  const linked = selectedBlueprint?.sourceNodeIds.includes(example.id) ?? false;
                  return (
                    <button
                      key={example.id}
                      type="button"
                      onClick={() => {
                        setSelectedExampleId(example.id);
                        setPdfSelection(null);
                      }}
                      aria-pressed={selectedExample?.id === example.id}
                      className="mb-1 block w-full border-l-4 border-transparent px-2 py-2 text-left aria-pressed:border-[#2D7D46] aria-pressed:bg-white"
                    >
                      <span className="block text-sm font-semibold">{example.title}</span>
                      <span className="mt-1 block text-xs text-[#526764]">{linked ? 'Linked source' : 'Same-lesson candidate'}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <SourcePagePanel
              example={selectedExample}
              documents={moduleDocuments}
              documentKey={activeDocumentKey}
              page={activePdfPage}
              hasExactPageReference={exactPdfReference !== null}
              decision={selectedExample ? selectedReview?.sourceAlignments[selectedExample.id] : undefined}
              onDocumentChange={(key) => {
                setPdfSelection({ subjectId: pdfSubjectId, documentKey: key, page: 1 });
              }}
              onPageChange={(page) => setPdfSelection({
                subjectId: pdfSubjectId,
                documentKey: activeDocumentKey ?? moduleDocuments[0]?.key ?? '',
                page,
              })}
              onDecisionChange={updateSourceDecision}
            />

            <section className="min-w-0 self-start border border-[#C9C4B5] bg-[#FDFCF5] xl:sticky xl:top-4">
              <div className="border-b border-[#C9C4B5] bg-[#EEEADF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#365451]">Mastery skill</p>
                <h2 className="mt-1 font-serif text-xl">{selectedNode?.title ?? 'No skill is available'}</h2>
                {selectedNode && <code className="mt-1 block break-all text-xs text-[#365451]">{selectedNode.id}</code>}
              </div>

              <div className="border-b border-[#C9C4B5] p-2">
                <div role="tablist" aria-label="Skill modality" className="grid grid-cols-3 gap-1">
                  {([
                    ['worked_example', 'Worked'],
                    ['guided_practice', 'Guided'],
                    ['independent_practice', 'Independent'],
                  ] as Array<[PracticeMode, string]>).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      role="tab"
                      aria-selected={state.mode === mode}
                      onClick={() => setState((current) => current.mode === mode
                        ? current
                        : {
                          ...current,
                          mode,
                          generatorOutput: null,
                          generatorError: null,
                          lastSubmission: null,
                        })}
                      className="border border-[#8A958E] px-2 py-2 text-xs font-semibold aria-selected:bg-[#0A1C1A] aria-selected:text-white"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[72vh] space-y-5 overflow-auto p-4">
                <RendererPreview
                  state={effectiveState}
                  selectedNode={selectedNode}
                  activity={selectedActivity}
                  onIntercept={handleSubmission}
                />
                {selectedNode && (
                  <ReviewDecisionControls
                    label={decisionLabel(state.mode)}
                    decision={selectedReview?.[state.mode]}
                    approvalDisabledReason={studentPreviewProblem?.summary}
                    onChange={updateModalityDecision}
                  />
                )}
                <BlueprintSpecPanel blueprint={selectedBlueprint} mode={state.mode} />

                {state.mode === 'independent_practice' && (
                  <details className="border border-[#8A958E] bg-[#EEEADF] text-[#0A1C1A]">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                      Generator diagnostics
                    </summary>
                    <div className="border-t border-[#C9C4B5] p-4">
                    <GeneratorPanel
                      state={effectiveState}
                      selectedNode={selectedNode}
                      selectedBlueprint={selectedBlueprint}
                      onUpdateState={updateState}
                    />
                    </div>
                  </details>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
