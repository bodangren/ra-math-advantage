export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type NormalBalanceSide = 'debit' | 'credit';

export interface AccountingTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference?: string;
  journalEntry?: string;
  category?: string;
}

export interface JournalEntryLine {
  id: string;
  account: string;
  accountType: AccountType;
  debit?: number;
  credit?: number;
  description?: string;
}

export interface TrialBalanceAccount {
  id: string;
  accountNumber?: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalanceSide;
  debitBalance?: number;
  creditBalance?: number;
}

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  asset: 'bg-blue-100 text-blue-800 border-blue-200',
  liability: 'bg-red-100 text-red-800 border-red-200',
  equity: 'bg-purple-100 text-purple-800 border-purple-200',
  revenue: 'bg-green-100 text-green-800 border-green-200',
  expense: 'bg-orange-100 text-orange-800 border-orange-200'
};


/**
 * Return Tailwind CSS classes for the given account type badge color.
 *
 * @param type - An AccountType or arbitrary string
 * @returns CSS class string for the badge
 */
export function getAccountTypeColor(type: AccountType | string) : string {
  if ((type as AccountType) in ACCOUNT_TYPE_COLORS) {
    return ACCOUNT_TYPE_COLORS[type as AccountType];
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
}


/**
 * Determine the normal balance side (debit or credit) for an account type.
 *
 * @param accountType - The account type to evaluate
 * @returns The normal balance side for that account type
 */
export function getNormalBalanceSide(accountType: AccountType) : NormalBalanceSide {
  return accountType === 'asset' || accountType === 'expense' ? 'debit' : 'credit';
}


/**
 * Format a numeric value as a US dollar currency string.
 *
 * @param value - The amount to format
 * @returns A string like "$1,500"
 */
export function formatCurrency(value: number) : string {
  return `$${value.toLocaleString()}`;
}
