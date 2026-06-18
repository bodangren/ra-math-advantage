/**
 * ImportSummary — Phase 3 Red-phase tests (Task 2).
 *
 * Covers the post-import summary surface per spec.md FR6 + AC5:
 *   "Import results (created/updated/skipped/errors) are summarized
 *    and retrievable."
 *
 * Per measure/tracks/onboarding-roster-import_20260605/test-strategy.md §6
 * Phase 3 (d):
 *   "summary view reads getImportSummary"
 *
 * The Red phase targets the missing component
 *   apps/integrated-math-3/components/teacher/onboarding/ImportSummary.tsx
 * (does not exist at HEAD). The Green author implements it against the
 * contract pinned by these tests.
 *
 * The summary component consumes the public Convex query
 * `onboarding.getImportSummary` from the Phase 2 wiring. Mock plumbing
 * follows the same pattern as RosterImportWizard.test.tsx (and
 * ExportPanel.test.tsx): vi.doMock('convex/react') and
 * vi.doMock('@/convex/_generated/api').
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Id } from '@/convex/_generated/dataModel';

/* ------------------------------------------------------------------ *
 * Convex mock plumbing
 * ------------------------------------------------------------------ */

type QueryResult = unknown;
type UseQueryReturn = QueryResult | undefined;

interface UseQueryMock {
  fn: (ref: unknown, args: unknown) => UseQueryReturn;
  setResult: (ref: unknown, args: unknown, result: UseQueryReturn) => void;
  args: Array<{ ref: unknown; args: unknown }>;
}

interface ConvexMockState {
  useQuery: UseQueryMock;
  reset: () => void;
}

function createConvexMock(): ConvexMockState {
  const state: ConvexMockState = {
    useQuery: {
      fn: (ref, args) => {
        state.useQuery.args.push({ ref, args });
        const entry = state.useQuery['_results' as keyof UseQueryMock] as
          | Array<{ ref: unknown; args: unknown; result: UseQueryReturn }>
          | undefined;
        const match = entry?.find(
          (e) => e.ref === ref && JSON.stringify(e.args) === JSON.stringify(args),
        );
        return match?.result;
      },
      setResult: (ref, args, result) => {
        const entry = (state.useQuery as unknown as {
          _results: Array<{ ref: unknown; args: unknown; result: UseQueryReturn }>;
        })._results;
        const idx = entry.findIndex(
          (e) => e.ref === ref && JSON.stringify(e.args) === JSON.stringify(args),
        );
        if (idx >= 0) {
          entry[idx] = { ref, args, result };
        } else {
          entry.push({ ref, args, result });
        }
      },
      args: [],
    },
    reset: () => {
      state.useQuery.args.length = 0;
      (state.useQuery as unknown as { _results: unknown[] })._results = [];
    },
  };
  (state.useQuery as unknown as { _results: unknown[] })._results = [];
  return state;
}

/* ------------------------------------------------------------------ *
 * Public API surface contract
 * ------------------------------------------------------------------ */

const Q_GET_IMPORT_SUMMARY = 'onboarding/rosterImport:getImportSummary';
const Q_LIST_IMPORTS_FOR_CLASS = 'onboarding/rosterImport:listImportsForClass';

/* ------------------------------------------------------------------ *
 * Component prop / import surface
 * ------------------------------------------------------------------ */

interface ImportSummaryProps {
  classId: Id<'classes'>;
  importId: Id<'roster_imports'>;
}

type ImportSummaryComponent = (
  props: ImportSummaryProps,
) => React.ReactElement | null;

const SUMMARY_PATH = '@/components/teacher/onboarding/ImportSummary';

/* ------------------------------------------------------------------ *
 * Setup / teardown
 * ------------------------------------------------------------------ */

let convex: ConvexMockState;

beforeEach(() => {
  convex = createConvexMock();
  vi.doMock('convex/react', () => ({
    useQuery: (ref: unknown, args: unknown) => convex.useQuery.fn(ref, args),
    useAction: (_ref: unknown) => undefined,
    useMutation: () => vi.fn(),
    useConvex: () => ({ query: vi.fn(), mutation: vi.fn(), action: vi.fn() }),
  }));
  vi.doMock('@/convex/_generated/api', () => ({
    api: {
      onboarding: {
        'rosterImport:importRoster': 'onboarding/rosterImport:importRoster',
        'rosterImport:getImportSummary': Q_GET_IMPORT_SUMMARY,
        'rosterImport:listImportsForClass': Q_LIST_IMPORTS_FOR_CLASS,
      },
    },
  }));
});

afterEach(() => {
  vi.doUnmock('convex/react');
  vi.doUnmock('@/convex/_generated/api');
});

async function loadSummary(): Promise<ImportSummaryComponent> {
  const mod = await import(SUMMARY_PATH);
  return (mod.ImportSummary ?? mod.default) as ImportSummaryComponent;
}

/* ------------------------------------------------------------------ *
 * Golden fixture — the public shape of getImportSummary's response.
 *
 * Matches the Phase 2 return-type contract in
 *   apps/integrated-math-3/convex/onboarding/roster-import.ts:190.
 * ------------------------------------------------------------------ */

const CLASS_ID = 'classes_test_1' as Id<'classes'>;
const IMPORT_ID = 'roster_imports_test_1' as Id<'roster_imports'>;

const SUMMARY_FIXTURE = {
  importId: IMPORT_ID,
  classId: CLASS_ID,
  importedBy: 'profiles_teacher_1' as Id<'profiles'>,
  importedAt: 1_780_000_000_000,
  source: { fileName: 'roster.csv', rowCount: 3 },
  created: 2,
  updated: 1,
  skipped: 0,
  errors: [],
  createdStudentIds: ['profiles_student_a' as Id<'profiles'>, 'profiles_student_b' as Id<'profiles'>],
};

const SUMMARY_WITH_ERRORS = {
  ...SUMMARY_FIXTURE,
  importId: 'roster_imports_test_2' as Id<'roster_imports'>,
  created: 1,
  updated: 1,
  skipped: 1,
  errors: [
    { rowIndex: 4, column: 'email' as const, code: 'invalid_email' as const, message: 'malformed email' },
  ],
};

/* ------------------------------------------------------------------ *
 * Task 3.2.a — Summary surfaces {created, updated, skipped, errors}
 *
 * Per spec.md FR6 + AC5: "Import results (created/updated/skipped/errors)
 * are summarized and retrievable." The dashboard / post-commit view
 * surfaces these counts so the teacher can audit what was applied.
 * ------------------------------------------------------------------ */

describe('ImportSummary — Task 2: surface import counts {created, updated, skipped, errors}', () => {
  it('renders the created count from the getImportSummary query result', async () => {
    const Summary = await loadSummary();
    convex.useQuery.setResult(
      Q_GET_IMPORT_SUMMARY,
      { classId: CLASS_ID, importId: IMPORT_ID },
      SUMMARY_FIXTURE,
    );

    render(<Summary classId={CLASS_ID} importId={IMPORT_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId('import-summary-created')).toHaveTextContent('2');
    });
  });

  it('renders the updated count from the query result', async () => {
    const Summary = await loadSummary();
    convex.useQuery.setResult(
      Q_GET_IMPORT_SUMMARY,
      { classId: CLASS_ID, importId: IMPORT_ID },
      SUMMARY_FIXTURE,
    );

    render(<Summary classId={CLASS_ID} importId={IMPORT_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId('import-summary-updated')).toHaveTextContent('1');
    });
  });

  it('renders the skipped count from the query result', async () => {
    const Summary = await loadSummary();
    convex.useQuery.setResult(
      Q_GET_IMPORT_SUMMARY,
      { classId: CLASS_ID, importId: IMPORT_ID },
      SUMMARY_FIXTURE,
    );

    render(<Summary classId={CLASS_ID} importId={IMPORT_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId('import-summary-skipped')).toHaveTextContent('0');
    });
  });

  it('renders the errors list with row numbers when errors are present', async () => {
    const Summary = await loadSummary();
    convex.useQuery.setResult(
      Q_GET_IMPORT_SUMMARY,
      { classId: CLASS_ID, importId: 'roster_imports_test_2' as Id<'roster_imports'> },
      SUMMARY_WITH_ERRORS,
    );

    render(
      <Summary
        classId={CLASS_ID}
        importId={'roster_imports_test_2' as Id<'roster_imports'>}
      />,
    );

    await waitFor(() => {
      const errorList = screen.getByTestId('import-summary-errors');
      expect(errorList).toBeInTheDocument();
      // The error row number must be visible so the teacher can locate
      // the bad row in their CSV.
      expect(errorList.textContent).toMatch(/row\s*4/i);
    });
  });

  it('renders zero counts without leaking internals while the query is loading', async () => {
    const Summary = await loadSummary();
    // No setResult — useQuery returns undefined (loading).
    render(<Summary classId={CLASS_ID} importId={IMPORT_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId('import-summary-created')).toHaveTextContent('0');
      expect(screen.getByTestId('import-summary-updated')).toHaveTextContent('0');
      expect(screen.getByTestId('import-summary-skipped')).toHaveTextContent('0');
      expect(screen.getByTestId('import-summary-errors')).toBeInTheDocument();
    });
  });
});

/* ------------------------------------------------------------------ *
 * Task 3.2.b — Summary metadata surface
 *
 * The summary should display provenance: source filename and importedAt
 * timestamp so the teacher can correlate the summary with the file they
 * uploaded. This is the auditability contract (FR6 + AC5).
 * ------------------------------------------------------------------ */

describe('ImportSummary — Task 2: auditability metadata', () => {
  it('renders the source filename from the query result', async () => {
    const Summary = await loadSummary();
    convex.useQuery.setResult(
      Q_GET_IMPORT_SUMMARY,
      { classId: CLASS_ID, importId: IMPORT_ID },
      SUMMARY_FIXTURE,
    );

    render(<Summary classId={CLASS_ID} importId={IMPORT_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId('import-summary-source')).toHaveTextContent('roster.csv');
    });
  });

  it('renders the importedAt timestamp in a human-readable form', async () => {
    const Summary = await loadSummary();
    convex.useQuery.setResult(
      Q_GET_IMPORT_SUMMARY,
      { classId: CLASS_ID, importId: IMPORT_ID },
      SUMMARY_FIXTURE,
    );

    render(<Summary classId={CLASS_ID} importId={IMPORT_ID} />);

    await waitFor(() => {
      const ts = screen.getByTestId('import-summary-imported-at');
      expect(ts).toBeInTheDocument();
      // The component must render some non-empty timestamp string. The
      // exact format (locale string vs ISO) is up to the Green author;
      // we just assert that it's not empty and is rendered.
      expect(ts.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});

/* ------------------------------------------------------------------ *
 * Task 3.2.c — Summary query contract
 *
 * The summary must call getImportSummary with the supplied classId and
 * importId, not listImportsForClass or any other query. This pins the
 * read-side wiring so future contributors can't accidentally swap to
 * the listing endpoint (which returns a different shape).
 * ------------------------------------------------------------------ */

describe('ImportSummary — Task 2: getImportSummary query wiring', () => {
  it('invokes the getImportSummary query with the supplied classId + importId', async () => {
    const Summary = await loadSummary();
    convex.useQuery.setResult(
      Q_GET_IMPORT_SUMMARY,
      { classId: CLASS_ID, importId: IMPORT_ID },
      SUMMARY_FIXTURE,
    );

    render(<Summary classId={CLASS_ID} importId={IMPORT_ID} />);

    await waitFor(() => {
      // Find the call to getImportSummary with matching args.
      const matchingCall = convex.useQuery.args.find(
        (c) =>
          c.ref === Q_GET_IMPORT_SUMMARY &&
          JSON.stringify(c.args) ===
            JSON.stringify({ classId: CLASS_ID, importId: IMPORT_ID }),
      );
      expect(matchingCall).toBeDefined();
    });

    // The component must NOT call listImportsForClass — that endpoint
    // returns a different shape and would break the auditability
    // contract.
    const listImportsCall = convex.useQuery.args.find(
      (c) => c.ref === Q_LIST_IMPORTS_FOR_CLASS,
    );
    expect(listImportsCall).toBeUndefined();
  });
});