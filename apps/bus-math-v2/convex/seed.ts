/**
 * Convex curriculum + demo account seed helpers.
 *
 * Usage:
 *   npx convex run seed:seedPublishedCurriculum
 *   npx convex run seed:seedDemoAccounts
 *
 * `seedUnit1Lesson1` is kept as a compatibility alias, but it now seeds the
 * full published curriculum manifest rather than a one-off lesson.
 *
 * Published activity props are sourced from the generated authored manifest in
 * `lib/curriculum/generated`, so reseeding should be run after regenerating
 * authored modules.
 */

import { mutation, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  buildPublishedCurriculumSeedPlan,
  type PublishedActivity,
  type PublishedCurriculumLesson,
  type PublishedSection,
} from "../lib/curriculum/published-manifest";
import { resolveLatestPublishedLessonVersion } from "../lib/progress/published-curriculum";

/** Encodes a byte array to a base64url string without padding. */
function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Computes a PBKDF2-SHA256 hash of the given password and salt.
 * @param password - The plaintext password to hash.
 * @param salt - The salt string to use.
 * @param iterations - The number of PBKDF2 iterations.
 * @returns The derived key as a base64url-encoded string.
 */
async function pbkdf2Hash(password: string, salt: string, iterations: number): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations },
    keyMaterial,
    256,
  );
  return base64UrlEncodeBytes(new Uint8Array(derived));
}

/**
 * Builds a deduplication signature string for a published activity.
 * @param activity - An activity with componentKey, displayName, and description.
 * @returns A "::-delimited" composite key for deduplication.
 */
function activitySignature(activity: Pick<PublishedActivity, "componentKey" | "displayName" | "description">) {
  return [
    activity.componentKey,
    activity.displayName,
    activity.description ?? "",
  ].join("::");
}

/**
 * Upserts a competency standard by code, using an in-memory cache to avoid
 * redundant inserts within the same seed run.
 * @param ctx - The Convex mutation context.
 * @param code - The unique competency standard code.
 * @param now - The current timestamp in milliseconds.
 * @param cache - An in-memory map of previously resolved standard IDs.
 * @returns The Convex ID of the competency standard.
 */
async function ensureCompetencyStandard(
  ctx: MutationCtx,
  code: string,
  now: number,
  cache: Map<string, Id<"competency_standards">>,
) {
  const cached = cache.get(code);
  if (cached) {
    return cached;
  }

  const existing = await ctx.db
    .query("competency_standards")
    .withIndex("by_code", (q) => q.eq("code", code))
    .unique();

  if (existing) {
    cache.set(code, existing._id);
    return existing._id;
  }

  const standardId = await ctx.db.insert("competency_standards", {
    code,
    description: `Published curriculum standard ${code}`,
    studentFriendlyDescription: `Demonstrate mastery for ${code}.`,
    category: "Curriculum",
    isActive: true,
    createdAt: now,
  });

  cache.set(code, standardId);
  return standardId;
}

/**
 * Upserts an activity by component key and display name, patching existing
 * records or inserting new ones with an in-memory signature cache.
 * @param ctx - The Convex mutation context.
 * @param activity - The published activity to upsert.
 * @param now - The current timestamp in milliseconds.
 * @param existingActivities - The existing activity docs from the database.
 * @param cache - An in-memory map of previously resolved activity IDs.
 * @returns The Convex ID of the activity.
 */
async function ensureActivity(
  ctx: MutationCtx,
  activity: PublishedActivity,
  now: number,
  existingActivities: Doc<"activities">[],
  cache: Map<string, Id<"activities">>,
) {
  const signature = activitySignature(activity);
  const cached = cache.get(signature);
  if (cached) {
    return cached;
  }

  const existing = existingActivities.find(
    (candidate) =>
      candidate.componentKey === activity.componentKey &&
      candidate.displayName === activity.displayName &&
      (candidate.description ?? null) === (activity.description ?? null),
  );

  if (existing) {
    await ctx.db.patch(existing._id, {
      description: activity.description,
      props: activity.props,
      gradingConfig: activity.gradingConfig,
      updatedAt: now,
    });
    cache.set(signature, existing._id);
    return existing._id;
  }

  const activityId = await ctx.db.insert("activities", {
    componentKey: activity.componentKey,
    displayName: activity.displayName,
    description: activity.description,
    props: activity.props,
    gradingConfig: activity.gradingConfig,
    createdAt: now,
    updatedAt: now,
  });

  const inserted = await ctx.db.get(activityId);
  if (inserted) {
    existingActivities.push(inserted);
  }

  cache.set(signature, activityId);
  return activityId;
}

/**
 * Deletes all existing phase versions and their sections for a lesson version
 * so they can be re-seeded from scratch.
 * @param ctx - The Convex mutation context.
 * @param lessonVersionId - The ID of the lesson version to clean.
 */
async function replaceLessonVersionPhases(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
) {
  const existingPhases = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", lessonVersionId))
    .collect();

  for (const phase of existingPhases) {
    const sections = await ctx.db
      .query("phase_sections")
      .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
      .collect();

    for (const section of sections) {
      await ctx.db.delete!(section._id);
    }

    await ctx.db.delete!(phase._id);
  }
}

/**
 * Replaces all lesson-standard links for a lesson version by deleting existing
 * links and inserting the provided set.
 * @param ctx - The Convex mutation context.
 * @param lessonVersionId - The ID of the lesson version.
 * @param standardIds - The standard IDs and primary flags to link.
 * @param now - The current timestamp in milliseconds.
 */
async function replaceLessonStandards(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  standardIds: Array<{ standardId: Id<"competency_standards">; isPrimary: boolean }>,
  now: number,
) {
  const existingLinks = await ctx.db
    .query("lesson_standards")
    .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", lessonVersionId))
    .collect();

  for (const link of existingLinks) {
    await ctx.db.delete!(link._id);
  }

  for (const standard of standardIds) {
    await ctx.db.insert("lesson_standards", {
      lessonVersionId,
      standardId: standard.standardId,
      isPrimary: standard.isPrimary,
      createdAt: now,
    });
  }
}

/**
 * Resolves activity references in section content by replacing logical activity
 * keys with their actual Convex IDs from the mapping.
 * @param section - The published section to normalize.
 * @param activityIdByLogicalKey - Map from logical activity key to Convex ID.
 * @returns The resolved section content object.
 * @throws If a referenced activity key is missing from the mapping.
 */
function normalizeSectionContent(
  section: PublishedSection,
  activityIdByLogicalKey: Map<string, Id<"activities">>,
) {
  if (
    section.sectionType === "activity" &&
    typeof section.content.activityId === "string"
  ) {
    const resolvedActivityId = activityIdByLogicalKey.get(section.content.activityId);
    if (!resolvedActivityId) {
      throw new Error(`Missing activity mapping for ${section.content.activityId}`);
    }

    return {
      ...section.content,
      activityId: resolvedActivityId,
    };
  }

  return section.content;
}

/**
 * Creates or updates a lesson and its version, standards, phases, and sections
 * from a single published curriculum lesson entry.
 * @param ctx - The Convex mutation context.
 * @param lesson - The published curriculum lesson to upsert.
 * @param now - The current timestamp in milliseconds.
 * @param existingActivities - The existing activity docs from the database.
 * @param standardCache - Cache of previously resolved competency standard IDs.
 * @param activityCache - Cache of previously resolved activity IDs.
 * @returns The Convex ID of the upserted lesson.
 */
async function upsertPublishedLesson(
  ctx: MutationCtx,
  lesson: PublishedCurriculumLesson,
  now: number,
  existingActivities: Doc<"activities">[],
  standardCache: Map<string, Id<"competency_standards">>,
  activityCache: Map<string, Id<"activities">>,
) {
  let lessonRow = await ctx.db
    .query("lessons")
    .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
    .unique();

  if (lessonRow) {
    await ctx.db.patch(lessonRow._id, {
      unitNumber: lesson.unitNumber,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      learningObjectives: lesson.learningObjectives,
      orderIndex: lesson.orderIndex,
      metadata: lesson.metadata,
      updatedAt: now,
    });
    lessonRow = await ctx.db.get(lessonRow._id);
  } else {
    const lessonId = await ctx.db.insert("lessons", {
      unitNumber: lesson.unitNumber,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      learningObjectives: lesson.learningObjectives,
      orderIndex: lesson.orderIndex,
      metadata: lesson.metadata,
      createdAt: now,
      updatedAt: now,
    });
    lessonRow = await ctx.db.get(lessonId);
  }

  if (!lessonRow) {
    throw new Error(`Unable to upsert lesson ${lesson.slug}`);
  }

  let lessonVersion = await ctx.db
    .query("lesson_versions")
    .withIndex("by_lesson_and_version", (q) =>
      q.eq("lessonId", lessonRow._id).eq("version", lesson.version.version),
    )
    .unique();

  if (lessonVersion) {
    await ctx.db.patch(lessonVersion._id, {
      title: lesson.version.title,
      description: lesson.version.description,
      status: lesson.version.status,
    });
    lessonVersion = await ctx.db.get(lessonVersion._id);
  } else {
    const lessonVersionId = await ctx.db.insert("lesson_versions", {
      lessonId: lessonRow._id,
      version: lesson.version.version,
      title: lesson.version.title,
      description: lesson.version.description,
      status: lesson.version.status,
      createdAt: now,
    });
    lessonVersion = await ctx.db.get(lessonVersionId);
  }

  if (!lessonVersion) {
    throw new Error(`Unable to upsert lesson version for ${lesson.slug}`);
  }

  const standardIds = [];
  for (const standard of lesson.standards) {
    const standardId = await ensureCompetencyStandard(ctx, standard.code, now, standardCache);
    standardIds.push({ standardId, isPrimary: standard.isPrimary });
  }

  await replaceLessonStandards(ctx, lessonVersion._id, standardIds, now);
  await replaceLessonVersionPhases(ctx, lessonVersion._id);

  const activityIdByLogicalKey = new Map<string, Id<"activities">>();
  for (const activity of lesson.activities) {
    const activityId = await ensureActivity(ctx, activity, now, existingActivities, activityCache);
    activityIdByLogicalKey.set(activity.key, activityId);
  }

  for (const phase of lesson.phases) {
    const phaseId = await ctx.db.insert("phase_versions", {
      lessonVersionId: lessonVersion._id,
      phaseNumber: phase.phaseNumber,
      title: phase.title,
      estimatedMinutes: phase.estimatedMinutes,
      createdAt: now,
    });

    for (const [index, section] of phase.sections.entries()) {
      await ctx.db.insert("phase_sections", {
        phaseVersionId: phaseId,
        sequenceOrder: index + 1,
        sectionType: section.sectionType,
        content: normalizeSectionContent(section, activityIdByLogicalKey),
        createdAt: now,
      });
    }
  }

  return lessonRow._id;
}

/**
 * Seeds the full published curriculum from the manifest by upserting every
 * lesson, its standards, activities, phases, and sections.
 * @param ctx - The Convex mutation context.
 * @returns A summary with status, lesson count, and seeded lesson IDs.
 */
async function seedPublishedCurriculumHandler(ctx: MutationCtx) {
  const now = Date.now();
  const seedPlan = buildPublishedCurriculumSeedPlan();
  const existingActivities = await ctx.db.query("activities").collect();
  const standardCache = new Map<string, Id<"competency_standards">>();
  const activityCache = new Map<string, Id<"activities">>();

  const lessonIds: Id<"lessons">[] = [];
  for (const lesson of seedPlan.lessons) {
    lessonIds.push(
      await upsertPublishedLesson(
        ctx,
        lesson,
        now,
        existingActivities,
        standardCache,
        activityCache,
      ),
    );
  }

  return {
    status: "seeded",
    lessonCount: seedPlan.lessons.length,
    instructionalUnitCount: seedPlan.instructionalUnitCount,
    capstoneLessonCount: seedPlan.capstoneLessonCount,
    lessonIds,
  };
}

/**
 * Patches mismatched activity props for published lessons by comparing the
 * seed plan against the database and updating any drifted records.
 * @param ctx - The Convex mutation context.
 * @returns A summary with status and the number of repaired activities.
 */
async function repairPublishedActivityPropsHandler(ctx: MutationCtx) {
  const now = Date.now();
  const seedPlan = buildPublishedCurriculumSeedPlan();
  let repairedCount = 0;

  for (const lesson of seedPlan.lessons) {
    const lessonRow = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
      .unique();
    if (!lessonRow) {
      continue;
    }

    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonRow._id))
      .collect();
    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) {
      continue;
    }

    const phaseRows = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latestVersion._id))
      .collect();
    const phaseByNumber = new Map(phaseRows.map((phase) => [phase.phaseNumber, phase]));

    for (const plannedPhase of lesson.phases) {
      const phaseRow = phaseByNumber.get(plannedPhase.phaseNumber);
      if (!phaseRow) {
        continue;
      }

      const sectionRows = await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phaseRow._id))
        .collect();
      sectionRows.sort((a, b) => a.sequenceOrder - b.sequenceOrder);

      for (let index = 0; index < plannedPhase.sections.length; index += 1) {
        const plannedSection = plannedPhase.sections[index];
        const sectionRow = sectionRows[index];

        if (
          plannedSection.sectionType !== "activity" ||
          sectionRow?.sectionType !== "activity" ||
          typeof plannedSection.content.activityId !== "string" ||
          typeof sectionRow.content.activityId !== "string"
        ) {
          continue;
        }

        const plannedActivity = lesson.activities.find(
          (activity) => activity.key === plannedSection.content.activityId,
        );
        if (!plannedActivity) {
          continue;
        }

        const activityRow = await ctx.db.get(sectionRow.content.activityId as Id<"activities">);
        if (!activityRow) {
          continue;
        }

        const shouldPatch =
          activityRow.componentKey !== plannedActivity.componentKey ||
          activityRow.displayName !== plannedActivity.displayName ||
          (activityRow.description ?? null) !== (plannedActivity.description ?? null) ||
          JSON.stringify(activityRow.props) !== JSON.stringify(plannedActivity.props) ||
          JSON.stringify(activityRow.gradingConfig ?? null) !== JSON.stringify(plannedActivity.gradingConfig ?? null);

        if (!shouldPatch) {
          continue;
        }

        await ctx.db.patch(activityRow._id, {
          componentKey: plannedActivity.componentKey,
          displayName: plannedActivity.displayName,
          description: plannedActivity.description,
          props: plannedActivity.props,
          gradingConfig: plannedActivity.gradingConfig,
          updatedAt: now,
        });
        repairedCount += 1;
      }
    }
  }

  return {
    status: "repaired",
    repairedCount,
  };
}

/**
 * Throws if the current authenticated user is not an admin.
 * @param ctx - The Convex mutation context.
 * @throws If the user is unauthenticated or does not have admin role.
 */
async function requireAdmin(ctx: MutationCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const profile = await ctx.db
    .query("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_username", (q: any) => q.eq("username", identity.email!))
    .unique();
  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized: admin role required");
  }
}

export const seedPublishedCurriculum = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return seedPublishedCurriculumHandler(ctx);
  },
});

export const seedUnit1Lesson1 = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return seedPublishedCurriculumHandler(ctx);
  },
});

export const repairPublishedActivityProps = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return repairPublishedActivityPropsHandler(ctx);
  },
});

export const seedDemoAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const DEV_ITERATIONS = 10_000;

    let org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", "demo-org"))
      .unique();

    if (!org) {
      const orgId = await ctx.db.insert("organizations", {
        name: "Demo Organization",
        slug: "demo-org",
        settings: {},
        createdAt: now,
        updatedAt: now,
      });
      org = await ctx.db.get(orgId);
    }

    if (!org) {
      throw new Error("Failed to create or retrieve demo-org");
    }

    const demoUsers = [
      {
        username: "demo_teacher",
        role: "teacher" as const,
        displayName: "Demo Teacher",
        password: "demo123",
      },
      {
        username: "demo_student",
        role: "student" as const,
        displayName: "Demo Student",
        password: "demo123",
      },
      {
        username: "demo_admin",
        role: "admin" as const,
        displayName: "Demo Admin",
        password: "demo123",
      },
    ];

    const results: Array<{ username: string; status: string }> = [];

    for (const user of demoUsers) {
      let profile = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", user.username))
        .unique();

      if (!profile) {
        const profileId = await ctx.db.insert("profiles", {
          organizationId: org._id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          createdAt: now,
          updatedAt: now,
        });
        profile = await ctx.db.get(profileId);
      }

      if (!profile) {
        results.push({ username: user.username, status: "profile_error" });
        continue;
      }

      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      const salt = base64UrlEncodeBytes(saltBytes);
      const passwordHash = await pbkdf2Hash(user.password, salt, DEV_ITERATIONS);

      const existingCredential = await ctx.db
        .query("auth_credentials")
        .withIndex("by_username", (q) => q.eq("username", user.username))
        .unique();

      if (existingCredential) {
        await ctx.db.patch(existingCredential._id, {
          passwordHash,
          passwordSalt: salt,
          passwordHashIterations: DEV_ITERATIONS,
          isActive: true,
          updatedAt: now,
        });
        results.push({ username: user.username, status: "updated" });
      } else {
        await ctx.db.insert("auth_credentials", {
          profileId: profile._id,
          username: user.username,
          role: user.role,
          organizationId: org._id,
          passwordHash,
          passwordSalt: salt,
          passwordHashIterations: DEV_ITERATIONS,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.push({ username: user.username, status: "created" });
      }
    }

    return {
      status: "seeded",
      orgId: org._id,
      results,
    };
  },
});
