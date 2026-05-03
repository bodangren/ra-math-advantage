import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { competencyStandards } from './competencies';

export {
  activityPropsSchemas,
  gradingConfigSchema,
  type ActivityComponentKey,
  type ActivityProps,
  type GradingConfig,
  type ComprehensionQuizActivityProps,
  type PercentageCalculationSortingActivityProps,
  type InventoryFlowDiagramActivityProps,
  type CashFlowTimelineActivityProps,
  type FillInTheBlankActivityProps,
  type JournalEntryActivityProps,
  type ReflectionJournalActivityProps,
  type PeerCritiqueActivityProps,
  type TieredAssessmentActivityProps,
  type LemonadeStandActivityProps,
  type StartupJourneyActivityProps,
  type BudgetBalancerActivityProps,
  type CashFlowChallengeActivityProps,
  type InventoryManagerActivityProps,
  type PitchPresentationBuilderActivityProps,
  type NotebookOrganizerActivityProps,
  type GrowthPuzzleActivityProps,
  type AssetTimeMachineActivityProps,
  type CafeSupplyChaosActivityProps,
  type CapitalNegotiationActivityProps,
  type BusinessStressTestActivityProps,
  type PayStructureDecisionLabActivityProps,
  type SpreadsheetActivityProps,
  type SpreadsheetEvaluatorActivityProps,
  type ScenarioSwitchShowtellActivityProps,
  type GraphingExplorerActivityProps,
} from './activity-props';

export const activities = pgTable(
  'activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    componentKey: text('component_key').notNull(),
    displayName: text('display_name').notNull(),
    description: text('description'),
    props: jsonb('props').notNull(),
    gradingConfig: jsonb('grading_config'),
    standardId: uuid('standard_id').references(() => competencyStandards.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    standardIdIdx: index('idx_activities_standard_id').on(table.standardId),
  }),
);
