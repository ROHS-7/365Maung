export function formatBalance(amount: number, lang: 'en' | 'my'): string {
  if (lang === 'my') {
    return amount.toLocaleString('en-US');
  }
  return amount.toLocaleString('en-US');
}
