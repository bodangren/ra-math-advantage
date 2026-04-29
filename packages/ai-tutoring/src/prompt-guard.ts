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

/**
 * Cyrillic to Latin mapping for common lookalike characters.
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  '\u0430': 'a', // а
  '\u0435': 'e', // е
  '\u043E': 'o', // о
  '\u0440': 'p', // р
  '\u0441': 'c', // с
  '\u0443': 'y', // у
  '\u0456': 'i', // і
  '\u0458': 'j', // ј
  '\u04BB': 'h', // һ
  '\u0410': 'A',
  '\u0412': 'B',
  '\u0415': 'E',
  '\u041A': 'K',
  '\u041C': 'M',
  '\u041D': 'H',
  '\u041E': 'O',
  '\u0420': 'P',
  '\u0421': 'C',
  '\u0422': 'T',
  '\u0425': 'X',
};

/**
 * Maps a single character if it's a Cyrillic lookalike.
 */
function mapCyrillicToLatin(char: string): string {
  return CYRILLIC_TO_LATIN[char] ?? char;
}

/**
 * Maps fullwidth characters to their ASCII equivalents.
 * Fullwidth Latin: U+FF21-U+FF3A (A-Z), U+FF41-U+FF5A (a-z)
 */
function mapFullwidthToAscii(char: string): string {
  const code = char.charCodeAt(0);
  if (code >= 0xFF21 && code <= 0xFF3A) {
    return String.fromCharCode(code - 0xFF21 + 0x41);
  }
  if (code >= 0xFF41 && code <= 0xFF5A) {
    return String.fromCharCode(code - 0xFF41 + 0x61);
  }
  return char;
}

/**
 * Normalizes user input to prevent Unicode-based bypass techniques.
 * - NFC normalization for composed characters
 * - Strips zero-width characters (U+200B, U+200C, U+200D, U+FEFF)
 * - Maps Cyrillic lookalikes to Latin equivalents
 * - Maps fullwidth characters to ASCII
 */
export function normalizeInput(input: string): string {
  let result = input.trim();

  // NFC normalization
  result = result.normalize('NFC');

  // Strip zero-width characters
  result = result.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

  // Map Cyrillic lookalikes to Latin
  result = result.split('').map(mapCyrillicToLatin).join('');

  // Map fullwidth characters to ASCII
  result = result.split('').map(mapFullwidthToAscii).join('');

  return result;
}

/**
 * Keywords that indicate potential injection when combined.
 * Only includes high-signal keywords that rarely appear in legitimate math questions.
 */
const INJECTION_ACTION_KEYWORDS = ['ignore', 'disregard', 'forget', 'override', 'bypass', 'skip'];
const INJECTION_TARGET_KEYWORDS = ['instruction', 'instructions', 'prompt', 'prompts', 'system', 'configuration'];

/**
 * Context-aware detection: checks if injection action and target keywords
 * appear within a short word window (5 words), indicating suspicious proximity.
 */
function detectKeywordProximity(input: string): InjectionDetection | null {
  const words = input.toLowerCase().split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^\w]/g, '');
    if (INJECTION_ACTION_KEYWORDS.includes(word)) {
      const window = words.slice(i, i + 6).join(' ');
      for (const target of INJECTION_TARGET_KEYWORDS) {
        if (window.includes(target)) {
          return {
            detected: true,
            reason: 'proximity: injection keywords in suspicious proximity',
            pattern: `action:"${word}" near target:"${target}"`,
          };
        }
      }
    }
  }

  return null;
}

const INJECTION_PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  {
    regex: /\b(ignore|disregard|forget|override)\b.+\b(instruction|instructions|rule|rules|prompt|prompts|context|system|previous)\b/i,
    reason: 'role-play: attempts to ignore or override instructions',
  },
  {
    regex: /\b(you are now|pretend you are|act as|switch to)\b.*\b(debug|admin|developer|system|raw|unrestricted|different AI)\b/i,
    reason: 'role-play: attempts to change AI role or mode',
  },
  {
    regex: /\b(reveal|show|repeat|output|print|tell me)\b.+\b(system prompt|instructions?|context|rules?|configuration|full context)\b/i,
    reason: 'extraction: attempts to extract system prompt or instructions',
  },
  {
    regex: /\b(what are your (exact )?(instructions?|rules?|prompts?|guidelines?))/i,
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
  const normalizedInput = normalizeInput(input);

  for (const { regex, reason } of INJECTION_PATTERNS) {
    if (regex.test(normalizedInput)) {
      return {
        detected: true,
        reason,
        pattern: regex.source,
      };
    }
  }

  return detectKeywordProximity(normalizedInput);
}

/**
 * Simple boolean check for injection attempts.
 */
export function isInjectionAttempt(input: string): boolean {
  return detectPromptInjection(input) !== null;
}
