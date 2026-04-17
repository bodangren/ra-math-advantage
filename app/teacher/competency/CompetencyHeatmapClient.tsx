'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CompetencyHeatmapGrid } from '@/components/teacher/CompetencyHeatmapGrid';
import type { CompetencyHeatmapResponse } from '@/lib/teacher/competency-heatmap';

interface CompetencyHeatmapClientProps {
  heatmapData: CompetencyHeatmapResponse;
}

export default function CompetencyHeatmapClient({ heatmapData }: CompetencyHeatmapClientProps) {
  const router = useRouter();
  const { rows, standards } = heatmapData;

  const handleStudentClick = (studentId: string) => {
    router.push(`/teacher/students/${studentId}/competency`);
  };

  const handleCellClick = (studentId: string) => {
    router.push(`/teacher/students/${studentId}/competency`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      <header className="space-y-2">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Teacher Dashboard
        </Link>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Competency Heatmap
        </h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} student{rows.length !== 1 ? 's' : ''} · {standards.length} standard{standards.length !== 1 ? 's' : ''} ·
          Color indicates mastery level: {<span className="ml-1 text-green-600 font-medium">green</span>} ≥80%, {<span className="text-yellow-600 font-medium">yellow</span>} 50-79%, {<span className="text-red-600 font-medium">red</span>} &lt;50%, {<span className="text-gray-400 font-medium">gray</span>} no data
        </p>
        <p className="text-xs text-muted-foreground">
          Click a student row or cell to view detailed competency data.
        </p>
      </header>

      <section aria-label="Competency heatmap">
        <CompetencyHeatmapGrid
          rows={rows}
          standards={standards}
          onStudentClick={handleStudentClick}
          onCellClick={handleCellClick}
        />
      </section>
    </div>
  );
}
