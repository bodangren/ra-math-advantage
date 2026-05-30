export type PhaseType =
  | 'explore'
  | 'vocabulary'
  | 'learn'
  | 'key_concept'
  | 'worked_example'
  | 'guided_practice'
  | 'independent_practice'
  | 'assessment'
  | 'discourse'
  | 'reflection';

export const PHASE_TYPES: readonly PhaseType[] = [
  'explore',
  'vocabulary',
  'learn',
  'key_concept',
  'worked_example',
  'guided_practice',
  'independent_practice',
  'assessment',
  'discourse',
  'reflection',
] as const;

/**
 * Type guard to validate a PhaseType value.
 * @param value - Value to check
 * @returns True if value is a valid PhaseType
 */
export function isValidPhaseType(value: unknown): value is PhaseType {
  return typeof value === 'string' && PHASE_TYPES.includes(value as PhaseType);
}

export interface PhaseDisplayInfo {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

const PHASE_DISPLAY_INFO: Record<PhaseType, PhaseDisplayInfo> = {
  explore: {
    label: 'Explore',
    icon: 'compass',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  vocabulary: {
    label: 'Vocabulary',
    icon: 'book-open',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  learn: {
    label: 'Learn',
    icon: 'lightbulb',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  key_concept: {
    label: 'Key Concept',
    icon: 'star',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  worked_example: {
    label: 'Example',
    icon: 'play-circle',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  guided_practice: {
    label: 'Guided Practice',
    icon: 'help-circle',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  independent_practice: {
    label: 'Practice',
    icon: 'pen-tool',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  assessment: {
    label: 'Assessment',
    icon: 'check-circle-2',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  discourse: {
    label: 'Think About It',
    icon: 'message-square',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  reflection: {
    label: 'Reflection',
    icon: 'clock',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

/**
 * Gets the display info for a phase type (label, icon, colors).
 * @param phaseType - The phase type to look up
 * @returns PhaseDisplayInfo with label, icon, color, and bgColor
 */
export function getPhaseDisplayInfo(phaseType: PhaseType): PhaseDisplayInfo {
  return PHASE_DISPLAY_INFO[phaseType];
}

export const SKIPPABLE_PHASE_TYPES: readonly PhaseType[] = [
  'explore',
  'discourse',
] as const;

/**
 * Checks if a phase type is skippable by students.
 * @param phaseType - The phase type to check
 * @returns True if the phase type can be skipped
 */
export function isSkippable(phaseType: PhaseType): boolean {
  return SKIPPABLE_PHASE_TYPES.includes(phaseType);
}