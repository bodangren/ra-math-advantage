import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ delivery: 'needs_acknowledgement', source: null as null | Record<string, unknown>, lesson: null as null | Record<string, unknown>, saved: null as null | Record<string, unknown> }));
vi.mock('@/lib/auth/server', () => ({ requireStudentSessionClaims: vi.fn(async () => ({ sub: 'profiles:learner', role: 'student' })) }));
vi.mock('@/lib/convex/server', () => ({
  internal: { course: { getLesson: 'lesson' }, activities: { getApprovedTopic11WorkedSource: 'source', getTopic11LearnerDeliveryState: 'delivery', getApprovedPrecalculusPilot: 'pilot', getSavedTopic11Practice: 'saved' } },
  fetchInternalQuery: vi.fn(async (ref: string) => ref === 'lesson' ? state.lesson : ref === 'source' ? state.source : ref === 'delivery' ? state.delivery : ref === 'saved' ? state.saved : []),
}));
vi.mock('@/components/student/PrecalculusTopic11DailyCurriculumPilot', () => ({ PrecalculusTopic11DailyCurriculumPilot: () => <div data-testid="worked" /> }));
vi.mock('@/components/student/PrecalculusMasteryAdvantagePilot', () => ({ PrecalculusMasteryAdvantagePilot: () => <div data-testid="practice" />, SavedPrecalculusPracticeResult: ({ result }: { result: { score: number } }) => <div>Historical score {result.score}</div> }));
vi.mock('@/components/course/LessonWrittenResponse', () => ({ LessonWrittenResponse: ({ content }: { content: string }) => <p>{content}</p> }));
vi.mock('@/components/course/LessonResponse', () => ({ LessonResponse: () => <div data-testid="generic-response" /> }));
const exact = { activityId: 'activities:worked', stableActivityId: 'topic11-worked', componentKey: 'precalculus-topic-1-1-daily-curriculum', props: {} };
function lesson(sections: Array<Record<string, unknown>>, responses: unknown[] = []) { return { title: 'Rates', phases: [{ _id: 'phase:4', title: 'Worked example', sections, responses }] }; }
function activity(content: Record<string, unknown>) { return { _id: 'section:1', sectionType: 'activity', content }; }
describe('selected Topic 1.1 lesson page', () => {
  beforeEach(() => { state.delivery = 'needs_acknowledgement'; state.source = exact; state.saved = null; state.lesson = lesson([activity({ activityId: exact.activityId, componentKey: exact.componentKey })]); });
  it('renders exact Worked content and suppresses only its duplicate generic response', async () => {
    const Page = (await import('@/app/student/lessons/[topic]/page')).default;
    render(await Page({ params: Promise.resolve({ topic: '1.1' }) }));
    expect(screen.getByTestId('worked')).toBeInTheDocument(); expect(screen.queryByTestId('generic-response')).not.toBeInTheDocument();
  });
  it('keeps the ordinary response for mixed, unrelated, null-source, wrong-ID, and wrong-component phases', async () => {
    const Page = (await import('@/app/student/lessons/[topic]/page')).default;
    for (const [source, sections] of [[exact,[activity({ activityId: exact.activityId, componentKey: exact.componentKey }),{_id:'text:1',sectionType:'text',content:{markdown:'Explain.'}}]],[null,[activity({})]],[exact,[activity({ activityId:'other',componentKey:exact.componentKey })]],[exact,[activity({ activityId:exact.activityId,componentKey:'other' })]]] as const) {
      state.source=source; state.lesson=lesson([...sections]); const view=render(await Page({params:Promise.resolve({topic:'1.1'})})); expect(screen.getByTestId('generic-response')).toBeInTheDocument(); view.unmount();
    }
  });
  it('shows pending state and shows two practice modes only after teacher confirmation', async () => {
    const Page = (await import('@/app/student/lessons/[topic]/page')).default;
    state.delivery='awaiting_teacher_confirmation'; let view=render(await Page({params:Promise.resolve({topic:'1.1'})})); expect(screen.getByRole('status')).toHaveTextContent(/wait for your teacher/i); expect(screen.queryByTestId('practice')).not.toBeInTheDocument(); view.unmount();
    state.delivery='ready_for_practice'; const server = await import('@/lib/convex/server'); vi.mocked(server.fetchInternalQuery).mockImplementation(async (ref: unknown) => ref==='lesson' ? state.lesson : ref==='source' ? state.source : ref==='delivery' ? state.delivery : ref === 'saved' ? state.saved : [{mode:'guided_practice',stableActivityId:'g',props:{}},{mode:'independent_practice',stableActivityId:'i',props:{}}] as never); view=render(await Page({params:Promise.resolve({topic:'1.1'})})); expect(screen.getAllByTestId('practice')).toHaveLength(2); view.unmount();
  });
  it('shows historical practice when current practice is unavailable', async () => {
    state.delivery = 'awaiting_teacher_confirmation';
    state.saved = { guidedPractice: { mode: 'guided_practice', submissionId: 'submission:saved', score: 2 }, independentPractice: null };
    const Page = (await import('@/app/student/lessons/[topic]/page')).default;
    render(await Page({ params: Promise.resolve({ topic: '1.1' }) }));
    expect(screen.getByText('Historical score 2')).toBeInTheDocument();
    expect(screen.queryByTestId('practice')).not.toBeInTheDocument();
  });
});
