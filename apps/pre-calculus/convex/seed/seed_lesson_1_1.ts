import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import {
  PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PILOT_ACTIVITY_ID,
  PRECALCULUS_PILOT_COMPONENT_KEY,
} from "../activities";
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
} from "../../lib/learning-evidence/precalc-pilot";

const PRECALCULUS_PILOT_GRADING_CONFIG = { variantSeed: 0 } as const;
const PRECALCULUS_PILOT_INDEPENDENT_GRADING_CONFIG = { variantSeed: 2 } as const;

interface SeedLesson1_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export const seedLesson1_1 = internalMutation({
  args: {},
  returns: v.object({
    lessonId: v.id("lessons"),
    lessonVersionId: v.id("lesson_versions"),
    phasesCreated: v.number(),
    activitiesCreated: v.number(),
  }),
  handler: async (ctx): Promise<SeedLesson1_1Result> => {
    const now = Date.now();
    const lessonSlug = "1-1-change-in-tandem";

    const topic11SourceMatches = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID)
      ))
      .collect();
    if (topic11SourceMatches.length > 1) {
      throw new Error("Duplicate Topic 1.1 source activities.");
    }

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Change in Tandem",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.1: Change in Tandem",
          orderIndex: 1,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_and_version", (q) => q.eq("lessonId", lessonId).eq("version", 2))
      .collect();
    if (existingLessonVersions.length > 1) {
      throw new Error("Duplicate Topic 1.1 lesson versions.");
    }
    const existingLessonVersion = existingLessonVersions[0] ?? null;

    if (existingLessonVersion) {
      const currentPhases = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", existingLessonVersion._id))
        .collect();
      const workedPhases = currentPhases.filter((phase) => phase.phaseNumber === 4);
      if (workedPhases.length > 1) {
        throw new Error("Duplicate Topic 1.1 Worked phases.");
      }
      if (workedPhases[0] && workedPhases[0].phaseType !== "worked_example") {
        throw new Error("Lesson 1.1 phase 4 is not a Worked phase.");
      }
      const selectedSource = topic11SourceMatches[0];
      const selectedLinks = [];
      for (const phase of currentPhases) {
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
          .collect();
        for (const section of sections) {
          if (
            section.sectionType === "activity"
            && typeof section.content === "object"
            && section.content !== null
            && (section.content as { activityId?: unknown }).activityId === selectedSource?._id
          ) {
            selectedLinks.push({ phase, section });
          }
        }
      }
      if (selectedLinks.length > 1) {
        throw new Error("Duplicate Topic 1.1 source phase links.");
      }
      if (selectedLinks[0] && selectedLinks[0].phase._id !== workedPhases[0]?._id) {
        throw new Error("The Topic 1.1 source is linked to another phase.");
      }
      if (workedPhases[0]) {
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", workedPhases[0]!._id))
          .collect();
        const selectedSequence = sections.filter((section) => section.sequenceOrder === 2);
        if (selectedSequence.length > 1) {
          throw new Error("Duplicate Topic 1.1 Worked sequence.");
        }
        if (selectedLinks[0]?.section.sequenceOrder !== undefined && selectedLinks[0].section.sequenceOrder !== 2) {
          throw new Error("The Topic 1.1 source uses an unexpected sequence.");
        }
        const existingLink = selectedSequence[0];
        if (existingLink) {
          const content = existingLink.content as { activityId?: unknown; componentKey?: unknown };
          if (
            !selectedSource
            || existingLink.sectionType !== "activity"
            || content.activityId !== selectedSource._id
            || content.componentKey !== PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY
          ) {
            throw new Error("The Topic 1.1 source sequence is occupied.");
          }
        }
      }
    }

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 2,
          title: "Change in Tandem",
          description: "AP Precalculus Topic 1.1: Change in Tandem",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
  {
    "phaseNumber": 1,
    "title": "Explore",
    "phaseType": "explore",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Authored extension:** Consider the table below. It gives values from the algebraic model $h(t)=-24t^2+60t+6$ at 0.5-second intervals:\n\n| t (seconds) | 0 | 0.5 | 1.0 | 1.5 | 2.0 | 2.5 | 3.0 |\n|---|---|---|---|---|---|---|---|\n| h(t) (feet) | 6 | 30 | 42 | 42 | 30 | 6 | -30 |\n\nUse the algebraic model to describe the change. The vertex occurs at $t=1.25$ seconds, where $h(t)=43.5$ feet. The height increases through $t=1.25$ and then decreases. The equal sampled values at $t=1$ and $t=1.5$ do not show a constant interval.\n\nFor physical height above the ground, use only $0 \\le t \\le (5+\\sqrt{29})/4$, or approximately 2.60 seconds. The negative value at 3 seconds is an algebraic continuation of the model."
        }
      }
    ]
  },
  {
    "phaseNumber": 2,
    "title": "Vocabulary",
    "phaseType": "vocabulary",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "- **Independent variable**: The variable that represents the input value. It is often represented by $x$ or $t$.\n- **Dependent variable**: The variable that represents the output value. Its value depends on the input. It is often represented by $y$ or $f(x)$.\n- **Domain**: The domain is the set of input values.\n- **Range**: The range is the set of output values.\n- **Covariation**: A description of how two quantities change together. Use directional language: \"As $x$ increases from $a$ to $b$, $y$ increases, decreases, or remains constant.\"\n- **Increasing**: A function is increasing on an interval if the output values rise as the input values move from left to right.\n- **Decreasing**: A function is decreasing on an interval if the output values fall as the input values move from left to right.\n- **Constant**: A function is constant on an interval if the output values stay the same as the input values change.\n\nA function maps each input to exactly one output. The input values form the **domain**. The output values form the **range**."
        }
      }
    ]
  },
  {
    "phaseNumber": 3,
    "title": "Learn",
    "phaseType": "learn",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "A finite table gives only sampled values. It does not prove behavior between inputs. When a question asks you to infer behavior between table entries, state the model assumption.\n\nA function can model the relationship between two quantities that change together. A function can be represented in four ways: **verbally**, **graphically**, **numerically** (tables), and **analytically** (equations).\n\nThe behavior of a function is described by identifying where it is increasing, decreasing, or constant \u2014 and by describing the *rate* at which it is changing.\n\n**Critical distinction**: \"The function is increasing\" describes the *direction* of the output \u2014 it means $y$ values are getting larger. This is NOT the same as \"$y$ is positive.\" A function can be increasing while being negative. For example, $f(x) = x$ is increasing on $[-5, -1]$ even though all output values are negative.\n\nWhen describing behavior, always use intervals written with the **input variable**: \"f is increasing on $[a, b]$,\" not \"f is increasing from $f(a)$ to $f(b)$.\"\n\nUse this sentence frame: \"As $x$ increases from ___ to ___, $y$ increases, decreases, or remains constant by approximately ___.\"\n\nThe local table activities are authored extensions. They are not Passwater examples."
        }
      }
    ]
  },
  {
    "phaseNumber": 4,
    "title": "Worked Example",
    "phaseType": "worked_example",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Authored worked example A:** The table shows sampled values of function $g$:\n\n| x | -2 | 0 | 2 | 4 | 6 |\n|---|---|---|---|---|---|\n| g(x) | 11 | 7 | 3 | 3 | 7 |\n\nCompare each pair of consecutive displayed values. Do not infer behavior between the displayed inputs.\n\n**Solution:**\n- From $x=-2$ to $x=0$, $g(x)$ decreases by 4, from 11 to 7.\n- From $x=0$ to $x=2$, $g(x)$ decreases by 4, from 7 to 3.\n- From $x=2$ to $x=4$, the displayed values remain 3.\n- From $x=4$ to $x=6$, $g(x)$ increases by 4, from 3 to 7.\n\n**Authored worked example B:** A piecewise linear function has three segments. On $[-3,-1]$, the graph rises. On $[-1,3]$, the graph falls. On $[3,5]$, the graph is horizontal.\n\n**Solution:**\n- The function is increasing on $[-3,-1]$.\n- The function is decreasing on $[-1,3]$.\n- The function is constant on $[3,5]$."
        }
      }
    ]
  },
  {
    "phaseNumber": 5,
    "title": "Guided Practice",
    "phaseType": "guided_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Authored practice:** These tasks are not recovered Passwater examples.\n\n**Problem 1:** The table shows the temperature $T$ at hour $h$ during a day.\n\n| h | 6 | 8 | 10 | 12 | 14 | 16 | 18 |\n|---|---|---|---|---|---|---|---|\n| T(h) | 58 | 62 | 70 | 76 | 78 | 72 | 65 |\n\nAssume that the temperature changes linearly between each pair of consecutive recorded hours.\n\nOn which interval(s) is $T$ increasing? Decreasing? Use the sentence frame to describe the interval from $h=10$ to $h=12$.\n\n**Hint:** Check whether the output values go up or down as the input values increase. Use directional language, not only the sign of the temperature.\n\n**Problem 2:** A graph shows $f(x)$ on $[-4,4]$. The function is below the x-axis on $[-4,-1)$, crosses the x-axis at $x=-1$, and is above the x-axis on $(-1,4]$. The function is increasing everywhere. Can $f$ be increasing while negative? Explain.\n\n**Hint:** Yes. Increasing describes direction. Negative describes position."
        }
      }
    ]
  },
  {
    "phaseNumber": 6,
    "title": "Independent Practice",
    "phaseType": "independent_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Authored practice:** This table is not a recovered Passwater example. Assume that $p$ changes linearly between consecutive displayed inputs.\n\n**Problem 1:** The table shows values of $p$:\n\n| x | 1 | 3 | 5 | 7 | 9 |\n|---|---|---|---|---|---|\n| p(x) | -8 | -3 | -3 | 2 | 8 |\n\nIdentify all intervals where $p$ is increasing, decreasing, or constant.\n\n**Problem 2:** Which consecutive pair of displayed inputs has the greatest increase in $p(x)$? Justify your answer by comparing the displayed function values.\n\n**Topic 1.2 preview:** Which interval has the greatest average rate of change? Justify your answer using the table. This preview does not supply Topic 1.1 mastery evidence.\n\n**Problem 3:** Describe in words how $x$ and $p(x)$ change together on the interval from $x=5$ to $x=9$."
        }
      }
    ]
  },
  {
    "phaseNumber": 7,
    "title": "Reflection",
    "phaseType": "reflection",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Authored exit ticket:** This table is not a recovered Passwater example. Assume that $m$ changes linearly between consecutive displayed inputs.\n\n| x | 0 | 2 | 4 | 6 | 8 |\n|---|---|---|---|---|---|\n| m(x) | 15 | 9 | 5 | 5 | 12 |\n\nIdentify one interval where $m$ is increasing and one interval where $m$ is decreasing. Then describe the tandem change on the interval $[0,4]$ using the sentence frame.\n\n**Lesson summary:** Functions model relationships between two quantities that change together. A function can have verbal, graphical, numerical, or analytical representations. On an interval, a function can be increasing, decreasing, or constant. Describe behavior with directional language tied to the input variable. A function can be increasing while its values are negative."
        }
      }
    ]
  }
] as const;

    let activitiesCreated = 0;

    const existingPilotActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => query.eq("stableActivityId", PRECALCULUS_PILOT_ACTIVITY_ID))
      .unique();
    const pilotActivityFields = {
        stableActivityId: PRECALCULUS_PILOT_ACTIVITY_ID,
        componentKey: PRECALCULUS_PILOT_COMPONENT_KEY,
        displayName: "Mastery Advantage: Identify Graph Intervals",
        description: "Classify the increasing, decreasing, and constant intervals from a graph.",
        props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: "guided_practice" as const },
        gradingConfig: PRECALCULUS_PILOT_GRADING_CONFIG,
        updatedAt: now,
    };
    if (existingPilotActivity) {
      const contentChanged = JSON.stringify({
        stableActivityId: existingPilotActivity.stableActivityId,
        componentKey: existingPilotActivity.componentKey,
        displayName: existingPilotActivity.displayName,
        description: existingPilotActivity.description,
        props: existingPilotActivity.props,
        gradingConfig: existingPilotActivity.gradingConfig,
      }) !== JSON.stringify({ ...pilotActivityFields, updatedAt: undefined });
      await ctx.db.patch(existingPilotActivity._id, {
        ...pilotActivityFields,
        ...(contentChanged ? { approval: { status: "unreviewed" as const } } : {}),
      });
    } else {
      await ctx.db.insert("activities", {
        ...pilotActivityFields,
        approval: { status: "unreviewed" },
        createdAt: now,
      });
      activitiesCreated++;
    }

    const existingIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => query.eq("stableActivityId", PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID))
      .unique();
    const independentActivityFields = {
      stableActivityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_PILOT_COMPONENT_KEY,
      displayName: "Independent Practice: Classify Graph Intervals",
      description: "Classify the increasing, decreasing, and constant intervals from a generated graph.",
      props: {
        nodeId: PRECALCULUS_PILOT_NODE_ID,
        mode: "independent_practice" as const,
      },
      gradingConfig: PRECALCULUS_PILOT_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingIndependentActivity) {
      const contentChanged = JSON.stringify({
        stableActivityId: existingIndependentActivity.stableActivityId,
        componentKey: existingIndependentActivity.componentKey,
        displayName: existingIndependentActivity.displayName,
        description: existingIndependentActivity.description,
        props: existingIndependentActivity.props,
        gradingConfig: existingIndependentActivity.gradingConfig,
      }) !== JSON.stringify({ ...independentActivityFields, updatedAt: undefined });
      await ctx.db.patch(existingIndependentActivity._id, {
        ...independentActivityFields,
        ...(contentChanged ? { approval: { status: "unreviewed" as const } } : {}),
      });
    } else {
      await ctx.db.insert("activities", {
        ...independentActivityFields,
        approval: { status: "unreviewed" },
        createdAt: now,
      });
      activitiesCreated++;
    }

    const existingTopic11SourceActivity = topic11SourceMatches[0] ?? null;
    const topic11SourceIdentity = {
      stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
      displayName: "Topic 1.1: Identify Graph Intervals with Your Teacher",
      description: "Worked-example source activity for classifying increasing, decreasing, and constant intervals.",
      props: {
        nodeId: PRECALCULUS_PILOT_NODE_ID,
        mode: "worked_example" as const,
        source: "teacher_led" as const,
      },
      gradingConfig: PRECALCULUS_PILOT_GRADING_CONFIG,
    };
    const topic11SourceFields = {
      ...topic11SourceIdentity,
      updatedAt: now,
    };
    let topic11SourceActivityId: Id<"activities">;
    if (existingTopic11SourceActivity) {
      const contentChanged = canonicalJson({
        stableActivityId: existingTopic11SourceActivity.stableActivityId,
        componentKey: existingTopic11SourceActivity.componentKey,
        displayName: existingTopic11SourceActivity.displayName,
        description: existingTopic11SourceActivity.description,
        props: existingTopic11SourceActivity.props,
        gradingConfig: existingTopic11SourceActivity.gradingConfig,
      }) !== canonicalJson(topic11SourceIdentity);
      await ctx.db.patch(existingTopic11SourceActivity._id, {
        ...topic11SourceFields,
        ...(contentChanged ? { approval: { status: "unreviewed" as const } } : {}),
      });
      topic11SourceActivityId = existingTopic11SourceActivity._id;
    } else {
      topic11SourceActivityId = await ctx.db.insert("activities", {
        ...topic11SourceFields,
        approval: { status: "unreviewed" },
        createdAt: now,
      });
      activitiesCreated++;
    }

    const phasesCreated = await upsertLessonPhases(ctx, lessonVersionId, phaseData, now, [{ phaseType: "worked_example", sequenceOrder: 2, componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY, activityId: topic11SourceActivityId }]);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
