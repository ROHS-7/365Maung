import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type {
  CreatePaymentAccountPayload,
  PaymentAccount,
  PaymentAccountsResponse,
  UpdatePaymentAccountPayload,
} from '@/types/api';

const MOCK_ACCOUNTS: PaymentAccount[] = [
  {
    id: 1,
    provider: 'kbz_pay',
    account_name: 'Mg Mg',
    account_number: '09978654321',
    is_bound: true,
    is_enabled: true,
    created_at: new Date().toISOString(),
  },
];

export async function fetchPaymentAccounts(token: string): Promise<PaymentAccount[]> {
  if (!API_BASE_URL) return [...MOCK_ACCOUNTS];
  const data = await apiRequest<PaymentAccountsResponse>('/payment-accounts', { token });
  return data.payment_accounts;
}

export async function createPaymentAccount(
  token: string,
  payload: CreatePaymentAccountPayload,
): Promise<PaymentAccount> {
  if (!API_BASE_URL) {
    const account: PaymentAccount = {
      id: Date.now(),
      ...payload,
      is_bound: MOCK_ACCOUNTS.length === 0,
      is_enabled: true,
      created_at: new Date().toISOString(),
    };
    if (account.is_bound) MOCK_ACCOUNTS.forEach((a) => { a.is_bound = false; });
    MOCK_ACCOUNTS.push(account);
    return account;
  }
  const data = await apiRequest<{ payment_account: PaymentAccount }>('/payment-accounts', {
    method: 'POST',
    token,
    body: payload,
  });
  return data.payment_account;
}

export async function updatePaymentAccount(
  token: string,
  id: number,
  payload: UpdatePaymentAccountPayload,
): Promise<PaymentAccount> {
  if (!API_BASE_URL) {
    const idx = MOCK_ACCOUNTS.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error('Account not found');
    MOCK_ACCOUNTS[idx] = { ...MOCK_ACCOUNTS[idx], ...payload };
    return MOCK_ACCOUNTS[idx];
  }
  const data = await apiRequest<{ payment_account: PaymentAccount }>(
    `/payment-accounts/${id}`,
    { method: 'PUT', token, body: payload },
  );
  return data.payment_account;
}

export async function deletePaymentAccount(token: string, id: number): Promise<void> {
  if (!API_BASE_URL) {
    const idx = MOCK_ACCOUNTS.findIndex((a) => a.id === id);
    if (idx >= 0) MOCK_ACCOUNTS.splice(idx, 1);
    return;
  }
  await apiRequest(`/payment-accounts/${id}`, { method: 'DELETE', token });
}

export async function bindPaymentAccount(token: string, id: number): Promise<void> {
  if (!API_BASE_URL) {
    MOCK_ACCOUNTS.forEach((a) => { a.is_bound = a.id === id; });
    return;
  }
  await apiRequest(`/payment-accounts/${id}/bind`, { method: 'POST', token });
}
