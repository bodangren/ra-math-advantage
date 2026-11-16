import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { MutationCtx } from '@/convex/_generated/server';
import { createServerOwnedSubmissionHandler } from '@/convex/activities';
import { buildIm3PilotSeedDocuments } from '@/convex/seed/seed_lesson_1_1';
import { GraphingExplorerActivity } from '@/components/activities/graphing/GraphingExplorerActivity';
import { IM3_PILOT_NODE } from '@/lib/practice/learning-evidence-pilot';

const publication = {
  nodes: [{ id: IM3_PILOT_NODE, kind: 'skill', reviewStatus: 'approved' }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: 'approved' }],
};
const literalPoints = [
  { x: -2, y: -5 }, { x: -1, y: -2 }, { x: 0, y: -1 },
  { x: 1, y: -2 }, { x: 2, y: -5 },
];

function memoryDb() {
  const seeded = buildIm3PilotSeedDocuments('independent' as never, 1).activity;
  const tables: Record<string, Array<Record<string, any>>> = {
    profiles: [{
      _id: 'student', username: 'student', role: 'student', organizationId: 'org',
    }],
    auth_credentials: [{
      _id: 'credential', profileId: 'student', username: 'student',
      role: 'student', organizationId: 'org', isActive: true,
    }],
    activities: [{ _id: 'independent', ...seeded, srsEligible: true, approval: { status: 'approved' } }],
    activity_submissions: [],
  };
  const query = (table: string) => {
    let rows = [...(tables[table] ?? [])];
    let direction: 'asc' | 'desc' = 'asc';
    const index = {
      eq(field: string, value: unknown) {
        rows = rows.filter((row) => row[field] === value);
        return index;
      },
    };
    const ordered = () => direction === 'desc' ? [...rows].reverse() : rows;
    const result = {
      unique: async () => {
        if (rows.length > 1) throw new Error('unique query returned multiple rows');
        return rows[0] ?? null;
      },
      first: async () => ordered()[0] ?? null,
      collect: async () => ordered(),
      take: async (limit: number) => ordered().slice(0, limit),
      order(next: 'asc' | 'desc') { direction = next; return result; },
    };
    return {
      withIndex: (_name: string, configure: (query: typeof index) => unknown) => {
        configure(index);
        return result;
      },
    };
  };
  const get = async (...args: unknown[]) => Object.values(tables).flat()
    .find((row) => row._id === args.at(-1)) ?? null;
  const insert = async (table: string, value: Record<string, unknown>) => {
    const target = tables[table] ?? (tables[table] = []);
    const id = `${table}:${target.length + 1}`;
    target.push({ _id: id, ...value });
    return id;
  };
  return {
    ctx: { db: { query, get, insert } } as unknown as MutationCtx,
    activity: tables.activities[0],
    submissions: tables.activity_submissions,
  };
}

function enterTable() {
  const values = [-5, -2, -1, -2, -5];
  screen.getAllByRole('spinbutton').forEach((input, index) => {
    fireEvent.change(input, { target: { value: String(values[index]) } });
  });
}

function setCanvasRect(canvas: HTMLElement) {
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 600,
    width: 600, height: 600, toJSON: () => ({}),
  });
}

function clickPoint(canvas: HTMLElement, point: { x: number; y: number }) {
  // The reviewed activity uses domain [-5, 5] and range [-10, 10].
  fireEvent.click(canvas, {
    clientX: (point.x + 5) * 60,
    clientY: 600 - ((point.y + 10) * 30),
  });
}

async function runUiAttempt(options: { correctGraph: boolean; key: string }) {
  const { ctx, activity, submissions } = memoryDb();
  const results: Array<{ score: number; maxScore: number; submissionId: string }> = [];
  const onSubmit = vi.fn(async (envelope: unknown) => {
    const result = await createServerOwnedSubmissionHandler(ctx, {
      userId: 'student', activityId: 'independent', idempotencyKey: options.key,
      submissionData: envelope,
    } as never, publication);
    results.push(result as typeof results[number]);
  });
  const props = activity.props as {
    equation: string; variant: 'plot_from_equation'; responseVariant: 'table_graph';
    domain: [number, number]; range: [number, number];
  };
  const view = render(
    <GraphingExplorerActivity
      activityId="independent"
      mode="practice"
      {...props}
      onSubmit={onSubmit}
    />,
  );
  enterTable();
  const canvas = screen.getByRole('img', { name: /coordinate plane/i });
  setCanvasRect(canvas);
  const points = options.correctGraph ? literalPoints : [{ x: 0, y: 0 }];
  points.forEach((point) => clickPoint(canvas, point));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  await waitFor(() => expect(results).toHaveLength(1));
  return { ...view, results, submissions };
}

describe('IM3 graph UI to server flow', () => {
  it('accepts the real UI envelope and grades literal table and point responses', async () => {
    const wrong = await runUiAttempt({ correctGraph: false, key: 'wrong-ui' });
    expect(wrong.results[0]).toMatchObject({ score: 1, maxScore: 2 });
    expect(wrong.submissions).toHaveLength(1);
    expect(wrong.submissions[0]).toMatchObject({
      score: 1,
      maxScore: 2,
      submissionData: {
        answers: { table_values: literalPoints, placed_points: [{ x: 0, y: 0 }] },
        parts: [
          { partId: 'table_values', rawAnswer: literalPoints, isCorrect: true, score: 1, maxScore: 1 },
          { partId: 'placed_points', rawAnswer: [{ x: 0, y: 0 }], isCorrect: false, score: 0, maxScore: 1 },
        ],
      },
    });
    wrong.unmount();

    const correct = await runUiAttempt({ correctGraph: true, key: 'correct-ui' });
    expect(correct.results[0]).toMatchObject({ score: 2, maxScore: 2 });
    expect(correct.submissions).toHaveLength(1);
    expect(correct.submissions[0]).toMatchObject({
      score: 2,
      maxScore: 2,
      submissionData: {
        answers: { table_values: literalPoints, placed_points: literalPoints },
        parts: [
          { partId: 'table_values', rawAnswer: literalPoints, isCorrect: true, score: 1, maxScore: 1 },
          { partId: 'placed_points', rawAnswer: literalPoints, isCorrect: true, score: 1, maxScore: 1 },
        ],
      },
    });
  });
});
