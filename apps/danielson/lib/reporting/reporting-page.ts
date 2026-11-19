import { redirect } from "next/navigation";

import { requireDanielsonSession } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type {
  EvidenceHistoryItem,
  PrivateTeacherReport,
  PublicTeacherReport,
  ReportingComment,
  ReportingPortfolioPage,
} from "@/lib/reporting/contracts";

type CursorPage<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
};

type ReportCursors = {
  historyCursor?: string | null;
  publicCommentCursor?: string | null;
  privateCommentCursor?: string | null;
};

function nextPageHref(
  path: string,
  cursors: ReportCursors,
  key: keyof ReportCursors,
  nextCursor: string | null,
) {
  if (nextCursor === null) return null;
  const parameters = new URLSearchParams();
  for (const [name, value] of Object.entries(cursors)) {
    if (value) parameters.set(name, value);
  }
  parameters.set(key, nextCursor);
  return `${path}?${parameters.toString()}`;
}

export async function getLeadershipPortfolio(
  cursor: string | null,
  filters: {
    search?: string;
    department?: string;
    attention?: string;
    assignedOnly?: boolean;
  } = {},
) {
  const session = await requireDanielsonSession("/reports");
  const result = await fetchInternalQuery(internal.reporting.readLeadershipPortfolio, {
    actorAccountId: session.claims.sub,
    now: new Date().toISOString(),
    cursor,
    pageSize: 25,
    ...filters,
  });
  if (result.kind === "portfolio_capacity_exceeded") {
    throw new Error("The reporting portfolio exceeded its safe capacity.");
  }
  if (result.kind === "invalid_cursor") redirect("/reports");
  if (result.kind !== "allowed") redirect("/unauthorized");
  return { session, page: result.page as ReportingPortfolioPage };
}

export async function getLeadershipTeacherReport(
  teacherProfileId: string,
  cursors: ReportCursors = {},
) {
  const path = `/reports/teachers/${encodeURIComponent(teacherProfileId)}`;
  const session = await requireDanielsonSession(path);
  const result = await fetchInternalQuery(internal.reporting.readLeadershipTeacherReport, {
    actorAccountId: session.claims.sub,
    teacherProfileId,
    now: new Date().toISOString(),
  });
  if (result.kind === "teacher_report_capacity_exceeded") {
    throw new Error("The teacher report exceeded its safe capacity.");
  }
  if (result.kind !== "allowed") redirect("/unauthorized");
  const [evidenceResult, publicCommentsResult, privateCommentsResult] = await Promise.all([
    fetchInternalQuery(internal.reporting.listLeadershipEvidenceHistory, {
      actorAccountId: session.claims.sub,
      teacherProfileId,
      paginationOpts: { cursor: cursors.historyCursor ?? null, numItems: 20 },
    }),
    fetchInternalQuery(internal.reporting.listLeadershipPublicComments, {
      actorAccountId: session.claims.sub,
      teacherProfileId,
      paginationOpts: { cursor: cursors.publicCommentCursor ?? null, numItems: 20 },
    }),
    result.visibility === "private"
      ? fetchInternalQuery(internal.reporting.listLeadershipPrivateComments, {
          actorAccountId: session.claims.sub,
          teacherProfileId,
          paginationOpts: { cursor: cursors.privateCommentCursor ?? null, numItems: 20 },
        })
      : Promise.resolve(null),
  ]);
  if (evidenceResult.kind === "history_capacity_exceeded") {
    throw new Error("The evidence history exceeded its safe capacity.");
  }
  if (
    evidenceResult.kind !== "allowed" ||
    publicCommentsResult.kind !== "allowed" ||
    (privateCommentsResult !== null && privateCommentsResult.kind !== "allowed")
  )
    redirect("/unauthorized");
  const evidencePage = evidenceResult.page as CursorPage<EvidenceHistoryItem>;
  const publicCommentsPage = publicCommentsResult.page as CursorPage<ReportingComment>;
  const privateCommentsPage = privateCommentsResult?.page as
    | CursorPage<ReportingComment>
    | undefined;
  const baseReport = result.report as PublicTeacherReport | PrivateTeacherReport;
  const report =
    result.visibility === "private"
      ? ({
          ...baseReport,
          evidenceHistory: evidencePage.page,
          publicComments: publicCommentsPage.page,
          privateComments: privateCommentsPage?.page ?? [],
        } as PrivateTeacherReport)
      : ({
          ...baseReport,
          evidenceHistory: evidencePage.page,
          publicComments: publicCommentsPage.page,
        } as PublicTeacherReport);
  return {
    session,
    visibility: result.visibility as "public" | "private",
    report,
    nextHrefs: {
      evidenceHistory: nextPageHref(
        path,
        cursors,
        "historyCursor",
        evidencePage.isDone ? null : evidencePage.continueCursor,
      ),
      publicComments: nextPageHref(
        path,
        cursors,
        "publicCommentCursor",
        publicCommentsPage.isDone ? null : publicCommentsPage.continueCursor,
      ),
      privateComments: nextPageHref(
        path,
        cursors,
        "privateCommentCursor",
        !privateCommentsPage || privateCommentsPage.isDone
          ? null
          : privateCommentsPage.continueCursor,
      ),
    },
  };
}

export async function getMyTeacherReport(cursors: ReportCursors = {}) {
  const session = await requireDanielsonSession("/my-report");
  const result = await fetchInternalQuery(internal.reporting.readMyTeacherReport, {
    actorAccountId: session.claims.sub,
    now: new Date().toISOString(),
  });
  if (result.kind === "teacher_report_capacity_exceeded") {
    throw new Error("The teacher report exceeded its safe capacity.");
  }
  if (result.kind !== "allowed") redirect("/unauthorized");
  const [evidenceResult, publicCommentsResult] = await Promise.all([
    fetchInternalQuery(internal.reporting.listMyEvidenceHistory, {
      actorAccountId: session.claims.sub,
      paginationOpts: { cursor: cursors.historyCursor ?? null, numItems: 20 },
    }),
    fetchInternalQuery(internal.reporting.listMyPublicComments, {
      actorAccountId: session.claims.sub,
      paginationOpts: { cursor: cursors.publicCommentCursor ?? null, numItems: 20 },
    }),
  ]);
  if (evidenceResult.kind === "history_capacity_exceeded") {
    throw new Error("The evidence history exceeded its safe capacity.");
  }
  if (evidenceResult.kind !== "allowed" || publicCommentsResult.kind !== "allowed") {
    redirect("/unauthorized");
  }
  const evidencePage = evidenceResult.page as CursorPage<EvidenceHistoryItem>;
  const publicCommentsPage = publicCommentsResult.page as CursorPage<ReportingComment>;
  const report = {
    ...result.report,
    evidenceHistory: evidencePage.page,
    publicComments: publicCommentsPage.page,
  } as PublicTeacherReport;
  return {
    session,
    report,
    nextHrefs: {
      evidenceHistory: nextPageHref(
        "/my-report",
        cursors,
        "historyCursor",
        evidencePage.isDone ? null : evidencePage.continueCursor,
      ),
      publicComments: nextPageHref(
        "/my-report",
        cursors,
        "publicCommentCursor",
        publicCommentsPage.isDone ? null : publicCommentsPage.continueCursor,
      ),
    },
  };
}
