import type { PaymentAccount } from '@/types/api';

export function getBoundAccount(accounts: PaymentAccount[]): PaymentAccount | null {
  return accounts.find((a) => a.is_bound && a.is_enabled) ?? null;
}

export function getSelectableAccounts(accounts: PaymentAccount[]): PaymentAccount[] {
  return accounts.filter((a) => a.is_enabled);
}

export function filterByProvider(
  accounts: PaymentAccount[],
  provider: string,
): PaymentAccount[] {
  return accounts.filter((a) => a.is_enabled && a.provider === provider);
}

export function maskAccountNumber(n: string): string {
  const digits = n.replace(/\s/g, '');
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 4)}  ••••  ••${digits.slice(-2)}`;
}

export function agentDisplayName(agent: {
  nickname?: string | null;
  username: string;
}): string {
  return agent.nickname?.trim() || agent.username;
}
