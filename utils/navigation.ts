import { router } from 'expo-router';

/** Go back when history exists; otherwise land on a safe fallback (home). */
export function safeBack(fallback: string = '/') {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback as never);
}
