import { lazy, type ComponentType } from 'react';

const FinancialDashboard = lazy(() => import('@/components/activities/charts/FinancialDashboard').then((module) => ({ default: module.FinancialDashboard })));
const CashFlowChallenge = lazy(() => import('@/components/activities/simulations/CashFlowChallenge').then((module) => ({ default: module.CashFlowChallenge })));
const BudgetBalancer = lazy(() => import('@/components/activities/simulations/BudgetBalancer').then((module) => ({ default: module.BudgetBalancer })));
const InventoryManager = lazy(() => import('@/components/activities/simulations/InventoryManager').then((module) => ({ default: module.InventoryManager })));
const LemonadeStand = lazy(() => import('@/components/activities/simulations/LemonadeStand').then((module) => ({ default: module.LemonadeStand })));
const PitchPresentationBuilder = lazy(() => import('@/components/activities/simulations/PitchPresentationBuilder').then((module) => ({ default: module.PitchPresentationBuilder })));
const StartupJourney = lazy(() => import('@/components/activities/simulations/StartupJourney').then((module) => ({ default: module.StartupJourney })));
const DataCleaningActivity = lazy(() => import('@/components/activities/spreadsheet/DataCleaningActivity').then((module) => ({ default: module.DataCleaningActivity })));
const CashFlowTimeline = lazy(() => import('@/components/activities/drag-drop/CashFlowTimeline').then((module) => ({ default: module.CashFlowTimeline })));
const InventoryFlowDiagram = lazy(() => import('@/components/activities/drag-drop/InventoryFlowDiagram').then((module) => ({ default: module.InventoryFlowDiagram })));
const PercentageCalculationSorting = lazy(() => import('@/components/activities/drag-drop/PercentageCalculationSorting').then((module) => ({ default: module.PercentageCalculationSorting })));
const FillInTheBlank = lazy(() => import('@/components/activities/quiz/FillInTheBlank').then((module) => ({ default: module.FillInTheBlank })));
const JournalEntryActivity = lazy(() => import('@/components/activities/accounting/JournalEntryActivity').then((module) => ({ default: module.JournalEntryActivity })));
const AccountingEquationEventActivity = lazy(() => import('@/components/activities/accounting/AccountingEquationEventActivity').then((module) => ({ default: module.AccountingEquationEventActivity })));
const ComprehensionCheck = lazy(() => import('@/components/activities/quiz/ComprehensionCheck').then((module) => ({ default: module.ComprehensionCheck })));
const TieredAssessment = lazy(() => import('@/components/activities/quiz/TieredAssessment').then((module) => ({ default: module.TieredAssessment })));
const PeerCritiqueForm = lazy(() => import('@/components/activities/quiz/PeerCritiqueForm').then((module) => ({ default: module.PeerCritiqueForm })));
const ReflectionJournal = lazy(() => import('@/components/activities/quiz/ReflectionJournal').then((module) => ({ default: module.ReflectionJournal })));
const SpreadsheetEvaluator = lazy(() => import('@/components/activities/spreadsheet/SpreadsheetEvaluator').then((module) => ({ default: module.SpreadsheetEvaluator })));
const SpreadsheetActivityAdapter = lazy(() => import('@/components/activities/spreadsheet/SpreadsheetActivityAdapter').then((module) => ({ default: module.SpreadsheetActivityAdapter })));

// Simulations
const CafeSupplyChaos = lazy(() => import('@/components/activities/simulations/CafeSupplyChaos').then((module) => ({ default: module.CafeSupplyChaos })));
const NotebookOrganizer = lazy(() => import('@/components/activities/simulations/NotebookOrganizer').then((module) => ({ default: module.NotebookOrganizer })));
const GrowthPuzzle = lazy(() => import('@/components/activities/simulations/GrowthPuzzle').then((module) => ({ default: module.GrowthPuzzle })));
const AssetTimeMachine = lazy(() => import('@/components/activities/simulations/AssetTimeMachine').then((module) => ({ default: module.AssetTimeMachine })));
const CapitalNegotiation = lazy(() => import('@/components/activities/simulations/CapitalNegotiation').then((module) => ({ default: module.CapitalNegotiation })));
const BusinessStressTest = lazy(() => import('@/components/activities/simulations/BusinessStressTest').then((module) => ({ default: module.BusinessStressTest })));
const PayStructureDecisionLab = lazy(() => import('@/components/activities/simulations/PayStructureDecisionLab').then((module) => ({ default: module.PayStructureDecisionLab })));
const ClassificationActivity = lazy(() => import('@/components/activities/ClassificationActivity').then((module) => ({ default: module.ClassificationActivity })));
const AssetRegisterSimulator = lazy(() => import('@/components/activities/simulations/AssetRegisterSimulator').then((module) => ({ default: module.AssetRegisterSimulator })));
const DepreciationMethodComparisonSimulator = lazy(() => import('@/components/activities/simulations/DepreciationMethodComparisonSimulator').then((module) => ({ default: module.DepreciationMethodComparisonSimulator })));
const DynamicMethodSelector = lazy(() => import('@/components/activities/simulations/DynamicMethodSelector').then((module) => ({ default: module.DynamicMethodSelector })));
const MethodComparisonSimulator = lazy(() => import('@/components/activities/simulations/MethodComparisonSimulator').then((module) => ({ default: module.MethodComparisonSimulator })));
const ScenarioSwitchShowTell = lazy(() => import('@/components/activities/simulations/ScenarioSwitchShowTell').then((module) => ({ default: module.ScenarioSwitchShowTell })));

// Exercises
const StraightLineMastery = lazy(() => import('@/components/activities/exercises/StraightLineMastery').then((module) => ({ default: module.StraightLineMastery })));
const DDBComparisonMastery = lazy(() => import('@/components/activities/exercises/DDBComparisonMastery').then((module) => ({ default: module.DDBComparisonMastery })));
const CapitalizationExpenseMastery = lazy(() => import('@/components/activities/exercises/CapitalizationExpenseMastery').then((module) => ({ default: module.CapitalizationExpenseMastery })));
const MarkupMarginMastery = lazy(() => import('@/components/activities/exercises/MarkupMarginMastery').then((module) => ({ default: module.MarkupMarginMastery })));
const BreakEvenMastery = lazy(() => import('@/components/activities/exercises/BreakEvenMastery').then((module) => ({ default: module.BreakEvenMastery })));
const InventoryAlgorithmShowtell = lazy(() => import('@/components/activities/exercises/InventoryAlgorithmShowtell').then((module) => ({ default: module.InventoryAlgorithmShowtell })));
const AdjustmentPractice = lazy(() => import('@/components/activities/exercises/AdjustmentPractice').then((module) => ({ default: module.AdjustmentPractice })));
const ClosingEntryPractice = lazy(() => import('@/components/activities/exercises/ClosingEntryPractice').then((module) => ({ default: module.ClosingEntryPractice })));
const MonthEndClosePractice = lazy(() => import('@/components/activities/exercises/MonthEndClosePractice').then((module) => ({ default: module.MonthEndClosePractice })));
const IncomeStatementPractice = lazy(() => import('@/components/activities/exercises/IncomeStatementPractice').then((module) => ({ default: module.IncomeStatementPractice })));
const CashFlowPractice = lazy(() => import('@/components/activities/exercises/CashFlowPractice').then((module) => ({ default: module.CashFlowPractice })));
const BalanceSheetPractice = lazy(() => import('@/components/activities/exercises/BalanceSheetPractice').then((module) => ({ default: module.BalanceSheetPractice })));
const ChartLinkingSimulator = lazy(() => import('@/components/activities/exercises/ChartLinkingSimulator').then((module) => ({ default: module.ChartLinkingSimulator })));
const CrossSheetLinkSimulator = lazy(() => import('@/components/activities/exercises/CrossSheetLinkSimulator').then((module) => ({ default: module.CrossSheetLinkSimulator })));
const ProfitCalculator = lazy(() => import('@/components/activities/exercises/ProfitCalculator').then((module) => ({ default: module.ProfitCalculator })));
const BudgetWorksheet = lazy(() => import('@/components/activities/exercises/BudgetWorksheet').then((module) => ({ default: module.BudgetWorksheet })));
const ErrorCheckingSystem = lazy(() => import('@/components/activities/exercises/ErrorCheckingSystem').then((module) => ({ default: module.ErrorCheckingSystem })));
const GraphingExplorer = lazy(() => import('@/components/activities/graphing/GraphingExplorer').then((module) => ({ default: module.GraphingExplorer })));

import { resolveActivityComponentKey } from '@/lib/activities/component-keys';
import type { ActivityComponentKey } from '@/types/activities';

/**
 * Centralized registry for activity components.
 * Maps componentKey from database to React component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activityRegistry: Record<ActivityComponentKey, ComponentType<any>> = {
  'comprehension-quiz': ComprehensionCheck,
  'tiered-assessment': TieredAssessment,
  'percentage-calculation-sorting': PercentageCalculationSorting,
  'inventory-flow-diagram': InventoryFlowDiagram,
  'cash-flow-timeline': CashFlowTimeline,
  'fill-in-the-blank': FillInTheBlank,
  'journal-entry-building': JournalEntryActivity,
  'accounting-equation-event': AccountingEquationEventActivity,
  'reflection-journal': ReflectionJournal,
  'peer-critique-form': PeerCritiqueForm,

  // Business simulations
  'lemonade-stand': LemonadeStand,
  'startup-journey': StartupJourney,
  'budget-balancer': BudgetBalancer,
  'cash-flow-challenge': CashFlowChallenge,
  'inventory-manager': InventoryManager,
  'pitch-presentation-builder': PitchPresentationBuilder,
  'pitch': PitchPresentationBuilder, // Alias for pitch-presentation-builder
  'cafe-supply-chaos': CafeSupplyChaos,
  'notebook-organizer': NotebookOrganizer,
  'growth-puzzle': GrowthPuzzle,
  'asset-time-machine': AssetTimeMachine,
  'capital-negotiation': CapitalNegotiation,
  'business-stress-test': BusinessStressTest,
  'pay-structure-lab': PayStructureDecisionLab,
  'graphing-explorer': GraphingExplorer,

  // Classification
  'classification': ClassificationActivity,

  // Charting components
  'financial-dashboard': FinancialDashboard,
  'chart-builder': FinancialDashboard,

  // Spreadsheet + data utilities
  'spreadsheet': SpreadsheetActivityAdapter,
  'spreadsheet-evaluator': SpreadsheetEvaluator,
  'data-cleaning': DataCleaningActivity,

  // Core activities
  'profit-calculator': ProfitCalculator,
  'budget-worksheet': BudgetWorksheet,

  // Exercises — Cluster 1: U5 Depreciation & Assets
  'straight-line-mastery': StraightLineMastery,
  'ddb-comparison-mastery': DDBComparisonMastery,
  'capitalization-expense-mastery': CapitalizationExpenseMastery,
  'depreciation-method-comparison': DepreciationMethodComparisonSimulator,
  'asset-register-simulator': AssetRegisterSimulator,
  'dynamic-method-selector': DynamicMethodSelector,
  'method-comparison-simulator': MethodComparisonSimulator,
  'scenario-switch-showtell': ScenarioSwitchShowTell,

  // Exercises — Cluster 2: U6 Inventory & Costing
  'inventory-algorithm-showtell': InventoryAlgorithmShowtell,
  'markup-margin-mastery': MarkupMarginMastery,
  'break-even-mastery': BreakEvenMastery,

  // Exercises — Cluster 3: U3 Financial Statements & Reporting
  'income-statement-practice': IncomeStatementPractice,
  'cash-flow-practice': CashFlowPractice,
  'balance-sheet-practice': BalanceSheetPractice,
  'chart-linking-simulator': ChartLinkingSimulator,
  'cross-sheet-link-simulator': CrossSheetLinkSimulator,

  // Exercises — Cluster 4: U2 Transactions & Adjustments
  'adjustment-practice': AdjustmentPractice,
  'closing-entry-practice': ClosingEntryPractice,
  'month-end-close-practice': MonthEndClosePractice,

  // Exercises — Cluster 5: U8 Integrated Model & Validation
  'error-checking-system': ErrorCheckingSystem,
};

/**
 * Get activity component by componentKey
 * @param componentKey - The activity component key from database
 * @returns React component or null if not found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActivityComponent(componentKey: string): ComponentType<any> | null {
  const canonicalKey = resolveActivityComponentKey(componentKey);
  if (!canonicalKey) {
    return null;
  }

  return activityRegistry[canonicalKey as ActivityComponentKey] ?? null;
}
