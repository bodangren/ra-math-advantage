import type { PlacementFlowOutcome } from '@/lib/placement/placement-flow';

export type StudentFlowDestination = 'placement' | 'assigned-work';

export type StudentFlowReason =
  | 'new-student'
  | 'returning-student'
  | 'forced-rerun';

export interface StudentFlowContext {
  studentId: string;
  hasExistingPlacement: boolean;
}

export interface StudentFlowDecision {
  destination: StudentFlowDestination;
  reason: StudentFlowReason;
  placementOutcome?: PlacementFlowOutcome;
}

export interface StudentFlowRouterDeps {
  runPlacement(
    studentId: string,
    options?: { force?: boolean },
  ): Promise<PlacementFlowOutcome>;
}

export interface StudentFlowOptions {
  force?: boolean;
}

export async function routeStudent(
  context: StudentFlowContext,
  deps: StudentFlowRouterDeps,
  options?: StudentFlowOptions,
): Promise<StudentFlowDecision> {
  const force = options?.force ?? false;

  if (context.hasExistingPlacement && !force) {
    return {
      destination: 'assigned-work',
      reason: 'returning-student',
    };
  }

  const placementOutcome = await deps.runPlacement(
    context.studentId,
    force ? { force } : undefined,
  );

  const reason = context.hasExistingPlacement ? 'forced-rerun' : 'new-student';

  return {
    destination: 'placement',
    reason,
    placementOutcome,
  };
}
