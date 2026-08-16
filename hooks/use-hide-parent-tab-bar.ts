import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

const HIDDEN_TAB_BAR = { display: 'none' as const };
const TAB_BAR_BODY = 84;
const WEB_EXTRA = Platform.OS === 'web' ? 8 : 0;

export function visibleTabBarStyle(insetsBottom: number) {
  return {
    backgroundColor: '#fff',
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
    paddingTop: 8,
    height: TAB_BAR_BODY + insetsBottom + WEB_EXTRA,
    paddingBottom: 14 + insetsBottom + WEB_EXTRA,
    overflow: 'visible' as const,
  };
}

/** Hides the root tab bar while focused (betting screens, detail readers). */
export function useHideParentTabBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const restore = { tabBarStyle: visibleTabBarStyle(insets.bottom) };
      const hide = { tabBarStyle: HIDDEN_TAB_BAR };

      // Direct Tabs.Screen (maung, hdp, …)
      navigation.setOptions(hide);

      // Nested under a tab stack (bets/[id], news/[id], …)
      const parent = navigation.getParent();
      parent?.setOptions(hide);

      return () => {
        navigation.setOptions(restore);
        parent?.setOptions(restore);
      };
    }, [navigation, insets.bottom]),
  );
}
