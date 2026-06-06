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

export function ClassSelector({ classes, selectedClassId }: ClassSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
          <option key={cls.classId} value={cls.classId}>
            {cls.className}
          </option>
        ))}
      </select>
    </div>
  );
}
