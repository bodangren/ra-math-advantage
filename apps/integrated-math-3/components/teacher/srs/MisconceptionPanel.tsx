'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MisconceptionView {
  tag: string;
  count: number;
  affectedObjectives: string[];
}

export interface MisconceptionPanelProps {
  misconceptions: MisconceptionView[];
  isLoading?: boolean;
  onTimeWindowChange?: (days: number) => void;
}

const TIME_WINDOWS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MisconceptionView }> }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium text-foreground text-sm">{data.tag}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {data.count} occurrence{data.count !== 1 ? 's' : ''}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {data.affectedObjectives.length} objective{data.affectedObjectives.length !== 1 ? 's' : ''} affected
      </p>
    </div>
  );
}

export function MisconceptionPanel({
  misconceptions,
  isLoading = false,
  onTimeWindowChange,
}: MisconceptionPanelProps) {
  const [selectedWindow, setSelectedWindow] = useState(7);

  const handleWindowChange = (days: number) => {
    setSelectedWindow(days);
    onTimeWindowChange?.(days);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Misconception Diagnostics</h2>
        </div>
        <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (misconceptions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Misconception Diagnostics</h2>
          {onTimeWindowChange && (
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              {TIME_WINDOWS.map((window) => (
                <button
                  key={window.value}
                  onClick={() => handleWindowChange(window.value)}
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded transition-colors',
                    selectedWindow === window.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {window.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-10 w-10 text-green-500 mb-2" aria-hidden="true" />
          <p className="text-sm text-foreground font-medium">No misconceptions detected</p>
          <p className="text-xs text-muted-foreground mt-1">
            Students are showing strong understanding
          </p>
        </div>
      </div>
    );
  }

  const chartData = misconceptions.slice(0, 10);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Misconception Diagnostics</h2>
        {onTimeWindowChange && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              {TIME_WINDOWS.map((window) => (
                <button
                  key={window.value}
                  onClick={() => handleWindowChange(window.value)}
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded transition-colors',
                    selectedWindow === window.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {window.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="tag"
              tick={{ fontSize: 11 }}
              width={120}
              tickFormatter={(value) =>
                value.length > 18 ? `${value.substring(0, 18)}...` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#ef4444' : index < 3 ? '#f97316' : '#eab308'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Top {chartData.length} misconceptions</span>
          <span>
            {misconceptions.reduce((sum, m) => sum + m.count, 0)} total occurrences
          </span>
        </div>
      </div>
    </div>
  );
}
