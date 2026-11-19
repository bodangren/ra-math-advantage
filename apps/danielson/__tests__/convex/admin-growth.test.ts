import { expect, it } from "vitest";
import { listAdministrationAccounts, readAdministrationAccount } from "../../convex/foundation";
import {
  MemoryDb,
  handler,
  seedBase,
  seedAccount,
  ORG,
  SYSADMIN,
  LEADER,
  TEACHER_ACCOUNT,
} from "../helpers/growth-db";
it("finds an account beyond the first directory page", async () => {
  const db = new MemoryDb();
  seedBase(db);
  for (let i = 0; i < 120; i++) seedAccount(db, `accounts:extra${i}`, `Account ${i}`);
  const result = await handler(listAdministrationAccounts)(db.context(), {
    actorAccountId: SYSADMIN,
    search: "Account 119",
    paginationOpts: { cursor: null, numItems: 10 },
  });
  expect(
    (result.accountPage as { items: { displayName: string }[] }).items.map(
      (row) => row.displayName,
    ),
  ).toEqual(["Account 119"]);
});
it("keeps account details within system administration access", async () => {
  const db = new MemoryDb();
  seedBase(db);
  expect(
    (
      await handler(readAdministrationAccount)(db.context(), {
        actorAccountId: LEADER,
        accountId: TEACHER_ACCOUNT,
      })
    ).kind,
  ).toBe("denied");
  const result = await handler(readAdministrationAccount)(db.context(), {
    actorAccountId: SYSADMIN,
    accountId: TEACHER_ACCOUNT,
  });
  expect(result.kind).toBe("allowed");
  expect(JSON.stringify(result)).toContain("Teacher One");
  expect(JSON.stringify(result)).not.toContain("password");
  await db.patch(TEACHER_ACCOUNT, { organizationId: `${ORG}:other` });
  expect(
    (
      await handler(readAdministrationAccount)(db.context(), {
        actorAccountId: SYSADMIN,
        accountId: TEACHER_ACCOUNT,
      })
    ).kind,
  ).toBe("denied");
});
