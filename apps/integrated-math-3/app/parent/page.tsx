import type { ReactElement } from 'react';
import type { ParentVisualizationV1 } from '@math-platform/knowledge-space-practice';

import { requireParentServerSessionClaims } from '@/lib/auth/parent-server-guards';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { ParentEmptyStates } from '@/components/parent/ParentEmptyStates';
import { ParentPortalClient } from '@/components/parent/ParentPortalClient';
import type { StudentOption } from '@/components/parent/StudentSwitcher';
import type { ParentEmptyStateLink } from '@/components/parent/ParentEmptyStates';

interface PageProps {
  searchParams?: Promise<{ student?: string }>;
}

interface ParentLinkRow {
  studentId: string;
  status: 'active' | 'pending' | 'revoked';
}

interface ProfileNameRow {
  _id: string;
  displayName?: string;
  username?: string;
}

/**
 * Production `/parent` route.
 *
 * Track: parent_portal_prod_wiring_remediation_20260621
 * Spec: FR-1, FR-2, FR-4 — render a real parent dashboard from live data.
 *
 * Flow:
 *   1. Call `requireParentServerSessionClaims('/parent')` — fails closed
 *      with a `NEXT_REDIRECT` for any non-parent session.
 *   2. Fetch the parent's `parent_links` via the internal
 *      `parent.links.listParentLinksQuery` Convex function.
 *   3. For each active link, fetch a parent-safe projection via the
 *      internal `parent.visualization.projectParentVisualizationQuery`.
 *   4. Render `ParentEmptyStates` (no links / pending / no activity) or
 *      `ParentPortalClient` (which composes `StudentSwitcher` and
 *      `ParentDashboard` from live data).
 *
 * No client-side Convex calls: the privacy boundary is owned by the
 * page-level guard and the internal queries. The client component only
 * owns the selected-student state for the switcher.
 */
export default async function ParentPage({
  searchParams,
}: PageProps = {}): Promise<ReactElement> {
  const claims = await requireParentServerSessionClaims('/parent');

  // FR-2 — fetch parent links from the live backend surface.
  const rawLinks = (await fetchInternalQuery(
    internal.parent.links.listParentLinksQuery,
    { parentProfileId: claims.sub },
  )) as ParentLinkRow[] | null;

  const allLinks: ParentLinkRow[] = Array.isArray(rawLinks) ? rawLinks : [];

  // Pre-link empty state: parent has no links at all (active or pending).
  if (allLinks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <ParentEmptyStates links={[]} />
      </div>
    );
  }

  // Normalize to the dispatcher's expected shape.
  const normalizedLinks: ParentEmptyStateLink[] = allLinks.map((l) => ({
    studentId: l.studentId,
    status: l.status,
  }));

  const activeLinks = normalizedLinks.filter((l) => l.status === 'active');

  // No active links (all are pending/revoked) — show the pending empty state.
  if (activeLinks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <ParentEmptyStates links={normalizedLinks} />
      </div>
    );
  }

  // FR-2 — fetch a parent-safe projection for each active student.
  const projectionsByStudentId: Record<string, ParentVisualizationV1> = {};

  await Promise.all(
    activeLinks.map(async (link) => {
      const projection = (await fetchInternalQuery(
        internal.parent.visualization.projectParentVisualizationQuery,
        {
          studentId: link.studentId,
          parentProfileId: claims.sub,
        },
      )) as ParentVisualizationV1 | null;
      if (projection) {
        projectionsByStudentId[link.studentId] = projection;
      }
    }),
  );

  // If every projection fetch failed (e.g. all students lost their
  // placement rows), fall back to the no-activity empty state rather
  // than rendering an empty dashboard.
  if (Object.keys(projectionsByStudentId).length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <ParentEmptyStates
          links={normalizedLinks}
          hasProjectionNodes={false}
        />
      </div>
    );
  }

  // Resolve student display names for the dashboard and switcher.
  const studentIds = Object.keys(projectionsByStudentId);
  const studentOptions: StudentOption[] = await resolveStudentOptions(
    studentIds,
  );

  // Pick the initially selected student: search-param override → first
  // projected student. The switcher re-renders without an additional
  // fetch when the user clicks a different student.
  const requestedStudentId = searchParams ? (await searchParams).student : undefined;
  const projectedSet = new Set(studentIds);
  const initialSelectedStudentId =
    requestedStudentId && projectedSet.has(requestedStudentId)
      ? requestedStudentId
      : studentIds[0]!;

  const studentNamesById: Record<string, string> = {};
  for (const option of studentOptions) {
    studentNamesById[option.studentId] = option.displayName;
  }

  return (
    <ParentPortalClient
      activeLinks={activeLinks}
      projectionsByStudentId={projectionsByStudentId}
      studentOptions={studentOptions}
      initialSelectedStudentId={initialSelectedStudentId}
      studentNamesById={studentNamesById}
    />
  );
}

/**
 * Resolves display names for the projected students.
 *
 * Best-effort: returns the studentId as the displayName if no profile
 * row is found, or if the lookup fails for any reason. The page must
 * never throw because of a missing name — the projection itself is the
 * source of truth for parent-visible data.
 *
 * Privacy note: the parent already has access to each linked student's
 * id (the parent_links row exposes it); using the id as a display
 * fallback does not leak extra information beyond what the parent
 * already knows.
 */
async function resolveStudentOptions(studentIds: string[]): Promise<StudentOption[]> {
  if (studentIds.length === 0) return [];

  // Try per-student profile lookups via the existing internal query. The
  // loop is bounded by the number of active links for this parent
  // (typically 1–3), so the cost is negligible compared to the projection
  // fetch already done above. Failures on any single lookup degrade
  // gracefully to the id-based display name.
  const results: StudentOption[] = [];
  for (const id of studentIds) {
    let displayName: string | undefined;
    try {
      const profile = (await fetchInternalQuery(
        internal.activities.getProfileById,
        { profileId: id },
      )) as ProfileNameRow | null;
      displayName = profile?.displayName ?? profile?.username ?? undefined;
    } catch {
      displayName = undefined;
    }
    results.push({
      studentId: id,
      displayName: displayName ?? humanizeId(id),
    });
  }
  return results;
}

/**
 * Turns `student_alpha_123` into `Student Alpha 123` for human-friendly
 * display when no real profile name is available.
 */
function humanizeId(id: string): string {
  return id
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
