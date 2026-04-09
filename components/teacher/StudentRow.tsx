'use client';

import { MessageSquare, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StudentRowProps {
  studentId: string;
  studentName: string;
  progress: number;
  onViewDetails: (studentId: string) => void;
  onMessage: (studentId: string) => void;
}

export function StudentRow({
  studentId,
  studentName,
  progress,
  onViewDetails,
  onMessage,
}: StudentRowProps) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-4 px-4">
        <div className="font-medium text-foreground">{studentName}</div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full bg-muted rounded-full h-2"
            >
              <div
                data-testid="progress-bar-fill"
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  progress === 100 ? 'bg-green-600' : 'bg-orange-600'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-foreground w-12 text-right">
            {progress}%
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(studentId)}
            aria-label={`View details for ${studentName}`}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMessage(studentId)}
            aria-label={`Message ${studentName}`}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="Message"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
