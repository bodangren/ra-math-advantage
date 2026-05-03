#!/usr/bin/env node
// @ts-check

/**
 * Seed Lesson Data Integrity Validator
 *
 * Cross-references seed data files against curriculum source files and
 * the activity component registry. Reports mismatches and exits with
 * code 1 if issues are found.
 *
 * Usage: node scripts/validate-seed-integrity.mjs
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");
const ROOT = join(__dirname, "..");
const SEED_DIR = join(ROOT, "convex", "seed");
const CURRICULUM_MODULES_DIR = join(ROOT, "curriculum", "modules");
const REGISTRY_FILE = join(ROOT, "lib", "activities", "registry.ts");

// ─── Collect registered component keys ──────────────────────────────────────

function getRegisteredComponentKeys() {
  const registrySource = readFileSync(REGISTRY_FILE, "utf-8");

  const registered = new Set();

  // Match registerActivity('key', ...) calls
  const registerRegex = /registerActivity\s*\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = registerRegex.exec(registrySource)) !== null) {
    registered.add(match[1]);
  }

  return registered;
}

// ─── Collect lesson slugs and component keys from seed files ─────────────────

function parseSeedFile(filePath) {
  const source = readFileSync(filePath, "utf-8");
  const filename = basename(filePath);

  // Extract lesson slug
  const slugMatch = source.match(/lessonSlug\s*=\s*["']([^"']+)["']/);
  const lessonSlug = slugMatch ? slugMatch[1] : null;

  // Extract all componentKey references from section content
  const componentKeys = new Set();
  const keyRegex = /componentKey:\s*["']([^"']+)["']/g;
  let match;
  while ((match = keyRegex.exec(source)) !== null) {
    componentKeys.add(match[1]);
  }

  return { filename, lessonSlug, componentKeys: [...componentKeys] };
}

function getSeedLessons() {
  const files = readdirSync(SEED_DIR).filter(
    (f) => f.startsWith("seed_lesson_") && f.endsWith(".ts") && !f.includes("standards")
  );

  return files.map((f) => parseSeedFile(join(SEED_DIR, f)));
}

// ─── Collect curriculum lesson slugs from modules/ directories ───────────────

function getCurriculumLessons() {
  if (!existsSync(CURRICULUM_MODULES_DIR)) return new Set();

  const entries = readdirSync(CURRICULUM_MODULES_DIR);
  const lessonSlugs = new Set();

  for (const entry of entries) {
    const fullPath = join(CURRICULUM_MODULES_DIR, entry);
    // Lesson entries are either directories or files named "module-N-lesson-N"
    if (/^module-\d+-lesson-\d+$/.test(entry)) {
      lessonSlugs.add(entry);
    }
  }

  return lessonSlugs;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function main() {
  const errors = [];
  const warnings = [];

  const registeredKeys = getRegisteredComponentKeys();
  const seedLessons = getSeedLessons();
  const curriculumSlugs = getCurriculumLessons();

  const seededSlugs = new Set();
  const invalidComponentKeys = new Map(); // key -> list of files using it

  // Check each seed file
  for (const lesson of seedLessons) {
    if (!lesson.lessonSlug) {
      errors.push(`${lesson.filename}: could not extract lessonSlug`);
      continue;
    }

    seededSlugs.add(lesson.lessonSlug);

    // Check component keys against registry
    for (const key of lesson.componentKeys) {
      if (!registeredKeys.has(key)) {
        if (!invalidComponentKeys.has(key)) {
          invalidComponentKeys.set(key, []);
        }
        invalidComponentKeys.get(key).push(lesson.filename);
      }
    }
  }

  // Check: seeded lessons without curriculum source
  for (const slug of [...seededSlugs].sort()) {
    if (!curriculumSlugs.has(slug)) {
      errors.push(`Seed has lesson "${slug}" but no curriculum directory found in modules/`);
    }
  }

  // Check: curriculum lessons without seed data
  for (const slug of [...curriculumSlugs].sort()) {
    if (!seededSlugs.has(slug)) {
      warnings.push(`Curriculum has lesson directory "${slug}" but no seed file`);
    }
  }

  // Check: seed files that don't map to any curriculum lesson (filename parsing)
  for (const lesson of seedLessons) {
    if (lesson.lessonSlug && !curriculumSlugs.has(lesson.lessonSlug)) {
      // Already reported above, skip
    }
  }

  // ─── Report ─────────────────────────────────────────────────────────────

  console.log("\n🔍 Seed Lesson Data Integrity Validator\n");

  console.log(`   Seed files scanned:         ${seedLessons.length}`);
  console.log(`   Curriculum lesson dirs:     ${curriculumSlugs.size}`);
  console.log(`   Registered component keys:  ${registeredKeys.size}`);
  console.log();

  let issueCount = 0;

  if (invalidComponentKeys.size > 0) {
    console.log("❌ INVALID COMPONENT KEYS (not in registry):\n");
    for (const [key, files] of [...invalidComponentKeys.entries()].sort()) {
      console.log(`   "${key}" used in:`);
      for (const f of files) {
        console.log(`     - ${f}`);
      }
      issueCount++;
    }
    console.log();
  }

  if (errors.length > 0) {
    console.log("❌ ERRORS:\n");
    for (const err of errors) {
      console.log(`   ${err}`);
      issueCount++;
    }
    console.log();
  }

  if (warnings.length > 0) {
    console.log("⚠️  WARNINGS:\n");
    for (const w of warnings) {
      console.log(`   ${w}`);
    }
    console.log();
  }

  if (issueCount === 0 && warnings.length === 0) {
    console.log("✅ All seed data cross-references are valid.\n");
  } else if (issueCount === 0) {
    console.log("✅ No errors (warnings above are informational).\n");
  } else {
    console.log(`💥 Found ${issueCount} issue(s).\n`);
  }

  // List all registered keys for reference
  if (registeredKeys.size > 0) {
    console.log("   Registered component keys:");
    for (const key of [...registeredKeys].sort()) {
      console.log(`     - ${key}`);
    }
    console.log();
  }

  process.exit(issueCount > 0 ? 1 : 0);
}

main();
