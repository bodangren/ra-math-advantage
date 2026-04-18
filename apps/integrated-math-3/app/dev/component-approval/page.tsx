import { notFound } from 'next/navigation';

import { isDevApprovalEnabledForRequest, requireDeveloperSessionClaims } from '@/lib/auth/developer';
import { ReviewQueueView } from '@/components/dev/review-queue';

export default async function ComponentApprovalPage() {
  if (!isDevApprovalEnabledForRequest()) {
    return notFound();
  }

  await requireDeveloperSessionClaims('/auth/login', '/');

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-mono">Developer Only</p>
        <h1 className="text-3xl font-display font-bold text-foreground">Component Approval</h1>
      </div>

      <ReviewQueueView />
    </div>
  );
}