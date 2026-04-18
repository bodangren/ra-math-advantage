import Link from 'next/link';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { cellBgClass, type GradebookRow, type GradebookLesson } from '@/lib/teacher/gradebook';
import { GradebookExportButton } from '@/components/teacher/GradebookExportButton';

const UNIT_COUNT = 9;

interface PageProps {
  searchParams: Promise<{ unit?: string }>;
}

export default async function GradebookPage({ searchParams }: PageProps) {
  const claims = await requireTeacherSessionClaims('/auth/login');
  const { unit } = await searchParams;
  const unitNumber = Math.max(1, Math.min(UNIT_COUNT, parseInt(unit ?? '1', 10) || 1));

  const data: { rows: GradebookRow[]; lessons: GradebookLesson[] } | null =
    await fetchInternalQuery(internal.teacher.getTeacherGradebookData, {
      userId: claims.sub,
      unitNumber,
    });

  const rows = data?.rows ?? [];
  const lessons = data?.lessons ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-foreground">Gradebook</h1>
        </div>
        <GradebookExportButton rows={rows} lessons={lessons} />
      </div>

      {/* Unit selector */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: UNIT_COUNT }, (_, i) => i + 1).map((u) => (
          <Link
            key={u}
            href={`/teacher/gradebook?unit=${u}`}
            className={[
              'px-3 py-1.5 rounded-md text-sm font-mono-num font-medium border transition-colors',
              u === unitNumber
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'border-border text-muted-foreground hover:bg-muted/40',
            ].join(' ')}
          >
            U{u}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground min-w-32 sticky left-0 bg-muted/50">
                Student
              </th>
              {lessons.map((lesson) => (
                <th
                  key={lesson.lessonId}
                  className="text-center px-2 py-3 font-medium text-muted-foreground min-w-24"
                  title={lesson.lessonTitle}
                >
                  <span className="block truncate max-w-20 mx-auto">{lesson.lessonTitle}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={lessons.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                  No data for this unit.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.studentId} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-2 font-medium text-foreground sticky left-0 bg-card">
                    <Link
                      href={`/teacher/students?id=${row.studentId}`}
                      className="hover:text-primary transition-colors"
                    >
                      {row.displayName}
                    </Link>
                  </td>
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={cell.lesson.lessonId}
                      className={`text-center px-2 py-2 ${cellBgClass(cell.color)}`}
                    >
                      <Link
                        href={`/teacher/students?id=${row.studentId}&lesson=${cellIndex}`}
                        className="block hover:opacity-80 transition-opacity"
                        title={`${cell.lesson.lessonTitle} - ${cell.completionStatus}`}
                      >
                        {cell.masteryLevel !== null ? `${cell.masteryLevel}%` : '—'}
                      </Link>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 inline-block" />Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-100 inline-block" />In Progress</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 inline-block" />Needs Attention</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/30 inline-block" />Not Started</span>
      </div>
    </div>
  );
}
