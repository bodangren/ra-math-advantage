import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const curriculumRoot = path.join(appRoot, 'curriculum');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(curriculumRoot, relativePath), 'utf8');
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

const AP_EXAM_UNITS = [1, 2, 3];

describe('AP Precalculus curriculum depth validation', () => {
  describe('Passwater source docs', () => {
    it.each(AP_EXAM_UNITS)(
      'unit-%d source doc has per-topic instructional detail (≥150 lines)',
      (unit) => {
        const content = read(`source/passwater/unit-${unit}.md`);
        const lines = content.split('\n').length;
        expect(lines).toBeGreaterThanOrEqual(150);
      },
    );

    it.each(AP_EXAM_UNITS)(
      'unit-%d source doc contains per-topic subsections with notes, examples, worksheet, and quiz/test references',
      (unit) => {
        const content = read(`source/passwater/unit-${unit}.md`);
        expect(content).toContain('## Topic');
        // Must have at least 3 distinct per-topic subsections
        const topicSections = content.match(/^## Topic \d+\.\d+/gm);
        expect(topicSections).not.toBeNull();
        expect(topicSections!.length).toBeGreaterThanOrEqual(3);
        // Must reference worksheets or quizzes/tests
        const hasWorksheet = /worksheet|worksheet blank|worksheet key/i.test(content);
        const hasQuiz = /quiz|test|assessment/i.test(content);
        expect(hasWorksheet || hasQuiz).toBe(true);
      },
    );

    it.each(AP_EXAM_UNITS)(
      'unit-%d source doc includes pacing or day-count signals',
      (unit) => {
        const content = read(`source/passwater/unit-${unit}.md`);
        const hasPacing = /pacing|days?|periods?|class periods?|hours?|weeks?/i.test(content);
        expect(hasPacing).toBe(true);
      },
    );

    it.each(AP_EXAM_UNITS)(
      'unit-%d source doc includes FRQ or AP-style practice signals',
      (unit) => {
        const content = read(`source/passwater/unit-${unit}.md`);
        const hasFRQ = /frq|free.response|ap.style|ap exam|task model|calculator/i.test(
          content,
        );
        expect(hasFRQ).toBe(true);
      },
    );
  });

  describe('Topic files', () => {
    const allTopicFiles = fs
      .readdirSync(path.join(curriculumRoot, 'topics'))
      .filter((f) => /^unit-\d+-topic-\d+\.\d+\.md$/.test(f))
      .sort();

    const assessedTopicFiles = allTopicFiles.filter((f) =>
      /^unit-[123]-topic/.test(f),
    );

    it('has 58 total topic files', () => {
      expect(allTopicFiles).toHaveLength(58);
    });

    it.each(assessedTopicFiles)(
      '%s has explicit CED learning-objective text (not just family code)',
      (filename) => {
        const content = read(`topics/${filename}`);
        // Must contain an actual learning objective statement, not just "Learning-objective family: `X.Y.A`"
        const hasLOText =
          /## (CED )?Learning [Oo]bjectives?/.test(content) ||
          /learning objective[:\s]/i.test(content);
        expect(hasLOText).toBe(true);
      },
    );

    it.each(assessedTopicFiles)(
      '%s has essential-knowledge statements (not just family code)',
      (filename) => {
        const content = read(`topics/${filename}`);
        const hasEKText =
          /## (CED )?Essential [Kk]nowledge/.test(content) ||
          /essential knowledge[:\s]/i.test(content);
        expect(hasEKText).toBe(true);
      },
    );

    it.each(assessedTopicFiles)(
      '%s has Passwater scaffolding notes',
      (filename) => {
        const content = read(`topics/${filename}`);
        const hasScaffolding =
          /scaffold|guided practice|worked example|introduction|vocabulary|misconception|notes/i.test(
            content,
          );
        expect(hasScaffolding).toBe(true);
      },
    );

    it.each(assessedTopicFiles)(
      '%s has independent practice description with AP-style expectations',
      (filename) => {
        const content = read(`topics/${filename}`);
        const hasPractice =
          /independent practice|ap.style|worksheet|practice task|independent.*practice/i.test(
            content,
          );
        expect(hasPractice).toBe(true);
      },
    );

    it.each(assessedTopicFiles)(
      '%s has FRQ expectations or AP exam alignment signals',
      (filename) => {
        const content = read(`topics/${filename}`);
        const hasFRQ =
          /frq|free.response|task model|calculator|ap exam|exam alignment|modeling/i.test(
            content,
          );
        expect(hasFRQ).toBe(true);
      },
    );

    it.each(assessedTopicFiles)(
      '%s has app-build notes with componentKey or activity type guidance',
      (filename) => {
        const content = read(`topics/${filename}`);
        const hasAppBuild =
          /componentKey|component key|graphing.explorer|step.by.step|comprehension.quiz|fill.in.the.blank|rate.of.change|discriminant|activity type|app.build/i.test(
            content,
          );
        expect(hasAppBuild).toBe(true);
      },
    );

    it.each(assessedTopicFiles)(
      '%s has ≥80 lines of content',
      (filename) => {
        const content = read(`topics/${filename}`);
        expect(content.split('\n').length).toBeGreaterThanOrEqual(80);
      },
    );
  });

  describe('Activity map component diversity', () => {
    const activityMap = readJson<{
      activities: Array<{ componentKey: string; cedTopicId: string; sourceReferences?: string[] }>;
    }>('implementation/practice-v1/activity-map.json');

    it('uses at least 4 distinct component keys', () => {
      const keys = new Set(activityMap.activities.map((a) => a.componentKey));
      expect(keys.size).toBeGreaterThanOrEqual(4);
    });

    it('no single componentKey exceeds 40% of entries', () => {
      const counts = new Map<string, number>();
      for (const a of activityMap.activities) {
        counts.set(a.componentKey, (counts.get(a.componentKey) ?? 0) + 1);
      }
      const total = activityMap.activities.length;
      for (const [key, count] of counts) {
        expect(
          count / total,
          `componentKey "${key}" has ${count}/${total} entries (${((count / total) * 100).toFixed(1)}%)`,
        ).toBeLessThanOrEqual(0.4);
      }
    });

    it('includes graphing-explorer for graph-heavy topics', () => {
      const graphingTopics = new Set(
        activityMap.activities
          .filter((a) => a.componentKey === 'graphing-explorer')
          .map((a) => a.cedTopicId),
      );
      // At minimum, polynomial end behavior and rational function topics should use graphing
      expect(graphingTopics.size).toBeGreaterThanOrEqual(3);
    });

    it('includes step-by-step-solver for algebraic manipulation topics', () => {
      const solverActivities = activityMap.activities.filter(
        (a) => a.componentKey === 'step-by-step-solver',
      );
      expect(solverActivities.length).toBeGreaterThanOrEqual(2);
    });

    it('includes fill-in-the-blank for vocabulary or definition topics', () => {
      const fibActivities = activityMap.activities.filter(
        (a) => a.componentKey === 'fill-in-the-blank',
      );
      expect(fibActivities.length).toBeGreaterThanOrEqual(2);
    });

    it('includes rate-of-change-calculator for rate-of-change topics', () => {
      const rocActivities = activityMap.activities.filter(
        (a) => a.componentKey === 'rate-of-change-calculator',
      );
      expect(rocActivities.length).toBeGreaterThanOrEqual(1);
    });

    it('includes discriminant-analyzer for quadratic analysis topics', () => {
      const daActivities = activityMap.activities.filter(
        (a) => a.componentKey === 'discriminant-analyzer',
      );
      expect(daActivities.length).toBeGreaterThanOrEqual(1);
    });

    it('sourceReferences point to specific Passwater per-topic subsections (not just unit-level)', () => {
      const withSpecificRef = activityMap.activities.filter(
        (a) =>
          a.sourceReferences?.some(
            (ref: string) => /topic/i.test(ref) || /#\d+\.\d+/.test(ref),
          ),
      );
      expect(withSpecificRef.length).toBeGreaterThanOrEqual(
        activityMap.activities.length * 0.5,
      );
    });
  });

  describe('Class-period packages daily phase depth', () => {
    it.each([1, 2, 3])(
      'unit-%d package has unique dailyPhases text per instruction period (not copy-paste)',
      (unit) => {
        const pkg = readJson<{
          periods: Array<{
            dayType: string;
            dailyPhases?: Record<string, string>;
          }>;
        }>(`implementation/class-period-packages/unit-${unit}.json`);

        const instructionPeriods = pkg.periods.filter(
          (p) => p.dayType === 'instruction' && p.dailyPhases,
        );

        // Check that at least the warmUp or topicIntroduction text varies between periods
        const warmUps = instructionPeriods.map((p) => p.dailyPhases?.warmUp ?? '');
        const uniqueWarmUps = new Set(warmUps);
        expect(
          uniqueWarmUps.size,
          `Expected unique warmUp text across instruction periods, got ${uniqueWarmUps.size} unique out of ${warmUps.length}`,
        ).toBeGreaterThanOrEqual(instructionPeriods.length * 0.5);

        // Check scaffolded examples reference the specific topic
        const scaffoldedExamples = instructionPeriods.map(
          (p) => p.dailyPhases?.scaffoldedExamples ?? '',
        );
        for (let i = 0; i < scaffoldedExamples.length; i++) {
          const topicId = `${unit}.${i + 1}`;
          expect(
            scaffoldedExamples[i],
            `Period ${i + 1} scaffoldedExamples should reference Topic ${topicId}`,
          ).toContain(topicId);
        }
      },
    );

    it.each([1, 2, 3])(
      'unit-%d package includes FRQ-model or AP-style signals in daily phases',
      (unit) => {
        const pkg = readJson<{
          periods: Array<{
            dayType: string;
            dailyPhases?: Record<string, string>;
          }>;
        }>(`implementation/class-period-packages/unit-${unit}.json`);

        const allPhaseText = pkg.periods
          .filter((p) => p.dailyPhases)
          .flatMap((p) => Object.values(p.dailyPhases!))
          .join(' ');

        const hasAPSignal =
          /frq|free.response|task model|ap.style|calculator|modeling|graphing calculator/i.test(
            allPhaseText,
          );
        expect(hasAPSignal).toBe(true);
      },
    );

    it.each([1, 2, 3])(
      'unit-%d package includes Passwater source references in daily phases',
      (unit) => {
        const pkg = readJson<{
          periods: Array<{
            dayType: string;
            dailyPhases?: Record<string, string>;
            passwaterSource?: string;
          }>;
        }>(`implementation/class-period-packages/unit-${unit}.json`);

        const instructionPeriods = pkg.periods.filter(
          (p) => p.dayType === 'instruction',
        );
        // At least some periods should have specific Passwater references in their phases
        const withPasswaterRef = instructionPeriods.filter((p) => {
          const text = Object.values(p.dailyPhases ?? {}).join(' ');
          return /passwater|notes|worksheet|unit \d/i.test(text);
        });
        expect(withPasswaterRef.length).toBeGreaterThanOrEqual(
          instructionPeriods.length * 0.3,
        );
      },
    );
  });
});
