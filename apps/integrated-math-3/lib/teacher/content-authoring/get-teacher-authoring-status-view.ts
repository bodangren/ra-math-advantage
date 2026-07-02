/**
 * Phase 3 — Composer UI & Preview
 *
 * Map a Phase 2 lifecycle DTO into a teacher-facing status view. The UI
 * must consume `teacherFacingStatus` (the product-level name) and the
 * `rejectionComment` returned by Phase 2 handlers — it must not infer
 * `review -> submitted` or `archived -> rejected` from the persisted
 * status strings, and it must not accept unknown statuses silently.
 *
 * Boundary rules:
 *
 *  - Only the canonical `TeacherFacingStatus` values are valid. Unknown
 *    statuses (e.g. persisted `review` / `archived`) throw — the UI
 *    must never cast to success.
 *  - `rejectionComment` is preserved verbatim when present; it is never
 *    hidden, even when empty (an empty rejection is still a meaningful
 *    "no comment yet" signal that the composer renders as `undefined`).
 *  - Action availability follows the spec: `draft` enables save/submit,
 *    `submitted` disables editing, `rejected` enables edit-after-reject,
 *    `approved` is publish-ready, `published` disables editing and
 *    points teachers to the assignment surface.
 */

import type { TeacherFacingStatus } from "../../../../convex/teacher/content-authoring";

export interface TeacherAuthoringStatusView {
  label: string;
  teacherFacingStatus: TeacherFacingStatus;
  canSave: boolean;
  canSubmit: boolean;
  canEdit: boolean;
  canEditAfterReject: boolean;
  isPublishReady: boolean;
  /** Reviewer comment from the last needs_changes/rejected decision, if
   *  one exists; otherwise `undefined`. The composer renders this above
   *  the edit-after-reject action so the teacher sees the rationale. */
  rejectionComment?: string;
}

export interface TeacherAuthoringStatusDto {
  teacherFacingStatus: TeacherFacingStatus;
  rejectionComment?: string;
  lessonId: string;
  lessonVersionId: string;
}

const KNOWN_STATUSES = new Set<TeacherFacingStatus>([
  "draft",
  "submitted",
  "approved",
  "rejected",
  "published",
]);

function isKnownStatus(value: unknown): value is TeacherFacingStatus {
  return typeof value === "string" && KNOWN_STATUSES.has(value as TeacherFacingStatus);
}

/**
 * Map a Phase 2 lifecycle DTO into the composer's status view.
 *
 * @throws when `teacherFacingStatus` is not one of the canonical
 *         product-level names. This is a deliberate fail-closed: the UI
 *         must never infer a teacher-facing status from persisted
 *         `review` / `archived` strings.
 */
export function getTeacherAuthoringStatusView(
  dto: TeacherAuthoringStatusDto,
): TeacherAuthoringStatusView {
  if (!isKnownStatus(dto.teacherFacingStatus)) {
    throw new Error(
      `Unknown teacherFacingStatus '${String(dto.teacherFacingStatus)}'. Only draft|submitted|approved|rejected|published are accepted.`,
    );
  }

  switch (dto.teacherFacingStatus) {
    case "draft":
      return {
        label: "Draft",
        teacherFacingStatus: "draft",
        canSave: true,
        canSubmit: true,
        canEdit: true,
        canEditAfterReject: false,
        isPublishReady: false,
      };
    case "submitted":
      return {
        label: "Submitted",
        teacherFacingStatus: "submitted",
        canSave: false,
        canSubmit: false,
        canEdit: false,
        canEditAfterReject: false,
        isPublishReady: false,
      };
    case "rejected": {
      const view: TeacherAuthoringStatusView = {
        label: "Rejected",
        teacherFacingStatus: "rejected",
        canSave: false,
        canSubmit: false,
        canEdit: true,
        canEditAfterReject: true,
        isPublishReady: false,
      };
      if (typeof dto.rejectionComment === "string" && dto.rejectionComment.length > 0) {
        view.rejectionComment = dto.rejectionComment;
      }
      return view;
    }
    case "approved":
      return {
        label: "Approved",
        teacherFacingStatus: "approved",
        canSave: false,
        canSubmit: false,
        canEdit: false,
        canEditAfterReject: false,
        isPublishReady: true,
      };
    case "published":
      return {
        label: "Published",
        teacherFacingStatus: "published",
        canSave: false,
        canSubmit: false,
        canEdit: false,
        canEditAfterReject: false,
        isPublishReady: true,
      };
  }
  /* istanbul ignore next — unreachable: switch is exhaustive over the union */
  throw new Error(
    `Unhandled teacherFacingStatus '${String(dto.teacherFacingStatus)}'.`,
  );
}
