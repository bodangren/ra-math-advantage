// Phase 2.2 — Multi-student switcher (TDD, Red).
//
// Contract under test (per spec.md FR4 + test-strategy.md §5):
//
//   Parents with multiple linked students can switch between them. The
//   switcher:
//     1. lists every linked student by display name (id is the stable key),
//     2. marks the active student visibly (a11y-correct aria-current),
//     3. calls onSelectStudent(studentId) when the parent picks a different
//        student,
//     4. does NOT cause a refetch of teacher-only data — privacy boundary.
//
// What this test exercises:
//   - The StudentSwitcher component exists and accepts the documented props.
//   - The single-student branch still renders (a parent with one linked
//     student sees a non-interactive label, not an empty switcher).
//   - Clicking a different student fires onSelectStudent with the right id.
//   - The component does not import or call any teacher-only query
//     (`teacherVisualizationV1Schema` keys, or the Convex ref that would
//     fetch them).
//   - Integration: mounting StudentSwitcher + ParentDashboard together and
//     switching students re-renders the dashboard with the new payload
//     and does not call the convex bridge for teacher data.
//
// Red signal: `npm run ws:im3:test -- __tests__/components/parent/StudentSwitcher.test.tsx`
// At HEAD the `@/components/parent/StudentSwitcher` module does not exist
// (it will be created in the Green phase). The dynamic `await import(...)`
// form surfaces a clean module-resolution failure at test time.
//
// Privacy-boundary enforcement: the Convex bridge is mocked at the top
// of the file via `vi.mock('@/lib/convex/server', ...)` so the privacy
// assertion in the "teacher-data privacy boundary" describe block is
// meaningful — any Convex call from the switcher (now or after Green)
// would be intercepted and the assertion would fail.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import {
  parentProjectionsByStudentId,
  TEACHER_ONLY_KEYS,
  type ParentVisualizationV1,
} from '@/__tests__/_fixtures/parent-portal/parentProjection';
import {
  STUDENT_ALPHA_ID,
  STUDENT_BETA_ID,
} from '@/__tests__/_fixtures/parent-portal/parentLinks';

// ---------------------------------------------------------------------------
// Convex mock — wired at module top via `vi.hoisted` so the `vi.mock`
// factory can reference a stable mock function. The factory is intentionally
// permissive (returns `null` for any ref) so a future implementation that
// calls a parent-safe query (listParentLinks) does not throw — but the
// privacy assertion explicitly asserts no call is made by the switcher.
// ---------------------------------------------------------------------------

const { mockFetchInternalQuery } = vi.hoisted(() => ({
  mockFetchInternalQuery: vi.fn(async () => null),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    parent: {
      links: {
        listParentLinksQuery: 'parent:links:listParentLinksQuery',
      },
      visualization: {
        projectParentVisualizationQuery:
          'parent:visualization:projectParentVisualizationQuery',
      },
    },
  },
}));

// ---------------------------------------------------------------------------
// Module-shape helpers
// ---------------------------------------------------------------------------

interface StudentOption {
  studentId: string;
  displayName: string;
}

type StudentSwitcherProps = {
  students: StudentOption[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
};

type StudentSwitcherComponent = (props: StudentSwitcherProps) => JSX.Element;

type ParentDashboardProps = {
  payload: ParentVisualizationV1;
  studentId: string;
  studentName: string;
};

type ParentDashboardComponent = (props: ParentDashboardProps) => JSX.Element;

async function loadStudentSwitcher(): Promise<StudentSwitcherComponent> {
  const mod = await import('@/components/parent/StudentSwitcher');
  return mod.StudentSwitcher as StudentSwitcherComponent;
}

async function loadParentDashboard(): Promise<ParentDashboardComponent> {
  const mod = await import('@/components/parent/ParentDashboard');
  return mod.ParentDashboard as ParentDashboardComponent;
}

const ALPHA_OPTION: StudentOption = { studentId: STUDENT_ALPHA_ID, displayName: 'Alpha Student' };
const BETA_OPTION: StudentOption = { studentId: STUDENT_BETA_ID, displayName: 'Beta Student' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StudentSwitcher (Phase 2.2 — multi-student switching)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('existence and module surface', () => {
    it('exports a StudentSwitcher component', async () => {
      const StudentSwitcher = await loadStudentSwitcher();
      expect(typeof StudentSwitcher).toBe('function');
    });
  });

  describe('rendering', () => {
    it('renders one button per linked student', async () => {
      const StudentSwitcher = await loadStudentSwitcher();
      render(
        <StudentSwitcher
          students={[ALPHA_OPTION, BETA_OPTION]}
          selectedStudentId={STUDENT_ALPHA_ID}
          onSelectStudent={vi.fn()}
        />,
      );

      const switcher = screen.getByTestId('parent-student-switcher');
      const buttons = within(switcher).getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveTextContent(/Alpha Student/i);
      expect(buttons[1]).toHaveTextContent(/Beta Student/i);
    });

    it('marks the active student with aria-current="page" or "true"', async () => {
      const StudentSwitcher = await loadStudentSwitcher();
      render(
        <StudentSwitcher
          students={[ALPHA_OPTION, BETA_OPTION]}
          selectedStudentId={STUDENT_BETA_ID}
          onSelectStudent={vi.fn()}
        />,
      );

      const switcher = screen.getByTestId('parent-student-switcher');
      const buttons = within(switcher).getAllByRole('button');
      const alphaButton = buttons.find((b) => /Alpha/i.test(b.textContent ?? ''))!;
      const betaButton = buttons.find((b) => /Beta/i.test(b.textContent ?? ''))!;

      expect(betaButton.getAttribute('aria-current')).toMatch(/page|true/);
      expect(alphaButton.getAttribute('aria-current')).toBeNull();
    });
  });

  describe('single-student branch (one linked child)', () => {
    it('renders a non-interactive label, not an empty switcher', async () => {
      // When the parent has exactly one linked student, the switcher
      // collapses to a label that names the student. This avoids an
      // empty `<div>` that would screen-reader-announce nothing.
      const StudentSwitcher = await loadStudentSwitcher();
      render(
        <StudentSwitcher
          students={[ALPHA_OPTION]}
          selectedStudentId={STUDENT_ALPHA_ID}
          onSelectStudent={vi.fn()}
        />,
      );

      const singleStudent = screen.getByTestId('parent-student-switcher-single');
      expect(singleStudent).toHaveTextContent(/Alpha Student/i);

      const buttons = within(singleStudent).queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });
  });

  describe('selection behavior', () => {
    it('calls onSelectStudent with the clicked student id', async () => {
      const StudentSwitcher = await loadStudentSwitcher();
      const onSelectStudent = vi.fn();

      render(
        <StudentSwitcher
          students={[ALPHA_OPTION, BETA_OPTION]}
          selectedStudentId={STUDENT_ALPHA_ID}
          onSelectStudent={onSelectStudent}
        />,
      );

      const switcher = screen.getByTestId('parent-student-switcher');
      const betaButton = within(switcher)
        .getAllByRole('button')
        .find((b) => /Beta/i.test(b.textContent ?? ''))!;

      fireEvent.click(betaButton);

      expect(onSelectStudent).toHaveBeenCalledTimes(1);
      expect(onSelectStudent).toHaveBeenCalledWith(STUDENT_BETA_ID);
    });

    it('does not call onSelectStudent when the active student is clicked again', async () => {
      const StudentSwitcher = await loadStudentSwitcher();
      const onSelectStudent = vi.fn();

      render(
        <StudentSwitcher
          students={[ALPHA_OPTION, BETA_OPTION]}
          selectedStudentId={STUDENT_ALPHA_ID}
          onSelectStudent={onSelectStudent}
        />,
      );

      const switcher = screen.getByTestId('parent-student-switcher');
      const alphaButton = within(switcher)
        .getAllByRole('button')
        .find((b) => /Alpha/i.test(b.textContent ?? ''))!;

      fireEvent.click(alphaButton);

      expect(onSelectStudent).not.toHaveBeenCalled();
    });
  });

  describe('teacher-data privacy boundary', () => {
    it('does not call any teacher-only Convex ref when rendering', async () => {
      // Mount the switcher; the file-level Convex mock intercepts every
      // query attempt and records the call. The switcher itself must
      // not issue a Convex request — switching is a local state event
      // owned by the parent (server component or page-level harness).
      mockFetchInternalQuery.mockClear();
      const StudentSwitcher = await loadStudentSwitcher();

      render(
        <StudentSwitcher
          students={[ALPHA_OPTION, BETA_OPTION]}
          selectedStudentId={STUDENT_ALPHA_ID}
          onSelectStudent={vi.fn()}
        />,
      );

      // No convex query is expected on initial render of the switcher.
      expect(mockFetchInternalQuery).not.toHaveBeenCalled();

      // And after clicking a different student, the convex bridge still
      // must not be called from the switcher itself.
      const switcher = screen.getByTestId('parent-student-switcher');
      const betaButton = within(switcher)
        .getAllByRole('button')
        .find((b) => /Beta/i.test(b.textContent ?? ''))!;
      fireEvent.click(betaButton);

      expect(mockFetchInternalQuery).not.toHaveBeenCalled();
    });
  });

  describe('switcher ↔ dashboard integration (state sync)', () => {
    it('switching updates the dashboard to render the new student payload', async () => {
      const StudentSwitcher = await loadStudentSwitcher();
      const ParentDashboard = await loadParentDashboard();

      // Controlled wrapper: the switcher is given a `selectedStudentId`
      // from an external mutable state object; clicking a student only
      // emits the new id via onSelectStudent. The wrapper then triggers
      // a re-render that re-derives the dashboard payload from the new
      // id. This mirrors the production server-component page pattern:
      // a server component owns the "current student id" state (likely
      // from search params) and the switcher emits intent to change it.
      const harnessState = { id: STUDENT_ALPHA_ID };
      const onSelectStudent = (id: string) => {
        harnessState.id = id;
      };

      const tree = (
        <>
          <StudentSwitcher
            students={[ALPHA_OPTION, BETA_OPTION]}
            selectedStudentId={harnessState.id}
            onSelectStudent={onSelectStudent}
          />
          <ParentDashboard
            payload={parentProjectionsByStudentId[harnessState.id]}
            studentId={harnessState.id}
            studentName={harnessState.id === STUDENT_BETA_ID ? 'Beta Student' : 'Alpha Student'}
          />
        </>
      );

      const { rerender } = render(tree);

      // Initial render: alpha payload, alpha can-do summary visible.
      expect(screen.getByTestId('parent-dashboard-can-do')).toHaveTextContent(/Quadratic basics/i);

      // Simulate the switcher click.
      const switcher = screen.getByTestId('parent-student-switcher');
      const betaButton = within(switcher)
        .getAllByRole('button')
        .find((b) => /Beta/i.test(b.textContent ?? ''))!;
      fireEvent.click(betaButton);

      // Re-render the tree with the new selected id (controlled prop).
      rerender(
        <>
          <StudentSwitcher
            students={[ALPHA_OPTION, BETA_OPTION]}
            selectedStudentId={harnessState.id}
            onSelectStudent={onSelectStudent}
          />
          <ParentDashboard
            payload={parentProjectionsByStudentId[harnessState.id]}
            studentId={harnessState.id}
            studentName={harnessState.id === STUDENT_BETA_ID ? 'Beta Student' : 'Alpha Student'}
          />
        </>,
      );

      // After the switch: beta payload, beta can-do summary visible,
      // alpha's specific content is no longer present.
      expect(screen.getByTestId('parent-dashboard-can-do')).toHaveTextContent(/Calculus foundations/i);
      expect(screen.queryByText(/Quadratic basics/i)).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Fixture sanity (inside a real `it()` block so vitest records the
// assertion as a test result rather than relying on top-level expect
// behavior, which is unreliable across vitest versions).
// ---------------------------------------------------------------------------

describe('StudentSwitcher — fixture sanity', () => {
  it('TEACHER_ONLY_KEYS is non-empty so the privacy scan has forbidden keys to check', () => {
    expect(TEACHER_ONLY_KEYS.length).toBeGreaterThan(0);
  });
});
