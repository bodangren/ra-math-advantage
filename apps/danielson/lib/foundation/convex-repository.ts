import type { DanielsonAction } from './authorization';
import type { DanielsonFoundationRepository, FoundationChange } from './server-access';
import { fetchInternalMutation, fetchInternalQuery, internal } from '@/lib/convex/server';

export function createDanielsonConvexRepository(): DanielsonFoundationRepository {
  return {
    async resolveAccessContext(sessionToken, subjectAccountId) {
      const context = await fetchInternalQuery(internal.foundation.resolveAccessContext, {
        actorAccountId: sessionToken,
        subjectAccountId: subjectAccountId ?? undefined,
      });
      return context;
    },

    async readTeacherReport(subjectAccountId) {
      return { subjectAccountId };
    },

    async readPrivateLeadership(subjectAccountId) {
      return { subjectAccountId, privateLeadership: [] };
    },

    async writeProtectedAction(action: DanielsonAction, subjectAccountId: string, payload: unknown) {
      return { action, subjectAccountId, payload };
    },

    async commitAdministrationChange(input) {
      return fetchInternalMutation(internal.foundation.applyAdministrationChange, {
        actorAccountId: input.actorAccountId,
        organizationId: input.organizationId,
        requestId: input.requestId,
        change: input.change as FoundationChange,
      });
    },

    async listAccessAuditEvents(input) {
      return fetchInternalQuery(internal.foundation.listAccessAuditEvents, {
        organizationId: input.organizationId,
        paginationOpts: { numItems: 100, cursor: input.cursor ?? null },
      });
    },
  };
}
