import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type { DepositPaymentAccountsResponse } from '@/types/api';

const MOCK_DEPOSIT: DepositPaymentAccountsResponse = {
  agent: { id: 1, username: 'agent01', nickname: 'Agent One', phone: '09' },
  payment_accounts: [
    {
      id: 101,
      provider: 'kbz_pay',
      account_name: 'Agent KBZ',
      account_number: '09970001111',
      is_bound: false,
      is_enabled: true,
    },
    {
      id: 102,
      provider: 'wave_pay',
      account_name: 'Agent Wave',
      account_number: '09770002222',
      is_bound: false,
      is_enabled: true,
    },
  ],
};

export async function fetchDepositPaymentAccounts(
  token: string,
): Promise<DepositPaymentAccountsResponse> {
  if (!API_BASE_URL) return MOCK_DEPOSIT;
  return apiRequest<DepositPaymentAccountsResponse>('/deposit/payment-accounts', { token });
}
