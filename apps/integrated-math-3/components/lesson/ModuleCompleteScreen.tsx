'use client';

import { useRouter } from 'next/navigation';
import { Award, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModuleCompleteScreenProps {
  moduleLabel: string;
  lessonsCompleted: number;
  totalLessons: number;
  totalTimeMinutes: number;
  onBackToDashboard?: () => void;
  dashboardHref?: string;
  className?: string;
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min`;
}

export function ModuleCompleteScreen({
  moduleLabel,
  lessonsCompleted,
  totalLessons,
  totalTimeMinutes,
  onBackToDashboard,
  dashboardHref = '/student/dashboard',
  className,
}: ModuleCompleteScreenProps) {
  const router = useRouter();
  const isFullyComplete = lessonsCompleted === totalLessons;

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      router.push(dashboardHref);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-6 py-12 text-center',
        className
      )}
      data-testid="module-complete-screen"
    >
      <Award className="h-20 w-20 text-amber-500" />

      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Module Complete!</h2>
        <p className="text-xl font-medium text-foreground">{moduleLabel}</p>
      </div>

      <div className="space-y-1 text-muted-foreground">
        <p>{lessonsCompleted} / {totalLessons} lessons completed</p>
        <p>Total time: {formatTime(totalTimeMinutes)}</p>
        {isFullyComplete && (
          <p className="text-green-600 font-medium font-semibold mt-2">
            You&apos;ve mastered all lessons in this module!
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleBackToDashboard}
        className="mt-4"
        data-testid="module-complete-dashboard-btn"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
    </div>
  );
}
