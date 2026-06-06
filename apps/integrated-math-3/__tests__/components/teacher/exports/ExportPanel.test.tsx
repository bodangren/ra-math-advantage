/**
 * ExportPanel — Phase 2 Red-phase tests.
 *
 * Covers three incomplete Phase 2 tasks for the data-export-teacher-ui track:
 *  1. Build teacher-only export panel (dataset/scope/format controls), role-gated.
 *  2. Wire client download with descriptive filename.
 *  3. Empty/large/error states.
 *
 * These tests are written BEFORE the `ExportPanel` component exists, so they
 * will fail with module-not-found or assertion errors. The Green phase is
 * responsible for implementing the component to make them pass.
 *
 * Architecture guardrails (from measure/tracks/.../test-strategy.md):
 *  - No new business logic in UI; reuse `lib/teacher/data-export.ts` and
 *    `lib/teacher/gradebook-export.ts`. Filename comes from `buildExportFilename`.
 *  - Public query wrappers will be added in Phase 3. The component must
 *    `useQuery` the public API, not internal queries directly.
 *  - Role gate must reject non-teacher sessions.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Id } from '@/convex/_generated/dataModel';

import { useBrowserDownloadMock, type BrowserDownloadHandle } from '../../../setup/browserDownloadMock';
import { studentExportFixture } from '../../../fixtures/exports/studentExportFixture';
import { classExportFixture } from '../../../fixtures/exports/classExportFixture';
import { submissionExportFixture } from '../../../fixtures/exports/submissionExportFixture';

/* ------------------------------------------------------------------ *
 * Convex mock plumbing
 * ------------------------------------------------------------------ */

type QueryResult = unknown;
type UseQueryReturn = QueryResult | undefined;
type UseActionReturn = ((args: unknown) => Promise<unknown>) | undefined;

interface UseQueryMock {
  fn: (ref: unknown, args: unknown) => UseQueryReturn;
  setResult: (ref: unknown, args: unknown, result: UseQueryReturn) => void;
}

interface UseActionMock {
  fn: (ref: unknown) => UseActionReturn;
  setHandler: (ref: unknown, handler: (args: unknown) => Promise<unknown>) => void;
}

interface ConvexMockState {
  useQuery: UseQueryMock;
  useAction: UseActionMock;
  reset: () => void;
}

function createConvexMock(): ConvexMockState {
  const queryResults: Array<{ ref: unknown; args: unknown; result: UseQueryReturn }> = [];
  const actionHandlers: Array<{ ref: unknown; handler: (args: unknown) => Promise<unknown> }> = [];

  const state: ConvexMockState = {
    useQuery: {
      fn: (ref, args) => {
        const match = queryResults.find(
          (entry) => entry.ref === ref && JSON.stringify(entry.args) === JSON.stringify(args),
        );
        return match?.result;
      },
      setResult: (ref, args, result) => {
        const idx = queryResults.findIndex(
          (entry) => entry.ref === ref && JSON.stringify(entry.args) === JSON.stringify(args),
        );
        if (idx >= 0) {
          queryResults[idx] = { ref, args, result };
        } else {
          queryResults.push({ ref, args, result });
        }
      },
    },
    useAction: {
      fn: (ref) => {
        const match = actionHandlers.find((entry) => entry.ref === ref);
        return match?.handler;
      },
      setHandler: (ref, handler) => {
        const idx = actionHandlers.findIndex((entry) => entry.ref === ref);
        if (idx >= 0) {
          actionHandlers[idx] = { ref, handler };
        } else {
          actionHandlers.push({ ref, handler });
        }
      },
    },
    reset: () => {
      queryResults.length = 0;
      actionHandlers.length = 0;
    },
  };
  return state;
}

/* ------------------------------------------------------------------ *
 * Component session / role prop contract
 *
 * The component will receive the role and session from the page (server-side
 * `requireTeacherSessionClaims`). Tests pass an `isTeacher` flag rather than
 * mocking the entire Next.js auth boundary.
 * ------------------------------------------------------------------ */

interface ExportPanelProps {
  isTeacher: boolean;
  classId?: Id<'classes'>;
  className?: string;
  studentId?: Id<'profiles'>;
  onComplete?: () => void;
}

type ExportPanelComponent = (props: ExportPanelProps) => React.ReactElement | null;

const EXPORT_PANEL_PATH = '@/components/teacher/exports/ExportPanel';

/* ------------------------------------------------------------------ *
 * Mock shape for the three public query references
 * (Phase 3 adds these — tests reference them by string for now).
 * ------------------------------------------------------------------ */

const Q_STUDENT = 'exports.getStudentExport';
const Q_CLASS = 'exports.getClassExport';
const Q_SUBMISSION = 'exports.getSubmissionExport';
const Q_TEACHER_CLASSES = 'teacher/lessonAssignment.getTeacherClassesWithLessons';

const STUDENT_SCOPE_ARGS = {
  studentId: 'student_001' as Id<'profiles'>,
};

const CLASS_SCOPE_ARGS = {
  classId: 'class_001' as Id<'classes'>,
};

const SUBMISSION_SCOPE_ARGS = {
  classId: 'class_001' as Id<'classes'>,
  endDate: 1700000020000,
  limit: 200,
};

/* ------------------------------------------------------------------ *
 * Dynamic import + module-mock boilerplate
 * ------------------------------------------------------------------ */

let convex: ConvexMockState;
let download: BrowserDownloadHandle;

async function loadExportPanel() {
  const mod = await import(EXPORT_PANEL_PATH);
  return (mod.ExportPanel ?? mod.default) as ExportPanelComponent;
}

beforeEach(() => {
  convex = createConvexMock();
  vi.doMock('convex/react', () => ({
    useQuery: (ref: unknown, args: unknown) => convex.useQuery.fn(ref, args),
    useAction: (ref: unknown) => convex.useAction.fn(ref),
    useMutation: () => vi.fn(),
    useConvex: () => ({ query: vi.fn(), mutation: vi.fn(), action: vi.fn() }),
  }));
  // Also mock the auto-generated api surface that the component will use.
  vi.doMock('@/convex/_generated/api', () => ({
    api: {
      exports: { getStudentExport: Q_STUDENT, getClassExport: Q_CLASS, getSubmissionExport: Q_SUBMISSION },
      'teacher/lessonAssignment': { getTeacherClassesWithLessons: Q_TEACHER_CLASSES },
    },
  }));
});

afterEach(() => {
  vi.doUnmock('convex/react');
  vi.doUnmock('@/convex/_generated/api');
});

describe('ExportPanel — Task 1: role-gate + render controls', () => {
  it('returns null (or forbidden notice) when isTeacher is false', async () => {
    const ExportPanel = await loadExportPanel();
    const { container } = render(<ExportPanel isTeacher={false} classId="class_001" className="Period 1" />);

    // Either the component renders nothing, or it renders a forbidden notice
    // — but it must not render the export controls.
    const exportButton = screen.queryByRole('button', { name: /export/i });
    expect(exportButton).toBeNull();

    // If a forbidden notice is rendered, it should be discoverable.
    const forbidden = screen.queryByText(/not authorized|forbidden|teacher/i);
    if (forbidden) {
      expect(container.textContent).toMatch(/not authorized|forbidden|teacher/i);
    }
  });

  it('renders dataset, scope, and format controls with accessible labels', async () => {
    const ExportPanel = await loadExportPanel();
    render(<ExportPanel isTeacher={true} classId="class_001" className="Period 1" />);

    // Dataset selector (student | class | submissions)
    const dataset = screen.getByLabelText(/dataset/i);
    expect(dataset).toBeInTheDocument();

    // Format selector (csv | json)
    const format = screen.getByLabelText(/format/i);
    expect(format).toBeInTheDocument();

    // Scope control — class dropdown for class/submissions datasets,
    // student dropdown for student dataset. The component must always
    // expose at least one scope affordance.
    const scope = screen.getAllByRole('combobox').find((el) =>
      /class|scope|student|section/i.test(el.getAttribute('aria-label') ?? el.getAttribute('name') ?? ''),
    );
    expect(scope).toBeDefined();
  });

  it('disables the export button until a valid scope is selected', async () => {
    const ExportPanel = await loadExportPanel();
    render(<ExportPanel isTeacher={true} classId={undefined as unknown as Id<'classes'>} className="" />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeDisabled();
  });

  it('enables the export button once a valid scope is provided', async () => {
    const ExportPanel = await loadExportPanel();
    render(<ExportPanel isTeacher={true} classId="class_001" className="Period 1" />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeEnabled();
  });
});

describe('ExportPanel — Task 2: client download wiring', () => {
  it('produces a Blob with the correct MIME type and a filename matching buildExportFilename', async () => {
    download = useBrowserDownloadMock();
    const ExportPanel = await loadExportPanel();

    // Stub the class export query with a non-empty payload.
    convex.useQuery.setResult(Q_CLASS, CLASS_SCOPE_ARGS, classExportFixture);

    const user = userEvent.setup();
    render(<ExportPanel isTeacher={true} classId="class_001" className="Period 1 — Algebra" />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(download.getCapturedDownloads().length).toBeGreaterThan(0);
    });

    const captured = download.getCapturedDownloads()[0];
    // Filename must follow the buildExportFilename contract:
    //   `${sanitizedClassName}-${dataset}-${YYYY-MM-DD}.${ext}`
    expect(captured.filename).toMatch(/^Period 1 — Algebra-class-\d{4}-\d{2}-\d{2}\.csv$/);
    // MIME type for CSV download (or json if the user selected it).
    expect(captured.mimeType).toMatch(/text\/csv|application\/json/);
    // URL.createObjectURL must have been called exactly once per click.
    expect(download.createObjectURL).toHaveBeenCalledTimes(1);
    // URL.revokeObjectURL must be called for cleanup.
    expect(download.revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it('uses the .json extension when format=json is selected', async () => {
    download = useBrowserDownloadMock();
    const ExportPanel = await loadExportPanel();

    convex.useQuery.setResult(Q_STUDENT, STUDENT_SCOPE_ARGS, studentExportFixture);

    const user = userEvent.setup();
    render(
      <ExportPanel
        isTeacher={true}
        classId="class_001"
        className="Period 1"
        studentId={'student_001' as Id<'profiles'>}
      />,
    );

    // Switch format to JSON.
    const format = screen.getByLabelText(/format/i) as HTMLSelectElement;
    await user.selectOptions(format, 'json');

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(download.getCapturedDownloads().length).toBeGreaterThan(0);
    });

    const captured = download.getCapturedDownloads()[0];
    expect(captured.filename).toMatch(/^Period 1-(student|class|submissions)-\d{4}-\d{2}-\d{2}\.json$/);
    expect(captured.mimeType).toBe('application/json');
  });

  it('does NOT trigger a download when the dataset is empty', async () => {
    download = useBrowserDownloadMock();
    const ExportPanel = await loadExportPanel();

    // Empty class export.
    convex.useQuery.setResult(Q_CLASS, CLASS_SCOPE_ARGS, []);

    const user = userEvent.setup();
    render(<ExportPanel isTeacher={true} classId="class_001" className="Period 1" />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    // When the query returns empty, the button may be disabled OR remain
    // enabled but skip the download. Either way, no Blob/URL.createObjectURL
    // may be invoked.
    if (!exportButton.hasAttribute('disabled')) {
      await user.click(exportButton);
    }

    expect(download.createObjectURL).not.toHaveBeenCalled();
    expect(download.getCapturedDownloads()).toHaveLength(0);
  });
});

describe('ExportPanel — Task 3: empty / large / error states', () => {
  it('shows an empty-state message when the query returns no rows', async () => {
    const ExportPanel = await loadExportPanel();
    convex.useQuery.setResult(Q_CLASS, CLASS_SCOPE_ARGS, []);

    render(<ExportPanel isTeacher={true} classId="class_001" className="Period 1" />);

    await waitFor(() => {
      expect(screen.getByText(/no data available|no results|empty/i)).toBeInTheDocument();
    });
  });

  it('shows a large-state notice when the query reports hasMore: true', async () => {
    // The submission query uses Date.now() as the default endDate.
    // Mock it to match the test fixture's expected args.
    vi.spyOn(Date, 'now').mockReturnValue(1700000020000);
    const ExportPanel = await loadExportPanel();
    convex.useQuery.setResult(Q_SUBMISSION, SUBMISSION_SCOPE_ARGS, {
      rows: submissionExportFixture,
      hasMore: true,
    });

    render(<ExportPanel isTeacher={true} classId="class_001" className="Period 1" />);

    // Switch dataset to submissions to trigger the hasMore branch.
    const dataset = screen.getByLabelText(/dataset/i) as HTMLSelectElement;
    await userEvent.setup().selectOptions(dataset, 'submissions');

    await waitFor(() => {
      expect(screen.getByText(/large|more results|refine|limit|truncated/i)).toBeInTheDocument();
    });
  });

  it('shows an error state without leaking internals when the query throws', async () => {
    const ExportPanel = await loadExportPanel();
    convex.useQuery.setResult(Q_CLASS, CLASS_SCOPE_ARGS, () => {
      throw new Error('internal: db connection refused at host 10.0.0.5:8080');
    });

    render(<ExportPanel isTeacher={true} classId="class_001" className="Period 1" />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load|export failed|something went wrong|try again/i)).toBeInTheDocument();
    });

    // Error message must not leak internal details.
    expect(screen.queryByText(/10\.0\.0\.5:8080/)).toBeNull();
    expect(screen.queryByText(/db connection refused/)).toBeNull();
  });
});
