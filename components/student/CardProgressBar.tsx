'use client';

export interface CardProgressBarProps {
  currentIndex: number;
  totalCount: number;
}

export function CardProgressBar({ currentIndex, totalCount }: CardProgressBarProps) {
  const currentCard = currentIndex + 1;
  const percentage = totalCount > 0 ? (currentCard / totalCount) * 100 : 0;

  return (
    <div className="space-y-2">
      <div
        className="h-2 w-full rounded-full bg-muted overflow-hidden"
        data-testid="card-progress-bar"
        role="progressbar"
        aria-valuenow={currentCard}
        aria-valuemin={1}
        aria-valuemax={totalCount}
        aria-label={`Card ${currentCard} of ${totalCount}`}
      >
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          Card {currentCard} of {totalCount}
        </span>
        <span
          className="text-muted-foreground font-mono-num"
          data-testid="card-progress-counter"
        >
          {currentCard} / {totalCount}
        </span>
      </div>
    </div>
  );
}