import type { CostRecord, HotPath } from '@/lib/scale/cost-record';

export type { HotPath };

export interface InsightsClient {
  query<T = unknown>(fn: string, args: unknown): Promise<T>;
  mutate<T = unknown>(fn: string, args: unknown): Promise<T>;
}

export type HotPathDriver = (
  client: InsightsClient,
  args: { studentIds: string[] },
) => Promise<CostRecord>;
