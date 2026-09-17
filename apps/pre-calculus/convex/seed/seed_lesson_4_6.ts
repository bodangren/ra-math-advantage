import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_6Result> => {
    const now = Date.now();
    const lessonSlug = "4-6-conic-sections";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Conic Sections",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.6: Conic Sections",
          orderIndex: 6,
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
          title: "Conic Sections",
          description: "AP Precalculus Topic 4.6: Conic Sections",
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
          "markdown": "Slice a cone with a flat plane. Depending on the angle, you get a circle, ellipse, parabola, or hyperbola. These four curves — **conic sections** — arise in orbits, optics, architecture, and navigation. Each has a standard implicit equation, and each reveals different geometric properties."
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
          "markdown": "- **Conic section**: A curve formed by the intersection of a plane with a double cone.\n- **Circle**: $(x - h)^2 + (y - k)^2 = r^2$ — center $(h, k)$, radius $r$.\n- **Ellipse**: $\\frac{(x - h)^2}{a^2} + \\frac{(y - k)^2}{b^2} = 1$ — center $(h, k)$, semi-axes $a$ and $b$.\n- **Parabola**: $y = a(x - h)^2 + k$ (vertical) — vertex $(h, k)$.\n- **Hyperbola**: $\\frac{(x - h)^2}{a^2} - \\frac{(y - k)^2}{b^2} = 1$ — center $(h, k)$, opens left-right.\n- **Standard form**: The canonical equation that reveals the conic's center, axes, and shape."
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
          "markdown": "The four conic sections, in standard form centered at the origin:\n\n| Conic | Standard Form | Key Feature |\n|-------|---------------|-------------|\n| Circle | $x^2 + y^2 = r^2$ | Equal coefficients for $x^2$ and $y^2$ |\n| Ellipse | $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ | Both terms positive, different denominators |\n| Parabola | $y = ax^2$ (or $x = ay^2$) | Only one squared term |\n| Hyperbola | $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ | Subtraction between squared terms |\n\n**Identifying from a general equation** $Ax^2 + By^2 + Cx + Dy + E = 0$:\n- $A = B \\neq 0$: circle\n- $A \\neq B$, same sign: ellipse\n- One of $A, B$ is 0: parabola\n- $A$ and $B$ have opposite signs: hyperbola\n\n**Graphing strategy**: Rewrite in standard form by completing the square, then identify center, axes, and vertices."
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
          "markdown": "**Example 1:** Identify and graph $4x^2 + 9y^2 = 36$.\n\n**Solution:** Divide by 36:\n$$\\frac{x^2}{9} + \\frac{y^2}{4} = 1$$\nThis is an **ellipse** centered at the origin with $a = 3$ (x-intercepts at $\\pm 3$) and $b = 2$ (y-intercepts at $\\pm 2$).\n\n**Example 2:** Identify $x^2 - 4y^2 + 6x + 8y + 5 = 0$.\n\n**Solution:** Completing the square gives $(x + 3)^2 - 4(y - 1)^2 = 0$, a **degenerate hyperbola** (two intersecting lines: $x + 3 = \\pm 2(y - 1)$)."
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
          "markdown": "**Problem 1:** Classify $9x^2 + 16y^2 = 144$ as a conic section and find its intercepts.\n\n**Hint:** Divide by 144 to get standard form.\n\n**Problem 2:** Classify $x^2 + y^2 - 4x + 6y - 12 = 0$ and find the center and radius.\n\n**Hint:** Complete the square for both $x$ and $y$."
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
          "markdown": "**Problem 1:** Write the equation $\\frac{x^2}{25} + \\frac{y^2}{16} = 1$. Identify the conic and find all intercepts.\n\n**Problem 2:** Classify $y^2 - 9x^2 = 81$. What type of conic is this?\n\n**Problem 3:** Complete the square to convert $x^2 + y^2 + 8x - 10y + 5 = 0$ to standard form. Identify the center and radius."
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
          "markdown": "**Exit Ticket:** Classify $25x^2 + 4y^2 = 100$ as a conic section and state its center.\n\n**Lesson Summary:** Conic sections are classified by their standard forms: circles (equal squared coefficients), ellipses (addition, different denominators), parabolas (one squared term), and hyperbolas (subtraction). Completing the square converts general equations to standard form."
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
