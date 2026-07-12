import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type { CoinTransaction, CoinTransactionsResponse } from '@/types/api';

const MOCK_TRANSACTIONS: CoinTransaction[] = [
  {
    id: 1,
    type: 'add',
    amount: 50000,
    direction: 'received',
    from_user: 'system',
    to_user: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    type: 'deduct',
    amount: 10000,
    direction: 'sent',
    from_user: null,
    to_user: 'agent007',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'add',
    amount: 25000,
    direction: 'received',
    from_user: { username: 'မောင်မောင်' },
    to_user: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    type: 'deduct',
    amount: 5000,
    direction: 'sent',
    from_user: null,
    to_user: { username: 'cashier01' },
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

function mockPage(page: number, perPage = 15): CoinTransactionsResponse {
  const total = MOCK_TRANSACTIONS.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  return {
    transactions: MOCK_TRANSACTIONS.slice(start, start + perPage),
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  };
}

export async function fetchCoinTransactions(
  token: string,
  page = 1,
): Promise<CoinTransactionsResponse> {
  if (!API_BASE_URL) {
    return mockPage(page);
  }
  return apiRequest<CoinTransactionsResponse>(`/coins/transactions?page=${page}`, { token });
}
