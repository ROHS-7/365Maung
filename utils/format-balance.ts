export function formatBalance(amount: number, lang: 'en' | 'my'): string {
  if (lang === 'my') {
    return amount.toLocaleString('en-US');
  }
  return amount.toLocaleString('en-US');
}

export function formatCashOut(
  raw: string | number | null | undefined,
  lang: 'en' | 'my',
  currencyUnit: string,
): string {
  if (raw == null || raw === '') return '—';
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return String(raw);
  return `${formatBalance(n, lang)} ${currencyUnit}`;
}

