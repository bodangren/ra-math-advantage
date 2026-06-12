'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface ClassInfo {
  classId: string;
  className: string;
}

interface ClassSelectorProps {
  classes: ClassInfo[];
  selectedClassId: string | null;
}

/**
 * Client component that renders a class selector dropdown for the teacher
 * lessons page. Updates the URL search params when a different class is selected.
 *
 * @param classes - Array of class info objects with classId and className.
 * @param selectedClassId - The currently selected class ID, or null.
 * @returns The class selector dropdown JSX element.
 */
export function ClassSelector({ classes, selectedClassId }: ClassSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Handles class selection change by updating the URL search params
   * to reflect the newly selected class ID.
   *
   * @param e - The select element change event.
   */
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const classId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('classId', classId);
    router.push(`/teacher/lessons?${params.toString()}`);
  }

  return (
    <div className="space-y-2" data-testid="teacher-class-selector">
      <label
        htmlFor="class-select"
        className="text-sm font-medium text-foreground"
      >
        Select Class
      </label>
      <select
        id="class-select"
        className="w-full max-w-xs rounded-md border border-border px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        value={selectedClassId ?? ''}
        onChange={handleChange}
      >
        {classes.map((cls) => (
          <option key={cls.classId} value={cls.classId} data-testid={`teacher-class-option-${cls.classId}`}>
            {cls.className}
          </option>
        ))}
      </select>
    </div>
  );
}
