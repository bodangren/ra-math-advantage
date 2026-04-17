import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { StudentCompetencyDetailGrid } from '@/components/teacher/StudentCompetencyDetailGrid';
import type { StudentCompetencyDetail } from '@/lib/teacher/competency-heatmap';

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function TeacherStudentCompetencyPage({ params }: PageProps) {
  const { studentId } = await params;
  const claims = await requireTeacherSessionClaims('/auth/login');

  const studentCompetencyDetail = await fetchInternalQuery(
    internal.teacher.getTeacherStudentCompetencyDetail,
    {
      userId: claims.sub,
      studentId,
    },
  );

  if (!studentCompetencyDetail) redirect('/teacher/competency');

  const detail = studentCompetencyDetail as StudentCompetencyDetail;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      <header className="space-y-2">
        <Link
          href="/teacher/competency"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Competency Heatmap
        </Link>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Student Competency Detail
        </h1>
      </header>

      <section aria-label="Student competency detail">
        <StudentCompetencyDetailGrid detail={detail} />
      </section>
    </div>
  );
}
