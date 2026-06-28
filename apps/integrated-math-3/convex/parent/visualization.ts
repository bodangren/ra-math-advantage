/**
 * Parent Portal — Parent-safe projection query.
 *
 * Track: parent_portal_prod_wiring_remediation_20260621
 * Spec: FR-3 (add the missing `convex/parent/visualization.ts` query or the
 * current equivalent backend module and expose it through generated Convex
 * APIs) + FR-5 (parent projection data must exclude teacher-only fields and
 * fail closed for non-parent sessions).
 *
 * Why this file exists:
 *   The archived `parent-portal_20260605` track shipped the parent-facing
 *   UI components and the `convex/parent/links.ts` backend, but never added
 *   the read-side projection that turns the student's placement data into a
 *   parent-safe `ParentVisualizationV1` payload. The 2026-06-21 completion
 *   audit flagged that `/parent` rendered a static stub because no live
 *   caller existed for the parent projection.
 *
 * Boundary:
 *   - This query is reachable only from other Convex functions
 *     (`internalQuery`). The page-level guard
 *     (`requireParentServerSessionClaims`) already verifies the caller is a
 *     parent, but this query ALSO re-verifies an active parent_link row for
 *     `(parentProfileId, studentId)` so a future caller that bypasses the
 *     page guard still fails closed.
 *   - It calls `projectParentVisualization` (domain-neutral projection) on
 *     the student's `placement_results` to derive a parent-safe payload.
 *     Teacher-only fields (heatmap, bottleneckNodes, etc.) never enter the
 *     response — the projection's own schema (`parentVisualizationV1Schema`)
 *     makes them unreachable.
 *
 * Hand-rolled (mock-ctx-friendly) handler:
 *   The handler is exported as a named async function so the unit tests can
 *   invoke it directly with a mock `QueryCtx` (no `convex-test` runtime).
 *   The Convex wrapper (`internalQuery`) just delegates to the handler.
 */

import { internalQuery } from '../_generated/server';
import { v } from 'convex/values';
import type { QueryCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import {
  projectParentVisualization,
  parentVisualizationV1Schema,
  type ParentVisualizationV1,
} from '@math-platform/knowledge-space-practice';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';
import { loadFullCurriculumGraph } from '../../lib/curriculum/skill-graph-loader';

/**
 * Default no-op learner state. Used when the student has no placement rows.
 */
const EMPTY_LEARNER_STATE: Record<
  string,
  'mastered' | 'ready' | 'blocked'
> = {};

/**
 * Pure projection step — given a learner state and the canonical full
 * curriculum knowledge graph, return a validated `ParentVisualizationV1`
 * payload.
 *
 * Split out from the handler so unit tests can verify the projection
 * without setting up a Convex context.
 */
export function buildParentProjectionPayload(
  learnerState: Record<string, 'mastered' | 'ready' | 'blocked'>,
  nodes: KnowledgeSpaceNode[],
  edges: KnowledgeSpaceEdge[],
): ParentVisualizationV1 {
  const payload = projectParentVisualization(nodes, edges, learnerState, []);
  return parentVisualizationV1Schema.parse(payload);
}

/**
 * Handler — verifies the (parent, student) link is active, then computes
 * the parent-safe projection from the student's placement results.
 *
 * Fail-closed semantics:
 *   - Throws when no active `parent_links` row exists for the pair.
 *   - Throws when the target profile is not a student.
 *   - Throws when the student profile does not exist.
 *
 * Privacy boundary:
 *   - The response shape is `ParentVisualizationV1`, which the projection
 *     schema enforces does not include `heatmap`, `bottleneckNodes`,
 *     `prerequisiteGaps`, `misconceptionClusters`, `interventionGroups`,
 *     `standardsCoverage`, or `activeMisconceptionStudentCount`.
 * @throws {Error} Thrown when the operation fails.
 */
export async function projectParentVisualizationHandler(
  ctx: QueryCtx,
  args: { studentId: Id<'profiles'>; parentProfileId: Id<'profiles'> },
): Promise<ParentVisualizationV1> {
  const link = await ctx.db
    .query('parent_links')
    .withIndex('by_parent_and_student', (q) =>
      q.eq('parentId', args.parentProfileId).eq('studentId', args.studentId),
    )
    .first();

  if (!link || link.status !== 'active') {
    throw new Error(
      'parent.visualization: no active parent link for (parentProfileId, studentId)',
    );
  }

  const student = await ctx.db.get(args.studentId);
  if (!student) {
    throw new Error('parent.visualization: student profile not found');
  }
  if (student.role !== 'student') {
    throw new Error(
      'parent.visualization: target profile is not a student (role=' +
        String(student.role) +
        ')',
    );
  }

  const placements = await ctx.db
    .query('placement_results')
    .withIndex('by_student', (q) => q.eq('studentId', args.studentId))
    .collect();

  const learnerState: Record<
    string,
    'mastered' | 'ready' | 'blocked'
  > = { ...EMPTY_LEARNER_STATE };

  for (const p of placements) {
    if (p.masteryEstimate >= 0.8) {
      learnerState[p.nodeId] = 'mastered';
    } else if (p.masteryEstimate >= 0.3) {
      learnerState[p.nodeId] = 'ready';
    } else {
      learnerState[p.nodeId] = 'blocked';
    }
  }

  const { nodes, edges } = loadFullCurriculumGraph();

  return buildParentProjectionPayload(learnerState, nodes, edges);
}

/**
 * Convex query — `internal.parent.visualization.projectParentVisualizationQuery`.
 *
 * Args:
 *   - `studentId` (Id<'profiles'>): the linked student whose progress to project.
 *   - `parentProfileId` (Id<'profiles'>): the parent requesting the projection.
 *
 * Returns:
 *   - `ParentVisualizationV1` validated against `parentVisualizationV1Schema`.
 *
 * Fail-closed:
 *   - The handler throws when the link is missing or not active, or when
 *     the target profile is not a student. Convex wraps query handler
 *     errors as a `ConvexError`, so callers see a typed error rather than
 *     a partial payload.
 */
export const projectParentVisualizationQuery = internalQuery({
  args: {
    studentId: v.id('profiles'),
    parentProfileId: v.id('profiles'),
  },
  handler: projectParentVisualizationHandler,
});
