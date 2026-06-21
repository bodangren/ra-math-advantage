import { redirect } from 'next/navigation';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type { CompetencyHeatmapResponse } from '@math-platform/teacher-reporting-core';
import CompetencyHeatmapClient from './CompetencyHeatmapClient';

/**
 * Renders the teacher competency heatmap page, displaying a class-wide view of
 * student mastery across learning standards.
 *
 * @returns {JSX.Element} The rendered TeacherCompetencyPage JSX.
 */
export default async function TeacherCompetencyPage() {
  const claims = await requireTeacherSessionClaims('/auth/login');

  const competencyHeatmap = await fetchInternalQuery(
    internal.teacher.getTeacherCompetencyHeatmapData,
    {
      userId: claims.sub,
    },
  );

  if (!competencyHeatmap) redirect('/teacher');

  const heatmapData = competencyHeatmap as CompetencyHeatmapResponse;

  return <CompetencyHeatmapClient heatmapData={heatmapData} />;
}
