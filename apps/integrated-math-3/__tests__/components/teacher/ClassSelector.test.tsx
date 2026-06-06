import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassSelector } from '@/app/teacher/lessons/ClassSelector';

const mockPush = vi.fn();
const mockSearchParamsToString = vi.fn().mockReturnValue('');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ toString: mockSearchParamsToString }),
}));

const MOCK_CLASSES = [
  { classId: 'cls-default', className: 'Algebra 1 — Default Period' },
  { classId: 'cls-isolated-e2e', className: 'E2E Isolated Test Period' },
  { classId: 'cls-third', className: 'Geometry — 3rd Period' },
];

describe('ClassSelector — Phase 4 verification coverage (Task 3, workflow §2.3)', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParamsToString.mockClear();
    mockSearchParamsToString.mockReturnValue('');
  });

  describe('Phase 4 Green data-testid contract (characterization)', () => {
    it('renders the wrapper with data-testid="teacher-class-selector" so E2E specs can locate it', () => {
      // Phase 4 Green commit a1998ac3 added this testid to satisfy the
      // teacher-flow.spec.ts SEL_PHASE4_TEACHER.teacherClassSelector contract.
      // workflow.md §2.3 requires a unit test for every Phase 4 changed file.
      render(
        <ClassSelector classes={MOCK_CLASSES} selectedClassId={MOCK_CLASSES[0].classId} />,
      );
      expect(screen.getByTestId('teacher-class-selector')).toBeInTheDocument();
    });

    it('renders the select with an accessible label association', () => {
      render(
        <ClassSelector classes={MOCK_CLASSES} selectedClassId={MOCK_CLASSES[0].classId} />,
      );
      const select = screen.getByLabelText(/select class/i);
      expect(select.tagName).toBe('SELECT');
    });

    it('renders one <option> per class with the classId as the value', () => {
      render(
        <ClassSelector classes={MOCK_CLASSES} selectedClassId={MOCK_CLASSES[0].classId} />,
      );
      for (const cls of MOCK_CLASSES) {
        const option = screen.getByRole('option', { name: cls.className }) as HTMLOptionElement;
        expect(option.value).toBe(cls.classId);
      }
    });

    it('reflects the selectedClassId prop as the current <select> value', () => {
      render(
        <ClassSelector classes={MOCK_CLASSES} selectedClassId={MOCK_CLASSES[1].classId} />,
      );
      const select = screen.getByLabelText(/select class/i) as HTMLSelectElement;
      expect(select.value).toBe(MOCK_CLASSES[1].classId);
    });

    it('navigates to /teacher/lessons?classId=<id> on selection change', () => {
      render(
        <ClassSelector classes={MOCK_CLASSES} selectedClassId={MOCK_CLASSES[0].classId} />,
      );
      const select = screen.getByLabelText(/select class/i);
      fireEvent.change(select, { target: { value: MOCK_CLASSES[2].classId } });
      expect(mockPush).toHaveBeenCalledTimes(1);
      const pushedUrl = mockPush.mock.calls[0][0] as string;
      expect(pushedUrl).toContain('/teacher/lessons');
      expect(pushedUrl).toContain(`classId=${encodeURIComponent(MOCK_CLASSES[2].classId)}`);
    });
  });

  describe('Strategy §3 per-test isolation contract (Red — drives out missing behavior)', () => {
    // test-strategy.md §3 cross-phase concern:
    //   "Teacher assignment flow (FR5) mutates `assignLessonToClassHandler`;
    //    this can pollute later runs. Wrap teacher assignment spec in a
    //    per-test `beforeEach` reseed or use a dedicated class id not
    //    consumed by student specs."
    //
    // The teacher-flow.spec.ts assign-toggle test (lines 156-189) only
    // asserts visibility — it explicitly defers the destructive mutation
    // to a "separate test that resets state via a dedicated class id."
    // For that separate test to exist without text coupling, the
    // ClassSelector must expose stable data-testid attributes on each
    // <option> so the E2E spec can pick the dedicated isolated class
    // (e.g. "cls-isolated-e2e") by selector, not by display name. The
    // current ClassSelector.tsx renders bare <option> elements — these
    // Red-phase assertions will fail until per-option testids are added.

    it('renders each <option> with data-testid="teacher-class-option-<classId>"', () => {
      render(
        <ClassSelector classes={MOCK_CLASSES} selectedClassId={MOCK_CLASSES[0].classId} />,
      );
      for (const cls of MOCK_CLASSES) {
        expect(
          screen.getByTestId(`teacher-class-option-${cls.classId}`),
          `expected stable per-option testid for class "${cls.classId}" so the FR5 assignment spec can target a dedicated isolated class without coupling to copy`,
        ).toBeInTheDocument();
      }
    });

    it('per-option testids let the E2E spec pick the dedicated isolated class without text coupling', () => {
      render(
        <ClassSelector classes={MOCK_CLASSES} selectedClassId={MOCK_CLASSES[0].classId} />,
      );
      const isolated = screen.getByTestId('teacher-class-option-cls-isolated-e2e') as HTMLOptionElement;
      expect(isolated.value).toBe('cls-isolated-e2e');
    });
  });
});
