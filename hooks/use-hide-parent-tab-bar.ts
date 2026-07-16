import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

const HIDDEN_TAB_BAR = { display: 'none' as const };

function visibleTabBarStyle(insetsBottom: number) {
  return {
    backgroundColor: '#fff',
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
    paddingTop: 6,
    height: 62 + insetsBottom,
    paddingBottom: 8 + insetsBottom,
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
