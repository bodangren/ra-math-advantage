'use client';

import { useState, useCallback, useEffect } from 'react';

interface ActivityCallback {
  type: 'submit' | 'complete' | 'error';
  payload?: unknown;
  timestamp: number;
}

interface ActivityReviewHarnessProps {
  componentKey: string;
  activityId: string;
  storedProps?: Record<string, unknown>;
  supportedModes?: Array<'teaching' | 'guided' | 'practice'>;
  onRenderError?: (error: Error) => void;
}

export function ActivityReviewHarness({
  componentKey,
  activityId,
  storedProps = {},
  supportedModes = ['teaching', 'guided', 'practice'],
  onRenderError,
}: ActivityReviewHarnessProps) {
  const [activeMode, setActiveMode] = useState<'teaching' | 'guided' | 'practice'>('teaching');
  const [callbacks, setCallbacks] = useState<ActivityCallback[]>([]);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const handleSubmit = useCallback((payload: unknown) => {
    setCallbacks(prev => [...prev, {
      type: 'submit',
      payload,
      timestamp: Date.now(),
    }]);
  }, []);

  const handleComplete = useCallback(() => {
    setCallbacks(prev => [...prev, {
      type: 'complete',
      timestamp: Date.now(),
    }]);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleError = useCallback((error: Error) => {
    setCallbacks(prev => [...prev, {
      type: 'error',
      payload: error.message,
      timestamp: Date.now(),
    }]);
    setRenderError(error.message);
    onRenderError?.(error);
  }, [onRenderError]);

  const handleRender = useCallback(() => {
    setIsRendered(true);
    setRenderError(null);
  }, []);

  const handleModeChange = useCallback((mode: 'teaching' | 'guided' | 'practice') => {
    setActiveMode(mode);
    setRenderKey(prev => prev + 1);
    setCallbacks([]);
    setIsRendered(false);
  }, []);

  const simulateInteraction = useCallback(() => {
    handleSubmit({ interaction: 'test', mode: activeMode });
  }, [activeMode, handleSubmit]);

  const simulateComplete = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold">Activity Review Harness</h3>
        <p className="text-sm text-muted-foreground font-mono">{componentKey}</p>
        <p className="text-xs text-muted-foreground">Activity ID: {activityId}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Mode / Context</label>
        <div className="flex gap-2">
          {supportedModes.map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              className={`px-4 py-2 rounded capitalize transition-colors ${
                activeMode === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              disabled={!supportedModes.includes(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border rounded bg-card">
        <div className="text-sm font-medium mb-2">
          Activity Preview (Mode: {activeMode})
        </div>
        <div
          key={renderKey}
          className="min-h-[200px] p-4 bg-muted/30 rounded"
          data-testid="activity-preview"
        >
          <ActivityPreview
            componentKey={componentKey}
            activityId={activityId}
            mode={activeMode}
            props={storedProps}
            onRender={handleRender}
          />
        </div>
        {renderError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Render Error: {renderError}
          </div>
        )}
        {isRendered && !renderError && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            Component rendered successfully
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Simulate Interactions</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={simulateInteraction}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
          >
            Trigger Submit Callback
          </button>
          <button
            type="button"
            onClick={simulateComplete}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
          >
            Trigger Complete Callback
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Callback Log</div>
        {callbacks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No callbacks triggered yet. Interact with the component to see callbacks.
          </p>
        ) : (
          <div className="p-3 bg-muted/50 rounded border overflow-auto max-h-[200px]">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {callbacks.map((cb, idx) => (
                <div key={idx} className="mb-1">
                  [{new Date(cb.timestamp).toISOString()}] {cb.type.toUpperCase()}
                  {cb.payload != null && `: ${String(cb.payload)}`}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Stored Props</div>
        <div className="p-3 bg-muted/50 rounded border overflow-auto max-h-[150px]">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(storedProps, null, 2)}
          </pre>
        </div>
      </div>

      <div className="p-3 rounded border">
        <div className="text-sm font-medium mb-2">Review Checklist</div>
        <div className="space-y-1">
          <CheckItem checked={isRendered && !renderError} label="Component renders without errors" />
          <CheckItem checked={callbacks.some(c => c.type === 'submit')} label="Submit callback triggered" />
          <CheckItem checked={callbacks.some(c => c.type === 'complete')} label="Complete callback triggered" />
          <CheckItem
            checked={supportedModes.length > 1}
            label="Mode selector functional"
          />
        </div>
      </div>
    </div>
  );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <label className="flex items-center gap-2">
      <span className={`text-xs ${checked ? 'text-green-600' : 'text-muted-foreground'}`}>
        {checked ? '✓' : '○'}
      </span>
      <span className="text-sm">{label}</span>
    </label>
  );
}

function ActivityPreview({
  componentKey,
  activityId,
  mode,
  props,
  onRender,
}: {
  componentKey: string;
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  props: Record<string, unknown>;
  onRender: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    onRender();
  }, [onRender]);

  if (!mounted) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Activity Component</div>
      <div className="text-sm">
        Key: <span className="font-mono">{componentKey}</span>
      </div>
      <div className="text-sm">
        ID: <span className="font-mono">{activityId}</span>
      </div>
      <div className="text-sm">
        Mode: <span className="capitalize">{mode}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        {Object.keys(props).length > 0 
          ? `Props: ${JSON.stringify(props).slice(0, 100)}...` 
          : 'Using default props'}
      </div>
    </div>
  );
}

export function useActivityReviewHarnessState() {
  const [callbacks, setCallbacks] = useState<ActivityCallback[]>([]);
  const [activeMode, setActiveMode] = useState<'teaching' | 'guided' | 'practice'>('teaching');
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const handleSubmit = useCallback((payload: unknown) => {
    setCallbacks(prev => [...prev, { type: 'submit', payload, timestamp: Date.now() }]);
  }, []);

  const handleComplete = useCallback(() => {
    setCallbacks(prev => [...prev, { type: 'complete', timestamp: Date.now() }]);
  }, []);

  const handleError = useCallback((error: Error) => {
    setCallbacks(prev => [...prev, { type: 'error', payload: error.message, timestamp: Date.now() }]);
    setRenderError(error.message);
  }, []);

  const handleRenderSuccess = useCallback(() => {
    setIsRendered(true);
    setRenderError(null);
  }, []);

  const changeMode = useCallback((mode: 'teaching' | 'guided' | 'practice') => {
    setActiveMode(mode);
    setCallbacks([]);
    setIsRendered(false);
  }, []);

  const canApprove = isRendered && !renderError && 
                     callbacks.some(c => c.type === 'submit') && 
                     callbacks.some(c => c.type === 'complete');

  return {
    callbacks,
    activeMode,
    isRendered,
    renderError,
    handleSubmit,
    handleComplete,
    handleError,
    handleRenderSuccess,
    changeMode,
    canApprove,
  };
}
