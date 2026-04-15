import type { Doc } from "@/convex/_generated/dataModel";
import { computeComponentContentHash } from "./content-hash";

export type ComponentKind = "activity" | "example" | "practice";

export interface ActivityPlacement {
  phaseType: string;
  sectionId: string;
  phaseId: string;
}

export function resolveComponentKind(phaseType: string): ComponentKind {
  if (phaseType === "worked_example") return "example";
  if (
    phaseType === "guided_practice" ||
    phaseType === "independent_practice" ||
    phaseType === "assessment"
  ) {
    return "practice";
  }
  return "activity";
}

export function buildActivityPlacementMap(
  sections: Array<Pick<Doc<"phase_sections">, "_id" | "phaseVersionId" | "content">>,
  phases: Array<Pick<Doc<"phase_versions">, "_id" | "phaseType">>
): Map<string, ActivityPlacement> {
  const phaseMap = new Map(phases.map((p) => [p._id, p]));
  const map = new Map<string, ActivityPlacement>();

  for (const section of sections) {
    const activityId = (section.content as { activityId?: string })?.activityId;
    if (!activityId) continue;
    if (map.has(activityId)) continue;

    const phase = phaseMap.get(section.phaseVersionId);
    if (!phase) continue;

    map.set(activityId, {
      phaseType: phase.phaseType,
      sectionId: section._id,
      phaseId: phase._id,
    });
  }

  return map;
}

export interface ReviewQueueItem {
  componentKind: ComponentKind;
  componentId: string;
  componentKey: string;
  displayName: string;
  currentHash?: string;
  storedHash?: string;
  isStale?: boolean;
  approval?: {
    status: string;
    contentHash?: string;
    reviewedAt?: number;
    reviewedBy?: string;
  };
  storedProps?: Record<string, unknown>;
  steps?: Array<{ expression: string; explanation: string }>;
}

interface AssembleArgs {
  activity: Pick<
    Doc<"activities">,
    "_id" | "componentKey" | "displayName" | "props" | "gradingConfig" | "approval"
  >;
  placement?: ActivityPlacement;
  approvalRecord?: Pick<
    Doc<"component_approvals">,
    "status" | "contentHash" | "reviewedAt" | "reviewedBy"
  >;
  filterKind?: ComponentKind;
  filterStatus?: "unreviewed" | "approved" | "needs_changes" | "rejected";
  onlyStale?: boolean;
}

export async function assembleReviewQueueItem({
  activity,
  placement,
  approvalRecord,
  filterKind,
  filterStatus,
  onlyStale,
}: AssembleArgs): Promise<ReviewQueueItem | null> {
  const componentKind = placement
    ? resolveComponentKind(placement.phaseType)
    : "activity";

  if (filterKind && filterKind !== componentKind) {
    return null;
  }

  const currentHash = await computeComponentContentHash({
    componentKind,
    componentKey: activity.componentKey,
    props: activity.props,
    gradingConfig: activity.gradingConfig,
  });

  let storedHash: string | undefined;
  let approvalStatus: string | undefined;
  let approval:
    | {
        status: string;
        contentHash?: string;
        reviewedAt?: number;
        reviewedBy?: string;
      }
    | undefined;

  if (componentKind === "activity") {
    storedHash = activity.approval?.contentHash;
    approvalStatus = activity.approval?.status;
    approval = activity.approval
      ? {
          status: activity.approval.status,
          contentHash: activity.approval.contentHash ?? undefined,
          reviewedAt: activity.approval.reviewedAt ?? undefined,
          reviewedBy: activity.approval.reviewedBy ?? undefined,
        }
      : undefined;
  } else {
    storedHash = approvalRecord?.contentHash;
    approvalStatus = approvalRecord?.status;
    approval = approvalRecord
      ? {
          status: approvalRecord.status,
          contentHash: approvalRecord.contentHash ?? undefined,
          reviewedAt: approvalRecord.reviewedAt ?? undefined,
          reviewedBy: approvalRecord.reviewedBy ?? undefined,
        }
      : undefined;
  }

  const isStale = storedHash ? storedHash !== currentHash : false;
  const effectiveStatus = approvalStatus || "unreviewed";

  if (filterStatus && filterStatus !== effectiveStatus) {
    return null;
  }

  if (onlyStale && !isStale) {
    return null;
  }

  return {
    componentKind,
    componentId: activity._id,
    componentKey: activity.componentKey,
    displayName: activity.displayName,
    currentHash,
    storedHash,
    isStale,
    approval,
    storedProps: activity.props ?? undefined,
    steps: (activity.props as { steps?: Array<{ expression: string; explanation: string }> })?.steps ?? undefined,
  };
}
