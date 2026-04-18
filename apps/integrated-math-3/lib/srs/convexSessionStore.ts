import type { SrsSession, SrsSessionConfig } from "./contract";
import { internal } from "@/convex/_generated/api";
import { type MutationCtx } from "@/convex/_generated/server";

export class ConvexSessionStore {
  private ctx: MutationCtx;

  constructor(ctx: MutationCtx) {
    this.ctx = ctx;
  }

  async createSession(
    studentId: string,
    config: SrsSessionConfig,
    plannedCards: number
  ): Promise<string> {
    const result = await this.ctx.runMutation(
      internal.srs.sessions.createSession,
      {
        studentId,
        plannedCards,
        config,
      }
    );
    return result;
  }

  async completeSession(sessionId: string, completedCards: number): Promise<void> {
    await this.ctx.runMutation(internal.srs.sessions.completeSession, {
      sessionId,
      completedCards,
    });
  }

  async getActiveSession(studentId: string): Promise<SrsSession | null> {
    const result = await this.ctx.runQuery(
      internal.srs.sessions.getActiveSession,
      { studentId }
    );
    return result;
  }

  async getSessionHistory(
    studentId: string,
    limit?: number,
    cursor?: string
  ): Promise<{ sessions: SrsSession[]; nextCursor: string | null }> {
    const result = await this.ctx.runQuery(
      internal.srs.sessions.getSessionHistory,
      {
        studentId,
        limit,
        cursor,
      }
    );
    return result;
  }
}

export function createConvexSessionStore(
  ctx: MutationCtx
): ConvexSessionStore {
  return new ConvexSessionStore(ctx);
}