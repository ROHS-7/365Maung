import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AUTH_TOKEN_KEY } from '@/constants/config';
import { ApiError } from '@/lib/api-client';
import { fetchMe, loginRequest, logoutRequest, registerRequest } from '@/services/auth';
import type { MeUser, RegisterPayload } from '@/types/api';
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '@/utils/secure-storage';

type AuthContextValue = {
  token: string | null;
  user: MeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readToken() {
  return getSecureItem(AUTH_TOKEN_KEY);
}

async function writeToken(token: string | null) {
  if (token) {
    await setSecureItem(AUTH_TOKEN_KEY, token);
  } else {
    await deleteSecureItem(AUTH_TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<MeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const applySession = useCallback(async (nextToken: string, nextUser: MeUser) => {
    await writeToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const loadUser = useCallback(async (activeToken: string) => {
    const me = await fetchMe(activeToken);
    setUser(me);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await readToken();
      if (cancelled) return;

      if (!stored) {
        setIsLoading(false);
        return;
      }

      setToken(stored);
      try {
        await loadUser(stored);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          await writeToken(null);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  const login = useCallback(async (username: string, password: string) => {
    const session = await loginRequest(username, password);
    await applySession(session.token, session.user);
  }, [applySession]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const session = await registerRequest(payload);
    await applySession(session.token, session.user);
  }, [applySession]);

  const clearSession = useCallback(async () => {
    await writeToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    const activeToken = token ?? (await readToken());
    if (activeToken) {
      try {
        await logoutRequest(activeToken);
      } catch {
        // Always clear local session even if server logout fails (offline, expired token, etc.)
      }
    }
    await clearSession();
  }, [token, clearSession]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      await loadUser(token);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await clearSession();
      }
      throw e;
    } finally {
      setIsRefreshing(false);
    }
  }, [token, loadUser, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isLoading,
      isRefreshing,
      login,
      register,
      logout,
      refreshUser,
    }),
    [token, user, isLoading, isRefreshing, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
