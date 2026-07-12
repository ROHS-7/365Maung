import type { Activity } from '@/types/api';
import type { Lang } from '@/constants/i18n';

const TEXT_KEYS = ['description', 'message', 'remark', 'content', 'title'] as const;

export function getActivityLabel(activity: Activity): string {
  for (const key of TEXT_KEYS) {
    const value = activity[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  if (activity.type?.trim()) return activity.type.trim();
  return `#${activity.id}`;
}

export function getActivityAmount(activity: Activity): number | null {
  const raw = activity.amount ?? activity.coin ?? activity.coin_amount;
  if (raw == null || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function formatActivityDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === 'my' ? 'my-MM' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type IconName =
  | 'arrow-down-circle'
  | 'arrow-up-circle'
  | 'football'
  | 'log-in'
  | 'swap-horizontal'
  | 'time-outline';

export function getActivityIcon(type?: string | null): IconName {
  const t = (type ?? '').toLowerCase();
  if (t.includes('deposit') || t.includes('topup') || t.includes('top_up')) {
    return 'arrow-down-circle';
  }
  if (t.includes('withdraw') || t.includes('cashout') || t.includes('cash_out')) {
    return 'arrow-up-circle';
  }
  if (t.includes('bet') || t.includes('wager') || t.includes('parlay') || t.includes('hdp')) {
    return 'football';
  }
  if (t.includes('login') || t.includes('auth')) return 'log-in';
  if (t.includes('transfer') || t.includes('adjust')) return 'swap-horizontal';
  return 'time-outline';
}

export function formatActivityAmount(amount: number, lang: Lang, currencyUnit: string): string {
  const sign = amount > 0 ? '+' : '';
  const formatted = Math.abs(amount).toLocaleString(lang === 'my' ? 'my-MM' : 'en-US');
  return `${sign}${formatted} ${currencyUnit}`;
}
