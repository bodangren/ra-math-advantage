'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExampleReviewHarness, PracticeReviewHarness, ActivityReviewHarness } from '@/components/dev/review-harness';
import type { AlgebraicStep } from '@/components/activities/algebraic/StepByStepper';

interface ReviewQueueItem {
  componentKind: 'activity' | 'example' | 'practice';
  componentId: string;
  componentKey?: string;
  displayName?: string;
  currentHash?: string;
  storedHash?: string;
  isStale?: boolean;
  approval?: {
    status: string;
    contentHash?: string;
    reviewedAt?: number;
    reviewedBy?: string;
  };
}

interface Filters {
  componentKind: string;
  status: string;
  onlyStale: boolean;
}

export function ReviewQueueClient() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    componentKind: '',
    status: '',
    onlyStale: false,
  });
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.componentKind) params.set('componentKind', filters.componentKind);
      if (filters.status) params.set('status', filters.status);
      if (filters.onlyStale) params.set('onlyStale', 'true');

      const res = await fetch(`/api/dev/review-queue?${params}`);
      if (!res.ok) throw new Error('Failed to fetch review queue');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  async function handleReviewSubmit(
    componentKind: string,
    componentId: string,
    status: string,
    comment?: string,
    issueTags?: string[],
    priority?: string
  ) {
    const res = await fetch('/api/dev/review-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        componentKind,
        componentId,
        status,
        comment,
        issueTags,
        priority,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to submit review');
    }

    setSelectedItem(null);
    fetchQueue();
  }

  return { items, loading, error, filters, setFilters, selectedItem, setSelectedItem, handleReviewSubmit };
}

export function ReviewQueueList({
  items,
  loading,
  error,
  filters,
  setFilters,
  onSelectItem,
}: {
  items: ReviewQueueItem[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  onSelectItem: (item: ReviewQueueItem) => void;
}) {
  if (loading) {
    return <div className="text-muted-foreground">Loading review queue...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error: {error}</div>;
  }

  if (items.length === 0) {
    return <div className="text-muted-foreground">No items match your filters.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <select
          value={filters.componentKind}
          onChange={(e) => setFilters({ ...filters, componentKind: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">All kinds</option>
          <option value="activity">Activity</option>
          <option value="example">Example</option>
          <option value="practice">Practice</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="approved">Approved</option>
          <option value="needs_changes">Needs Changes</option>
          <option value="rejected">Rejected</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.onlyStale}
            onChange={(e) => setFilters({ ...filters, onlyStale: e.target.checked })}
          />
          <span className="text-sm">Only stale</span>
        </label>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={`${item.componentKind}-${item.componentId}`}
            onClick={() => onSelectItem(item)}
            className="w-full text-left p-4 border rounded hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{item.displayName || item.componentKey || item.componentId}</span>
                <span className="ml-2 text-xs px-2 py-0.5 bg-muted rounded">{item.componentKind}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.isStale && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">Stale</span>
                )}
                {item.approval?.status && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.approval.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : item.approval.status === 'needs_changes'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.approval.status}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              {item.currentHash?.slice(0, 8) || 'No hash'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewDecisionPanel({
  item,
  onSubmit,
  onCancel,
}: {
  item: ReviewQueueItem;
  onSubmit: (status: string, comment?: string, issueTags?: string[], priority?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<string>('');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const issueTagOptions = [
    'math_correctness',
    'curriculum_alignment',
    'pedagogy',
    'wording',
    'ui_behavior',
    'answer_validation',
    'feedback_quality',
    'algorithmic_variation',
    'accessibility',
  ];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!status) {
      setError('Please select a decision');
      return;
    }
    if ((status === 'needs_changes' || status === 'rejected') && !comment) {
      setError('Comment is required for needs_changes or rejected');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(status, comment || undefined, selectedTags.length > 0 ? selectedTags : undefined, priority || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-card">
      <div className="space-y-2">
        <h3 className="font-semibold">Review Decision</h3>
        <p className="text-sm text-muted-foreground">
          {item.displayName || item.componentKey || item.componentId} ({item.componentKind})
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Decision</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatus('approved')}
            className={`px-4 py-2 rounded ${
              status === 'approved' ? 'bg-green-600 text-white' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setStatus('needs_changes')}
            className={`px-4 py-2 rounded ${
              status === 'needs_changes' ? 'bg-yellow-600 text-white' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Needs Changes
          </button>
          <button
            type="button"
            onClick={() => setStatus('rejected')}
            className={`px-4 py-2 rounded ${
              status === 'rejected' ? 'bg-red-600 text-white' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Reject
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Priority</label>
        <div className="flex gap-2">
          {['low', 'medium', 'high'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-3 py-1 rounded text-sm ${
                priority === p ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Issue Tags</label>
        <div className="flex flex-wrap gap-2">
          {issueTagOptions.map((tag) => (
            <label key={tag} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTags([...selectedTags, tag]);
                  } else {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  }
                }}
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={status === 'approved' ? 'Optional comment' : 'Required comment...'}
          className="w-full border rounded p-2 min-h-[100px]"
        />
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-muted/50"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          disabled={submitting || !status}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

type ReviewView = 'decision' | 'harness';

export function ReviewQueueView() {
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [filters, setFilters] = useState<Filters>({
    componentKind: '',
    status: '',
    onlyStale: false,
  });
  const [reviewView, setReviewView] = useState<ReviewView>('decision');

  const { items, loading, error, handleReviewSubmit } = ReviewQueueClient();

  const handleItemSelect = useCallback((item: ReviewQueueItem) => {
    setSelectedItem(item);
    setReviewView('decision');
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-workbook p-6">
        <h2 className="text-lg font-semibold mb-4">Review Queue</h2>
        <ReviewQueueList
          items={items}
          loading={loading}
          error={error}
          filters={filters}
          setFilters={setFilters}
          onSelectItem={handleItemSelect}
        />
      </div>

      <div className="card-workbook p-6">
        {selectedItem ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {reviewView === 'decision' ? 'Review Decision' : 'Component Harness'}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewView('decision')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    reviewView === 'decision'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Decision
                </button>
                <button
                  type="button"
                  onClick={() => setReviewView('harness')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    reviewView === 'harness'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Harness
                </button>
              </div>
            </div>
            {reviewView === 'decision' ? (
              <ReviewDecisionPanel
                item={selectedItem}
                onSubmit={async (status, comment, issueTags, priority) => {
                  await handleReviewSubmit(
                    selectedItem.componentKind,
                    selectedItem.componentId,
                    status,
                    comment,
                    issueTags,
                    priority
                  );
                }}
                onCancel={() => setSelectedItem(null)}
              />
            ) : (
              <ComponentHarnessPanel item={selectedItem} />
            )}
          </>
        ) : (
          <p className="text-muted-foreground">Select an item from the queue to review.</p>
        )}
      </div>
    </div>
  );
}

function ComponentHarnessPanel({ item }: { item: ReviewQueueItem }) {
  const sampleSteps: AlgebraicStep[] = [
    {
      expression: 'x^2 + 5x + 6 = 0',
      explanation: 'Start with the quadratic equation in standard form.',
    },
    {
      expression: '(x + 2)(x + 3) = 0',
      explanation: 'Factor the trinomial into two binomials.',
    },
    {
      expression: 'x = -2 or x = -3',
      explanation: 'Apply the Zero Product Property.',
    },
  ];

  const defaultActivityProps = {
    activityId: item.componentId,
    mode: 'teaching' as const,
    variant: 'plot_from_equation',
    equation: 'y = x^2',
  };

  switch (item.componentKind) {
    case 'example':
      return (
        <ExampleReviewHarness
          componentKey={item.componentKey || item.componentId}
          steps={sampleSteps}
        />
      );
    case 'practice':
      return (
        <PracticeReviewHarness
          componentKey={item.componentKey || item.componentId}
          componentProps={defaultActivityProps}
        />
      );
    case 'activity':
    default:
      return (
        <ActivityReviewHarness
          componentKey={item.componentKey || item.componentId}
          activityId={item.componentId}
          storedProps={defaultActivityProps}
        />
      );
  }
}