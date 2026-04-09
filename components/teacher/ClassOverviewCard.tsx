'use client';

import { Users, TrendingUp, Calendar } from 'lucide-react';

export interface ClassOverviewCardProps {
  totalStudents: number;
  averageProgress: number;
  upcomingAssignments: number;
}

export function ClassOverviewCard({
  totalStudents,
  averageProgress,
  upcomingAssignments,
}: ClassOverviewCardProps) {
  const stats = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Average Progress',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      label: 'Upcoming Assignments',
      value: upcomingAssignments,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-6">Class Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <article
            key={stat.label}
            className={`${stat.bgColor} border border-border rounded-lg p-4`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
