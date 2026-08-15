import axios, { isAxiosError } from 'axios';
import { API_BASE_URL } from '@/constants/config';
import { unwrapApiPayload } from '@/lib/payload-crypto';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
};

type ErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

function messageFromPayload(payload: ErrorPayload | undefined, fallback: string): string {
  if (!payload) return fallback;
  if (payload.errors) {
    const first = Object.values(payload.errors).flat()[0];
    if (first) return first;
  }
  return payload.message ?? fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body } = options;

  try {
    const { data } = await axiosClient.request<unknown>({
      url: path,
      method,
      data: body,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    try {
      return unwrapApiPayload<T>(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to decrypt API payload';
      throw new ApiError(message, 0);
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const payload = error.response?.data as ErrorPayload | undefined;
      const message = messageFromPayload(payload, error.message || `Request failed (${status})`);
      throw new ApiError(message, status);
    }
    throw error;
  }
}
