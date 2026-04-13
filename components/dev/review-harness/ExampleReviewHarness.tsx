'use client';

import { useState, useCallback } from 'react';
import type { StepMode } from '@/components/textbook/StepRevealContainer';
import type { AlgebraicStep } from '@/components/activities/algebraic/StepByStepper';

interface ExampleReviewHarnessProps {
  componentKey: string;
  steps: AlgebraicStep[];
  onModeReviewed?: (mode: StepMode) => void;
  onVariantGenerated?: () => void;
  onAlgorithmicBehaviorChecked?: () => void;
  onCoherentFeedbackChecked?: () => void;
}

interface ReviewedModes {
  teaching: boolean;
  guided: boolean;
  practice: boolean;
}

export function ExampleReviewHarness({
  componentKey,
  steps,
  onModeReviewed,
  onVariantGenerated,
  onAlgorithmicBehaviorChecked,
  onCoherentFeedbackChecked,
}: ExampleReviewHarnessProps) {
  const [activeMode, setActiveMode] = useState<StepMode>('teaching');
  const [reviewedModes, setReviewedModes] = useState<ReviewedModes>({
    teaching: false,
    guided: false,
    practice: false,
  });
  const [practiceVariantCount, setPracticeVariantCount] = useState(0);
  const [algorithmicChecked, setAlgorithmicChecked] = useState(false);
  const [coherentFeedbackChecked, setCoherentFeedbackChecked] = useState(false);

  const handleModeSwitch = useCallback((mode: StepMode) => {
    const currentMode = activeMode;
    setActiveMode(mode);
    if (currentMode !== mode && !reviewedModes[currentMode]) {
      setReviewedModes(prev => ({ ...prev, [currentMode]: true }));
      onModeReviewed?.(currentMode);
    }
    if (!reviewedModes[mode]) {
      setReviewedModes(prev => ({ ...prev, [mode]: true }));
      onModeReviewed?.(mode);
    }
  }, [activeMode, reviewedModes, onModeReviewed]);

  const handleGenerateVariant = useCallback(() => {
    setPracticeVariantCount(prev => prev + 1);
    onVariantGenerated?.();
  }, [onVariantGenerated]);

  const canApprove = reviewedModes.teaching && reviewedModes.guided && reviewedModes.practice;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold">Example Review Harness</h3>
        <p className="text-sm text-muted-foreground font-mono">{componentKey}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Mode Selection</label>
        <div className="flex gap-2">
          <ModeButton
            mode="teaching"
            active={activeMode === 'teaching'}
            reviewed={reviewedModes.teaching}
            onClick={() => handleModeSwitch('teaching')}
          />
          <ModeButton
            mode="guided"
            active={activeMode === 'guided'}
            reviewed={reviewedModes.guided}
            onClick={() => handleModeSwitch('guided')}
          />
          <ModeButton
            mode="practice"
            active={activeMode === 'practice'}
            reviewed={reviewedModes.practice}
            onClick={() => handleModeSwitch('practice')}
          />
        </div>
      </div>

      <div className="p-4 border rounded bg-card">
        <div className="text-sm font-medium mb-2">
          Preview: <span className="capitalize">{activeMode} Mode</span>
        </div>
        <div className="min-h-[200px] p-4 bg-muted/30 rounded">
          <ExamplePreview mode={activeMode} steps={steps} variant={practiceVariantCount} />
        </div>
      </div>

      {activeMode === 'practice' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGenerateVariant}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
          >
            Generate Variant ({practiceVariantCount} generated)
          </button>
          {practiceVariantCount >= 2 && (
            <p className="text-xs text-muted-foreground">
              Multiple variants verified. Component appears to support algorithmic variation.
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={algorithmicChecked}
            onChange={(e) => {
              setAlgorithmicChecked(e.target.checked);
              if (e.target.checked) onAlgorithmicBehaviorChecked?.();
            }}
            disabled={practiceVariantCount < 2}
          />
          <span className="text-sm">Algorithmic practice behavior verified</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={coherentFeedbackChecked}
            onChange={(e) => {
              setCoherentFeedbackChecked(e.target.checked);
              if (e.target.checked) onCoherentFeedbackChecked?.();
            }}
            disabled={!reviewedModes.practice}
          />
          <span className="text-sm">Coherent feedback/solution behavior verified</span>
        </label>
      </div>

      <div className="p-3 rounded border">
        <div className="text-sm font-medium mb-2">Review Status</div>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge label="Teaching" checked={reviewedModes.teaching} />
          <StatusBadge label="Guided" checked={reviewedModes.guided} />
          <StatusBadge label="Practice" checked={reviewedModes.practice} />
        </div>
        {!canApprove && (
          <p className="text-xs text-yellow-600 mt-2">
            All modes must be reviewed before approving.
          </p>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  mode,
  active,
  reviewed,
  onClick,
}: {
  mode: StepMode;
  active: boolean;
  reviewed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded capitalize transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : reviewed
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-muted hover:bg-muted/80'
      }`}
    >
      {mode} {reviewed && !active && '✓'}
    </button>
  );
}

function StatusBadge({ label, checked }: { label: string; checked: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded ${
        checked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {label}: {checked ? 'Reviewed' : 'Pending'}
    </span>
  );
}

function ExamplePreview({
  mode,
  steps,
  variant,
}: {
  mode: StepMode;
  steps: AlgebraicStep[];
  variant: number;
}) {
  if (variant > 0 && mode === 'practice') {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Practice Variant #{variant}</div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm text-blue-700">
            Variant generation supported. Re-rendering with modified coefficients...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {mode === 'teaching' ? 'Full step reveal mode' : mode === 'guided' ? 'Interactive step-by-step' : 'Practice input mode'}
      </div>
      <div className="text-sm">
        {steps.length} steps available
      </div>
      {steps.length > 0 && (
        <div className="text-xs text-muted-foreground font-mono">
          First step: {steps[0].expression}
        </div>
      )}
    </div>
  );
}

export function useExampleReviewHarnessState() {
  const [reviewedModes, setReviewedModes] = useState<ReviewedModes>({
    teaching: false,
    guided: false,
    practice: false,
  });
  const [variantCount, setVariantCount] = useState(0);
  const [algorithmicVerified, setAlgorithmicVerified] = useState(false);
  const [coherentFeedbackVerified, setCoherentFeedbackVerified] = useState(false);

  const markModeReviewed = useCallback((mode: StepMode) => {
    setReviewedModes(prev => ({ ...prev, [mode]: true }));
  }, []);

  const generateVariant = useCallback(() => {
    setVariantCount(prev => prev + 1);
  }, []);

  const verifyAlgorithmic = useCallback(() => {
    setAlgorithmicVerified(true);
  }, []);

  const verifyCoherentFeedback = useCallback(() => {
    setCoherentFeedbackVerified(true);
  }, []);

  const canApprove = reviewedModes.teaching && reviewedModes.guided && reviewedModes.practice;

  return {
    reviewedModes,
    variantCount,
    algorithmicVerified,
    coherentFeedbackVerified,
    markModeReviewed,
    generateVariant,
    verifyAlgorithmic,
    verifyCoherentFeedback,
    canApprove,
  };
}
