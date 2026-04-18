export interface CompletePhaseRequest {
  lessonId: string;
  phaseNumber: number;
  timeSpent: number;
  idempotencyKey: string;
  linkedStandardId?: string;
}

export interface CompletePhaseResponse {
  success: boolean;
  alreadyCompleted?: boolean;
  nextPhaseUnlocked?: boolean;
}

export interface SkipPhaseRequest {
  lessonId: string;
  phaseNumber: number;
  idempotencyKey: string;
}

export interface SkipPhaseResponse {
  success: boolean;
  alreadySkipped?: boolean;
  nextPhaseUnlocked?: boolean;
}
