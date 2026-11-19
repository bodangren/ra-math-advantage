import { describe, expect, it } from "vitest";

import { getAccountById } from "../../convex/auth";

type Row = Record<string, unknown> & { _id: string };

class MemoryDb {
  private readonly rows = new Map<string, Row>();

  seed(id: string, row: Record<string, unknown>) {
    this.rows.set(id, { _id: id, ...row });
  }

  async get(id: string) {
    return this.rows.get(id) ?? null;
  }

  query(table: string) {
    let matches = [...this.rows.values()].filter((row) => row._id.startsWith(`${table}:`));
    const query = {
      withIndex: (
        _name: string,
        configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => {
        const equalities: Array<[string, unknown]> = [];
        const builder = {
          eq: (field: string, value: unknown) => {
            equalities.push([field, value]);
            return builder;
          },
        };
        configure(builder);
        matches = matches.filter((row) =>
          equalities.every(([field, value]) => row[field] === value),
        );
        return query;
      },
      unique: async () => matches[0] ?? null,
    };
    return query;
  }
}

function handler(value: unknown) {
  return (value as { _handler: (ctx: unknown, args: unknown) => Promise<unknown> })._handler;
}

function seedAccount(db: MemoryDb, suffix: string, branding?: Record<string, string>) {
  const organizationId = `organizations:${suffix}`;
  const accountId = `accounts:${suffix}`;
  db.seed(organizationId, {
    name: `Organization ${suffix}`,
    isActive: true,
    ...(branding ? { branding } : {}),
  });
  db.seed(accountId, {
    organizationId,
    username: `user.${suffix}`,
    displayName: `User ${suffix}`,
    sharedSessionRole: "admin",
    isActive: true,
  });
  db.seed(`auth_credentials:${suffix}`, {
    accountId,
    isActive: true,
    mustChangePassword: false,
  });
  return { accountId, organizationId };
}

describe("organization branding in the account boundary", () => {
  it("returns the current organization brand and no other organization brand", async () => {
    const db = new MemoryDb();
    const hdkwaBranding = {
      displayName: "HDKWA",
      logoPath: "/brands/hdkwa-logo.png",
      primaryColor: "#003366",
      accentColor: "#C5A059",
    };
    const hdkwa = seedAccount(db, "hdkwa", hdkwaBranding);
    seedAccount(db, "other", {
      displayName: "Other School",
      logoPath: "/brands/other.png",
      primaryColor: "#111111",
      accentColor: "#222222",
    });

    await expect(
      handler(getAccountById)({ db }, { accountId: hdkwa.accountId }),
    ).resolves.toMatchObject({
      organizationId: hdkwa.organizationId,
      organizationName: "Organization hdkwa",
      organizationBranding: hdkwaBranding,
    });
  });

  it("returns null branding for an organization that has no brand fields", async () => {
    const db = new MemoryDb();
    const generic = seedAccount(db, "generic");

    await expect(
      handler(getAccountById)({ db }, { accountId: generic.accountId }),
    ).resolves.toMatchObject({
      organizationName: "Organization generic",
      organizationBranding: null,
    });
  });
});
