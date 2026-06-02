import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

/** Hides the root tab bar while focused (e.g. news article reader). */
export function useHideParentTabBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const tabNav = navigation.getParent();
      if (!tabNav) return;

      tabNav.setOptions({ tabBarStyle: { display: 'none' } });

      return () => {
        tabNav.setOptions({
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: Colors.light.border,
            borderTopWidth: 1,
            paddingTop: 6,
            height: 62 + insets.bottom,
            paddingBottom: 8 + insets.bottom,
          },
        });
      };
    }, [navigation, insets.bottom]),
  );
}
