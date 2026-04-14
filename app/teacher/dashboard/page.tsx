import Link from 'next/link';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

type AtGlanceStatus = 'on-track' | 'behind' | 'not-started';

interface StudentRow {
  id: string;
  username: string;
  displayName: string | null;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
  currentLesson: string | null;
  atGlanceStatus: AtGlanceStatus;
}

interface TeacherDashboardData {
  teacher: {
    username: string;
    organizationName: string;
    organizationId: string;
  };
  students: StudentRow[];
}

function statusBadgeClass(status: AtGlanceStatus): string {
  switch (status) {
    case 'on-track':
      return 'bg-green-100 text-green-800';
    case 'behind':
      return 'bg-yellow-100 text-yellow-800';
    case 'not-started':
      return 'bg-muted/30 text-muted-foreground';
  }
}

export default async function TeacherDashboardPage() {
  const claims = await requireTeacherSessionClaims('/auth/login');

  const data: TeacherDashboardData | null = await fetchInternalQuery(
    internal.teacher.getTeacherDashboardData,
    { userId: claims.sub },
  );

  const students = data?.students ?? [];
  const orgName = data?.teacher.organizationName ?? 'Your Organization';

  const avgProgress = students.length > 0
    ? Math.round(students.reduce((s, st) => s + st.progressPercentage, 0) / students.length)
    : 0;

  const activeToday = students.filter((s) => {
    if (!s.lastActive) return false;
    const diff = Date.now() - new Date(s.lastActive).getTime();
    return diff < 86400000;
  }).length;

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-mono-num">
          {orgName}
        </p>
        <h1 className="text-3xl font-display font-bold text-foreground">Teacher Dashboard</h1>
      </div>

      {/* Module filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="module-filter" className="text-sm font-medium text-foreground">
          Module
        </label>
        <select
          id="module-filter"
          className="rounded-md border border-border px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue="1"
        >
          <option value="1">Module 1</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Students', value: students.length },
          { label: 'Avg Progress', value: `${avgProgress}%` },
          { label: 'Active Today', value: activeToday },
        ].map((stat) => (
          <div key={stat.label} className="card-workbook p-4 space-y-1 text-center">
            <p className="font-mono-num text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/teacher/gradebook"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
        >
          Gradebook
        </Link>
        <Link
          href="/teacher/students"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
        >
          Student Roster
        </Link>
        <Link
          href="/teacher/units"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
        >
          Units Overview
        </Link>
      </div>

      {/* Student table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Progress</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Current Lesson</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Phases</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No students enrolled.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/teacher/students?id=${student.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {student.displayName ?? student.username}
                    </Link>
                    <p className="text-xs text-muted-foreground">{student.username}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${student.progressPercentage}%` }}
                        />
                      </div>
                      <span className="font-mono-num text-xs text-muted-foreground w-10 text-right">
                        {student.progressPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {student.currentLesson ? (
                      <span className="text-xs text-foreground">{student.currentLesson}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(student.atGlanceStatus)}`}
                    >
                      {student.atGlanceStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-num text-xs text-muted-foreground">
                    {student.completedPhases}/{student.totalPhases}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                    {student.lastActive
                      ? new Date(student.lastActive).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}