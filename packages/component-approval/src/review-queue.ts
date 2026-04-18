import { computeComponentContentHash, type ComponentKind } from './content-hash';

export interface PhaseSection {
  _id: string;
  phaseVersionId: string;
  content: { activityId?: string } | null;
}

export interface PhaseVersion {
  _id: string;
  phaseType: string;
}

export interface ActivityDoc {
  _id: string;
  componentKey: string;
  displayName: string;
  props?: Record<string, unknown> | null;
  gradingConfig: Record<string, unknown> | null;
  approval?: ComponentApproval | null;
}

export interface ComponentApproval {
  status?: string | null;
  contentHash?: string | null;
  reviewedAt?: number | null;
  reviewedBy?: string | null;
}

export interface ApprovalRecord {
  status: string;
  contentHash: string | null;
  reviewedAt?: number | null;
  reviewedBy?: string | null;
}

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
  sections: Array<Pick<PhaseSection, "_id" | "phaseVersionId" | "content">>,
  phases: Array<Pick<PhaseVersion, "_id" | "phaseType">>
): Map<string, ActivityPlacement> {
  const phaseMap = new Map(phases.map((p) => [p._id, p]));
  const map = new Map<string, ActivityPlacement>();

  for (const section of sections) {
    const activityId = section.content?.activityId;
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
  activity: Pick<ActivityDoc, "_id" | "componentKey" | "displayName" | "props" | "gradingConfig" | "approval">;
  placement?: ActivityPlacement;
  approvalRecord?: ApprovalRecord;
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
    props: activity.props ?? undefined,
    gradingConfig: activity.gradingConfig ?? undefined,
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
    storedHash = activity.approval?.contentHash ?? undefined;
    approvalStatus = activity.approval?.status ?? undefined;
    approval = activity.approval
      ? {
          status: activity.approval.status ?? "",
          contentHash: activity.approval.contentHash ?? undefined,
          reviewedAt: activity.approval.reviewedAt ?? undefined,
          reviewedBy: activity.approval.reviewedBy ?? undefined,
        }
      : undefined;
  } else {
    storedHash = approvalRecord?.contentHash ?? undefined;
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
    steps: Array.isArray((activity.props as Record<string, unknown> | null)?.steps)
      ? ((activity.props as Record<string, unknown>)?.steps as Array<{ expression: string; explanation: string }>)
      : undefined,
  };
}
