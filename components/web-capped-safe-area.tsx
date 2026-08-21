import { useMemo, type ReactNode } from 'react';
import { Platform } from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

/** iOS Safari fullscreen reports large env(safe-area-inset-*) even when the
 *  status bar / home indicator already sit outside the page. Cap on web only. */
const WEB_TOP_CAP = 12;
const WEB_BOTTOM_CAP = 20;

export function WebCappedSafeArea({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const value = useMemo(() => {
    if (Platform.OS !== 'web') return insets;
    return {
      ...insets,
      top: Math.min(insets.top, WEB_TOP_CAP),
      bottom: Math.min(insets.bottom, WEB_BOTTOM_CAP),
    };
  }, [insets]);

  if (Platform.OS !== 'web') return children;

  return (
    <SafeAreaInsetsContext.Provider value={value}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}
