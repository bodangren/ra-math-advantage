export type AuditScalar = string | number | boolean | null;
export type AuditSnapshot = Record<string, AuditScalar>;

const SECRET_KEY = /(password|passwd|credential|secret|salt|hash|token|access|refresh)/i;

export function sanitizeAuditSnapshot(value: Record<string, unknown>): AuditSnapshot {
  const result: AuditSnapshot = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) continue;
    if (entry === null || typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
      result[key] = entry;
    }
  }
  return result;
}
