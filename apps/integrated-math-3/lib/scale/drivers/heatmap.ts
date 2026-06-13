import type { CostRecord } from '@/lib/scale/cost-record';
import type { InsightsClient } from '@/lib/scale/drivers/types';

export async function driveHeatmap(
  client: InsightsClient,
  args: { studentIds: string[] },
): Promise<CostRecord> {
  return client.query<CostRecord>(
    'lib/teacher/competency-heatmap:buildCompetencyHeatmap',
    args,
  );
}
