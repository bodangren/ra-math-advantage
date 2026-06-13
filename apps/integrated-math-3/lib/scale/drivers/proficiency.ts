import type { CostRecord } from '@/lib/scale/cost-record';
import type { InsightsClient } from '@/lib/scale/drivers/types';

export async function driveProficiency(
  client: InsightsClient,
  args: { studentIds: string[] },
): Promise<CostRecord> {
  return client.query<CostRecord>(
    'convex/objectiveProficiency:getObjectiveProficiencyHandler',
    args,
  );
}
