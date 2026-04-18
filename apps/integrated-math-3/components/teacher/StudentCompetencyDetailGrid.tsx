'use client';

import { computeCompetencyColor, type StudentCompetencyDetail } from '@/lib/teacher/competency-heatmap';
import { cellBgClass } from '@/lib/teacher/gradebook';

interface StudentCompetencyDetailGridProps {
  detail: StudentCompetencyDetail;
}

export function StudentCompetencyDetailGrid({ detail }: StudentCompetencyDetailGridProps) {
  const { displayName, username, competencies } = detail;

  if (competencies.length === 0) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-muted-foreground">
        No competency data found for this student.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          {displayName} (@{username})
        </h2>
        <p className="text-sm text-muted-foreground">
          {competencies.length} standard{competencies.length !== 1 ? 's' : ''}
        </p>
      </section>

      <div className="rounded-xl border border-border overflow-x-auto">
        <table
          className="w-full text-xs"
          aria-label="Student competency detail"
        >
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground">
                Standard
              </th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground">
                Description
              </th>
              <th scope="col" className="text-center px-4 py-3 font-medium text-muted-foreground">
                Mastery Level
              </th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground">
                Unit
              </th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground">
                Primary Lesson
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {competencies.map((comp) => (
              <tr key={comp.standardId} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-2 font-medium">
                  <div>{comp.standardCode}</div>
                  {comp.category && (
                    <div className="text-xs text-muted-foreground font-normal">{comp.category}</div>
                  )}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {comp.standardDescription}
                </td>
                <td className={`text-center px-4 py-2 font-medium tabular-nums ${cellBgClass(computeCompetencyColor(comp.masteryLevel))}`}>
                  {comp.masteryLevel !== null ? `${comp.masteryLevel}%` : '—'}
                </td>
                <td className="px-4 py-2">
                  {comp.unitNumber ? `Module ${comp.unitNumber}` : '—'}
                </td>
                <td className="px-4 py-2">
                  {comp.lessonTitle || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
