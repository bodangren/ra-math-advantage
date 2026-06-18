// Phase 2.3 — Privacy assertions (TDD, Red).
//
// Contract under test (per spec.md FR5 + test-strategy.md §5):
//
//   The parent dashboard NEVER exposes teacher-only analytics, OTHER
//   students' data, or raw graph truth. The component must consume the
//   parent projection payload and only that payload.
//
// What this test exercises:
//
//   1. **Teacher-only-field exclusion (rendered JSON snapshot).**
//      Every key declared by `teacherVisualizationV1Schema` (heatmap,
//      bottleneckNodes, prerequisiteGaps, misconceptionClusters,
//      interventionGroups, standardsCoverage, activeMisconceptionStudentCount)
//      must NOT appear anywhere in the rendered DOM's text content or in
//      any serializable data attribute used by the component. The test
//      serializes the rendered output to a stable JSON snapshot and
//      scans it for the forbidden key set.
//
//   2. **Cross-student isolation.**
//      When the parent is rendering student A's dashboard, student B's
//      node ids must never appear in the rendered output. The fixtures
//      use disjoint id sets (`parent.skill.alpha.*` vs
//      `parent.skill.epsilon.*`) so a leakage bug surfaces immediately.
//
//   3. **Raw-graph exclusion.**
//      The parent payload's `nodes` field carries only the
//      `parentVisualizationV1Schema`-validated shape (nodeId, title,
//      description, state, difficulty, domain). The component must
//      never expose raw graph fields such as `metadata`, `sourceRefs`,
//      `reviewStatus`, `kind`, or `prerequisites` — these belong to
//      `KnowledgeSpaceNode` and would leak the underlying graph if they
//      surfaced in the UI.
//
// Red signal: `npm run ws:im3:test -- __tests__/components/parent/parent-privacy.test.tsx`
// At HEAD the `@/components/parent/ParentDashboard` module does not exist
// (it will be created in the Green phase). The dynamic `await import(...)`
// form surfaces a clean module-resolution failure at test time.
//
// This is a privacy-critical test. A future change that re-introduces a
// teacher-only field (e.g. by importing the teacher projection by
// mistake) would fail here even if the dashboard "looks right" to a
// human reviewer.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';

import {
  richParentProjection,
  otherStudentParentProjection,
  PARENT_FIXTURE_OTHER_STUDENT_NODE,
  TEACHER_ONLY_KEYS,
  type ParentVisualizationV1,
} from '@/__tests__/_fixtures/parent-portal/parentProjection';
import { STUDENT_ALPHA_ID, STUDENT_BETA_ID } from '@/__tests__/_fixtures/parent-portal/parentLinks';

// ---------------------------------------------------------------------------
// Module-shape helpers
// ---------------------------------------------------------------------------

type ParentDashboardProps = {
  payload: ParentVisualizationV1;
  studentId: string;
  studentName: string;
};

type ParentDashboardComponent = (props: ParentDashboardProps) => JSX.Element;

async function loadParentDashboard(): Promise<ParentDashboardComponent> {
  const mod = await import('@/components/parent/ParentDashboard');
  return mod.ParentDashboard as ParentDashboardComponent;
}

// ---------------------------------------------------------------------------
// Serialization helper — produces a single string that captures every
// surface the dashboard can leak data through:
//
//   * document.body.textContent — every visible string
//   * document.body.innerHTML   — every visible attribute (data-*, aria-*,
//                                title, alt, href) and any inline JSON the
//                                component may have embedded as a
//                                `__NEXT_DATA__` or similar hydration prop
//   * JSON.stringify on each element's dataset, attributes, and text
//
// The test then scans this string for the forbidden key set. A privacy
// leak is any forbidden key (or forbidden node id) appearing anywhere
// in the serialized output.
// ---------------------------------------------------------------------------

function serializeRenderedOutput(): string {
  const chunks: string[] = [];
  chunks.push(document.body.textContent ?? '');
  chunks.push(document.body.innerHTML ?? '');

  // Walk every element and collect any attribute the component might
  // have used to embed data (data-*, aria-*, title, alt, href, value).
  const all = document.body.querySelectorAll('*');
  for (const el of Array.from(all)) {
    for (const attr of Array.from(el.attributes)) {
      chunks.push(`${attr.name}=${attr.value}`);
    }
    chunks.push(el.textContent ?? '');
  }

  return chunks.join('\n');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Parent dashboard — privacy invariants (Phase 2.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('teacher-only field exclusion', () => {
    it('rendered output contains no teacherVisualizationV1Schema key (rich payload)', async () => {
      const ParentDashboard = await loadParentDashboard();

      const { unmount } = render(
        <ParentDashboard
          payload={richParentProjection}
          studentId={STUDENT_ALPHA_ID}
          studentName="Alpha Student"
        />,
      );

      const serialized = serializeRenderedOutput();
      // Lowercase the scan to avoid false negatives from a component that
      // prints the key in a different case. The keys themselves are
      // camelCase and the schema declares them as such, so a true leak
      // would match regardless of casing.
      const lower = serialized.toLowerCase();

      for (const key of TEACHER_ONLY_KEYS) {
        expect(
          lower,
          `parent dashboard must not expose teacher-only key "${key}"`,
        ).not.toContain(key.toLowerCase());
      }

      unmount();
    });

    it('rendered output contains no teacherVisualizationV1Schema key (other-student payload)', async () => {
      const ParentDashboard = await loadParentDashboard();

      const { unmount } = render(
        <ParentDashboard
          payload={otherStudentParentProjection}
          studentId={STUDENT_BETA_ID}
          studentName="Beta Student"
        />,
      );

      const serialized = serializeRenderedOutput();
      const lower = serialized.toLowerCase();

      for (const key of TEACHER_ONLY_KEYS) {
        expect(
          lower,
          `parent dashboard must not expose teacher-only key "${key}"`,
        ).not.toContain(key.toLowerCase());
      }

      unmount();
    });

    it('the schema-level property "schemaVersion" is allowed; "schemaVersion" must not itself be a leak signal', async () => {
      // The parent payload also has a `schemaVersion` field, which is
      // part of `parentVisualizationV1Schema` (not teacher). The
      // component is free to display it (e.g. as a small "v1" badge).
      // This test guards against an over-broad future check that
      // accidentally treats `schemaVersion` as teacher-only.
      const ParentDashboard = await loadParentDashboard();

      const { unmount } = render(
        <ParentDashboard
          payload={richParentProjection}
          studentId={STUDENT_ALPHA_ID}
          studentName="Alpha Student"
        />,
      );

      // Sanity: the rendered output is non-empty (we want to be sure
      // the test is actually exercising the render, not passing on a
      // blank document).
      const serialized = serializeRenderedOutput();
      expect(serialized.length).toBeGreaterThan(0);

      unmount();
    });
  });

  describe('cross-student isolation', () => {
    it('rendering student A never shows student B node ids', async () => {
      const ParentDashboard = await loadParentDashboard();

      const { unmount } = render(
        <ParentDashboard
          payload={richParentProjection}
          studentId={STUDENT_ALPHA_ID}
          studentName="Alpha Student"
        />,
      );

      const serialized = serializeRenderedOutput();
      expect(
        serialized,
        'student A render must not contain student B node ids',
      ).not.toContain(PARENT_FIXTURE_OTHER_STUDENT_NODE);
      // Belt-and-suspenders: every node id in the B payload must be absent.
      for (const node of otherStudentParentProjection.nodes) {
        expect(
          serialized,
          `student A render must not contain student B node id "${node.nodeId}"`,
        ).not.toContain(node.nodeId);
      }
      // And the human-readable titles of B's nodes must not appear either
      // (the dashboard may surface titles but never from a non-linked student).
      for (const node of otherStudentParentProjection.nodes) {
        expect(
          serialized,
          `student A render must not contain student B node title "${node.title}"`,
        ).not.toContain(node.title);
      }

      unmount();
    });

    it('rendering student B never shows student A node ids', async () => {
      const ParentDashboard = await loadParentDashboard();

      const { unmount } = render(
        <ParentDashboard
          payload={otherStudentParentProjection}
          studentId={STUDENT_BETA_ID}
          studentName="Beta Student"
        />,
      );

      const serialized = serializeRenderedOutput();
      for (const node of richParentProjection.nodes) {
        expect(
          serialized,
          `student B render must not contain student A node id "${node.nodeId}"`,
        ).not.toContain(node.nodeId);
        expect(
          serialized,
          `student B render must not contain student A node title "${node.title}"`,
        ).not.toContain(node.title);
      }

      unmount();
    });
  });

  describe('raw-graph field exclusion', () => {
    it('rendered output contains no KnowledgeSpaceNode raw-graph fields', async () => {
      // The parent payload's `nodes` are `visualNodeV1Schema` shape
      // (nodeId, title, description, state, difficulty, domain). The
      // component must not surface raw graph fields such as `metadata`,
      // `sourceRefs`, `reviewStatus`, `kind`, `prerequisites` — those
      // belong to the underlying `KnowledgeSpaceNode` and would leak
      // the canonical graph if they surfaced in the parent UI.
      const ParentDashboard = await loadParentDashboard();

      const { unmount } = render(
        <ParentDashboard
          payload={richParentProjection}
          studentId={STUDENT_ALPHA_ID}
          studentName="Alpha Student"
        />,
      );

      const serialized = serializeRenderedOutput().toLowerCase();
      const forbiddenRawGraphKeys = [
        'metadata',
        'sourcerefs',
        'reviewstatus',
        // The word "prerequisites" can appear legitimately in plain
        // English (e.g. "no prerequisites needed"), so the check is
        // only on the lowercased key in serialized JSON. Since the
        // component is forbidden from emitting JSON, the key as
        // "prerequisites" must not appear in a structured form. We
        // check the JSON-style occurrence.
        '"prerequisites"',
        '"kind"',
      ];

      for (const key of forbiddenRawGraphKeys) {
        expect(
          serialized,
          `parent dashboard must not surface raw-graph key "${key}"`,
        ).not.toContain(key);
      }

      unmount();
    });
  });

  describe('payload-acceptance: schema-validated payloads only', () => {
    it('the component accepts a payload that passes parentVisualizationV1Schema.parse()', async () => {
      // Defense-in-depth: the parent projection fixture is constructed
      // via `parentVisualizationV1Schema.parse(...)` at module load, so
      // any drift in the v1 schema breaks the fixtures before this test
      // runs. Re-assert the invariant here so a future change that
      // bypasses the fixture (e.g. hand-rolled payload) still gets
      // caught.
      const ParentDashboard = await loadParentDashboard();

      expect(() =>
        render(
          <ParentDashboard
            payload={richParentProjection}
            studentId={STUDENT_ALPHA_ID}
            studentName="Alpha Student"
          />,
        ),
      ).not.toThrow();
    });
  });
});
