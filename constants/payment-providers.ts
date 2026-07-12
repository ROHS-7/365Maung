import type { PaymentProvider } from '@/types/api';

export type ProviderMeta = {
  id: PaymentProvider;
  label: string;
  cardBg: string;
  cardBg2: string;
  lightText: boolean;
  logo: 'kbz' | 'wave' | 'icon';
  iconName: 'card' | 'phone-portrait' | 'wallet';
};

export const PAYMENT_PROVIDERS: ProviderMeta[] = [
  {
    id: 'kbz_pay',
    label: 'KBZ Pay',
    cardBg: '#1246AC',
    cardBg2: '#0A2F7A',
    lightText: true,
    logo: 'kbz',
    iconName: 'card',
  },
  {
    id: 'wave_pay',
    label: 'Wave Money',
    cardBg: '#F7D000',
    cardBg2: '#E6B800',
    lightText: false,
    logo: 'wave',
    iconName: 'phone-portrait',
  },
  {
    id: 'ayapay',
    label: 'AYA Pay',
    cardBg: '#B91C1C',
    cardBg2: '#991B1B',
    lightText: true,
    logo: 'icon',
    iconName: 'wallet',
  },
  {
    id: 'cb_pay',
    label: 'CB Pay',
    cardBg: '#1E40AF',
    cardBg2: '#1E3A8A',
    lightText: true,
    logo: 'icon',
    iconName: 'card',
  },
  {
    id: 'other',
    label: 'Other',
    cardBg: '#4B5563',
    cardBg2: '#374151',
    lightText: true,
    logo: 'icon',
    iconName: 'wallet',
  },
];

export function getProviderMeta(provider: string): ProviderMeta {
  return PAYMENT_PROVIDERS.find((p) => p.id === provider) ?? PAYMENT_PROVIDERS[4];
}

export function isPaymentProvider(value: string): value is PaymentProvider {
  return PAYMENT_PROVIDERS.some((p) => p.id === value);
}
