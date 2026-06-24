import type { PhaseType } from '../curriculum/phase-types';

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
 * - Teacher and admin roles always get 'teaching' mode (role takes precedence over override)
 * - Student role: worked_example → 'guided', independent_practice → 'practice',
 *   assessment → 'practice', others → 'guided'
 * - Activity-level override takes precedence over default phase-type resolution for students
 *
 * @param {ResolveModeParams} params - Object containing role, phaseType, and optional activityModeOverride
 * @returns {ActivityMode} - The resolved activity mode ('teaching', 'guided', or 'practice')
 */
export function resolveActivityMode(params: ResolveModeParams): ActivityMode {
  const { role, phaseType, activityModeOverride } = params;

  // Teacher and admin always get teaching mode (role takes precedence)
  if (role === 'teacher' || role === 'admin') {
    return 'teaching';
  }

  // Student role: check override first, then resolve based on phase type
  if (activityModeOverride && isValidActivityMode(activityModeOverride)) {
    return activityModeOverride;
  }

  return resolveStudentMode(phaseType);
}

/**
 * Resolves the default activity mode for a student based on phase type.
 * @param {PhaseType} phaseType - The phase type to resolve
 * @returns {ActivityMode} - 'practice' for independent_practice/assessment, 'guided' for all others
 */
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

/**
 * Type guard to validate an activity mode string.
 * @param {unknown} value - Value to check
 * @returns {value is ActivityMode} - True if value is a valid ActivityMode
 */
function isValidActivityMode(value: unknown): value is ActivityMode {
  return typeof value === 'string' && ['teaching', 'guided', 'practice'].includes(value);
}