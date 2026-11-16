import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { KnowledgeBlueprint, ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { fetchGraphData } from '@/app/(dev)/blueprint-qa/data';
import { BlueprintSpecPanel } from '@/app/(dev)/blueprint-qa/components/BlueprintSpecPanel';
import { ReviewDecisionControls } from '@/app/(dev)/blueprint-qa/components/ReviewDecisionControls';
import { SourcePagePanel } from '@/app/(dev)/blueprint-qa/components/SourcePagePanel';
import { GET as getCurriculumSource } from '@/app/api/dev/curriculum-source/route';
import { GET as getCurriculumGraph } from '@/app/api/dev/curriculum-graph/route';
import {
  buildReviewExport,
  compareCurriculumNodes,
  getWorkedExamplesForSkill,
  isReviewDecisionComplete,
  resolvePdfReference,
} from '@/app/(dev)/blueprint-qa/review-utils';
import type {
  ReviewDecision,
  ReviewStore,
  SkillNode,
  SourceDocument,
} from '@/app/(dev)/blueprint-qa/types';

function makeNode(overrides: Partial<SkillNode>): SkillNode {
  return {
    id: 'math.im3.skill.1.1.sample',
    kind: 'skill',
    title: 'Sample skill',
    domain: 'math.im3',
    reviewStatus: 'draft',
    metadata: { course: 'im3', module: '1', lesson: '1' },
    ...overrides,
  };
}

const completeBlueprint: KnowledgeBlueprint = {
  nodeId: 'math.im3.skill.1.1.sample',
  sourceNodeIds: ['math.im3.example.1.1.001'],
  alignmentNodeIds: [],
  rendererKey: 'graphing-explorer',
  rendererModeMap: {},
  workedExampleSpec: {
    prompt: 'Graph the source function.',
    givens: ['f(x) = x²'],
    target: { vertex: '(0, 0)' },
    steps: [{ description: 'Find the vertex.', result: '(0, 0)' }],
    explanation: 'The parent function has its vertex at the origin.',
  },
  guidedPracticeSpec: {
    scaffoldedPrompt: 'Graph a translated function.',
    stepPrompts: ['Find the vertex.'],
    hints: ['Use vertex form.'],
    checksPerStep: [{ check: 'Vertex is correct.' }],
    revealPolicy: 'after_attempt',
  },
  independentPracticeSpec: {
    variantParameters: { shift: { type: 'integer', min: -5, max: 5 } },
    answerSchema: { vertex: 'ordered_pair' },
    gradingRules: [{ partId: 'vertex', ruleType: 'exact_match', maxScore: 1 }],
    replayPolicy: 'unique_seeds',
  },
  generatorKey: 'quadratic-graph-analysis',
  reviewStatus: 'draft',
  metadata: { course: 'im3', module: '1', lesson: '1' },
};

const completeActivity: ProjectedActivity = {
  stableActivityId: 'math.im3.skill.1.1.sample.worked_example',
  nodeId: 'math.im3.skill.1.1.sample',
  sourceNodeIds: ['math.im3.example.1.1.001'],
  rendererKey: 'graphing-explorer',
  mode: 'worked_example',
  alignmentNodeIds: [],
  props: { equation: 'y = x^2' },
  gradingConfig: {},
  srsEligible: false,
};

describe('curriculum review graph loading', () => {
  it.each(['im1', 'im2', 'im3', 'precalc'] as const)(
    'loads the existing %s graph and source-document descriptions',
    async (courseKey) => {
      const request = vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.includes('artifact=nodes')) {
          return new Response(JSON.stringify({ nodes: [
            makeNode({ kind: 'skill' }),
            makeNode({ id: 'example', kind: 'worked_example' }),
          ] }));
        }
        if (url.includes('artifact=activities')) {
          return new Response(JSON.stringify({ activities: [completeActivity] }));
        }
        return new Response(JSON.stringify({ blueprints: [completeBlueprint] }));
      });
      const data = await fetchGraphData(courseKey, request as typeof fetch);

      expect(data.courseKey).toBe(courseKey);
      expect(data.nodes.some((node) => node.kind === 'skill')).toBe(true);
      expect(data.nodes.some((node) => node.kind === 'worked_example')).toBe(true);
      expect(data.activities).toEqual([completeActivity]);
      expect(data.sourceDocuments.length).toBeGreaterThan(0);
      expect(request).toHaveBeenCalledWith(
        `/api/dev/curriculum-graph?course=${courseKey}&artifact=nodes`,
      );
      expect(request).toHaveBeenCalledWith(
        `/api/dev/curriculum-graph?course=${courseKey}&artifact=blueprints`,
      );
      expect(request).toHaveBeenCalledWith(
        `/api/dev/curriculum-graph?course=${courseKey}&artifact=activities`,
      );
    },
  );

  it('loads the Business Math capability graph through the graph route', async () => {
    const request = vi.fn(async (input: string | URL | Request) => {
      const artifact = new URL(String(input), 'http://localhost').searchParams.get('artifact');
      return Response.json({ [artifact!]: artifact === 'nodes' ? [makeNode({ id: 'math.bm2.skill.1.1', domain: 'math.bm2' })] : [] });
    });
    const data = await fetchGraphData('bm2', request as typeof fetch);
    expect(data.nodes[0].domain).toBe('math.bm2');
    expect(data.unavailableReason).toBeUndefined();
    expect(request).toHaveBeenCalledWith('/api/dev/curriculum-graph?course=bm2&artifact=nodes');
  });

  it.each(['im1', 'im2', 'im3', 'precalc', 'bm2'] as const)(
    'allowlists the three existing %s graph documents in development',
    async (courseKey) => {
      vi.stubEnv('NODE_ENV', 'development');
      for (const artifact of ['nodes', 'blueprints', 'activities']) {
        const response = await getCurriculumGraph(
          new Request(`http://localhost/api/dev/curriculum-graph?course=${courseKey}&artifact=${artifact}`),
        );
        expect(response.status).toBe(307);
        const expectedPath = artifact === 'activities'
          ? 'projection/practice-v1-activity-map.json'
          : `${artifact}.json`;
        expect(response.headers.get('location')).toMatch(
          new RegExp(`/\\@fs/.*/apps/.*/curriculum/skill-graph/${expectedPath.replaceAll('.', '\\.')}$`),
        );
      }
      vi.unstubAllEnvs();
    },
  );

  it('rejects unknown and production graph document requests', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const unknown = await getCurriculumGraph(
      new Request('http://localhost/api/dev/curriculum-graph?course=im3&artifact=../../secret'),
    );
    vi.stubEnv('NODE_ENV', 'production');
    const production = await getCurriculumGraph(
      new Request('http://localhost/api/dev/curriculum-graph?course=im3&artifact=nodes'),
    );

    expect(unknown.status).toBe(404);
    expect(production.status).toBe(404);
  });
});

describe('curriculum order and source matching', () => {
  it('sorts numeric modules, lessons, and example numbers', () => {
    const nodes = [
      makeNode({ id: 'lesson-10', metadata: { module: '1', lesson: '10', exampleNumber: 1 } }),
      makeNode({ id: 'module-2', metadata: { module: '2', lesson: '1', exampleNumber: 1 } }),
      makeNode({ id: 'example-2', metadata: { module: '1', lesson: '2', exampleNumber: 2 } }),
      makeNode({ id: 'example-1', metadata: { module: '1', lesson: '2', exampleNumber: 1 } }),
    ];

    expect(nodes.sort(compareCurriculumNodes).map((node) => node.id)).toEqual([
      'example-1',
      'example-2',
      'lesson-10',
      'module-2',
    ]);
  });

  it('lists linked examples first and keeps same-lesson examples in example order', () => {
    const skill = makeNode({});
    const nodes = [
      skill,
      makeNode({
        id: 'example-2',
        kind: 'worked_example',
        metadata: { module: '1', lesson: '1', exampleNumber: 2 },
      }),
      makeNode({
        id: 'example-1',
        kind: 'worked_example',
        metadata: { module: '1', lesson: '1', exampleNumber: 1 },
      }),
      makeNode({
        id: 'other-lesson',
        kind: 'worked_example',
        metadata: { module: '1', lesson: '2', exampleNumber: 1 },
      }),
    ];

    expect(getWorkedExamplesForSkill(nodes, skill, ['example-2']).map((node) => node.id)).toEqual([
      'example-2',
      'example-1',
    ]);
  });

  it('resolves only an allowlisted PDF reference with an exact positive page', () => {
    const documents: SourceDocument[] = [
      {
        key: 'im3-module-1',
        title: 'IM3 Module 1',
        courseKey: 'im3',
        module: '1',
        repositoryPath: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf',
      },
    ];
    const example = makeNode({
      kind: 'worked_example',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=4',
      ],
    });

    expect(resolvePdfReference(example, documents)).toEqual({
      documentKey: 'im3-module-1',
      page: 4,
      sourceRef: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=4',
    });
    expect(resolvePdfReference({ ...example, sourceRefs: ['../../secret.pdf#page=4'] }, documents)).toBeNull();
    expect(resolvePdfReference({ ...example, sourceRefs: [documents[0].repositoryPath] }, documents)).toBeNull();
  });
});

describe('curriculum PDF source', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows the original PDF and an explicit missing-page state', () => {
    const document: SourceDocument = {
      key: 'im3-module-1',
      title: 'IM3 Module 1',
      courseKey: 'im3',
      module: '1',
      repositoryPath: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf',
    };
    render(
      <SourcePagePanel
        example={makeNode({ kind: 'worked_example' })}
        documents={[document]}
        documentKey={document.key}
        page={4}
        hasExactPageReference={false}
        decision={undefined}
        onDocumentChange={vi.fn()}
        onPageChange={vi.fn()}
        onDecisionChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Page reference missing')).toBeInTheDocument();
    expect(screen.getByTitle('IM3 Module 1 page 4')).toHaveAttribute(
      'src',
      '/api/dev/curriculum-source?document=im3-module-1#page=4&zoom=page-width',
    );
  });

  it('serves only an allowlisted PDF location in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const response = await getCurriculumSource(
      new Request('http://localhost/api/dev/curriculum-source?document=im3-module-1'),
    );
    const rejected = await getCurriculumSource(
      new Request('http://localhost/api/dev/curriculum-source?document=../../secret'),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toMatch(
      /\/\@fs\/.*\/apps\/integrated-math-3\/curriculum\/IM3-reveal-module-1\.pdf$/,
    );
    expect(rejected.status).toBe(404);
  });

  it('does not expose curriculum PDFs outside development', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const response = await getCurriculumSource(
      new Request('http://localhost/api/dev/curriculum-source?document=im3-module-1'),
    );

    expect(response.status).toBe(404);
  });
});

describe('blueprint modality review', () => {
  it('keeps authored math exact in the secondary stored-fields panel', () => {
    const blueprint: KnowledgeBlueprint = {
      ...completeBlueprint,
      workedExampleSpec: {
        ...completeBlueprint.workedExampleSpec!,
        prompt: '**Graph** the function f(x) = x^2 - 4.',
      },
    };

    render(<BlueprintSpecPanel blueprint={blueprint} mode="worked_example" />);

    const rawFields = screen.getByText('Stored blueprint fields').closest('details');
    expect(rawFields).toHaveTextContent('f(x) = x^2 - 4');
    expect(rawFields).not.toHaveTextContent('f(x) = x² - 4');
    expect(within(rawFields!).getByText(/f\(x\) = x\^2 - 4/).closest('pre')).toHaveClass(
      'bg-[#0A1C1A]',
      'text-[#FDFCF5]',
    );
  });

  it('shows the exact stored fields for each modality', () => {
    const { rerender } = render(<BlueprintSpecPanel blueprint={completeBlueprint} mode="worked_example" />);
    expect(screen.getByText(/Graph the source function\./)).toBeInTheDocument();
    expect(screen.getByText(/Find the vertex\./)).toBeInTheDocument();

    rerender(<BlueprintSpecPanel blueprint={completeBlueprint} mode="guided_practice" />);
    expect(screen.getByText(/Graph a translated function\./)).toBeInTheDocument();
    expect(screen.getByText(/Use vertex form\./)).toBeInTheDocument();

    rerender(<BlueprintSpecPanel blueprint={completeBlueprint} mode="independent_practice" />);
    expect(screen.getByText(/unique_seeds/)).toBeInTheDocument();
    expect(screen.getByText(/shift/)).toBeInTheDocument();
  });

  it('does not invent content for a missing modality', () => {
    render(
      <BlueprintSpecPanel
        blueprint={{ ...completeBlueprint, guidedPracticeSpec: undefined }}
        mode="guided_practice"
      />,
    );

    expect(screen.getByText('Missing')).toBeInTheDocument();
    expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument();
  });
});

describe('review decisions', () => {
  function DecisionHarness() {
    const [decision, setDecision] = useState<ReviewDecision | undefined>();
    return (
      <ReviewDecisionControls
        label="Guided practice"
        decision={decision}
        onChange={setDecision}
      />
    );
  }

  it('requires a note when the reviewer selects Needs fix', () => {
    render(<DecisionHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Needs fix' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Add a fix note.');

    fireEvent.change(screen.getByLabelText('Guided practice fix note'), {
      target: { value: 'The first hint gives away the answer.' },
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('blocks approval when the exact student view is unavailable', () => {
    render(
      <ReviewDecisionControls
        label="Worked example"
        decision={undefined}
        approvalDisabledReason="The projected activity props are invalid."
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Approved' })).toBeDisabled();
    expect(screen.getByText('The projected activity props are invalid.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Needs fix' })).toBeEnabled();
  });

  it('treats only approved or explained needs-fix decisions as complete', () => {
    expect(isReviewDecisionComplete({ status: 'approved', note: '' })).toBe(true);
    expect(isReviewDecisionComplete({ status: 'needs_fix', note: '' })).toBe(false);
    expect(isReviewDecisionComplete({ status: 'needs_fix', note: 'Repair the prompt.' })).toBe(true);
  });

  it('builds a deterministic export without a hash or provenance field', () => {
    const store: ReviewStore = {
      'math.im3.skill.1.1.sample': {
        sourceAlignments: {
          'math.im3.example.1.1.001': { status: 'approved', note: '' },
        },
        worked_example: { status: 'approved', note: '' },
        guided_practice: { status: 'needs_fix', note: 'Reduce the first hint.' },
        independent_practice: { status: 'approved', note: '' },
      },
    };

    expect(buildReviewExport('im3', store)).toEqual({
      version: 1,
      courseKey: 'im3',
      skills: [
        {
          skillNodeId: 'math.im3.skill.1.1.sample',
          sourceAlignments: [
            {
              sourceNodeId: 'math.im3.example.1.1.001',
              status: 'approved',
              note: '',
            },
          ],
          modalities: {
            worked_example: { status: 'approved', note: '' },
            guided_practice: { status: 'needs_fix', note: 'Reduce the first hint.' },
            independent_practice: { status: 'approved', note: '' },
          },
        },
      ],
    });
  });
});
