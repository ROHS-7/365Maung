import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type { ActivitiesResponse, Activity } from '@/types/api';

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    type: 'deposit',
    description: 'Auto deposit approved',
    amount: 50000,
    balance_after: 417000,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    type: 'bet',
    description: 'HDP bet placed — Man U vs Chelsea',
    amount: -5000,
    balance_after: 367000,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'bet_win',
    description: 'Bet settled — win',
    amount: 12000,
    balance_after: 379000,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    type: 'withdraw',
    description: 'Withdrawal request processed',
    amount: -20000,
    balance_after: 359000,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    type: 'login',
    description: 'Logged in from new device',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

function mockPage(page: number, perPage = 20): ActivitiesResponse {
  const total = MOCK_ACTIVITIES.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  return {
    activities: MOCK_ACTIVITIES.slice(start, start + perPage),
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  };
}

export async function fetchActivities(token: string, page = 1): Promise<ActivitiesResponse> {
  if (!API_BASE_URL) {
    return mockPage(page);
  }
  return apiRequest<ActivitiesResponse>(`/activities?page=${page}`, { token });
}
