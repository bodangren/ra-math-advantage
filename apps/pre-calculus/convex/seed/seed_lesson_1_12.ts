import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_12Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_12 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_12Result> => {
    const now = Date.now();
    const lessonSlug = "1-12-transformations-of-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Transformations of Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.12: Transformations of Functions",
          orderIndex: 12,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_and_version", (q) => q.eq("lessonId", lessonId).eq("version", 2))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 2,
          title: "Transformations of Functions",
          description: "AP Precalculus Topic 1.12: Transformations of Functions",
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
          "markdown": "If $f(3) = 5$, what is $g(3)$ when $g(x) = 2f(x) - 1$? What about $g(3)$ when $g(x) = f(x + 2)$? Each transformation shifts, stretches, or reflects the graph of $f$. Today we develop a systematic table of transformations and learn how they affect domain, range, and graph behavior."
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
          "markdown": "- **Vertical translation** — $g(x) = f(x) + k$ shifts the graph up $k$ units (down if $k < 0$).\n- **Horizontal translation** — $g(x) = f(x + h)$ shifts the graph left $h$ units (right if $h < 0$).\n- **Vertical dilation** — $g(x) = a · f(x)$ stretches the graph by factor $|a|$ vertically.\n- **Horizontal dilation** — $g(x) = f(bx)$ compresses the graph by factor $|1/b|$ horizontally.\n- **Reflection** — If $a < 0$, reflect over the x-axis. If $b < 0$, reflect over the y-axis."
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
          "markdown": "**EK 1.12.A.1:** $g(x) = f(x) + k$ produces a vertical translation of $k$ units. $g(x) = f(x + h)$ produces a horizontal translation of $-h$ units.\n\n**EK 1.12.A.2:** $g(x) = a · f(x)$ produces a vertical dilation by $|a|$. If $a < 0$, reflect over the x-axis. $g(x) = f(bx)$ produces a horizontal dilation by $|1/b|$. If $b < 0$, reflect over the y-axis.\n\n**EK 1.12.A.3:** Transformations affect domain and range. Horizontal dilations scale the domain; vertical dilations scale the range. Translations shift both.\n\n### Transformation Order\n\nApply transformations in this order:\n1. **Horizontal:** translate (shift by $-h$), then dilate/reflect (scale by $1/b$)\n2. **Vertical:** dilate/reflect (scale by $a$), then translate (shift by $k$)\n\nThe general form: $g(x) = a · f(bx + c) + d$.\n\n### Mapping Points\n\nA point $(p, q)$ on $f$ maps to $(p/b - c/b, aq + d)$ on $g$."
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
          "markdown": "**Example 1:** Let $g(x) = 2f(x - 1) + 3$. Given that $f$ has domain $[-4, 6]$ and range $[-2, 5]$:\n\n- **Domain of $g$:** $x - 1 ∈ [-4, 6$] → $x ∈ [-3, 7$].\n- **Range of $g$:** $2 · [-2, 5$ + 3 = $-4, 10$ + 3 = $-1, 13$].\n- **Point mapping:** $(4, 2)$ on $f$ → $(4 + 1, 2 · 2 + 3) = (5, 7)$ on $g$.\n- **Find $g(0)$:** $g(0) = 2f(-1) + 3$.\n\n**Example 2:** $f(x) = -2(x + 3)²(x - 1)$. Let $g(x) = f(-x)$.\n\n$g(x) = -2(-x + 3)²(-x - 1)$.\n\nZeros: $-x + 3 = 0$ gives $x = 3$; $-x - 1 = 0$ gives $x = -1$.\n\n**Example 3:** $p$ is cubic with table: $p(-2) = 1, p(0) = -1, p(2) = 0, p(4) = 3, p(6) = 7$. Let $m(x) = -3p(x + 4)$.\n\n- Zero of $m$: $p(x + 4) = 0$ when $x + 4 = 2$, so $x = -2$.\n- Average rate of change of $m$ over $[0, 2]$: $m(0) = -3p(4) = -9$, $m(2) = -3p(6) = -21$. AROC = $(-21 - (-9)) / (2 - 0) = -6$."
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
          "markdown": "**Problem 1:** $f$ has domain $[-6, 9]$ and range $[-8, 10)], increasing on [[-6, 1]$ and $[5, 9)], decreasing on [[1, 5]$. Find the domain and range of $q(x) = 4 - 2n(5 - x)$.\n*Hint:* For domain: $5 - x ∈ [-6, 9$]. For range: apply dilation by $-2$ then translation by $4$.\n\n**Problem 2:** Let $g(x) = 2f(x/2) - 3$. Given the table $f(-5) = 7, f(0) = 2, f(5) = -1$, find $g(-10)$ and $g(0)$.\n*Hint:* $g(-10) = 2f(-10/2) - 3 = 2f(-5) - 3$.\n\n**Problem 3:** Describe the transformation from $f$ to $g$ if $g(x) = -f(2x + 4) + 1$.\n*Hint:* Rewrite as $g(x) = -f(2(x + 2)) + 1$. Horizontal shift left 2, horizontal compression by 1/2, reflection over x-axis, vertical shift up 1."
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
          "markdown": "**Problem 1:** If $f$ has domain $[-3, 5]$ and range $[0, 8]$, find the domain and range of $g(x) = -2f(x - 1) + 3$.\n\n**Problem 2:** The graph of $f$ has a line segment from $(-4,0)$ to $(-2,0)$, the upper semicircle $y=\\sqrt{4-x^2}$ for $-2\\le x\\le2$, and a line segment from $(2,0)$ to $(3,2)$. Sketch $g(x) = ½f(x + 2) + 5$ by mapping key points.\n\n**Problem 3:** Which equation transforms $f$ to $g$ if $g$ is $f$ shifted right 2 and down 1? Options: $g(x) = f(x - 2) - 1$, $f(x + 2) - 1$, $f(x - 2) + 1$, $f(x + 2) + 1$."
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
          "markdown": "**Exit Ticket:** If $f$ has domain $[-3, 5]$ and range $[0, 8]$, find the domain and range of $g(x) = -2f(x - 1) + 3$.\n\n**Lesson Summary:** Transformations shift, stretch, compress, and reflect function graphs. Horizontal transformations act on the input (inside the function); vertical transformations act on the output (outside). Always track how domain and range change, and map key points to verify your transformed graph."
        }
      }
    ]
  }
] as const;

    const activitiesCreated = 0;

    const phasesCreated = await upsertLessonPhases(ctx, lessonVersionId, phaseData, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
