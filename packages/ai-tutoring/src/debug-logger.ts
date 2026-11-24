/**
 * Internal SDK debug logger for the OpenRouter AI layer.
 *
 * The redacting logger keeps key material out of debug output. Request and
 * response bodies carry prompts and answers, so the logger replaces object
 * values with a marker instead of printing them. Header strings stay, with
 * every configured key form redacted. The logger is only supplied when debug
 * logging is on; the SDK otherwise stays quiet.
 *
 * This module is not a package export. The chat path and the structured
 * helper import the same implementation from here.
 */

const MIN_REDACT_KEY_LENGTH = 8;
const BEARER_SCHEME = /^bearer\s+/i;

/**
 * Lists the configured key forms that an upstream error may echo.
 * A short key is never redacted, so ordinary text stays unchanged.
 * The bearer scheme is removed without case sensitivity and with any
 * following whitespace.
 */
function redactionTargets(apiKey: string): string[] {
  if (apiKey.length === 0) {
    return [];
  }
  const trimmed = apiKey.trim();
  if (trimmed.length < MIN_REDACT_KEY_LENGTH) {
    return [];
  }
  const scheme = BEARER_SCHEME.exec(trimmed);
  const token = scheme ? trimmed.slice(scheme[0].length) : trimmed;
  const targets = [apiKey, trimmed, token];
  return [...new Set(targets.filter((target) => target.length >= MIN_REDACT_KEY_LENGTH))];
}

/** Replaces every occurrence of a configured key form with a redaction marker. */
export function redactApiKey(text: string, apiKey: string): string {
  let redacted = text;
  for (const target of redactionTargets(apiKey)) {
    redacted = redacted.split(target).join("[redacted]");
  }
  return redacted;
}

interface RedactingDebugLogger {
  group(label?: string): void;
  groupEnd(): void;
  log(message: unknown, ...args: unknown[]): void;
}

/** Builds the SDK debug logger for one API key. */
function redactingDebugLogger(apiKey: string): RedactingDebugLogger {
  const redact = (value: unknown): unknown => {
    if (typeof value === "string") {
      return redactApiKey(value, apiKey);
    }
    if (value && typeof value === "object") {
      return "[body redacted]";
    }
    return value;
  };
  return {
    group: (label) => {
      console.group(label === undefined ? undefined : (redact(label) as string));
    },
    groupEnd: () => console.groupEnd(),
    log: (message, ...args) => console.log(redact(message), ...args.map(redact)),
  };
}

/** Returns the redacting logger when debug logging is on, else undefined. */
export function debugLoggerFor(apiKey: string): RedactingDebugLogger | undefined {
  return process.env.OPENROUTER_DEBUG ? redactingDebugLogger(apiKey) : undefined;
}
