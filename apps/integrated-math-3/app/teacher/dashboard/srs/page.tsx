import Link from 'next/link';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import {
  SrsDashboardPanel,
  WeakObjectivesPanel,
  StrugglingStudentsPanel,
  MisconceptionPanel,
} from '@/components/teacher/srs';

interface ClassOption {
  id: string;
  name: string;
}

interface SrsDashboardData {
  classes: ClassOption[];
  currentClassId: string | null;
  classHealth: {
    totalActiveStudents: number;
    practicedToday: number;
    avgRetention: number;
    totalCards: number;
  } | null;
  overdueLoad: {
    totalOverdue: number;
    perStudent: Array<{ studentId: string; overdueCount: number }>;
  } | null;
  streaks: Array<{ studentId: string; displayName: string; streak: number }>;
  weakObjectives: Array<{
    objectiveId: string;
    standardCode: string;
    standardDescription: string;
    proficientPercent: number;
    avgRetention: number;
    strugglingStudentCount: number;
    priority: 'essential' | 'supporting' | 'extension' | 'triaged';
  }>;
  strugglingStudents: Array<{
    studentId: string;
    displayName: string;
    overdueCount: number;
    avgRetention: number;
    weakestObjective: string;
  }>;
  misconceptions: Array<{
    tag: string;
    count: number;
    affectedObjectives: string[];
  }>;
}

interface PageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function SrsDashboardPage({ searchParams }: PageProps) {
  const claims = await requireTeacherSessionClaims('/auth/login');
  const { classId: selectedClassId } = await searchParams;

  const data: SrsDashboardData | null = await fetchInternalQuery(
    internal.teacher.getTeacherSrsDashboardData,
    { userId: claims.sub, classId: selectedClassId },
  );

  const currentClass = data?.classes.find((c) => c.id === data.currentClassId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono-num">
          <Link href="/teacher/dashboard" className="hover:text-foreground">
            Teacher Dashboard
          </Link>
          <span>/</span>
          <span>SRS Dashboard</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          {currentClass?.name ?? 'SRS Dashboard'}
        </h1>
        <p className="text-muted-foreground text-sm">
          Spaced Repetition System monitoring and interventions
        </p>
      </div>

      {data && data.classes.length > 0 && (
        <div className="flex items-center gap-4">
          <label htmlFor="class-select" className="text-sm font-medium text-foreground">
            Class
          </label>
          <select
            id="class-select"
            defaultValue={data.currentClassId ?? ''}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) {
                url.searchParams.set('classId', e.target.value);
              } else {
                url.searchParams.delete('classId');
              }
              window.location.href = url.toString();
            }}
            className="rounded-md border border-border px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {data.classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {data && data.currentClassId ? (
        <div className="space-y-6">
          <SrsDashboardPanel
            classHealth={data.classHealth}
            overdueLoad={data.overdueLoad}
            streaks={data.streaks}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeakObjectivesPanel
              objectives={data.weakObjectives}
            />

            <StrugglingStudentsPanel
              students={data.strugglingStudents}
            />
          </div>

          <MisconceptionPanel
            misconceptions={data.misconceptions}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">No classes available.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a class to start using SRS features.
          </p>
        </div>
      )}
    </div>
  );
}
