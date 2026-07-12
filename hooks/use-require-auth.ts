import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth';

/** Redirect to login when screen requires authentication. */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}
