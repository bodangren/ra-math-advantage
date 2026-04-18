import Link from 'next/link';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

interface StudentRow {
  id: string;
  username: string;
  displayName: string | null;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
}

export default async function AdminDashboardPage() {
  const claims = await requireTeacherSessionClaims('/auth/login');

  const data: {
    teacher: { username: string; organizationName: string; organizationId: string };
    students: StudentRow[];
  } | null = await fetchInternalQuery(internal.teacher.getTeacherDashboardData, {
    userId: claims.sub,
  });

  const students = data?.students ?? [];
  const orgName = data?.teacher.organizationName ?? 'Your Organization';

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="section-label">Admin</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{orgName} · {claims.username}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Students', value: students.length },
          {
            label: 'Avg Progress',
            value: students.length > 0
              ? `${Math.round(students.reduce((s, st) => s + st.progressPercentage, 0) / students.length)}%`
              : '—',
          },
          { label: 'Completed', value: students.filter((s) => s.progressPercentage === 100).length },
          { label: 'Active', value: students.filter((s) => s.completedPhases > 0).length },
        ].map((stat) => (
          <div key={stat.label} className="card-workbook p-4 space-y-1 text-center">
            <p className="font-mono-num text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Admin nav */}
      <div className="flex flex-wrap gap-3">
        <Link href="/teacher/dashboard" className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors">
          Teacher View
        </Link>
        <Link href="/teacher/gradebook" className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors">
          Gradebook
        </Link>
        <Link href="/teacher/students" className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors">
          Student Roster
        </Link>
        <Link href="/settings" className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors">
          Settings
        </Link>
      </div>
    </div>
  );
}
