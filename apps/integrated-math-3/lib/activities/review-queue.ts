import type { Doc } from "@/convex/_generated/dataModel";
import {
  resolveComponentKind as _resolveComponentKind,
  buildActivityPlacementMap as _buildActivityPlacementMap,
  assembleReviewQueueItem as _assembleReviewQueueItem,
  type ActivityPlacement,
  type ReviewQueueItem,
} from "@math-platform/component-approval";

export type { ActivityPlacement, ReviewQueueItem };

export const resolveComponentKind = _resolveComponentKind;

/**
 * Thin adapter: Convex Doc<"phase_sections"> / Doc<"phase_versions"> are
 * structurally compatible with the package's generic interfaces.
 */
export function buildActivityPlacementMap(
  sections: Array<Pick<Doc<"phase_sections">, "_id" | "phaseVersionId" | "content">>,
  phases: Array<Pick<Doc<"phase_versions">, "_id" | "phaseType">>
): Map<string, ActivityPlacement> {
  // Package uses generic Pick types that are structurally compatible
  return _buildActivityPlacementMap(
    sections as Array<Pick<{ _id: string; phaseVersionId: string; content: { activityId?: string } | null }, "_id" | "phaseVersionId" | "content">>,
    phases as Array<Pick<{ _id: string; phaseType: string }, "_id" | "phaseType">>
  );
}

interface AssembleArgs {
  activity: {
    _id: string;
    componentKey: string;
    displayName: string;
    props?: Record<string, unknown> | null;
    gradingConfig?: Record<string, unknown> | null;
    approval?: {
      status?: string;
      contentHash?: string;
      reviewedAt?: number;
      reviewedBy?: string;
    } | null;
  };
  placement?: ActivityPlacement;
  approvalRecord?: {
    status?: string;
    contentHash?: string;
    reviewedAt?: number;
    reviewedBy?: string;
  };
  filterKind?: "example" | "activity" | "practice";
  filterStatus?: "unreviewed" | "approved" | "needs_changes" | "rejected";
  onlyStale?: boolean;
}

/**
 * Thin adapter: normalizes Convex-specific null/undefined conventions
 * to match the package's ActivityDoc / ApprovalRecord interfaces.
 */
export async function assembleReviewQueueItem({
  activity,
  placement,
  approvalRecord,
  filterKind,
  filterStatus,
  onlyStale,
}: AssembleArgs): Promise<ReviewQueueItem | null> {
  return _assembleReviewQueueItem({
    activity: {
      _id: activity._id,
      componentKey: activity.componentKey,
      displayName: activity.displayName,
      props: activity.props ?? null,
      gradingConfig: activity.gradingConfig ?? null,
      approval: activity.approval
        ? {
            status: activity.approval.status,
            contentHash: activity.approval.contentHash ?? null,
            reviewedAt: activity.approval.reviewedAt ?? null,
            reviewedBy: activity.approval.reviewedBy ?? null,
          }
        : undefined,
    },
    placement,
    approvalRecord: approvalRecord
      ? {
          status: approvalRecord.status ?? "unreviewed",
          contentHash: approvalRecord.contentHash ?? null,
          reviewedAt: approvalRecord.reviewedAt ?? null,
          reviewedBy: approvalRecord.reviewedBy ?? null,
        }
      : undefined,
    filterKind,
    filterStatus,
    onlyStale,
  });
}
