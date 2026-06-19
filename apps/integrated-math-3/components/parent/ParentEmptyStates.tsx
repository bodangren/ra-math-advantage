'use client';

import type { ReactNode } from 'react';

export interface ParentEmptyStateLink {
  studentId: string;
  status: 'active' | 'pending' | 'revoked';
}

export interface ParentEmptyStatesProps {
  links: ParentEmptyStateLink[];
  hasProjectionNodes?: boolean;
  studentName?: string;
  children?: ReactNode;
}

export function ParentEmptyStates({
  links,
  hasProjectionNodes,
  studentName,
  children,
}: ParentEmptyStatesProps) {
  if (links.length === 0) {
    return (
      <div
        data-testid="parent-empty-state-no-links"
        role="status"
        className="card-workbook p-6 text-center space-y-3"
      >
        <h2 className="text-xl font-semibold text-foreground">
          No students linked yet
        </h2>
        <p className="text-sm text-muted-foreground">
          Your account is not yet linked to any students. Ask your
          student&rsquo;s teacher or school administrator to send you an
          invite. Once they link your account, you&rsquo;ll be able to
          view your student&rsquo;s progress here.
        </p>
      </div>
    );
  }

  const hasActiveLink = links.some((l) => l.status === 'active');

  if (!hasActiveLink) {
    return (
      <div
        data-testid="parent-empty-state-pending-link"
        role="status"
        className="card-workbook p-6 text-center space-y-3"
      >
        <h2 className="text-xl font-semibold text-foreground">
          Link pending approval
        </h2>
        <p className="text-sm text-muted-foreground">
          {studentName
            ? `Your link to ${studentName} is pending confirmation.`
            : 'Your link is pending confirmation.'}{' '}
          A teacher or school administrator needs to review and approve
          the connection. This usually takes a day or two. We&rsquo;ll
          let you know once it&rsquo;s confirmed.
        </p>
      </div>
    );
  }

  if (hasProjectionNodes === false) {
    return (
      <div
        data-testid="parent-empty-state-no-activity"
        role="status"
        className="card-workbook p-6 text-center space-y-3"
      >
        <h2 className="text-xl font-semibold text-foreground">
          No activity yet
        </h2>
        <p className="text-sm text-muted-foreground">
          {studentName
            ? `${studentName} hasn't started any lessons yet.`
            : 'Your student hasn&rsquo;t started any lessons yet.'}{' '}
          Once they begin working through the curriculum, their skill map
          and progress will appear here. Check back soon!
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
