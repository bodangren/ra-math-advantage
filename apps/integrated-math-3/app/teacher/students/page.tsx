import Link from 'next/link';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { SubmissionReviewPanel } from '@/components/teacher/SubmissionReviewPanel';

interface StudentRow {
  id: string;
  username: string;
  displayName: string | null;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
  atGlanceStatus: 'on-track' | 'behind' | 'not-started';
  currentLesson: string | null;
}

interface StudentDetailLesson {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  totalPhases: number;
  completedPhases: number;
  progressPercentage: number;
}

interface StudentDetailUnit {
  unitNumber: number;
  unitTitle: string;
  lessons: StudentDetailLesson[];
}

interface StudentDetail {
  status: 'success' | 'unauthorized' | 'not_found';
  organizationName?: string;
  student?: { id: string; username: string; displayName: string | null };
  snapshot?: {
    completedPhases: number;
    totalPhases: number;
    progressPercentage: number;
    lastActive: string | null;
    currentLesson: string | null;
    atGlanceStatus: 'on-track' | 'behind' | 'not-started';
  };
  units?: StudentDetailUnit[];
}

interface PageProps {
  searchParams: Promise<{ id?: string; lesson?: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  'on-track': 'On Track',
  'behind': 'Behind',
  'not-started': 'Not Started',
};

const STATUS_COLORS: Record<string, string> = {
  'on-track': 'bg-green-100 text-green-800',
  'behind': 'bg-red-100 text-red-800',
  'not-started': 'bg-muted text-muted-foreground',
};

/**
 * Renders a single lesson progress card within the student detail view,
 * showing completion percentage, phase counts, and a progress bar.
 *
 * @param {StudentDetailLesson} lesson - The lesson data including progress metrics.
 * @param {number} index - The lesson's index position in the list.
 * @param {number} scrollTarget - The index of the lesson to highlight as the scroll target.
 * @returns {JSX.Element} The lesson card JSX element.
 */
function LessonCard({
  lesson,
  index,
  scrollTarget,
}: {
  lesson: StudentDetailLesson;
  index: number;
  scrollTarget: number;
}) {
  const isTarget = index === scrollTarget;
  const progressColor =
    lesson.progressPercentage === 100
      ? 'bg-green-500'
      : lesson.progressPercentage > 0
        ? 'bg-yellow-500'
        : 'bg-muted';

  return (
    <div
      id={`lesson-${index}`}
      data-lesson-index={index}
      data-testid="teacher-student-detail-lesson-card"
      className={[
        'card-workbook p-4 space-y-3 border',
        isTarget ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-medium text-foreground truncate">{lesson.title}</h3>
          {lesson.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {lesson.description}
            </p>
          )}
        </div>
        <span
          className={[
            'shrink-0 px-2 py-0.5 rounded-full text-xs font-medium',
            lesson.progressPercentage === 100
              ? 'bg-green-100 text-green-800'
              : lesson.progressPercentage > 0
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-muted text-muted-foreground',
          ].join(' ')}
        >
          {lesson.completedPhases}/{lesson.totalPhases}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${progressColor}`}
          style={{ width: `${lesson.progressPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{lesson.progressPercentage}% complete</span>
        {lesson.totalPhases > 0 && (
          <span className="font-mono-num">
            {lesson.completedPhases} of {lesson.totalPhases} phases
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Renders the full student detail view including a back link, summary
 * stats, per-unit lesson progress cards, and a submission review panel.
 * Displays an error message if the student data could not be loaded.
 *
 * @param {StudentDetail} detail - The student detail data from the server query.
 * @param {number} scrollTarget - The lesson index to scroll to on mount.
 * @returns {JSX.Element} The student detail view JSX element.
 */
function StudentDetailView({
  detail,
  scrollTarget,
}: {
  detail: StudentDetail;
  scrollTarget: number;
}) {
  if (detail.status !== 'success' || !detail.student || !detail.snapshot || !detail.units) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {detail.status === 'unauthorized'
          ? 'You are not authorized to view this student.'
          : detail.status === 'not_found'
            ? 'Student not found.'
            : 'Unable to load student details.'}
      </div>
    );
  }

  const { student, snapshot, units } = detail;

  return (
    <div className="space-y-6" data-testid="teacher-student-detail">
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/students"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="teacher-student-detail-back-link"
        >
          ← Back to all students
        </Link>
      </div>

      <div className="card-workbook p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {student.displayName ?? student.username}
            </h2>
            <p className="text-sm text-muted-foreground">@{student.username}</p>
          </div>
          <span
            className={[
              'px-3 py-1 rounded-full text-sm font-medium',
              STATUS_COLORS[snapshot.atGlanceStatus],
            ].join(' ')}
          >
            {STATUS_LABELS[snapshot.atGlanceStatus]}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold font-mono-num text-primary">
              {snapshot.progressPercentage}%
            </p>
            <p className="text-xs text-muted-foreground">Overall Progress</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold font-mono-num text-foreground">
              {snapshot.completedPhases}/{snapshot.totalPhases}
            </p>
            <p className="text-xs text-muted-foreground">Phases Completed</p>
          </div>
          {snapshot.currentLesson && (
            <div className="p-3 rounded-lg bg-muted/50 col-span-2">
              <p className="text-lg font-medium text-foreground truncate">
                {snapshot.currentLesson}
              </p>
              <p className="text-xs text-muted-foreground">Current Lesson</p>
            </div>
          )}
        </div>

        {snapshot.lastActive && (
          <p className="text-sm text-muted-foreground">
            Last active: {new Date(snapshot.lastActive).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {units.map((unit) => (
          <div key={unit.unitNumber} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{unit.unitTitle}</h3>
              <span className="text-sm text-muted-foreground">Module {unit.unitNumber}</span>
            </div>
        <div className="grid gap-3">
              {unit.lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  scrollTarget={scrollTarget}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <SubmissionReviewPanel evidence={null} errorSummary={null} />
    </div>
  );
}

/**
 * Teacher students list page showing all enrolled students with
 * progress summaries and a detail panel for the selected student.
 *
 * @param {Promise<{ id?: string; lesson?: string }>} searchParams - URL search params with optional student ID and lesson.
 * @returns {JSX.Element} The rendered students page JSX.
 */
export default async function StudentsPage({ searchParams }: PageProps) {
  const claims = await requireTeacherSessionClaims('/auth/login');
  const { id: selectedId, lesson: lessonParam } = await searchParams;

  const scrollTarget = lessonParam != null ? parseInt(lessonParam, 10) - 1 : -1;

  const dashboardData: {
    teacher: { username: string; organizationName: string; organizationId: string };
    students: StudentRow[];
  } | null = await fetchInternalQuery(internal.teacher.getTeacherDashboardData, {
    userId: claims.sub,
  });

  const students = dashboardData?.students ?? [];

  let detail: StudentDetail | null = null;
  if (selectedId) {
    detail = await fetchInternalQuery(internal.teacher.getTeacherStudentDetail, {
      userId: claims.sub,
      studentId: selectedId,
    });
  }

  const showDetail = detail?.status === 'success';

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-bold text-foreground">
          {showDetail ? (detail!.student?.displayName ?? detail!.student?.username ?? 'Student') : 'Students'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {showDetail ? 'Lesson progress detail' : `${students.length} enrolled`}
        </p>
      </div>

      {showDetail ? (
        <StudentDetailView detail={detail!} scrollTarget={scrollTarget} />
      ) : (
        <div className="grid gap-3" data-testid="teacher-student-list">
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No students enrolled.</p>
          ) : (
            students.map((student) => {
              const isSelected = student.id === selectedId;
              return (
                <div
                  key={student.id}
                  data-testid="teacher-student-list-row"
                  className={[
                    'card-workbook p-4 space-y-2 transition-all',
                    isSelected ? 'border-primary/50 bg-primary/5' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/teacher/students?id=${student.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {student.displayName ?? student.username}
                      </Link>
                      <p className="text-xs text-muted-foreground">{student.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-num text-sm font-bold text-primary">
                        {student.progressPercentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.completedPhases}/{student.totalPhases} phases
                      </p>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${student.progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {student.lastActive && (
                      <p className="text-xs text-muted-foreground">
                        Last active: {new Date(student.lastActive).toLocaleDateString()}
                      </p>
                    )}
                    <span
                      className={[
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        student.atGlanceStatus === 'on-track'
                          ? 'bg-green-100 text-green-800'
                          : student.atGlanceStatus === 'behind'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {STATUS_LABELS[student.atGlanceStatus]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}