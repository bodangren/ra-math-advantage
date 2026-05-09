import { describe, it, expect } from 'vitest';
import {
  parseClassPeriodPlan,
  parseModuleOverview,
  parseAleksRegistry,
  parseRevealLessonSource,
  parsePrecalcLesson,
} from '../parser';
import {
  im3Module1ClassPeriodPlan,
  im3Module1Overview,
  aleksRegistrySnippet,
  revealLessonSnippet,
  precalcLessonContent,
  moduleWithCombinedHeadings,
  emptyWorkedExamples,
  duplicateLessonPlan,
  duplicateLessonPlan2,
} from './fixtures';

// ---------------------------------------------------------------------------
// Task 1.1 — Parser fixture tests
// ---------------------------------------------------------------------------

describe('parseClassPeriodPlan', () => {
  it('extracts instruction-day rows and skips mastery/jigsaw/review/test', () => {
    const result = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
    // 4 unique lessonRefs from 8 instruction rows (1-1, 1-2, 1-3, 1-4)
    expect(result.lessons).toHaveLength(4);
  });

  it('parses lesson reference from Source Textbook Lesson column', () => {
    const result = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
    const lesson11 = result.lessons.find((l) => l.lessonRef === '1-1');
    expect(lesson11).toBeDefined();
    expect(lesson11!.objectives).toHaveLength(2); // 1a and 1b
  });

  it('parses objective code and description', () => {
    const result = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
    const first = result.lessons.find(
      (l) => l.lessonRef === '1-1',
    )!.objectives[0];
    expect(first.code).toBe('1a');
    expect(first.description).toBe('Graph quadratic functions');
  });

  it('parses worked example numbers from the Worked Examples column', () => {
    const result = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
    // 1-1, Examples 1-3 should produce single example group with numbers [1,2,3]
    const lesson11Examples = result.lessons.find(
      (l) => l.lessonRef === '1-1',
    )!.examples;
    // There are two instruction rows for 1-1 (periods 1 and 2), each with examples
    expect(lesson11Examples.length).toBeGreaterThanOrEqual(2);
    const firstGroup = lesson11Examples[0];
    expect(firstGroup.lessonRef).toBe('1-1');
    expect(firstGroup.exampleNumbers).toEqual([1, 2, 3]);
    expect(firstGroup.title).toBe(
      'Graph Using a Table; Compare Quadratic Functions; Real-World Application (Modeling)',
    );
  });

  it('parses example ranges correctly (e.g., Examples 4-6)', () => {
    const result = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
    // Period 2: 1-1, Examples 4-6
    const period2Examples = result.lessons
      .find((l) => l.lessonRef === '1-1')!
      .examples.find((e) => e.exampleNumbers[0] === 4);
    expect(period2Examples).toBeDefined();
    expect(period2Examples!.exampleNumbers).toEqual([4, 5, 6]);
  });

  it('preserves raw example text as source reference', () => {
    const result = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
    const firstExample = result.examples[0];
    expect(firstExample.rawText).toContain('1-1, Examples 1-3');
    expect(firstExample.rawText).toContain('Graph Using a Table');
  });

  it('handles embedded objectives in the Embedded Objectives column', () => {
    const result = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
    // Period 7 has embedded objective "1g"
    const lesson13 = result.lessons.find((l) => l.lessonRef === '1-3');
    expect(lesson13).toBeDefined();
    const objCodes = lesson13!.objectives.map((o) => o.code);
    expect(objCodes).toContain('1g'); // embedded objective
  });

  it('returns unique lessons deduplicated by lessonRef', () => {
    const result = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
    const uniqueLessonRefs = result.lessons.map((l) => l.lessonRef);
    expect(uniqueLessonRefs).toEqual(['1-1', '1-2', '1-3', '1-4']);
  });

  it('handles empty worked examples (— dash)', () => {
    const result = parseClassPeriodPlan(emptyWorkedExamples);
    const lesson11 = result.lessons.find((l) => l.lessonRef === '1-1');
    expect(lesson11).toBeDefined();
    expect(lesson11!.examples).toHaveLength(0);
  });
});

describe('parseModuleOverview', () => {
  it('extracts module number and title from H1', () => {
    const result = parseModuleOverview(im3Module1Overview);
    expect(result.moduleNumber).toBe(1);
    expect(result.title).toBe('Quadratic Functions and Complex Numbers');
  });

  it('extracts overview description', () => {
    const result = parseModuleOverview(im3Module1Overview);
    expect(result.description).toContain('deep understanding of quadratic');
  });

  it('extracts lesson entries from ### headings', () => {
    const result = parseModuleOverview(im3Module1Overview);
    expect(result.lessons).toHaveLength(4);
    expect(result.lessons[0].number).toBe(1);
    expect(result.lessons[0].lessonNumber).toBe(1);
    expect(result.lessons[0].title).toBe('Graphing Quadratic Functions');
    expect(result.lessons[0].description).toContain('vertex form');
  });

  it('extracts skills developed list', () => {
    const result = parseModuleOverview(im3Module1Overview);
    expect(result.skills).toHaveLength(3);
    expect(result.skills[0]).toBe('Strategic selection of solution methods');
    expect(result.skills).toContain('Connecting representations');
  });
});

describe('parseAleksRegistry', () => {
  it('extracts problem family entries from the registry table', () => {
    const result = parseAleksRegistry(aleksRegistrySnippet);
    expect(result.families).toHaveLength(5);
  });

  it('parses familyKey as snake_case identifier', () => {
    const result = parseAleksRegistry(aleksRegistrySnippet);
    const family = result.families[0];
    expect(family.familyKey).toBe('quadratic_graph_analysis');
  });

  it('parses module number from Module column', () => {
    const result = parseAleksRegistry(aleksRegistrySnippet);
    expect(result.families[0].module).toBe(1);
  });

  it('parses multiple objectives from Objectives column', () => {
    const result = parseAleksRegistry(aleksRegistrySnippet);
    // quadratic_factoring has objectives 1h and 1i
    const factoring = result.families.find(
      (f) => f.familyKey === 'quadratic_factoring',
    );
    expect(factoring).toBeDefined();
    expect(factoring!.objectives).toEqual(['1h', '1i']);
  });

  it('parses source example reference', () => {
    const result = parseAleksRegistry(aleksRegistrySnippet);
    expect(result.families[0].sourceExamples).toBe('1-1, Examples 1-3');
  });

  it('parses interaction shape and status', () => {
    const result = parseAleksRegistry(aleksRegistrySnippet);
    const family = result.families[0];
    expect(family.interactionShape).toContain('graphing explorer');
    expect(family.status).toBe('component-planned');
  });

  it('parses notes field', () => {
    const result = parseAleksRegistry(aleksRegistrySnippet);
    expect(result.families[0].notes).toContain('Covers graphing');
  });
});

describe('parseRevealLessonSource', () => {
  it('extracts lesson headings from ## Lesson X-Y', () => {
    const result = parseRevealLessonSource(revealLessonSnippet);
    expect(result.lessons).toHaveLength(2);
    expect(result.lessons[0].lessonRef).toBe('1-1');
    expect(result.lessons[1].lessonRef).toBe('1-2');
  });

  it('extracts example headings and titles', () => {
    const result = parseRevealLessonSource(revealLessonSnippet);
    const lesson11 = result.lessons[0];
    expect(lesson11.examples).toHaveLength(3);
    expect(lesson11.examples[0].index).toBe(1);
    expect(lesson11.examples[0].title).toBe('Graph Using a Table');
    expect(lesson11.examples[2].title).toBe('Real-World Application (Modeling)');
  });

  it('records line numbers for source references', () => {
    const result = parseRevealLessonSource(revealLessonSnippet);
    const firstExample = result.lessons[0].examples[0];
    expect(firstExample.lineNumber).toBeGreaterThan(0);
  });

  it('includes example body content for context', () => {
    const result = parseRevealLessonSource(revealLessonSnippet);
    const firstExample = result.lessons[0].examples[0];
    expect(firstExample.bodyExcerpt).toContain('f(x) = x^2 + 2x - 3');
  });
});

describe('parsePrecalcLesson', () => {
  it('extracts unit and topic metadata', () => {
    const result = parsePrecalcLesson(precalcLessonContent);
    expect(result.unit).toBe(2);
    expect(result.topic).toBe('2.1');
  });

  it('parses lesson title', () => {
    const result = parsePrecalcLesson(precalcLessonContent);
    expect(result.title).toBe(
      'Change in Arithmetic and Geometric Sequences',
    );
  });

  it('extracts worked examples from ## Worked Example section', () => {
    const result = parsePrecalcLesson(precalcLessonContent);
    expect(result.examples).toHaveLength(2);
    expect(result.examples[0].index).toBe(1);
    expect(result.examples[1].index).toBe(2);
  });
});

describe('combined and ambiguous headings', () => {
  it('handles module with 5 lessons correctly', () => {
    const result = parseModuleOverview(moduleWithCombinedHeadings);
    expect(result.lessons).toHaveLength(5);
    expect(result.lessons[4].title).toBe('Powers of Binomials');
  });
});

// ---------------------------------------------------------------------------
// Task 1.2 — Deterministic output test (run same fixture twice, assert same result)
// ---------------------------------------------------------------------------

describe('deterministic output', () => {
  it('produces the same result on repeated parseClassPeriodPlan calls', () => {
    const first = JSON.stringify(parseClassPeriodPlan(im3Module1ClassPeriodPlan));
    const second = JSON.stringify(parseClassPeriodPlan(im3Module1ClassPeriodPlan));
    expect(first).toBe(second);
  });

  it('produces the same result on repeated parseModuleOverview calls', () => {
    const first = JSON.stringify(parseModuleOverview(im3Module1Overview));
    const second = JSON.stringify(parseModuleOverview(im3Module1Overview));
    expect(first).toBe(second);
  });

  it('produces the same result on repeated parseAleksRegistry calls', () => {
    const first = JSON.stringify(parseAleksRegistry(aleksRegistrySnippet));
    const second = JSON.stringify(parseAleksRegistry(aleksRegistrySnippet));
    expect(first).toBe(second);
  });
});

// ---------------------------------------------------------------------------
// Task 1.3 — Duplicate-ID test
// ---------------------------------------------------------------------------

describe('duplicate detection', () => {
  describe('collectDuplicateLessonRefs', () => {
    // This test imports a helper that checks for duplicate lesson references
    // across multiple plan files for the same course/module
    it('detects that lesson 1-1 appears in both plan files', async () => {
      const { collectDuplicateLessonRefs } = await import('../parser');
      const plan1 = parseClassPeriodPlan(duplicateLessonPlan);
      const plan2 = parseClassPeriodPlan(duplicateLessonPlan2);
      const allLessons = [...plan1.lessons, ...plan2.lessons];
      const dupes = collectDuplicateLessonRefs(allLessons);
      expect(dupes).toContain('1-1');
    });

    it('returns empty array when no duplicates exist', async () => {
      const { collectDuplicateLessonRefs } = await import('../parser');
      const plan1 = parseClassPeriodPlan(im3Module1ClassPeriodPlan);
      const allLessons = plan1.lessons;
      const dupes = collectDuplicateLessonRefs(allLessons);
      expect(dupes).toHaveLength(0);
    });
  });

  describe('disambiguateSkillSlug', () => {
    it('generates unique slugs for duplicate skill names', async () => {
      const { disambiguateSkillSlug } = await import('../parser');
      // Two skills with same base slug should get different suffixes
      const slug1 = disambiguateSkillSlug(
        'graph-quadratic-functions',
        new Set(),
      );
      const used = new Set([slug1]);
      const slug2 = disambiguateSkillSlug(
        'graph-quadratic-functions',
        used,
      );
      expect(slug1).toBe('graph-quadratic-functions');
      expect(slug2).not.toBe(slug1);
      expect(slug2).toMatch(/^graph-quadratic-functions/);
    });
  });
});
