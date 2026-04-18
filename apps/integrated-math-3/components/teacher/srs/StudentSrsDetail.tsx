'use client';

import { Clock, TrendingUp, AlertCircle, CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export interface ObjectiveCardSummary {
  objectiveId: string;
  objectiveDescription: string;
  standardCode: string;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  relearningCount: number;
  avgRetention: number;
  avgResponseTimeMs: number | null;
}

export interface ReviewHistoryEntry {
  reviewId: string;
  cardId: string;
  objectiveId: string;
  rating: string;
  reviewedAt: number;
  stateBefore: CardState;
  stateAfter: CardState;
  retention: number | null;
}

export interface StudentSrsDetailProps {
  studentId: string;
  studentName: string;
  cardSummary: ObjectiveCardSummary[];
  reviewHistory: ReviewHistoryEntry[];
  isLoading?: boolean;
}

const STATE_ICONS: Record<CardState, React.ElementType> = {
  new: Circle,
  learning: RefreshCw,
  review: CheckCircle,
  relearning: AlertCircle,
};

const STATE_COLORS: Record<CardState, string> = {
  new: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  learning: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  review: 'text-green-500 bg-green-50 dark:bg-green-950',
  relearning: 'text-red-500 bg-red-50 dark:bg-red-950',
};

function CardStateGrid({ summary }: { summary: ObjectiveCardSummary }) {
  const states: { key: CardState; count: number; label: string }[] = [
    { key: 'new', count: summary.newCount, label: 'New' },
    { key: 'learning', count: summary.learningCount, label: 'Learning' },
    { key: 'review', count: summary.reviewCount, label: 'Review' },
    { key: 'relearning', count: summary.relearningCount, label: 'Relearning' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground truncate">
          {summary.objectiveDescription}
        </span>
        <span className="text-xs font-mono-num text-muted-foreground ml-2">
          {summary.standardCode}
        </span>
      </div>
      <div className="flex gap-2">
        {states.map(({ key, count, label }) => {
          const Icon = STATE_ICONS[key];
          return (
            <div
              key={key}
              className={cn('flex items-center gap-1 px-2 py-1 rounded text-xs', STATE_COLORS[key])}
              title={`${label}: ${count}`}
            >
              <Icon className="h-3 w-3" aria-hidden="true" />
              <span className="font-mono-num">{count}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {summary.avgRetention > 0 && (
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
            {(summary.avgRetention * 100).toFixed(0)}% retention
          </span>
        )}
        {summary.avgResponseTimeMs !== null && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {(summary.avgResponseTimeMs / 1000).toFixed(1)}s avg
          </span>
        )}
      </div>
    </div>
  );
}

function ReviewTimeline({ reviews }: { reviews: ReviewHistoryEntry[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No review history available
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {reviews.slice(0, 20).map((review, index) => {
        const date = new Date(review.reviewedAt);
        const ratingColor =
          review.rating === 'easy' || review.rating === 'good'
            ? 'text-green-500'
            : review.rating === 'hard'
              ? 'text-yellow-500'
              : 'text-red-500';

        return (
          <div
            key={review.reviewId}
            className="flex items-center gap-3 text-xs p-2 rounded hover:bg-muted/30"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <span className="font-mono-num text-[10px]">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('font-medium', ratingColor)}>{review.rating}</span>
                <span className="text-muted-foreground">
                  {review.stateBefore} → {review.stateAfter}
                </span>
              </div>
              <div className="text-muted-foreground">
                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {review.retention !== null && (
              <span className="text-xs font-mono-num text-muted-foreground">
                {(review.retention * 100).toFixed(0)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StudentSrsDetail({
  studentName,
  cardSummary,
  reviewHistory,
  isLoading = false,
}: StudentSrsDetailProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="h-8 bg-muted/50 rounded animate-pulse w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">SRS Detail</h2>
        <p className="text-sm text-muted-foreground">{studentName}</p>
      </div>

      {cardSummary.length === 0 && reviewHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" aria-hidden="true" />
          <p className="text-sm text-foreground font-medium">No SRS Data</p>
          <p className="text-xs text-muted-foreground mt-1">
            This student hasn&apos;t practiced yet
          </p>
        </div>
      ) : (
        <>
          {cardSummary.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Card States by Objective</h3>
              <div className="space-y-4">
                {cardSummary.map((summary) => (
                  <div
                    key={summary.objectiveId}
                    className="p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <CardStateGrid summary={summary} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Recent Review History</h3>
              <ReviewTimeline reviews={reviewHistory} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
