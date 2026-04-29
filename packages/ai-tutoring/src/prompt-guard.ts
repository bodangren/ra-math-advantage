/**
 * Prompt injection detection for AI tutoring chatbot.
 *
 * Detects common injection techniques:
 * - Role-play/ignore instructions
 * - System prompt extraction
 * - Delimiter injection
 * - Instruction override
 */

export interface InjectionDetection {
  detected: true;
  reason: string;
  pattern: string;
}

const INJECTION_PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  {
    regex: /\b(ignore|disregard|forget|override)\b.*(instruction|rule|prompt|context|system|previous)?\b/i,
    reason: 'role-play: attempts to ignore or override instructions',
  },
  {
    regex: /\b(you are now|pretend you are|act as|switch to)\b.*\b(debug|admin|developer|system|raw|unrestricted|different AI)\b/i,
    reason: 'role-play: attempts to change AI role or mode',
  },
  {
    regex: /\b(reveal|show|repeat|output|print|tell me)\b.*\b(system prompt|instruction|context|rule|configuration|full context)\b/i,
    reason: 'extraction: attempts to extract system prompt or instructions',
  },
  {
    regex: /\b(what are your (exact )?(instruction|rule|prompt|guideline))/i,
    reason: 'extraction: direct request for internal instructions',
  },
  {
    regex: /("""|---|\*\*\*|===)\s*(system|override|ignore|bypass|inject)/i,
    reason: 'delimiter: uses delimiters with injection keywords',
  },
  {
    regex: /\b(use (your )?own (knowledge|logic)|external knowledge|outside information|lesson context and answer)\b/i,
    reason: 'override: attempts to use knowledge outside lesson context',
  },
];

/**
 * Detects prompt injection attempts in user input.
 * Returns null if input is safe, or an InjectionDetection object if suspicious.
 */
export function detectPromptInjection(input: string): InjectionDetection | null {
  const normalizedInput = input.trim();

  for (const { regex, reason } of INJECTION_PATTERNS) {
    if (regex.test(normalizedInput)) {
      return {
        detected: true,
        reason,
        pattern: regex.source,
      };
    }
  }

  return null;
}

/**
 * Simple boolean check for injection attempts.
 */
export function isInjectionAttempt(input: string): boolean {
  return detectPromptInjection(input) !== null;
}
