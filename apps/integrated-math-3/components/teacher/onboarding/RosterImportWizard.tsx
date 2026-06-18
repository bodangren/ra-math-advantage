'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { parseRoster } from '@/lib/roster/parser';
import { dryRunPreview } from '@/lib/roster/dry-run';
import type { RosterParseResult, RosterImportResult } from '@/lib/roster/csv-contract';

type WizardStep = 'create-class' | 'upload' | 'preview';

interface RosterImportWizardProps {
  teacherId: Id<'profiles'>;
  organizationId?: Id<'organizations'>;
  onComplete?: (classId: Id<'classes'>) => void;
}

export function RosterImportWizard({
  teacherId,
  organizationId,
  onComplete,
}: RosterImportWizardProps) {
  const [step, setStep] = useState<WizardStep>('create-class');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [classId, setClassId] = useState<Id<'classes'> | null>(null);
  const [parsedResult, setParsedResult] = useState<RosterParseResult | null>(null);
  const [dryRunResult, setDryRunResult] = useState<RosterImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [committing, setCommitting] = useState(false);
  const [creatingClass, setCreatingClass] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onboardingApi = (api as any).onboarding;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createClass = useMutation(onboardingApi.rosterImport.createClass as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const importRoster = useMutation(onboardingApi.rosterImport.importRoster as any);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdvanceToUpload = useCallback(async () => {
    if (!className.trim() || creatingClass) return;
    setCreatingClass(true);
    try {
      const { classId: newClassId } = (await createClass({
        teacherId,
        name: className.trim(),
        section: section.trim() || undefined,
        organizationId,
      })) as { classId: Id<'classes'> };
      setClassId(newClassId);
      setStep('upload');
    } finally {
      setCreatingClass(false);
    }
  }, [className, section, teacherId, organizationId, createClass, creatingClass]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parsed = parseRoster(text);
      const dryRun = dryRunPreview(parsed);
      setParsedResult(parsed);
      setDryRunResult(dryRun);
      setStep('preview');
    };
    reader.readAsText(file);
  }, []);

  const [pendingCommit, setPendingCommit] = useState(false);

  const handleCommit = useCallback(() => {
    if (!classId || !parsedResult || committing || pendingCommit) return;
    setPendingCommit(true);
  }, [classId, parsedResult, committing, pendingCommit]);

  useEffect(() => {
    if (!pendingCommit) return;
    if (!classId || !parsedResult) return;

    let cancelled = false;
    const doCommit = async () => {
      setCommitting(true);
      try {
        const result = (await importRoster({
          classId,
          rows: parsedResult.rows,
          importedBy: teacherId,
          source: { fileName: fileName || undefined, rowCount: parsedResult.rows.length },
        })) as { classId?: Id<'classes'> };

        if (!cancelled) {
          onComplete?.(result.classId ?? classId);
        }
      } finally {
        if (!cancelled) {
          setCommitting(false);
          setPendingCommit(false);
        }
      }
    };
    doCommit();
    return () => { cancelled = true; };
  }, [pendingCommit, classId, parsedResult, importRoster, teacherId, fileName, onComplete]);

  const isClassNameValid = className.trim().length > 0;
  const hasErrors = dryRunResult && dryRunResult.errors.length > 0;
  const isCommitPending = committing || pendingCommit;
  const canCommit = dryRunResult && !hasErrors && !isCommitPending;

  return (
    <div data-testid="roster-wizard">
      {step === 'create-class' && (
        <div data-testid="roster-wizard-step-create-class">
          <h2>Create a Class</h2>
          <div>
            <label htmlFor="roster-class-name">Class Name</label>
            <input
              id="roster-class-name"
              aria-label="Class name"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Algebra 1 — Period 1"
            />
          </div>
          <div>
            <label htmlFor="roster-section">Section / Period</label>
            <input
              id="roster-section"
              aria-label="Section / Period"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Period 1"
            />
          </div>
          <button
            type="button"
            disabled={!isClassNameValid || creatingClass}
            onClick={handleAdvanceToUpload}
          >
            {creatingClass ? 'Creating...' : 'Next: Upload Roster'}
          </button>
        </div>
      )}

      {step === 'upload' && (
        <div data-testid="roster-wizard-step-upload">
          <h2>Upload Roster</h2>
          <div>
            <label htmlFor="roster-file-input">Roster CSV File</label>
            <input
              id="roster-file-input"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              aria-label="Upload roster CSV file"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div data-testid="roster-wizard-step-preview">
          <h2>Preview Import</h2>
          {dryRunResult && (
            <>
              <div>
                <span data-testid="preview-count-created">{dryRunResult.created}</span>
                <span data-testid="preview-count-skipped">{dryRunResult.skipped}</span>
                <span data-testid="preview-count-errors">{dryRunResult.errors.length}</span>
              </div>
              {dryRunResult.errors.length > 0 && (
                <ul data-testid="preview-error-list">
                  {dryRunResult.errors.map((err, i) => (
                    <li key={i}>Row {err.rowIndex}: {err.message}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                data-testid="roster-wizard-commit-button"
                disabled={!canCommit}
                onClick={handleCommit}
              >
                {committing ? 'Importing...' : 'Commit Import'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default RosterImportWizard;
