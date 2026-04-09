'use client';

import { BookOpen, Clock, Target, Flame } from 'lucide-react';

export interface StatsSummaryProps {
  lessonsCompleted: number;
  timeSpent: number;
  averageScore: number;
  streakDays: number;
}

const stats = [
  {
    key: 'lessonsCompleted',
    label: 'Lessons Completed',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    key: 'timeSpent',
    label: 'Minutes Spent',
    icon: Clock,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    key: 'averageScore',
    label: 'Average Score',
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
  {
    key: 'streakDays',
    label: 'Day Streak',
    icon: Flame,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
  },
];

export function StatsSummary({
  lessonsCompleted,
  timeSpent,
  averageScore,
  streakDays,
}: StatsSummaryProps) {
  const values = {
    lessonsCompleted,
    timeSpent,
    averageScore,
    streakDays,
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-4">Your Progress</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => {
          const StatIcon = stat.icon;
          const value = values[stat.key as keyof typeof values];
          
          return (
            <article
              key={stat.key}
              className={`${stat.bgColor} border border-border rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <StatIcon className={`h-5 w-5 ${stat.color}`} aria-label={stat.label} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
