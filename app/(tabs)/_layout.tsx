import { TouchableOpacity, View, StyleSheet, Platform, type GestureResponderEvent } from 'react-native';
import { Text } from '@/components/app-text';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontWeight } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { visibleTabBarStyle } from '@/hooks/use-hide-parent-tab-bar';

function LiveTabButton({ onPress }: { onPress?: (e: GestureResponderEvent) => void }) {
  const { tr, lang } = useLanguage();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.liveWrap}>
      <View style={s.liveDiamond}>
        <View style={s.liveDiamondInner}>
          <Ionicons name="radio" size={22} color="#fff" />
        </View>
      </View>
      <Text
        style={[s.liveLabel, lang === 'my' && s.liveLabelMy]}
        numberOfLines={lang === 'my' ? 2 : 1}
      >
        {tr.tabLive}
      </Text>
    </TouchableOpacity>
  );
}

function TabLabel({ children, color }: { children: string; color: string }) {
  const { lang } = useLanguage();
  return (
    <Text
      style={[s.tabLabel, lang === 'my' && s.tabLabelMy, { color }]}
      numberOfLines={lang === 'my' ? 2 : 1}
    >
      {children}
    </Text>
  );
}

export default function TabLayout() {
  const { tr, lang } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.icon,
        tabBarStyle: visibleTabBarStyle(insets.bottom, lang),
        tabBarItemStyle: s.tabItem,
        tabBarLabelStyle: s.tabLabel,
        tabBarLabel: ({ children, color }) => (
          <TabLabel color={color}>{children}</TabLabel>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tr.tabHome,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bets"
        options={{
          title: tr.tabBet,
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: '',
          freezeOnBlur: true,
          tabBarButton: (props) => <LiveTabButton onPress={props.onPress ?? undefined} />,
        }}
      />
      <Tabs.Screen
        name="scores"
        options={{
          title: tr.tabScores,
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: tr.tabAccount,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="maung"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="hdp"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="maung-fh"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="hdp-fh"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="sone-ma"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="one-x-two"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="correct-score"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="esports"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="fight"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="esports-scores"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen
        name="fight-scores"
        options={{ href: null, tabBarStyle: { display: 'none' }, freezeOnBlur: true }}
      />
      <Tabs.Screen name="rule"            options={{ href: null, freezeOnBlur: true }} />
      <Tabs.Screen name="change-password" options={{ href: null, freezeOnBlur: true }} />
      <Tabs.Screen name="auto-deposit"    options={{ href: null, freezeOnBlur: true }} />
      <Tabs.Screen name="news"            options={{ href: null, freezeOnBlur: true }} />
      <Tabs.Screen name="activities"      options={{ href: null, freezeOnBlur: true }} />
      <Tabs.Screen name="coin-transactions" options={{ href: null, freezeOnBlur: true }} />
      <Tabs.Screen name="payment-accounts" options={{ href: null, freezeOnBlur: true }} />
      <Tabs.Screen name="withdraw"          options={{ href: null, freezeOnBlur: true }} />
      <Tabs.Screen name="coin-requests"     options={{ href: null, freezeOnBlur: true }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabItem: {
    paddingTop: 4,
    height: '100%',
    overflow: 'visible',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.icon,
    marginTop: 2,
    includeFontPadding: true,
    textAlign: 'center',
  },
  tabLabelMy: {
    marginTop: 0,
  },
  liveWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'web' ? 0 : 12,
    flex: 1,
    ...(Platform.OS === 'web' ? { transform: [{ translateY: -8 }] } : {}),
  },
  liveDiamond: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.brand.greenButton, transform: [{ rotate: '45deg' }],
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4, marginTop: -20,
    shadowColor: Colors.brand.greenButton, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8, elevation: 8,
  },
  liveDiamondInner: { transform: [{ rotate: '-45deg' }], alignItems: 'center', justifyContent: 'center' },
  liveLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenButton,
    textAlign: 'center',
  },
  liveLabelMy: {
    marginTop: -2,
  },
});
