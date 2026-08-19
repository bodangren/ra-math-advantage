export type SysadminAccountState = {
  organizationId: string;
  isActive: boolean;
};

export function countActiveSysadmins(
  accounts: readonly (SysadminAccountState | null)[],
  organizationId: string,
): number {
  return accounts.filter((account) => account?.isActive && account.organizationId === organizationId).length;
}
