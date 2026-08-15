import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type { ActivitiesResponse, Activity, PaginationMeta } from '@/types/api';

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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readActivities(raw: unknown): Activity[] {
  if (Array.isArray(raw)) return raw as Activity[];
  const obj = asRecord(raw);
  if (Array.isArray(obj.activities)) return obj.activities as Activity[];
  if (Array.isArray(obj.data)) return obj.data as Activity[];
  return [];
}

function readPaginationMeta(raw: unknown, itemCount: number): PaginationMeta {
  const obj = asRecord(raw);
  const nested = obj.meta && typeof obj.meta === 'object' ? asRecord(obj.meta) : {};
  const current = Number(nested.current_page ?? obj.current_page);
  const last = Number(nested.last_page ?? obj.last_page);
  const per = Number(nested.per_page ?? obj.per_page);
  const total = Number(nested.total ?? obj.total);
  const hasPagination =
    Number.isFinite(current) &&
    Number.isFinite(last) &&
    current >= 1 &&
    last >= 1;

  if (!hasPagination) {
    return {
      current_page: 1,
      last_page: 1,
      per_page: itemCount,
      total: itemCount,
    };
  }

  return {
    current_page: current,
    last_page: last,
    per_page: Number.isFinite(per) ? per : itemCount,
    total: Number.isFinite(total) ? total : itemCount,
  };
}

export function parseActivitiesResponse(raw: unknown): ActivitiesResponse {
  const activities = readActivities(raw);
  return {
    activities,
    meta: readPaginationMeta(raw, activities.length),
  };
}

function activityDay(iso: string): string {
  return iso.slice(0, 10);
}

function filterMockActivities(
  startDate?: string | null,
  endDate?: string | null,
): Activity[] {
  return MOCK_ACTIVITIES.filter((item) => {
    const day = activityDay(item.created_at);
    if (startDate && day < startDate) return false;
    if (endDate && day > endDate) return false;
    return true;
  });
}

function mockPage(
  page: number,
  perPage = 20,
  startDate?: string | null,
  endDate?: string | null,
): ActivitiesResponse {
  const filtered = filterMockActivities(startDate, endDate);
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  return {
    activities: filtered.slice(start, start + perPage),
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  };
}

export type ActivitiesQuery = {
  page?: number;
  startDate?: string | null;
  endDate?: string | null;
};

export async function fetchActivities(
  token: string,
  query: ActivitiesQuery = {},
): Promise<ActivitiesResponse> {
  const page = query.page ?? 1;
  if (!API_BASE_URL) {
    return mockPage(page, 20, query.startDate, query.endDate);
  }
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (query.startDate) params.set('start_date', query.startDate);
  if (query.endDate) params.set('end_date', query.endDate);
  const raw = await apiRequest<unknown>(`/activities?${params.toString()}`, { token });
  return parseActivitiesResponse(raw);
}
