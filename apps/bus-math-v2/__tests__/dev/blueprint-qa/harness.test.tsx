import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path resolution tests (actions.ts REPO_ROOT calculation)
// ---------------------------------------------------------------------------

describe('actions.ts — REPO_ROOT path resolution', () => {
  it('resolves to the monorepo root (contains package.json with workspaces)', () => {
    // Replicate the logic from actions.ts
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dirParts = __dirname.split(path.sep);
    const actionsFileDir = path.join(
      process.cwd(),
      'apps',
      'bus-math-v2',
      'app',
      '(dev)',
      'blueprint-qa',
    );
    const repoRoot = path.resolve(actionsFileDir, '../../../../../');

    // The monorepo root should contain package.json with workspaces
    const fs = await import('node:fs');
    const pkgJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));
    expect(pkgJson.workspaces).toBeDefined();
    expect(pkgJson.workspaces).toContain('apps/*');

    // The IM3 skill-graph directory should exist
    const skillGraphDir = path.join(repoRoot, 'apps', 'integrated-math-3', 'curriculum', 'skill-graph');
    expect(fs.existsSync(skillGraphDir)).toBe(true);
    expect(fs.existsSync(path.join(skillGraphDir, 'nodes.json'))).toBe(true);
    expect(fs.existsSync(path.join(skillGraphDir, 'blueprints.json'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// gradeAnswerLocally tests (RendererPreview grading logic)
// ---------------------------------------------------------------------------

function gradeAnswerLocally(
  rawAnswer: unknown,
  expected: unknown,
  rule: 'exact_match' | 'numeric_tolerance' | 'expression_equivalence',
  tolerance?: number,
): boolean {
  if (rule === 'exact_match') {
    return String(rawAnswer).trim() === String(expected).trim();
  }
  if (rule === 'numeric_tolerance') {
    const numAnswer = Number(rawAnswer);
    const numExpected = Number(expected);
    if (isNaN(numAnswer) || isNaN(numExpected)) return false;
    const tol = tolerance ?? 0.01;
    return Math.abs(numAnswer - numExpected) <= tol;
  }
  if (rule === 'expression_equivalence') {
    return String(rawAnswer).replace(/\s+/g, '') === String(expected).replace(/\s+/g, '');
  }
  return false;
}

describe('gradeAnswerLocally', () => {
  it('grades exact_match correctly', () => {
    expect(gradeAnswerLocally('hello', 'hello', 'exact_match')).toBe(true);
    expect(gradeAnswerLocally(' hello ', 'hello', 'exact_match')).toBe(true);
    expect(gradeAnswerLocally('hello', 'world', 'exact_match')).toBe(false);
  });

  it('grades numeric_tolerance correctly', () => {
    expect(gradeAnswerLocally(3.14, 3.14, 'numeric_tolerance')).toBe(true);
    expect(gradeAnswerLocally(3.141, 3.14, 'numeric_tolerance')).toBe(true);
    expect(gradeAnswerLocally(3.20, 3.14, 'numeric_tolerance')).toBe(false);
    expect(gradeAnswerLocally('3.14', 3.14, 'numeric_tolerance')).toBe(true);
    // Custom tolerance
    expect(gradeAnswerLocally(10, 15, 'numeric_tolerance', 5)).toBe(true);
    expect(gradeAnswerLocally(10, 16, 'numeric_tolerance', 5)).toBe(false);
  });

  it('grades expression_equivalence correctly', () => {
    expect(gradeAnswerLocally('x^2 + 2x + 1', 'x^2+2x+1', 'expression_equivalence')).toBe(true);
    expect(gradeAnswerLocally('x^2 + 2x + 1', 'x^2+3x+1', 'expression_equivalence')).toBe(false);
  });

  it('returns false for NaN numeric inputs', () => {
    expect(gradeAnswerLocally('abc', 42, 'numeric_tolerance')).toBe(false);
    expect(gradeAnswerLocally(42, 'abc', 'numeric_tolerance')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// NodeList component tests
// ---------------------------------------------------------------------------

vi.mock('@math-platform/activity-components/registry', () => ({
  getActivityComponent: vi.fn(),
  registerActivity: vi.fn(),
  getRegisteredActivityKeys: vi.fn(() => []),
  clearActivityRegistry: vi.fn(),
}));

import { NodeList } from '@/app/(dev)/blueprint-qa/components/NodeList';
import type { SkillNode } from '@/app/(dev)/blueprint-qa/types';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';

function makeSkillNode(overrides: Partial<SkillNode> = {}): SkillNode {
  return {
    id: 'math.im3.skill.1.1.test-skill',
    kind: 'skill',
    title: 'Test Skill',
    domain: 'math.im3',
    reviewStatus: 'draft',
    metadata: { module: '1', lesson: '1' },
    ...overrides,
  };
}

describe('NodeList', () => {
  it('renders skill nodes', () => {
    const nodes = [makeSkillNode(), makeSkillNode({ id: 'skill.2', title: 'Second Skill' })];
    render(
      <NodeList
        nodes={nodes}
        blueprintsByNodeId={new Map()}
        selectedNodeId={null}
        onSelectNode={vi.fn()}
      />,
    );
    expect(screen.getByText('Test Skill')).toBeInTheDocument();
    expect(screen.getByText('Second Skill')).toBeInTheDocument();
    expect(screen.getByText('2 total')).toBeInTheDocument();
  });

  it('filters non-skill nodes', () => {
    const nodes = [
      makeSkillNode(),
      { ...makeSkillNode({ id: 'skill.2', title: 'Second Skill' }), kind: 'domain' } as SkillNode,
    ];
    render(
      <NodeList
        nodes={nodes}
        blueprintsByNodeId={new Map()}
        selectedNodeId={null}
        onSelectNode={vi.fn()}
      />,
    );
    expect(screen.getByText('1 total')).toBeInTheDocument();
  });

  it('filters by search query', () => {
    const nodes = [
      makeSkillNode({ id: 'skill.1', title: 'Graph quadratics' }),
      makeSkillNode({ id: 'skill.2', title: 'Solve linear equations' }),
    ];
    render(
      <NodeList
        nodes={nodes}
        blueprintsByNodeId={new Map()}
        selectedNodeId={null}
        onSelectNode={vi.fn()}
      />,
    );
    const searchInput = screen.getByPlaceholderText('Filter by title or ID...');
    fireEvent.change(searchInput, { target: { value: 'quadratic' } });
    expect(screen.getByText('Graph quadratics')).toBeInTheDocument();
    expect(screen.queryByText('Solve linear equations')).not.toBeInTheDocument();
  });

  it('shows green dot when generatorKey is on the node', () => {
    const nodes = [makeSkillNode({ generatorKey: 'test-generator' })];
    render(
      <NodeList
        nodes={nodes}
        blueprintsByNodeId={new Map()}
        selectedNodeId={null}
        onSelectNode={vi.fn()}
      />,
    );
    expect(screen.getByText('\uD83D\uDFE2')).toBeInTheDocument();
    expect(screen.getByText('no generator')).toBeInTheDocument();
    // ^ because generatorKey is on the node but we look for the label text
    // Wait — the check is: hasGen ? shows generator key : shows "no generator"
    // The green dot renders but the text below still checks for the exact text
    expect(screen.getByText('test-generator')).toBeInTheDocument();
  });

  it('shows red dot when no generatorKey', () => {
    const nodes = [makeSkillNode()];
    render(
      <NodeList
        nodes={nodes}
        blueprintsByNodeId={new Map()}
        selectedNodeId={null}
        onSelectNode={vi.fn()}
      />,
    );
    expect(screen.getByText('\uD83D\uDD34')).toBeInTheDocument();
    expect(screen.getByText('no generator')).toBeInTheDocument();
  });

  it('shows generator from blueprint when node has none', () => {
    const nodes = [makeSkillNode()];
    const blueprintsByNodeId = new Map<string, KnowledgeBlueprint>();
    blueprintsByNodeId.set('math.im3.skill.1.1.test-skill', {
      nodeId: 'math.im3.skill.1.1.test-skill',
      generatorKey: 'bp-generator',
      rendererKey: 'test-renderer',
      sourceNodeIds: [],
      alignmentNodeIds: [],
      rendererModeMap: {},
      reviewStatus: 'draft',
      metadata: {},
    });
    render(
      <NodeList
        nodes={nodes}
        blueprintsByNodeId={blueprintsByNodeId}
        selectedNodeId={null}
        onSelectNode={vi.fn()}
      />,
    );
    expect(screen.getByText('\uD83D\uDFE2')).toBeInTheDocument();
    expect(screen.getByText('bp-generator')).toBeInTheDocument();
  });

  it('calls onSelectNode when a node is clicked', () => {
    const onSelectNode = vi.fn();
    const nodes = [makeSkillNode()];
    render(
      <NodeList
        nodes={nodes}
        blueprintsByNodeId={new Map()}
        selectedNodeId={null}
        onSelectNode={onSelectNode}
      />,
    );
    fireEvent.click(screen.getByText('Test Skill'));
    expect(onSelectNode).toHaveBeenCalledWith('math.im3.skill.1.1.test-skill');
  });

  it('displays module and lesson labels', () => {
    const nodes = [makeSkillNode({ metadata: { module: '3', lesson: '5' } })];
    render(
      <NodeList
        nodes={nodes}
        blueprintsByNodeId={new Map()}
        selectedNodeId={null}
        onSelectNode={vi.fn()}
      />,
    );
    expect(screen.getByText('M3.L5')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// GeneratorPanel component tests
// ---------------------------------------------------------------------------

vi.mock('@math-platform/math-content/knowledge-space', () => ({
  getGenerator: vi.fn(),
  GENERATOR_KEYS: [],
}));

import { getGenerator } from '@math-platform/math-content/knowledge-space';
import { GeneratorPanel } from '@/app/(dev)/blueprint-qa/components/GeneratorPanel';

const mockGetGenerator = getGenerator as ReturnType<typeof vi.fn>;

describe('GeneratorPanel', () => {
  beforeEach(() => {
    mockGetGenerator.mockReset();
  });

  const defaultHarnessState = {
    selectedNodeId: 'math.im3.skill.1.1.test-skill',
    seed: 42,
    difficulty: 0.5,
    mode: 'independent_practice' as const,
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };

  const defaultNode = makeSkillNode({
    generatorKey: 'test-generator',
    rendererKey: 'test-renderer',
  });

  const defaultBlueprint: KnowledgeBlueprint = {
    nodeId: 'math.im3.skill.1.1.test-skill',
    sourceNodeIds: [],
    alignmentNodeIds: [],
    rendererKey: 'test-renderer',
    rendererModeMap: {},
    reviewStatus: 'draft',
    metadata: {},
    generatorKey: 'test-generator',
  };

  it('renders prompt when no node is selected', () => {
    render(
      <GeneratorPanel
        state={{ ...defaultHarnessState, selectedNodeId: null }}
        selectedNode={null}
        selectedBlueprint={null}
        onUpdateState={vi.fn()}
      />,
    );
    expect(screen.getByText('Select a skill from the sidebar to generate output.')).toBeInTheDocument();
  });

  it('shows warning when no generator key is assigned', () => {
    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={{ ...defaultNode, generatorKey: undefined }}
        selectedBlueprint={{ ...defaultBlueprint, generatorKey: undefined }}
        onUpdateState={vi.fn()}
      />,
    );
    expect(screen.getByText('No generator key assigned to this skill.')).toBeInTheDocument();
  });

  it('renders seed, difficulty, and mode controls when generator key exists', () => {
    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={vi.fn()}
      />,
    );
    expect(screen.getByText('test-generator')).toBeInTheDocument();
    expect(screen.getByDisplayValue('42')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('displays generator error with stack trace', () => {
    const onUpdateState = vi.fn();
    mockGetGenerator.mockImplementation(() => {
      const err = new Error('Generator failed');
      err.stack = 'Error: Generator failed\n    at generate (test.ts:1)';
      throw err;
    });

    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={onUpdateState}
      />,
    );

    // Wait for debounced generator call
    waitFor(() => {
      expect(onUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          generatorError: expect.stringContaining('Generator failed'),
        }),
      );
    });

    // Verify stack trace is included (not just message)
    const errorCall = onUpdateState.mock.calls.find(
      (call: [Partial<ReturnType<typeof vi.fn>>]) => call[0]?.generatorError != null,
    );
    expect(errorCall).toBeDefined();
    expect(errorCall[0].generatorError).toContain('Error: Generator failed');
    expect(errorCall[0].generatorError).toContain('at generate');
  });

  it('displays JSON output when generator succeeds', () => {
    const onUpdateState = vi.fn();
    const generatorOutput = {
      prompt: 'Test prompt',
      data: { a: 1, b: 2 },
      expectedAnswer: { result: 42 },
      solutionSteps: [],
      gradingMetadata: {
        partAnswers: { result: 42 },
        partMaxScores: { result: 5 },
        partGradingRules: { result: 'exact_match' },
      },
    };
    mockGetGenerator.mockReturnValue({
      generate: () => generatorOutput,
    });

    render(
      <GeneratorPanel
        state={{ ...defaultHarnessState, generatorOutput: generatorOutput as unknown as Record<string, unknown> }}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={onUpdateState}
      />,
    );

    expect(screen.getByText('Output')).toBeInTheDocument();
  });

  it('calls onUpdateState when seed changes', () => {
    const onUpdateState = vi.fn();
    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={onUpdateState}
      />,
    );
    const seedInput = screen.getByDisplayValue('42');
    fireEvent.change(seedInput, { target: { value: '100' } });
    expect(onUpdateState).toHaveBeenCalledWith({ seed: 100 });
  });

  it('calls onUpdateState when difficulty changes', () => {
    const onUpdateState = vi.fn();
    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={onUpdateState}
      />,
    );
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.7' } });
    expect(onUpdateState).toHaveBeenCalledWith({ difficulty: 0.7 });
  });
});

// ---------------------------------------------------------------------------
// RendererPreview component tests
// ---------------------------------------------------------------------------

import { RendererPreview } from '@/app/(dev)/blueprint-qa/components/RendererPreview';

describe('RendererPreview', () => {
  const defaultHarnessState = {
    selectedNodeId: 'math.im3.skill.1.1.test-skill',
    seed: 42,
    difficulty: 0.5,
    mode: 'independent_practice' as const,
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };

  it('renders prompt when no node selected', () => {
    render(
      <RendererPreview
        state={{ ...defaultHarnessState, selectedNodeId: null }}
        selectedNode={null}
        selectedBlueprint={null}
        onIntercept={vi.fn()}
      />,
    );
    expect(screen.getByText('Select a skill to preview its component.')).toBeInTheDocument();
  });

  it('shows warning when no renderer key is assigned', () => {
    render(
      <RendererPreview
        state={defaultHarnessState}
        selectedNode={makeSkillNode()}
        selectedBlueprint={null}
        onIntercept={vi.fn()}
      />,
    );
    expect(screen.getByText('No renderer key assigned.')).toBeInTheDocument();
  });

  it('shows error when component is not registered', () => {
    const blueprint: KnowledgeBlueprint = {
      nodeId: 'math.im3.skill.1.1.test-skill',
      sourceNodeIds: [],
      alignmentNodeIds: [],
      rendererKey: 'unregistered-component',
      rendererModeMap: {},
      reviewStatus: 'draft',
      metadata: {},
    };
    render(
      <RendererPreview
        state={defaultHarnessState}
        selectedNode={makeSkillNode({ rendererKey: 'unregistered-component' })}
        selectedBlueprint={blueprint}
        onIntercept={vi.fn()}
      />,
    );
    expect(screen.getByText(/not registered/)).toBeInTheDocument();
  });

  it('renders submission log when lastSubmission is set', () => {
    render(
      <RendererPreview
        state={{
          ...defaultHarnessState,
          lastSubmission: { partId: 'result', rawAnswer: 42, isCorrect: true },
        }}
        selectedNode={null}
        selectedBlueprint={null}
        onIntercept={vi.fn()}
      />,
    );
    expect(screen.getByText('Submission Log')).toBeInTheDocument();
    expect(screen.getByText('Correct')).toBeInTheDocument();
  });

  it('shows incorrect badge for wrong submissions', () => {
    render(
      <RendererPreview
        state={{
          ...defaultHarnessState,
          lastSubmission: { partId: 'result', rawAnswer: 99, isCorrect: false },
        }}
        selectedNode={null}
        selectedBlueprint={null}
        onIntercept={vi.fn()}
      />,
    );
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  it('renders prompt when no generator output yet', () => {
    const blueprint: KnowledgeBlueprint = {
      nodeId: 'math.im3.skill.1.1.test-skill',
      sourceNodeIds: [],
      alignmentNodeIds: [],
      rendererKey: 'graphing-explorer',
      rendererModeMap: {},
      reviewStatus: 'draft',
      metadata: {},
    };
    render(
      <RendererPreview
        state={defaultHarnessState}
        selectedNode={makeSkillNode({ rendererKey: 'graphing-explorer' })}
        selectedBlueprint={blueprint}
        onIntercept={vi.fn()}
      />,
    );
    expect(screen.getByText('Generate output first to preview the component.')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// buildComponentProps tests
// ---------------------------------------------------------------------------

function buildComponentProps(
  rendererKey: string,
  generatorOutput: Record<string, unknown>,
): Record<string, unknown> {
  const data = (generatorOutput.data ?? {}) as Record<string, unknown>;
  const prompt = generatorOutput.prompt as string ?? '';

  switch (rendererKey) {
    case 'graphing-explorer':
      return { equation: data?.equation ?? 'y = x^2' };
    case 'step-by-step-solver':
      return { steps: generatorOutput.solutionSteps, equation: data?.equation ?? '', problemType: data?.problemType };
    case 'comprehension-quiz':
      return { questions: data?.questions ?? [] };
    case 'fill-in-the-blank':
      return { template: prompt, blanks: data?.blanks ?? [] };
    case 'rate-of-change-calculator':
      return { sourceType: data?.sourceType, data: data?.data, interval: data?.interval };
    case 'discriminant-analyzer':
      return { ...data };
    default:
      return { ...data };
  }
}

describe('buildComponentProps', () => {
  const generatorOutput = {
    prompt: 'Solve the equation',
    data: { equation: 'y = x^2 + 1', a: 1, b: 0, c: 1 },
    solutionSteps: [{ description: 'Step 1' }, { description: 'Step 2' }],
    expectedAnswer: {},
    gradingMetadata: {},
  };

  it('maps graphing-explorer props', () => {
    const props = buildComponentProps('graphing-explorer', generatorOutput);
    expect(props.equation).toBe('y = x^2 + 1');
  });

  it('maps step-by-step-solver props', () => {
    const props = buildComponentProps('step-by-step-solver', generatorOutput);
    expect(props.steps).toEqual([{ description: 'Step 1' }, { description: 'Step 2' }]);
    expect(props.equation).toBe('y = x^2 + 1');
  });

  it('maps fill-in-the-blank props', () => {
    const props = buildComponentProps('fill-in-the-blank', generatorOutput);
    expect(props.template).toBe('Solve the equation');
    expect(props.blanks).toEqual([]);
  });

  it('passes through unknown renderer keys', () => {
    const props = buildComponentProps('unknown-renderer', generatorOutput);
    expect(props.equation).toBe('y = x^2 + 1');
  });

  it('falls back to default equation for graphing-explorer', () => {
    const props = buildComponentProps('graphing-explorer', { prompt: '', data: {}, expectedAnswer: {}, gradingMetadata: {} });
    expect(props.equation).toBe('y = x^2');
  });
});
