import { redirect } from 'next/navigation';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type { CompetencyHeatmapResponse } from '@math-platform/teacher-reporting-core';
import CompetencyHeatmapClient from './CompetencyHeatmapClient';

/**
 * Page wrapper for the teacher competency heatmap view.
 *
 * @returns The competency heatmap client component.
 */
export default async function TeacherCompetencyPage() {
  const claims = await requireTeacherSessionClaims('/teacher/competency');

  const competencyHeatmap = await fetchInternalQuery(
    internal.teacher.getTeacherCompetencyHeatmapData,
    {
      userId: claims.sub as never,
    },
  );

  if (!competencyHeatmap) redirect('/teacher');

  const heatmapData = competencyHeatmap as CompetencyHeatmapResponse;

  return <CompetencyHeatmapClient heatmapData={heatmapData} />;
}
