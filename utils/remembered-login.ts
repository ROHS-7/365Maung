import { REMEMBERED_LOGIN_KEY } from '@/constants/config';
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '@/utils/secure-storage';

export type RememberedLogin = {
  username: string;
  password: string;
};

export async function loadRememberedLogin(): Promise<RememberedLogin | null> {
  const raw = await getSecureItem(REMEMBERED_LOGIN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RememberedLogin;
    if (!parsed.username || typeof parsed.password !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveRememberedLogin(username: string, password: string): Promise<void> {
  await setSecureItem(
    REMEMBERED_LOGIN_KEY,
    JSON.stringify({ username, password }),
  );
}

export async function clearRememberedLogin(): Promise<void> {
  await deleteSecureItem(REMEMBERED_LOGIN_KEY);
}
