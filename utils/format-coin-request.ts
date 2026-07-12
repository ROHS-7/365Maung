import type { Lang } from '@/constants/i18n';
import type { Translations } from '@/constants/i18n';
import type { CoinRequest } from '@/types/api';
import { getProviderMeta } from '@/constants/payment-providers';
import { maskAccountNumber } from '@/utils/payment-accounts';

export function formatCoinRequestDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === 'my' ? 'my-MM' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCoinRequestDisplayDate(req: CoinRequest): string | null {
  if (req.status.toLowerCase() !== 'pending' && req.processed_at) return req.processed_at;
  return req.created_at;
}

export function getCoinRequestTypeLabel(type: string, tr: Translations): string {
  if (type === 'deposit') return tr.coinRequestDeposit;
  if (type === 'withdraw') return tr.coinRequestWithdraw;
  return type;
}

export function getCoinRequestSourceLabel(source: string, tr: Translations): string | null {
  if (source === 'direct') return tr.coinRequestSourceDirect;
  if (source === 'request') return tr.coinRequestSourceRequest;
  return null;
}

export function getCoinRequestStatusLabel(status: string, tr: Translations): string {
  const s = status.toLowerCase();
  if (s === 'pending') return tr.coinRequestStatusPending;
  if (s === 'accepted' || s === 'approved') return tr.coinRequestStatusAccepted;
  if (s === 'rejected' || s === 'declined') return tr.coinRequestStatusRejected;
  return status;
}

export function getCoinRequestStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'pending') return '#F59E0B';
  if (s === 'accepted' || s === 'approved') return '#16A34A';
  if (s === 'rejected' || s === 'declined') return '#DC2626';
  return '#6B7280';
}

export function getCoinRequestSignedAmount(req: CoinRequest): number {
  const amount = Math.abs(req.amount);
  return req.type === 'withdraw' ? -amount : amount;
}

export function formatCoinRequestAmount(
  signed: number,
  lang: Lang,
  currencyUnit: string,
): string {
  const sign = signed > 0 ? '+' : signed < 0 ? '−' : '';
  const formatted = Math.abs(signed).toLocaleString(lang === 'my' ? 'my-MM' : 'en-US');
  return `${sign}${formatted} ${currencyUnit}`;
}

export function getCoinRequestAccountLine(req: CoinRequest): string | null {
  const pa = req.payment_account;
  if (!pa) return null;
  const provider = getProviderMeta(pa.provider).label;
  return `${provider} · ${maskAccountNumber(pa.account_number)}`;
}

export function formatCoinRequestBalanceLine(
  req: CoinRequest,
  lang: Lang,
  currencyUnit: string,
  template: string,
): string | null {
  if (req.balance_after == null) return null;
  const formatted = req.balance_after.toLocaleString(lang === 'my' ? 'my-MM' : 'en-US');
  return template.replace('{amount}', `${formatted} ${currencyUnit}`);
}

export function formatCoinRequestRejectReason(reason: string, template: string): string {
  return template.replace('{reason}', reason);
}
