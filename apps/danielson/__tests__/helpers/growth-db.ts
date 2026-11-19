type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>> = (
  ctx: { db: MemoryDb },
  args: TArgs,
) => Promise<TResult>;

export function handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>>(
  value: unknown,
): Handler<TArgs, TResult> {
  return (value as { _handler: Handler<TArgs, TResult> })._handler;
}

export class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();
  readonly queryCalls: Array<{ table: string; index: string | null; take: number | null }> = [];

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string): StoredDocument[] {
    return [...(this.tables.get(table)?.values() ?? [])];
  }

  snapshot() {
    return structuredClone(
      Object.fromEntries(
        [...this.tables.entries()].map(([name, rows]) => [name, [...rows.values()]]),
      ),
    );
  }

  async get(id: unknown) {
    if (typeof id !== "string") return null;
    for (const table of this.tables.values()) {
      const document = table.get(id);
      if (document) return document;
    }
    return null;
  }

  normalizeId(table: string, id: string) {
    return this.tables.get(table)?.has(id) ? id : null;
  }

  async insert(table: string, document: Record<string, unknown>) {
    const id = `${table}:${++this.sequence}`;
    this.seed(table, id, document);
    return id;
  }

  async patch(id: string, patch: Record<string, unknown>) {
    for (const table of this.tables.values()) {
      const document = table.get(id);
      if (document) {
        table.set(id, { ...document, ...patch });
        return;
      }
    }
    throw new Error(`Missing document ${id}`);
  }

  async delete(id: string) {
    for (const table of this.tables.values()) {
      if (table.delete(id)) return;
    }
    throw new Error(`Missing document ${id}`);
  }

  query(tableName: string) {
    let matches = this.rows(tableName);
    let descending = false;
    const call = { table: tableName, index: null as string | null, take: null as number | null };
    this.queryCalls.push(call);
    const query = {
      withIndex: (
        name: string,
        configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => {
        call.index = name;
        const equalities: Array<[string, unknown]> = [];
        const builder = {
          eq: (field: string, value: unknown) => {
            equalities.push([field, value]);
            return builder;
          },
        };
        configure(builder);
        matches = matches.filter((document) =>
          equalities.every(([field, value]) => document[field] === value),
        );
        return query;
      },
      order: (direction: "asc" | "desc") => {
        descending = direction === "desc";
        return query;
      },
      unique: async () => {
        if (matches.length > 1) throw new Error(`Expected one ${tableName} row`);
        return matches[0] ?? null;
      },
      first: async () => {
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered[0] ?? null;
      },
      take: async (count: number) => {
        call.take = count;
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered.slice(0, count);
      },
      collect: async () => {
        throw new Error(`Unbounded collect is prohibited for ${tableName}`);
      },
      paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
        const start = cursor === null ? 0 : Number(cursor);
        const ordered = descending ? [...matches].reverse() : matches;
        const page = ordered.slice(start, start + numItems);
        const next = start + page.length;
        return {
          page,
          isDone: next >= ordered.length,
          continueCursor: next >= ordered.length ? "" : String(next),
        };
      },
    };
    return query;
  }

  context() {
    return { db: this };
  }

  private table(table: string) {
    let rows = this.tables.get(table);
    if (!rows) {
      rows = new Map();
      this.tables.set(table, rows);
    }
    return rows;
  }
}

export const ORG = "organizations:one";
export const OTHER_ORG = "organizations:other";
export const LEADER = "accounts:leader";
export const SYSADMIN = "accounts:sysadmin";
export const TEACHER_ACCOUNT = "accounts:teacher";
export const TEACHER = "teacher_profiles:teacher";
export const NOW = Date.parse("2026-11-01T00:00:00.000Z");
export const NOW_ISO = new Date(NOW).toISOString();

export function seedOrganization(db: MemoryDb, organizationId = ORG) {
  db.seed("organizations", organizationId, {
    slug: organizationId,
    name: organizationId,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

export function seedAccount(
  db: MemoryDb,
  accountId: string,
  displayName: string,
  organizationId = ORG,
) {
  db.seed("accounts", accountId, {
    organizationId,
    username: accountId,
    displayName,
    sharedSessionRole: "admin",
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

export function seedTeacher(
  db: MemoryDb,
  teacherProfileId: string,
  accountId: string,
  displayName: string,
  organizationId = ORG,
) {
  seedAccount(db, accountId, displayName, organizationId);
  db.seed("teacher_profiles", teacherProfileId, {
    organizationId,
    accountId,
    currentGbfAssignmentId: null,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

export function seedRole(db: MemoryDb, accountId: string, role: string, organizationId = ORG) {
  db.seed("role_assignments", `role_assignments:${accountId}:${role}`, {
    organizationId,
    accountId,
    role,
    status: "active",
    createdByAccountId: accountId,
    createdAt: NOW,
  });
}

export function seedBase(db: MemoryDb) {
  seedOrganization(db);
  seedOrganization(db, OTHER_ORG);
  seedAccount(db, LEADER, "Leader One");
  seedAccount(db, SYSADMIN, "System Administrator");
  seedTeacher(db, TEACHER, TEACHER_ACCOUNT, "Teacher One");
  seedRole(db, LEADER, "school_head");
  seedRole(db, SYSADMIN, "sysadmin");
  seedRole(db, TEACHER_ACCOUNT, "teacher");
}
