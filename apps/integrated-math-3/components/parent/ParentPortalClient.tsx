'use client';

import { useState } from 'react';
import { ParentDashboard } from './ParentDashboard';
import { StudentSwitcher, type StudentOption } from './StudentSwitcher';
import { ParentEmptyStates, type ParentEmptyStateLink } from './ParentEmptyStates';
import type { ParentVisualizationV1 } from '@math-platform/knowledge-space-practice';

export interface ParentPortalClientProps {
  /** All active links for this parent (status === 'active'). */
  activeLinks: ParentEmptyStateLink[];
  /**
   * Map from studentId to its parent-safe projection. Only students for
   * which a projection was successfully fetched are in this map.
   */
  projectionsByStudentId: Record<string, ParentVisualizationV1>;
  /** Display options for the student switcher. */
  studentOptions: StudentOption[];
  /** The student to display initially (typically the first one or a search-param-selected one). */
  initialSelectedStudentId: string;
  /**
   * Map from studentId to a human-readable name (falls back to the
   * studentId if not provided).
   */
  studentNamesById?: Record<string, string>;
}

/**
 * Client-side dispatcher for the parent portal.
 *
 * The server component (`app/parent/page.tsx`) does all of the auth and
 * data fetching (Convex). It then renders this client component with the
 * already-fetched link list, projections, and student options. This
 * component holds the selected-student state on the client so clicking a
 * switcher button instantly re-renders the dashboard without a full page
 * reload — the privacy boundary stays on the server (no additional Convex
 * calls are made from the client).
 */
export function ParentPortalClient({
  activeLinks,
  projectionsByStudentId,
  studentOptions,
  initialSelectedStudentId,
  studentNamesById,
}: ParentPortalClientProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(initialSelectedStudentId);

  // Resolve the selected projection; if the requested id is missing or
  // unprojected, fall back to the first projected student.
  const projectedIds = studentOptions.map((s) => s.studentId);
  const safeSelectedId = projectedIds.includes(selectedStudentId)
    ? selectedStudentId
    : projectedIds[0] ?? '';

  const selectedProjection = safeSelectedId
    ? projectionsByStudentId[safeSelectedId]
    : undefined;

  // Defensive: if no projections resolved at all, render the
  // no-activity empty state via the dispatcher.
  if (!selectedProjection) {
    return (
      <ParentEmptyStates
        links={activeLinks}
        hasProjectionNodes={false}
        studentName={safeSelectedId || undefined}
      />
    );
  }

  const displayName =
    studentNamesById?.[safeSelectedId] ?? safeSelectedId;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <StudentSwitcher
        students={studentOptions}
        selectedStudentId={safeSelectedId}
        onSelectStudent={setSelectedStudentId}
      />
      <ParentDashboard
        payload={selectedProjection}
        studentId={safeSelectedId}
        studentName={displayName}
      />
    </div>
  );
}
