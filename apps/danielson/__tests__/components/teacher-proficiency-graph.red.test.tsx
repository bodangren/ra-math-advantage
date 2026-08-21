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
  it('renders the accessible collapsed graph and controls', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);

    expect(screen.getByRole('group', { name: /teacher proficiency graph/i })).toBeInTheDocument();
    expect(screen.getByText('Framework for Teaching 2022')).toBeInTheDocument();
    expect(screen.getByText(/Domain 1:/)).toBeInTheDocument();
    expect(screen.getAllByText(/1a:/).length).toBeGreaterThan(0);
    expect(screen.queryByText('Applying Knowledge of Content and Pedagogy: Rating 2')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fit graph' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset view' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Full screen' })).toBeInTheDocument();
    expect(screen.getAllByText('Below Proficient').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not enough evidence').length).toBeGreaterThan(0);
  });

  it('expands a component with pointer and keyboard activation', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);
    const component = screen.getByRole('button', { name: /1a: Applying Knowledge/ });

    fireEvent.pointerDown(component, { pointerId: 1 });
    fireEvent.pointerUp(component, { pointerId: 1 });
    expect(screen.getByText(/Applying Knowledge of Content and Pedagogy:/)).toBeInTheDocument();

    fireEvent.keyDown(component, { key: 'Enter' });
    expect(screen.getByText(/Danielson component (expanded|collapsed)/)).toBeInTheDocument();
  });

  it('shows skill detail without comment or response data', () => {
    render(<TeacherProficiencyGraph currentProficiency={currentProficiency()} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /1a: Applying Knowledge/ }), { key: 'Enter' });
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

  it('anchors wheel zoom in view-box units and clamps zoom controls', () => {
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

    fireEvent.wheel(svg, { clientX: 100, clientY: 250, deltaY: -100 });
    expect(viewport.getAttribute('transform')).toContain('translate(75 0) scale(1.1)');

    for (let index = 0; index < 20; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    }
    expect(viewport.getAttribute('transform')).toContain('scale(1.8)');

    for (let index = 0; index < 30; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    }
    expect(viewport.getAttribute('transform')).toContain('scale(0.55)');
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
