import type { PhaseType } from '@/lib/curriculum/phase-types';

export type { PhaseType };

export type UserRole = 'student' | 'teacher' | 'admin';

export type ActivityMode = 'teaching' | 'guided' | 'practice';

export interface ResolveModeParams {
  role: UserRole;
  phaseType: PhaseType;
  activityModeOverride?: ActivityMode;
}

/**
 * Resolve the activity mode based on user role, phase type, and optional override.
 *
 * Rules:
 * - Teacher and admin roles always default to 'teaching' mode
 * - Student role: worked_example → 'guided', independent_practice → 'practice', assessment → 'practice', others → 'guided'
 * - Activity-level override takes precedence over default resolution
 *
 * @param params - Object containing role, phaseType, and optional activityModeOverride
 * @returns The resolved activity mode
 */
export function resolveActivityMode(params: ResolveModeParams): ActivityMode {
  const { role, phaseType, activityModeOverride } = params;

  // Activity-level override takes precedence
  if (activityModeOverride && isValidActivityMode(activityModeOverride)) {
    return activityModeOverride;
  }

  // Teacher and admin always get teaching mode
  if (role === 'teacher' || role === 'admin') {
    return 'teaching';
  }

  // Student role: resolve based on phase type
  return resolveStudentMode(phaseType);
}

function resolveStudentMode(phaseType: PhaseType): ActivityMode {
  switch (phaseType) {
    case 'independent_practice':
    case 'assessment':
      return 'practice';
    case 'worked_example':
    case 'guided_practice':
    case 'explore':
    case 'vocabulary':
    case 'learn':
    case 'key_concept':
    case 'discourse':
    case 'reflection':
    default:
      return 'guided';
  }
}

function isValidActivityMode(value: unknown): value is ActivityMode {
  return typeof value === 'string' && ['teaching', 'guided', 'practice'].includes(value);
}
