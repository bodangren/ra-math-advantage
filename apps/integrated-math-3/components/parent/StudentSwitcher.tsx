'use client';

export interface StudentOption {
  studentId: string;
  displayName: string;
}

export interface StudentSwitcherProps {
  students: StudentOption[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
}

export function StudentSwitcher({
  students,
  selectedStudentId,
  onSelectStudent,
}: StudentSwitcherProps) {
  if (students.length <= 1) {
    const student = students[0];
    return (
      <div data-testid="parent-student-switcher-single" className="py-2">
        <span className="text-sm font-medium text-foreground">
          {student?.displayName ?? 'Student'}
        </span>
      </div>
    );
  }

  return (
    <nav data-testid="parent-student-switcher" className="flex gap-2 py-2" aria-label="Select student">
      {students.map((student) => {
        const isActive = student.studentId === selectedStudentId;
        return (
          <button
            key={student.studentId}
            type="button"
            onClick={() => {
              if (!isActive) {
                onSelectStudent(student.studentId);
              }
            }}
            aria-current={isActive ? 'page' : undefined}
            className={isActive
              ? 'px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground'
              : 'px-3 py-1.5 rounded-md text-sm font-medium text-foreground bg-muted/50 hover:bg-muted transition-colors'
            }
          >
            {student.displayName}
          </button>
        );
      })}
    </nav>
  );
}
