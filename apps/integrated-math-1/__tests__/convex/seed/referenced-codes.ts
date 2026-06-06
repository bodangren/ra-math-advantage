import fs from "node:fs";
import path from "node:path";

const APP_ROOT = path.resolve(__dirname, "../../..");
const SEED_DIR = path.join(APP_ROOT, "convex/seed");
const APP_PREFIX = "im1";
const MODULE_FILE_RE = new RegExp(`^seed_${APP_PREFIX}_module_\\d+_standards\\.ts$`);
const REFERENCED_CODE_RE = /standardCode:\s*"([^"]+)"/g;
const DEFINED_CODE_RE = /\bcode:\s*"([A-Z0-9][A-Z0-9.\-]*)"/g;

export const APP_NAME = "IM1" as const;
export const INTEGRITY_RED_TRACK_ID = "im1-im2-standards-backfill_20260605" as const;

export const CODE_REGEX =
  /^(\d+\.[A-Z]+|[A-Z]+(-[A-Z]+)?)\.[A-Z]\.[0-9]+[a-z]?$/;

export interface CollectOptions {
  definedStandardsPath?: string;
}

export function collectReferencedCodes(): string[] {
  const files = fs
    .readdirSync(SEED_DIR)
    .filter((name) => MODULE_FILE_RE.test(name));

  if (files.length === 0) {
    throw new Error(
      `[${APP_NAME}] No seed_${APP_PREFIX}_module_*_standards.ts files found in ${SEED_DIR}`
    );
  }

  const codes = new Set<string>();
  for (const file of files) {
    const text = fs.readFileSync(path.join(SEED_DIR, file), "utf8");
    let match: RegExpExecArray | null;
    REFERENCED_CODE_RE.lastIndex = 0;
    while ((match = REFERENCED_CODE_RE.exec(text)) !== null) {
      codes.add(match[1]);
    }
  }
  return [...codes].sort();
}

export function collectDefinedCodes(
  definedStandardsPath: string = path.join(SEED_DIR, "seed_standards.ts")
): string[] {
  if (!fs.existsSync(definedStandardsPath)) {
    return [];
  }
  const text = fs.readFileSync(definedStandardsPath, "utf8");
  const codes = new Set<string>();
  let match: RegExpExecArray | null;
  DEFINED_CODE_RE.lastIndex = 0;
  while ((match = DEFINED_CODE_RE.exec(text)) !== null) {
    codes.add(match[1]);
  }
  return [...codes].sort();
}

export function findMissingCodes(
  referenced: Iterable<string>,
  defined: Iterable<string>
): string[] {
  const definedSet = new Set(defined);
  return [...referenced].filter((code) => !definedSet.has(code)).sort();
}
