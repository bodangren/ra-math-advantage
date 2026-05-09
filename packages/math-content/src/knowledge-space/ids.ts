// Math ID rules and constructors
//
// ID formats:
//   Skill:           math.<course>.skill.<module>.<lesson>.<slug>
//   Worked example:  math.<course>.example.<module>.<lesson>.<index>
//   Lesson:          math.<course>.lesson.<module>.<lesson>
//   Module:          math.<course>.module.<module>
//   Course:          math.<course>
//   Standard:        math.standard.<authority>.<code>
//
// <course> ∈ {im1, im2, im3, precalc}

export const MATH_COURSES = ['im1', 'im2', 'im3', 'precalc'] as const;
export type MathCourse = (typeof MATH_COURSES)[number];

export const MATH_DOMAIN_PREFIX = 'math';

// Regex patterns for each math node kind — informational reference for adapter consumers.
// `validateMathId` is authoritative; these patterns are for quick ad-hoc checks.
export const ID_PATTERNS: Record<string, RegExp> = {
  skill:             /^math\.[a-z0-9]+\.skill\.[^.]+\.[^.]+\.[a-z0-9-]+$/,
  worked_example:    /^math\.[a-z0-9]+\.example\.[^.]+\.[^.]+\.[a-z0-9-]+$/,
  instructional_unit:/^math\.[a-z0-9]+\.lesson\.[^.]+\.[^.]+$/,
  content_group:     /^math\.[a-z0-9]+\.module\.[^.]+$/,
  domain:            /^math\.[a-z0-9]+$/,
  standard:          /^math\.standard\.[a-z]+\..+$/,
};

// ---------------------------------------------------------------------------
// ID constructors
// ---------------------------------------------------------------------------

export function buildSkillId(
  course: MathCourse,
  module: string,
  lesson: string,
  slug: string,
): string {
  return `${MATH_DOMAIN_PREFIX}.${course}.skill.${module}.${lesson}.${slug}`;
}

export function buildWorkedExampleId(
  course: MathCourse,
  module: string,
  lesson: string,
  index: string,
): string {
  return `${MATH_DOMAIN_PREFIX}.${course}.example.${module}.${lesson}.${index}`;
}

export function buildLessonId(
  course: MathCourse,
  module: string,
  lesson: string,
): string {
  return `${MATH_DOMAIN_PREFIX}.${course}.lesson.${module}.${lesson}`;
}

export function buildModuleId(course: MathCourse, module: string): string {
  return `${MATH_DOMAIN_PREFIX}.${course}.module.${module}`;
}

export function buildCourseId(course: MathCourse): string {
  return `${MATH_DOMAIN_PREFIX}.${course}`;
}

export function buildStandardId(authority: string, code: string): string {
  return `${MATH_DOMAIN_PREFIX}.standard.${authority}.${code}`;
}

// ---------------------------------------------------------------------------
// ID validation
// ---------------------------------------------------------------------------

export interface IdValidationResult {
  valid: boolean;
  errors?: string[];
}

export function validateMathId(id: string, kind: string): IdValidationResult {
  const errors: string[] = [];
  const parts = id.split('.');

  // Must start with math.
  if (parts[0] !== MATH_DOMAIN_PREFIX) {
    errors.push(`ID must start with "${MATH_DOMAIN_PREFIX}." prefix`);
    return { valid: false, errors };
  }

  // Course check (skip for standard IDs which use math.standard.<authority>.<code>)
  const course = parts[1];
  if (kind !== 'standard' && !MATH_COURSES.includes(course as MathCourse)) {
    errors.push(`Unsupported course "${course}" — must be one of: ${MATH_COURSES.join(', ')}`);
  }

  // Kind-specific segment validation
  const typePart = parts[2];

  switch (kind) {
    case 'skill': {
      // math.<course>.skill.<module>.<lesson>.<slug>
      if (typePart !== 'skill') {
        errors.push(`Expected kind "skill" but ID segment is "${typePart}"`);
      }
      if (parts.length !== 6) {
        errors.push(`Skill ID must have 6 segments (math.<course>.skill.<module>.<lesson>.<slug>), got ${parts.length}`);
      }
      if (!parts[5] || parts[5].length === 0) {
        errors.push('Skill ID slug must not be empty');
      }
      break;
    }

    case 'worked_example': {
      // math.<course>.example.<module>.<lesson>.<index>
      if (typePart !== 'example') {
        errors.push(`Expected kind "worked_example" but ID segment is "${typePart}"`);
      }
      if (parts.length !== 6) {
        errors.push(`Worked example ID must have 6 segments, got ${parts.length}`);
      }
      if (!parts[5] || parts[5].length === 0) {
        errors.push('Worked example index must not be empty');
      }
      break;
    }

    case 'instructional_unit': {
      // math.<course>.lesson.<module>.<lesson>
      if (typePart !== 'lesson') {
        errors.push(`Expected kind "instructional_unit" (lesson) but ID segment is "${typePart}"`);
      }
      if (parts.length !== 5) {
        errors.push(`Lesson ID must have 5 segments, got ${parts.length}`);
      }
      break;
    }

    case 'content_group': {
      // math.<course>.module.<module>
      if (typePart !== 'module') {
        errors.push(`Expected kind "content_group" (module) but ID segment is "${typePart}"`);
      }
      if (parts.length !== 4) {
        errors.push(`Module ID must have 4 segments, got ${parts.length}`);
      }
      break;
    }

    case 'domain': {
      // math.<course>
      if (parts.length !== 2) {
        errors.push(`Course ID must have 2 segments, got ${parts.length}`);
      }
      break;
    }

    case 'standard': {
      // math.standard.<authority>.<code>
      if (parts[1] !== 'standard') {
        errors.push(`Expected kind "standard" but ID segment 1 is "${parts[1]}"`);
      }
      if (parts.length < 4) {
        errors.push(`Standard ID must have at least 4 segments, got ${parts.length}`);
      }
      if (!parts[2] || parts[2].length === 0) {
        errors.push('Standard authority must not be empty');
      }
      // Verify there's a code part after authority
      if (!parts[3] || parts[3].length === 0) {
        errors.push('Standard code must not be empty');
      }
      break;
    }

    default: {
      // For other kinds, just validate prefix and course
      break;
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
