import type { Lang } from '@/constants/i18n';
import type { FootballNewsArticle } from '@/types/api';

export function formatCount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (n >= 1000) {
    const v = n / 1000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(n);
}

export function timeAgo(iso: string, lang: Lang): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === 'my' ? 'ယခုလေး' : 'Just now';
  if (mins < 60) return lang === 'my' ? `${mins} မိနစ်အကြာ` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === 'my' ? `${hrs} နာရီအကြာ` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return lang === 'my' ? `${days} ရက်အကြာ` : `${days}d ago`;
  return new Date(iso).toLocaleDateString(lang === 'my' ? 'my-MM' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function newsBodyParagraphs(content: string): string[] {
  return content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function estimateReadMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function newsImageUri(article: FootballNewsArticle): string | null {
  const url = article.image_url?.trim();
  return url || null;
}
