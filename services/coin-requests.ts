import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type {
  CoinRequest,
  CoinRequestPayload,
  CoinRequestResponse,
  CoinRequestsResponse,
  PaginationMeta,
} from '@/types/api';

const MOCK_AGENT = { id: 3, username: 'agent', phone: '09100000003' };
const MOCK_USER = {
  id: 5,
  username: 'user',
  nickname: 'Player',
  phone: '09100000005',
  role: 4,
};
const MOCK_PAYMENT_ACCOUNT = {
  id: 1,
  provider: 'kbz_pay',
  account_name: 'Demo Player',
  account_number: '09100000005',
};

const MOCK_REQUESTS: CoinRequest[] = [
  {
    id: 3,
    type: 'withdraw',
    source: 'request',
    coin_transaction_id: null,
    amount: 5000,
    balance_before: null,
    balance_after: null,
    status: 'pending',
    note: 'Demo pending withdraw',
    reject_reason: null,
    processed_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: MOCK_USER,
    agent: MOCK_AGENT,
    payment_account: MOCK_PAYMENT_ACCOUNT,
    processed_by: null,
  },
  {
    id: 1,
    type: 'deposit',
    source: 'request',
    coin_transaction_id: null,
    amount: 10000,
    balance_before: 85000,
    balance_after: 95000,
    status: 'accepted',
    note: 'Demo accepted deposit',
    reject_reason: null,
    processed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    user: MOCK_USER,
    agent: MOCK_AGENT,
    payment_account: MOCK_PAYMENT_ACCOUNT,
    processed_by: { id: 1, username: 'admin', phone: '09100000001' },
  },
  {
    id: 4,
    type: 'withdraw',
    source: 'request',
    coin_transaction_id: null,
    amount: 3000,
    balance_before: 88000,
    balance_after: 85000,
    status: 'rejected',
    note: 'Demo rejected withdraw',
    reject_reason: 'Insufficient verification',
    processed_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    user: MOCK_USER,
    agent: MOCK_AGENT,
    payment_account: MOCK_PAYMENT_ACCOUNT,
    processed_by: MOCK_AGENT,
  },
  {
    id: 6,
    type: 'deposit',
    source: 'direct',
    coin_transaction_id: 3,
    amount: 50000,
    balance_before: 35000,
    balance_after: 85000,
    status: 'accepted',
    note: 'Demo welcome bonus',
    reject_reason: null,
    processed_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    user: MOCK_USER,
    agent: MOCK_AGENT,
    payment_account: null,
    processed_by: MOCK_AGENT,
  },
];

function mockPage(page: number, perPage = 15): CoinRequestsResponse {
  const total = MOCK_REQUESTS.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  return {
    coin_requests: MOCK_REQUESTS.slice(start, start + perPage),
    meta: { current_page: page, last_page: lastPage, per_page: perPage, total },
  };
}

export async function fetchCoinRequests(
  token: string,
  page = 1,
): Promise<{ items: CoinRequest[]; meta: PaginationMeta }> {
  if (!API_BASE_URL) {
    const data = mockPage(page);
    return { items: data.coin_requests, meta: data.meta };
  }
  const data = await apiRequest<CoinRequestsResponse>(`/coin-requests?page=${page}`, { token });
  return { items: data.coin_requests, meta: data.meta };
}

function mockSubmit(type: 'deposit' | 'withdraw', payload: CoinRequestPayload): CoinRequest {
  const req: CoinRequest = {
    id: Date.now(),
    type,
    source: 'request',
    coin_transaction_id: null,
    amount: payload.amount,
    balance_before: null,
    balance_after: null,
    status: 'pending',
    note: payload.note ?? null,
    reject_reason: null,
    processed_at: null,
    created_at: new Date().toISOString(),
    user: MOCK_USER,
    agent: MOCK_AGENT,
    payment_account: type === 'withdraw' ? MOCK_PAYMENT_ACCOUNT : null,
    processed_by: null,
  };
  MOCK_REQUESTS.unshift(req);
  return req;
}

export async function submitDepositRequest(
  token: string,
  payload: CoinRequestPayload,
): Promise<CoinRequest> {
  if (!API_BASE_URL) return mockSubmit('deposit', payload);
  const data = await apiRequest<CoinRequestResponse>('/coin-requests/deposit', {
    method: 'POST',
    token,
    body: payload,
  });
  return data.coin_request;
}

export async function submitWithdrawRequest(
  token: string,
  payload: CoinRequestPayload,
): Promise<CoinRequest> {
  if (!API_BASE_URL) return mockSubmit('withdraw', payload);
  const data = await apiRequest<CoinRequestResponse>('/coin-requests/withdraw', {
    method: 'POST',
    token,
    body: payload,
  });
  return data.coin_request;
}
