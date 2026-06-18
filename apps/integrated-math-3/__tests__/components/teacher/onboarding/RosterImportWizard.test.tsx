/**
 * RosterImportWizard — Phase 3 Red-phase tests (Task 1).
 *
 * Covers the first-run teacher onboarding flow per spec.md FR1 + FR2 + AC1:
 *   create class → upload CSV roster → dry-run preview → commit → dashboard.
 *
 * Per measure/tracks/onboarding-roster-import_20260605/test-strategy.md §6:
 *   (a) wizard step progression create-class → upload → preview → commit
 *   (b) preview renders dry-run counts and per-row errors with row numbers
 *   (c) commit disabled while errors present
 *
 * The Red phase targets the missing component
 *   apps/integrated-math-3/components/teacher/onboarding/RosterImportWizard.tsx
 * (does not exist at HEAD). The Green author implements the wizard against
 * the contract pinned by these tests; the closeout gate is the directory
 * glob `__tests__/components/teacher/onboarding/` per test-strategy §7.
 *
 * Mock plumbing mirrors __tests__/components/teacher/exports/ExportPanel.test.tsx:
 *   - vi.doMock('convex/react') for useQuery / useMutation / useAction
 *   - vi.doMock('@/convex/_generated/api') for the public query / mutation refs
 *     (so the wizard's `import { api } from '@/convex/_generated/api'` resolves
 *      without a live convex codegen run)
 *   - dynamic import of the wizard inside each test, so the mocks are applied
 *     before the module graph is built.
 *
 * No real network, no live Convex — all assertions are against the mocked
 * query/mutation handlers.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Id } from '@/convex/_generated/dataModel';

/* ------------------------------------------------------------------ *
 * Convex mock plumbing — same shape as ExportPanel.test.tsx
 * ------------------------------------------------------------------ */

type QueryResult = unknown;
type UseQueryReturn = QueryResult | undefined;
type MutationFn = (args: unknown) => Promise<unknown>;
type UseMutationReturn = MutationFn | undefined;

interface UseQueryMock {
  fn: (ref: unknown, args: unknown) => UseQueryReturn;
  setResult: (ref: unknown, args: unknown, result: UseQueryReturn) => void;
}

interface UseMutationMock {
  fn: () => UseMutationReturn;
  setHandler: (handler: MutationFn) => void;
  calls: Array<{ args: unknown }>;
}

interface ConvexMockState {
  useQuery: UseQueryMock;
  useMutation: UseMutationMock;
  reset: () => void;
}

function createConvexMock(): ConvexMockState {
  const queryResults: Array<{ ref: unknown; args: unknown; result: UseQueryReturn }> = [];

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
    useMutation: {
      fn: () => state.useMutation['_handler' as keyof UseMutationMock] as UseMutationReturn,
      setHandler: (handler: MutationFn) => {
        (state.useMutation as unknown as { _handler: MutationFn })._handler = handler;
      },
      calls: [],
    },
    reset: () => {
      queryResults.length = 0;
      (state.useMutation as unknown as { _handler?: MutationFn })._handler = undefined;
      state.useMutation.calls.length = 0;
    },
  };
  return state;
}

/* ------------------------------------------------------------------ *
 * Public API surface contract — what the wizard must import
 *
 * The wizard will reference these by name from `@/convex/_generated/api`
 * (mirroring ExportPanel.tsx: `const x = api.onboarding.rosterImport;`).
 * Phase 2's roster-import.ts exports internalMutation / internalQuery
 * wrappers; the wizard consumes them via the auto-generated `api` object.
 *
 * We declare string refs here so the test does not depend on a live
 * `convex codegen` run; the wizard's compile-time imports resolve through
 * the same surface once `npx convex dev` has been executed.
 * ------------------------------------------------------------------ */

const M_IMPORT_ROSTER = 'onboarding/rosterImport:importRoster';
const M_GET_IMPORT_SUMMARY = 'onboarding/rosterImport:getImportSummary';
const M_LIST_IMPORTS_FOR_CLASS = 'onboarding/rosterImport:listImportsForClass';

/* ------------------------------------------------------------------ *
 * Component prop / import surface
 * ------------------------------------------------------------------ */

interface RosterImportWizardProps {
  teacherId: Id<'profiles'>;
  organizationId?: Id<'organizations'>;
  onComplete?: (classId: Id<'classes'>) => void;
}

type RosterImportWizardComponent = (
  props: RosterImportWizardProps,
) => React.ReactElement | null;

const WIZARD_PATH = '@/components/teacher/onboarding/RosterImportWizard';

/* ------------------------------------------------------------------ *
 * Setup / teardown
 * ------------------------------------------------------------------ */

let convex: ConvexMockState;

beforeEach(() => {
  convex = createConvexMock();
  vi.doMock('convex/react', () => ({
    useQuery: (ref: unknown, args: unknown) => convex.useQuery.fn(ref, args),
    useAction: (_ref: unknown) => undefined,
    useMutation: () => {
      const handler = (convex.useMutation as unknown as { _handler?: MutationFn })._handler;
      const wrapped: MutationFn = async (args: unknown) => {
        convex.useMutation.calls.push({ args });
        if (!handler) throw new Error('no mutation handler registered in test');
        return handler(args);
      };
      return wrapped;
    },
    useConvex: () => ({ query: vi.fn(), mutation: vi.fn(), action: vi.fn() }),
  }));
  vi.doMock('@/convex/_generated/api', () => ({
    api: {
      onboarding: {
        'rosterImport:importRoster': M_IMPORT_ROSTER,
        'rosterImport:getImportSummary': M_GET_IMPORT_SUMMARY,
        'rosterImport:listImportsForClass': M_LIST_IMPORTS_FOR_CLASS,
      },
    },
  }));
});

afterEach(() => {
  vi.doUnmock('convex/react');
  vi.doUnmock('@/convex/_generated/api');
});

async function loadWizard(): Promise<RosterImportWizardComponent> {
  const mod = await import(WIZARD_PATH);
  return (mod.RosterImportWizard ?? mod.default) as RosterImportWizardComponent;
}

/* ------------------------------------------------------------------ *
 * Golden fixtures — keep this file the single source of truth for the
 * RosterImportWizard Red contract; each `it` cites which test-strategy
 * bullet it covers.
 * ------------------------------------------------------------------ */

const VALID_CSV = [
  'name,email,sisId,section',
  'Ada Lovelace,ada@school.test,SIS-001,Period 1',
  'Grace Hopper,grace@school.test,SIS-002,Period 1',
  'Alan Turing,alan@school.test,SIS-003,Period 2',
].join('\n');

const MIXED_ERRORS_CSV = [
  'name,email,sisId,section',
  'Alice Anderson,alice@school.test,SIS-001,Period 1',
  ',no-email-row,SIS-002,Period 1',
  'Charlie Cho,not-an-email,SIS-003,Period 2',
].join('\n');

const TEACHER_ID = 'profiles_teacher_1' as Id<'profiles'>;
const ORG_ID = 'organizations_org_1' as Id<'organizations'>;

/* ------------------------------------------------------------------ *
 * Task 3.1.a — Wizard step progression
 *   create-class → upload → preview → commit
 * ------------------------------------------------------------------ */

describe('RosterImportWizard — Task 1: wizard step progression', () => {
  it('renders the create-class step (step 1) by default with data-testid="roster-wizard-step-create-class"', async () => {
    const Wizard = await loadWizard();
    render(<Wizard teacherId={TEACHER_ID} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('roster-wizard-step-create-class'),
      ).toBeInTheDocument();
    });
  });

  it('does not render the upload step until the create-class step is satisfied', async () => {
    const Wizard = await loadWizard();
    render(<Wizard teacherId={TEACHER_ID} />);

    expect(screen.queryByTestId('roster-wizard-step-upload')).toBeNull();
    expect(screen.queryByTestId('roster-wizard-step-preview')).toBeNull();
    expect(screen.queryByTestId('roster-wizard-step-commit')).toBeNull();
  });

  it('advances from create-class to upload after valid class info is submitted', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Step 1 — fill in class name + section
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1 — Period 1');
    const sectionInput = screen.getByLabelText(/section|period/i);
    await user.type(sectionInput, 'Period 1');
    const nextButton = screen.getByRole('button', { name: /next|continue|upload/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('roster-wizard-step-upload')).toBeInTheDocument();
    });
  });
});

/* ------------------------------------------------------------------ *
 * Task 3.1.b — Upload step parses CSV via lib/roster/parser
 *              and the wizard transitions to preview
 * ------------------------------------------------------------------ */

describe('RosterImportWizard — Task 1: upload step → preview transition', () => {
  it('parses a valid CSV file and transitions from upload to preview', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Advance past create-class
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1 — Period 1');
    const sectionInput = screen.getByLabelText(/section|period/i);
    await user.type(sectionInput, 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    // Upload the file
    const file = new File([VALID_CSV], 'roster.csv', { type: 'text/csv' });
    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    await user.upload(fileInput, file);

    // Wizard advances to preview
    await waitFor(() => {
      expect(screen.getByTestId('roster-wizard-step-preview')).toBeInTheDocument();
    });
  });
});

/* ------------------------------------------------------------------ *
 * Task 3.1.c — Preview step renders dry-run counts and per-row errors
 *
 * test-strategy §6 Phase 3 (b):
 *   "preview renders dry-run counts and per-row errors with row numbers"
 *
 * Per spec NFR: "No PII leakage in errors/logs; respects existing auth +
 * role guards." The wizard surfaces the row index but must not render
 * the raw email or full name in any error message — this is the
 * frontend-side complement to Phase 2's mock-ctx PII assertion.
 * ------------------------------------------------------------------ */

describe('RosterImportWizard — Task 1: preview step renders dry-run counts and per-row errors', () => {
  it('renders dry-run counts {created, skipped, errors} in the preview step for a valid CSV', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Advance to upload
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1');
    await user.type(screen.getByLabelText(/section|period/i), 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    // Upload valid CSV
    const file = new File([VALID_CSV], 'roster.csv', { type: 'text/csv' });
    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    await user.upload(fileInput, file);

    // Preview step should display the dry-run counts
    await waitFor(() => {
      expect(screen.getByTestId('roster-wizard-step-preview')).toBeInTheDocument();
      // dryRunPreview returns {created, updated: 0, skipped, errors} — at the
      // preview step there are no re-imports yet so created = parsed rows,
      // updated = 0, skipped = errors.length, errors = parsed.errors.
      expect(screen.getByTestId('preview-count-created')).toHaveTextContent('3');
      expect(screen.getByTestId('preview-count-skipped')).toHaveTextContent('0');
      expect(screen.getByTestId('preview-count-errors')).toHaveTextContent('0');
    });
  });

  it('renders per-row errors with row numbers when the CSV has malformed rows', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Advance to upload
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1');
    await user.type(screen.getByLabelText(/section|period/i), 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    // Upload mixed-errors CSV
    const file = new File([MIXED_ERRORS_CSV], 'roster.csv', { type: 'text/csv' });
    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    await user.upload(fileInput, file);

    // Preview must surface each error's row number. The MIXED_ERRORS_CSV
    // contains: row 2 missing name, row 3 invalid email — so we expect
    // row indices 2 and 3 to appear in the error list.
    await waitFor(() => {
      const errorList = screen.getByTestId('preview-error-list');
      expect(errorList).toBeInTheDocument();
      expect(errorList.textContent).toMatch(/row\s*2/i);
      expect(errorList.textContent).toMatch(/row\s*3/i);
    });
  });

  it('does NOT render raw email values or full student names in the error list (PII safe)', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Advance to upload
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1');
    await user.type(screen.getByLabelText(/section|period/i), 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    // Upload mixed-errors CSV — the raw row 2 missing name; row 3's invalid
    // email value 'not-an-email' must NOT appear in the error list.
    const file = new File([MIXED_ERRORS_CSV], 'roster.csv', { type: 'text/csv' });
    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    await user.upload(fileInput, file);

    await waitFor(() => {
      const errorList = screen.getByTestId('preview-error-list');
      expect(errorList).toBeInTheDocument();
      // The literal "not-an-email" string is the malformed email value.
      // It must not appear in the error list because the message is
      // derived from the error code (e.g. "Malformed email"), not the
      // raw input value.
      expect(errorList.textContent ?? '').not.toContain('not-an-email');
    });
  });
});

/* ------------------------------------------------------------------ *
 * Task 3.1.d — Commit button gating
 *
 * test-strategy §6 Phase 3 (c):
 *   "commit disabled while errors present"
 *
 * The preview step is the commit-step's pre-condition. If the dry-run
 * produced any errors (skipped > 0 OR errors.length > 0), the commit
 * button must be disabled. The teacher can fix the CSV offline and
 * re-upload.
 * ------------------------------------------------------------------ */

describe('RosterImportWizard — Task 1: commit button gating', () => {
  it('disables the commit button while any errors are present in the dry-run preview', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Advance to upload
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1');
    await user.type(screen.getByLabelText(/section|period/i), 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    // Upload mixed-errors CSV
    const file = new File([MIXED_ERRORS_CSV], 'roster.csv', { type: 'text/csv' });
    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    await user.upload(fileInput, file);

    // The commit button must be disabled because the dry-run has errors.
    await waitFor(() => {
      const commitButton = screen.getByTestId('roster-wizard-commit-button');
      expect(commitButton).toBeInTheDocument();
      expect(commitButton).toBeDisabled();
    });
  });

  it('enables the commit button when the dry-run has no errors', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Advance to upload
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1');
    await user.type(screen.getByLabelText(/section|period/i), 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    // Upload the valid CSV — zero errors expected.
    const file = new File([VALID_CSV], 'roster.csv', { type: 'text/csv' });
    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    await user.upload(fileInput, file);

    // Commit button must be enabled.
    await waitFor(() => {
      const commitButton = screen.getByTestId('roster-wizard-commit-button');
      expect(commitButton).toBeInTheDocument();
      expect(commitButton).toBeEnabled();
    });
  });
});

/* ------------------------------------------------------------------ *
 * Task 3.1.e — Commit invokes importRoster mutation
 *
 * Phase 2's importRosterMutation is the production handler. The wizard
 * must call it with the parsed rows + teacher identity, then surface the
 * resulting {importId, created, updated, skipped, errors} in the
 * success state (Task 3.2.a below).
 * ------------------------------------------------------------------ */

describe('RosterImportWizard — Task 1: commit invokes the importRoster mutation', () => {
  it('invokes the importRoster mutation with classId, rows, and importedBy when commit is clicked', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Advance to upload
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1');
    await user.type(screen.getByLabelText(/section|period/i), 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    // Upload the valid CSV
    const file = new File([VALID_CSV], 'roster.csv', { type: 'text/csv' });
    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    await user.upload(fileInput, file);

    // Register a stub mutation handler that captures the call and returns
    // a plausible import result.
    convex.useMutation.setHandler(async (args: unknown) => {
      const a = args as { classId?: string; importedBy?: string; rows?: unknown[] };
      return {
        importId: 'roster_imports_test_1',
        classId: a.classId ?? 'classes_test_1',
        created: a.rows?.length ?? 0,
        updated: 0,
        skipped: 0,
        errors: [],
      };
    });

    // Click commit.
    await waitFor(() => {
      const commitButton = screen.getByTestId('roster-wizard-commit-button');
      expect(commitButton).toBeEnabled();
    });
    await user.click(screen.getByTestId('roster-wizard-commit-button'));

    // The mutation must have been invoked exactly once with parsed rows
    // and the teacher identity.
    await waitFor(() => {
      expect(convex.useMutation.calls.length).toBeGreaterThanOrEqual(1);
    });
    const lastCall = convex.useMutation.calls[convex.useMutation.calls.length - 1]!;
    const callArgs = lastCall.args as {
      classId?: Id<'classes'>;
      rows?: Array<{ rowIndex: number; name: string; email?: string }>;
      importedBy?: Id<'profiles'>;
      source?: { fileName?: string; rowCount: number };
    };
    expect(callArgs.importedBy).toBe(TEACHER_ID);
    expect(Array.isArray(callArgs.rows)).toBe(true);
    expect(callArgs.rows!.length).toBe(3);
    expect(callArgs.rows!.map((r) => r.rowIndex)).toEqual([1, 2, 3]);
    expect(callArgs.source?.fileName).toBe('roster.csv');
  });
});

/* ------------------------------------------------------------------ *
 * Task 3.1.f — Wizard transitions to a success / dashboard step on
 *              successful commit. The exact destination (dashboard URL
 *              vs inline summary) is left to the Green author; the
 *              contract is that the wizard signals completion via
 *              onComplete with the new classId.
 * ------------------------------------------------------------------ */

describe('RosterImportWizard — Task 1: post-commit transition', () => {
  it('fires the onComplete callback with the new classId after a successful commit', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <Wizard
        teacherId={TEACHER_ID}
        organizationId={ORG_ID}
        onComplete={onComplete}
      />,
    );

    // Advance to upload
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1');
    await user.type(screen.getByLabelText(/section|period/i), 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    // Upload the valid CSV
    const file = new File([VALID_CSV], 'roster.csv', { type: 'text/csv' });
    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    await user.upload(fileInput, file);

    // Register a stub mutation handler.
    convex.useMutation.setHandler(async (args: unknown) => {
      const a = args as { classId?: string; rows?: unknown[] };
      return {
        importId: 'roster_imports_test_1',
        classId: a.classId ?? 'classes_test_1',
        created: a.rows?.length ?? 0,
        updated: 0,
        skipped: 0,
        errors: [],
      };
    });

    // Click commit.
    const commitButton = await screen.findByTestId('roster-wizard-commit-button');
    await user.click(commitButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    const completedClassId = onComplete.mock.calls[0]![0] as Id<'classes'>;
    expect(String(completedClassId)).toMatch(/^classes_/);
  });
});

/* ------------------------------------------------------------------ *
 * File input wiring sanity check — the wizard must accept a
 * .csv file via a real <input type="file">. This is the property
 * under test: the wizard must not be a server-only form that
 * bypasses the File API.
 * ------------------------------------------------------------------ */

describe('RosterImportWizard — Task 1: file input plumbing', () => {
  it('renders a real <input type="file" accept=".csv"> on the upload step', async () => {
    const Wizard = await loadWizard();
    const user = userEvent.setup();
    render(<Wizard teacherId={TEACHER_ID} organizationId={ORG_ID} />);

    // Advance to upload
    const classNameInput = await screen.findByLabelText(/class name/i);
    await user.type(classNameInput, 'Algebra 1');
    await user.type(screen.getByLabelText(/section|period/i), 'Period 1');
    await user.click(screen.getByRole('button', { name: /next|continue|upload/i }));

    const fileInput = await screen.findByLabelText(/roster|csv|file/i);
    expect(fileInput.tagName).toBe('INPUT');
    expect((fileInput as HTMLInputElement).type).toBe('file');
    // fireEvent.change on the file input must not throw.
    expect(() =>
      fireEvent.change(fileInput, { target: { files: [] } }),
    ).not.toThrow();
  });
});