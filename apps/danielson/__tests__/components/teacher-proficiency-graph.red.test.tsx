import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TeacherProficiencyGraph } from '../../components/teacher-proficiency-graph';
import { projectCurrentProficiency } from '../../lib/reporting/projections';
import { buildDanielsonGraph } from '../../lib/proficiency/graph';

function currentProficiency() {
  const graph = buildDanielsonGraph().graph;
  const componentBySkill = new Map(
    graph.edges
      .filter((edge) => edge.type === 'contains')
      .filter((edge) => graph.nodes.some((node) => node.id === edge.targetId && node.kind === 'skill'))
      .map((edge) => [edge.targetId, edge.sourceId]),
  );
  const prioritySkillId = 'danielson.tlac.skill.exemplar-planning';
  const priorities = graph.nodes
    .filter((node) => node.kind === 'skill')
    .map((node, index) => ({
      teacherId: 'teacher_profiles:graph',
      skillId: node.id,
      componentId: componentBySkill.get(node.id),
      due: node.id === prioritySkillId,
      dueAt: node.id === prioritySkillId ? '2026-10-28T00:00:00.000Z' : '2027-01-01T00:00:00.000Z',
      overdueDays: node.id === prioritySkillId ? 4 : 0,
      currentProficiency: node.id === prioritySkillId
        ? { rawRating: 2, points: 80, passes: false }
        : { rawRating: 3, points: 90, passes: true },
      evidenceGaps: [],
      approvedPriorityInputs: ['current_proficiency', 'due_status'],
      sourceRecordId: `observation_records:${index}`,
    }));
  return projectCurrentProficiency({ priorities });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TeacherProficiencyGraph', () => {
  it('uses background colors for the HTML legend swatches', () => {
    const stylesheet = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');

    expect(stylesheet).toMatch(/\.teacher-proficiency-graph-legend \.score-red\s*{\s*background-color:\s*#a72f32;/);
    expect(stylesheet).toMatch(/\.teacher-proficiency-graph-legend \.score-yellow\s*{\s*background-color:\s*#e5b93f;/);
    expect(stylesheet).toMatch(/\.teacher-proficiency-graph-legend \.score-green\s*{\s*background-color:\s*#247154;/);
    expect(stylesheet).toMatch(/\.teacher-proficiency-graph-legend \.score-blue\s*{\s*background-color:\s*#2f68a2;/);
    expect(stylesheet).toMatch(/\.teacher-proficiency-graph-legend \.score-neutral\s*{\s*background-color:\s*var\(--surface\);/);
  });

  it('shows rounded scores inside nodes with text-backed color bands', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);

    const framework = screen.getByRole('button', {
      name: /Framework for Teaching 2022: Below Proficient: Score 3\.0 of 4: Green/,
    });
    const component = screen.getByRole('button', {
      name: /Command of Content and Teaching Methods: Below Proficient: Score 2\.5 of 4: Yellow/,
    });

    expect(framework).toHaveClass('score-green');
    expect(component).toHaveClass('score-yellow');
    expect(component).toHaveTextContent('2.5');
    expect(screen.getByRole('region', { name: 'Proficiency score colors' })).toHaveTextContent(
      'Red 1.0–1.9Yellow 2.0–2.9Green 3.0–3.9Blue 4.0No score',
    );

    fireEvent.keyDown(component, { key: 'Enter' });
    expect(screen.getByRole('complementary', { name: 'Selected graph node details' }))
      .toHaveTextContent('Score: 2.5 of 4');
  });

  it('shows a component score without requiring selection', () => {
    const current = projectCurrentProficiency({
      priorities: [],
      componentEvidence: [{
        componentId: 'danielson.framework.component.1a',
        rawRating: 4,
        sourceRecordId: 'observation_records:component-source',
      }],
    });
    render(<TeacherProficiencyGraph currentProficiency={current} />);

    const component = screen.getByRole('button', {
      name: /Command of Content and Teaching Methods: Proficient: Score 4\.0 of 4: Blue: Rating 4: 100 points/,
    });
    expect(component).toHaveTextContent('4.0');

    fireEvent.keyDown(component, { key: 'Enter' });
    const details = screen.getByRole('complementary', { name: 'Selected graph node details' });
    expect(details).toHaveTextContent('Rating: 4');
    expect(details).toHaveTextContent('Points: 100');
    expect(details).toHaveTextContent('Open evidence record');
  });

  it('renders the accessible collapsed graph and controls', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);

    expect(screen.getByRole('group', { name: /teacher proficiency graph/i })).toBeInTheDocument();
    expect(screen.getByText('Framework for Teaching 2022')).toBeInTheDocument();
    expect(screen.getByText(/Domain 1:/)).toBeInTheDocument();
    expect(screen.getAllByText(/1a:/).length).toBeGreaterThan(0);
    expect(screen.queryByText('Command of Content and Teaching Methods: Rating 2')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fit graph' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset view' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Full screen' })).toBeInTheDocument();
    expect(screen.getAllByText('Below Proficient').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not enough evidence').length).toBeGreaterThan(0);
    fireEvent.keyDown(screen.getByRole('button', { name: /1a: Command of Content/ }), { key: 'Enter' });
    expect(screen.getAllByText(/Below Proficient · Due/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', {
      name: /Exemplar Planning: Below Proficient: Score 2\.0 of 4: Yellow: Rating 2: 80 points: Due/,
    })).toBeInTheDocument();
  });

  it('expands a component with pointer and keyboard activation', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);
    const component = screen.getByRole('button', { name: /1a: Command of Content/ });

    fireEvent.pointerDown(component, { pointerId: 1 });
    fireEvent.pointerUp(component, { pointerId: 1 });
    expect(screen.getByText(/Command of Content and Teaching Methods:/)).toBeInTheDocument();

    fireEvent.keyDown(component, { key: 'Enter' });
    expect(screen.getByText(/Danielson component (expanded|collapsed)/)).toBeInTheDocument();
  });

  it('shows skill detail without comment or response data', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /1a: Command of Content/ }), { key: 'Enter' });
    const skill = screen.getByRole('button', { name: /Exemplar Planning: Below Proficient/ });
    fireEvent.keyDown(skill, { key: ' ' });

    expect(screen.getByText(/Rating: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Points: 80/)).toBeInTheDocument();
    expect(screen.getByText(/Overdue by 4 days/)).toBeInTheDocument();
    expect(screen.getByText(/Priority: 1/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open evidence record/ })).toHaveAttribute(
      'href',
      expect.stringContaining('observation_records'),
    );
    expect(screen.getByRole('link', { name: 'Learn Exemplar Planning' })).toHaveAttribute(
      'href',
      '/learn/exemplar-planning',
    );
    expect(screen.queryByText('private leadership comment')).not.toBeInTheDocument();
    expect(screen.queryByText('teacher response')).not.toBeInTheDocument();
  });

  it('calls native full screen and changes only local view state during zoom and pan', () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);
    const viewport = screen.getByTestId('proficiency-graph-viewport');
    const initialTransform = viewport.getAttribute('transform');

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.pointerDown(viewport, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(viewport, { clientX: 30, clientY: 40, pointerId: 1 });
    fireEvent.pointerUp(viewport, { clientX: 30, clientY: 40, pointerId: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Full screen' }));

    expect(viewport.getAttribute('transform')).not.toBe(initialTransform);
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('anchors wheel zoom in view-box units under a letterboxed SVG', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);
    const svg = screen.getByRole('group', { name: /teacher proficiency graph/i });
    const viewport = screen.getByTestId('proficiency-graph-viewport');
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      width: 950,
      height: 500,
      top: 0,
      left: 0,
      right: 950,
      bottom: 500,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperty(svg, 'getScreenCTM', {
      configurable: true,
      value: () => ({
        inverse: () => ({ a: 3.8, b: 0, c: 0, d: 3.8, e: -1_805, f: -950 }),
      }),
    });

    fireEvent.wheel(svg, { clientX: 350, clientY: 250, deltaY: -100 });
    expect(viewport.getAttribute('transform')).toContain('translate(47.5 0) scale(1.1)');

    for (let index = 0; index < 20; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    }
    expect(viewport.getAttribute('transform')).toContain('scale(1.8)');

    for (let index = 0; index < 30; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    }
    expect(viewport.getAttribute('transform')).toContain('scale(0.55)');
  });

  it('converts drag panning through the SVG screen transform', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);
    const svg = screen.getByRole('group', { name: /teacher proficiency graph/i });
    const viewport = screen.getByTestId('proficiency-graph-viewport');
    Object.defineProperty(svg, 'getScreenCTM', {
      configurable: true,
      value: () => ({
        inverse: () => ({ a: 3.8, b: 0, c: 0, d: 3.8, e: -1_805, f: -950 }),
      }),
    });

    fireEvent.pointerDown(viewport, { clientX: 350, clientY: 250, pointerId: 7 });
    fireEvent.pointerMove(viewport, { clientX: 400, clientY: 250, pointerId: 7 });
    fireEvent.pointerUp(viewport, { clientX: 400, clientY: 250, pointerId: 7 });

    expect(viewport.getAttribute('transform')).toContain('translate(190 0) scale(1)');
  });

  it('fits and resets the graph view', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);
    const viewport = screen.getByTestId('proficiency-graph-viewport');

    fireEvent.click(screen.getByRole('button', { name: 'Fit graph' }));
    expect(viewport.getAttribute('transform')).not.toBe('translate(0 0) scale(1)');

    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }));
    expect(viewport.getAttribute('transform')).toBe('translate(0 0) scale(1)');
  });
});
