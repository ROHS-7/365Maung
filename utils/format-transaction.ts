import type { Translations } from '@/constants/i18n';
import type { Lang } from '@/constants/i18n';
import type { CoinTransaction, TransactionUserRef } from '@/types/api';

export function formatTransactionUser(ref: TransactionUserRef): string | null {
  if (ref == null) return null;
  if (typeof ref === 'string') {
    const trimmed = ref.trim();
    return trimmed || null;
  }
  const name = ref.nickname?.trim() || ref.username?.trim();
  return name || null;
}

export function getTransactionLabel(tx: CoinTransaction, tr: Translations): string {
  const from = formatTransactionUser(tx.from_user);
  const to = formatTransactionUser(tx.to_user);

  if (tx.direction === 'received' && from) {
    return tr.coinTxReceivedFrom.replace('{user}', from);
  }
  if (tx.direction === 'sent' && to) {
    return tr.coinTxSentTo.replace('{user}', to);
  }
  if (tx.type === 'add') return tr.coinTxAdded;
  if (tx.type === 'deduct') return tr.coinTxDeducted;
  if (tx.direction === 'received') return tr.coinTxReceived;
  return tr.coinTxSent;
}

export function getSignedTransactionAmount(tx: CoinTransaction): number {
  const amount = Math.abs(tx.amount);
  return tx.direction === 'received' ? amount : -amount;
}

export function formatTransactionDate(iso: string, _lang?: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTransactionAmount(
  signedAmount: number,
  lang: Lang,
  currencyUnit: string,
): string {
  const sign = signedAmount > 0 ? '+' : signedAmount < 0 ? '−' : '';
  const formatted = Math.abs(signedAmount).toLocaleString(lang === 'my' ? 'my-MM' : 'en-US');
  return `${sign}${formatted} ${currencyUnit}`;
}

export function getTransactionIcon(
  direction: CoinTransaction['direction'],
): 'arrow-down-circle' | 'arrow-up-circle' {
  return direction === 'received' ? 'arrow-down-circle' : 'arrow-up-circle';
}
