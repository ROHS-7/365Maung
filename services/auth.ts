import { API_BASE_URL } from '@/constants/config';
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  MeUser,
  RegisterPayload,
  RegisterResponse,
} from '@/types/api';
import { mapApiUser } from '@/types/api';
import { apiRequest } from '@/lib/api-client';

const MOCK_USER: MeUser = {
  id: 1,
  username: 'မောင်မောင်',
  nickname: 'မောင်မောင်',
  balance: 367000,
  phone: '09',
  cash_out_id: '88880001',
  cash_code: '114947',
};

export type AuthSession = {
  token: string;
  user: MeUser;
};

export async function loginRequest(username: string, password: string): Promise<AuthSession> {
  if (!API_BASE_URL) {
    if (!username.trim() || !password.trim()) {
      throw new Error('Username and password are required');
    }
    return { token: 'mock-dev-token', user: { ...MOCK_USER, username: username.trim() } };
  }
  const data = await apiRequest<LoginResponse>('/login', {
    method: 'POST',
    body: { username: username.trim(), password },
  });
  return { token: data.token, user: mapApiUser(data.user) };
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthSession> {
  if (!API_BASE_URL) {
    if (!payload.username.trim() || !payload.password.trim()) {
      throw new Error('Username and password are required');
    }
    if (payload.password !== payload.password_confirmation) {
      throw new Error('Password confirmation does not match');
    }
    return {
      token: 'mock-dev-token',
      user: {
        id: Date.now(),
        username: payload.username.trim(),
        nickname: payload.nickname?.trim() || null,
        phone: payload.phone?.trim() || null,
        balance: 0,
        role: 4,
      },
    };
  }

  const body: RegisterPayload = {
    username: payload.username.trim(),
    password: payload.password,
    password_confirmation: payload.password_confirmation,
  };
  if (payload.nickname?.trim()) body.nickname = payload.nickname.trim();
  if (payload.phone?.trim()) body.phone = payload.phone.trim();

  const data = await apiRequest<RegisterResponse>('/register', {
    method: 'POST',
    body,
  });
  return { token: data.token, user: mapApiUser(data.user) };
}

export async function fetchMe(token: string): Promise<MeUser> {
  if (!API_BASE_URL) {
    return MOCK_USER;
  }
  const data = await apiRequest<MeResponse>('/me', { token });
  return mapApiUser(data.user);
}

export async function logoutRequest(token: string): Promise<void> {
  if (!API_BASE_URL) return;
  await apiRequest<LogoutResponse>('/logout', {
    method: 'POST',
    token,
  });
}

export async function changePasswordRequest(
  token: string,
  payload: ChangePasswordPayload,
): Promise<void> {
  if (!API_BASE_URL) {
    if (payload.password !== payload.password_confirmation) {
      throw new Error('Password confirmation does not match');
    }
    return;
  }
  await apiRequest<ChangePasswordResponse>('/me/password', {
    method: 'PUT',
    token,
    body: payload,
  });
}
