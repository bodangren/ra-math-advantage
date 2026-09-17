import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';
import { getPropsSchema } from '@/lib/activities/schemas';

const seedRoot = resolve(import.meta.dirname, '../../../convex/seed');
const files = readdirSync(seedRoot).filter(file => /^seed_lesson_\d+_\d+\.ts$/.test(file));

it('covers all 52 lesson seeds', () => expect(files).toHaveLength(52));

it.each(files)('%s writes valid activities and linked phase sections', async file => {
  // The mock stores actual writes. Later seed queries read those writes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Seed documents span multiple Convex tables.
  const rows: Array<{ table: string; id: string; data: Record<string, any> }> = [];
  const db = {
    query(table: string) {
      let read = () => rows.filter(row => row.table === table).map(row => ({ _id: row.id, ...row.data }));
      const chain = {
        withIndex(_name: string, build?: (query: { eq: (field: string, value: unknown) => unknown }) => unknown) {
          const source = read;
          const filters: Array<[string, unknown]> = [];
          const query = { eq(field: string, value: unknown) { filters.push([field, value]); return query; } };
          build?.(query);
          read = () => source().filter(row => filters.every(([field, value]) => (row as Record<string, unknown>)[field] === value));
          return chain;
        },
        filter() { return chain; }, order() { return chain; },
        first: async () => read()[0] ?? null, unique: async () => read()[0] ?? null,
        collect: async () => read(), take: async (limit: number) => read().slice(0, limit),
      };
      return chain;
    },
    get: async (id: string) => { const row = rows.find(row => row.id === id); return row ? { _id: id, ...row.data } : null; },
    insert: async (table: string, data: Record<string, unknown>) => { const id = `row-${rows.length}`; rows.push({ table, id, data }); return id; },
    patch: async (id: string, data: Record<string, unknown>) => { const row = rows.find(row => row.id === id); if (!row) throw new Error(`Missing row ${id}`); Object.assign(row.data, data); },
    delete: async () => {},
  };
  const exports = await import(/* @vite-ignore */ pathToFileURL(resolve(seedRoot, file)).href);
  const seed = Object.values(exports).find(value => value && typeof (value as { _handler?: unknown })._handler === 'function') as { _handler: (ctx: unknown, args: object) => Promise<unknown> };
  await seed._handler({ db, scheduler: { runAfter: async () => {} }, runMutation: async () => null }, {});
  const activities = rows.filter(row => row.table === 'activities');
  expect(activities.length).toBeGreaterThan(0);
  for (const activity of activities) {
    const schema = getPropsSchema(activity.data.componentKey);
    expect(schema, activity.data.componentKey).toBeDefined();
    expect(schema!.safeParse(activity.data.props), `${file}: ${activity.id}`).toMatchObject({ success: true });
  }
  const phases = rows.filter(row => row.table === 'phase_versions');
  expect(new Set(phases.map(row => row.data.phaseNumber)).size).toBe(phases.length);
  for (const section of rows.filter(row => row.table === 'phase_sections')) {
    expect(phases.some(phase => phase.id === section.data.phaseVersionId)).toBe(true);
    if (section.data.sectionType === 'activity') expect(activities.some(activity => activity.id === section.data.content.activityId)).toBe(true);
  }
  const [, module, lesson] = file.match(/^seed_lesson_(\d+)_(\d+)\.ts$/)!;
  const heading = readFileSync(resolve(import.meta.dirname, `../../../curriculum/modules/module-${module}-lesson-${lesson}`), 'utf8').split('\n')[0].replace(/^# Lesson \d+-\d+ [—-] /, '');
  for (const row of rows.filter(row => row.table === 'lessons' || row.table === 'lesson_versions')) expect(row.data.title).toBe(heading);
});
