/**
 * AI-assisted teacher error summary on the structured-output helper.
 *
 * The prompt is lesson-level and names no student. The route adds the student
 * name to its response on the app side. A failed model call or Zod check gives
 * null, so the route keeps the deterministic summary.
 */

import { resolveStructuredProviderFromEnv } from "@math-platform/ai-tutoring";
import { z } from "zod";

import type { LessonErrorSummary } from "./error-summary";

export const teacherAiSummarySchema = z.strictObject({
  likelyMisunderstanding: z.string(),
  evidenceObserved: z.array(z.string()),
  suggestedReteach: z.string(),
  groundedIn: z.array(z.string()),
});

export type TeacherAiSummary = z.infer<typeof teacherAiSummarySchema> & {
  type: "ai-assisted";
  generatedAt: number;
};

export type TeacherAiSummaryGenerator = (
  summary: LessonErrorSummary,
) => Promise<TeacherAiSummary | null>;

/** Builds the lesson-level prompt. The student name never enters this text. */
export function buildTeacherSummaryPrompt(summary: LessonErrorSummary): string {
  const lines: string[] = [];

  lines.push("You are an expert accounting education assistant.");
  lines.push(
    "Analyze the following student practice evidence and provide a concise interpretation.",
  );
  lines.push('Refer to the learner only as "the student". Do not use a name.');
  lines.push("");

  lines.push(`Lesson: ${summary.lessonTitle}`);
  lines.push("");

  if (summary.overallCorrectnessRate !== null) {
    const pct = Math.round(summary.overallCorrectnessRate * 100);
    lines.push(
      `Overall performance: ${pct}% correct (${summary.correctParts}/${summary.totalParts} parts)`,
    );
  }

  if (summary.topMisconceptions.length > 0) {
    lines.push("");
    lines.push("Top misconceptions:");
    for (const m of summary.topMisconceptions.slice(0, 5)) {
      lines.push(`  - "${m.tag}" (${m.count} occurrences across parts: ${m.partIds.join(", ")})`);
    }
  }

  if (summary.totalHintsUsed > 0 || summary.totalRevealsSeen > 0 || summary.totalEditsMade > 0) {
    lines.push("");
    lines.push(
      `Scaffold usage: ${summary.totalHintsUsed} hints, ${summary.totalRevealsSeen} reveals, ${summary.totalEditsMade} edits`,
    );
  }

  if (summary.activities.length > 0) {
    lines.push("");
    lines.push("Activity breakdown:");
    for (const activity of summary.activities) {
      const pct =
        activity.correctnessRate !== null
          ? `${Math.round(activity.correctnessRate * 100)}%`
          : "unscored";
      lines.push(
        `  - ${activity.activityTitle}: ${activity.correctParts}/${activity.totalParts} correct (${pct})`,
      );
      if (activity.misconceptionTags.length > 0) {
        const tags = activity.misconceptionTags.map((t) => t.tag).join(", ");
        lines.push(`    Tags: ${tags}`);
      }
    }
  }

  lines.push("");
  lines.push("Fill each field of the JSON schema:");
  lines.push("  - likelyMisunderstanding: string — the most probable conceptual gap");
  lines.push("  - evidenceObserved: string[] — 2-4 specific evidence points from the submission");
  lines.push("  - suggestedReteach: string — a concrete reteaching direction");
  lines.push(
    "  - groundedIn: string[] — which submission data points your interpretation is based on",
  );
  lines.push("");
  lines.push("Be concise. Only reference evidence that is actually present in the data above.");
  lines.push(
    "If the student performed well, say so and suggest enrichment rather than reteaching.",
  );

  return lines.join("\n");
}

/**
 * Resolves the teacher summary generator from the accounting role settings.
 * A missing key or model logs the variable name and returns null.
 */
export function resolveTeacherAiSummaryGenerator(): TeacherAiSummaryGenerator | null {
  const provider = resolveStructuredProviderFromEnv("accountingEval");
  if (!provider) {
    return null;
  }

  return async function generateTeacherAiSummary(
    summary: LessonErrorSummary,
  ): Promise<TeacherAiSummary | null> {
    if (summary.totalParts === 0) {
      return null;
    }

    const result = await provider({
      schemaName: "teacher_error_summary",
      schema: teacherAiSummarySchema,
      messages: [{ role: "user", content: buildTeacherSummaryPrompt(summary) }],
      temperature: 0.3,
      maxTokens: 500,
    });

    if (!result.ok) {
      return null;
    }

    return {
      type: "ai-assisted",
      generatedAt: Date.now(),
      ...result.data,
    };
  };
}
