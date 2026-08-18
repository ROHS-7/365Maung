import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth';

const AUTH_ROUTES = new Set([
  'mix',
  'hdp',
  'mix-fh',
  'hdp-fh',
  'esports',
  'esports-score',
  'fight',
  'fight-score',
  'betlist',
  'deposit',
  'withdraw',
  'pw',
]);

export function useAuthGate() {
  const { isAuthenticated } = useAuth();

  function navigate(menuId: string, route?: string) {
    if (AUTH_ROUTES.has(menuId) && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (route) {
      router.push(route as never);
    }
  }

  function requireAuth(): boolean {
    if (isAuthenticated) return true;
    router.push('/login');
    return false;
  }

  return { isAuthenticated, navigate, requireAuth };
}
