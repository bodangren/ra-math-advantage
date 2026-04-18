import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { TeacherNavigation } from '@/components/teacher/TeacherNavigation';
import type { Id } from '@/convex/_generated/dataModel';

interface ClassWithLessons {
  classId: string;
  className: string;
  assignedLessonIds: string[];
}

interface LessonInfo {
  lessonId: string;
  title: string;
  slug: string;
  unitNumber: number;
  orderIndex: number;
}

interface PageData {
  classes: ClassWithLessons[];
  lessons: LessonInfo[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex generated types stale; proper fix requires npx convex dev
const lessonAssignmentInternal = internal as any;

export default async function TeacherLessonsPage() {
  const claims = await requireTeacherSessionClaims('/auth/login');

  const data: PageData = await fetchInternalQuery(
    lessonAssignmentInternal.teacher.lessonAssignment.getTeacherClassesWithLessons,
    { userId: claims.sub as Id<'profiles'> },
  );

  const allLessons: LessonInfo[] = await fetchInternalQuery(
    lessonAssignmentInternal.teacher.lessonAssignment.getAvailableLessons,
    {},
  );

  const lessonsByUnit = allLessons.reduce<Record<number, LessonInfo[]>>((acc, lesson) => {
    if (!acc[lesson.unitNumber]) {
      acc[lesson.unitNumber] = [];
    }
    acc[lesson.unitNumber].push(lesson);
    return acc;
  }, {});

  const sortedUnits = Object.keys(lessonsByUnit)
    .map(Number)
    .sort((a, b) => a - b);

  const selectedClassId = data.classes[0]?.classId ?? null;
  const selectedClass = data.classes.find((c) => c.classId === selectedClassId);
  const assignedLessonIds = new Set(selectedClass?.assignedLessonIds ?? []);

  return (
    <div className="flex min-h-screen">
      <TeacherNavigation activeRoute="/teacher/lessons" />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Lesson Assignments
            </h1>
            <p className="text-sm text-muted-foreground">
              Assign lessons to your classes to control student access
            </p>
          </div>

          {data.classes.length === 0 ? (
            <div className="card-workbook p-8 text-center">
              <p className="text-muted-foreground">
                You don&apos;t have any classes yet. Create a class to start assigning lessons.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="class-select"
                  className="text-sm font-medium text-foreground"
                >
                  Select Class
                </label>
                <select
                  id="class-select"
                  className="w-full max-w-xs rounded-md border border-border px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={selectedClassId ?? ''}
                >
                  {data.classes.map((cls) => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                {sortedUnits.map((unitNumber) => (
                  <section key={unitNumber} className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      Unit {unitNumber}
                    </h2>
                    <div className="space-y-2">
                      {lessonsByUnit[unitNumber]
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((lesson) => {
                          const isAssigned = assignedLessonIds.has(lesson.lessonId);
                          return (
                            <div
                              key={lesson.lessonId}
                              className="card-workbook p-4 flex items-center justify-between"
                            >
                              <div className="space-y-0.5">
                                <p className="font-medium text-foreground">
                                  {lesson.orderIndex}. {lesson.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  /teacher/lesson/{lesson.slug}
                                </p>
                              </div>
                              <LessonAssignmentToggle
                                classId={selectedClassId!}
                                lessonId={lesson.lessonId}
                                isAssigned={isAssigned}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

interface LessonAssignmentToggleProps {
  classId: string;
  lessonId: string;
  isAssigned: boolean;
}

function LessonAssignmentToggle({ classId, lessonId, isAssigned }: LessonAssignmentToggleProps) {
  return (
    <form action={assignLessonToClassAction} className="flex items-center gap-2">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="isAssigned" value={String(isAssigned)} />
      <button
        type="submit"
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isAssigned
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {isAssigned ? 'Unassign' : 'Assign'}
      </button>
    </form>
  );
}

async function assignLessonToClassAction(formData: FormData) {
  'use server';
  const { fetchInternalMutation } = await import('@/lib/convex/server');
  const classId = formData.get('classId') as string;
  const lessonId = formData.get('lessonId') as string;
  const isAssigned = formData.get('isAssigned') === 'true';
  const claims = await requireTeacherSessionClaims('/auth/login');

  const mutation = isAssigned
    ? lessonAssignmentInternal.teacher.lessonAssignment.unassignLessonFromClass
    : lessonAssignmentInternal.teacher.lessonAssignment.assignLessonToClass;

  await fetchInternalMutation(mutation, {
    userId: claims.sub as Id<'profiles'>,
    classId: classId as Id<'classes'>,
    lessonId: lessonId as Id<'lessons'>,
  });
}
