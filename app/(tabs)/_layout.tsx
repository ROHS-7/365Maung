import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontWeight } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';

function LiveTabButton({ onPress }: { onPress?: () => void }) {
  const { tr } = useLanguage();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.liveWrap}>
      <View style={s.liveDiamond}>
        <View style={s.liveDiamondInner}>
          <Ionicons name="radio" size={22} color="#fff" />
        </View>
      </View>
      <Text style={s.liveLabel}>{tr.tabLive}</Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { tr } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.greenButton,
        tabBarInactiveTintColor: '#A0ADB5',
        tabBarStyle: [s.tabBar, { height: 62 + insets.bottom, paddingBottom: 8 + insets.bottom }],
        tabBarLabelStyle: s.tabLabel,
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
        name="esports-scores"
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
  tabBar: {
    backgroundColor: '#fff', borderTopColor: Colors.light.border,
    borderTopWidth: 1, paddingTop: 6,
  },
  tabLabel: { fontSize: 11, fontWeight: FontWeight.semibold },
  liveWrap: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8, flex: 1 },
  liveDiamond: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.brand.greenButton, transform: [{ rotate: '45deg' }],
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4, marginTop: -20,
    shadowColor: Colors.brand.greenButton, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8, elevation: 8,
  },
  liveDiamondInner: { transform: [{ rotate: '-45deg' }], alignItems: 'center', justifyContent: 'center' },
  liveLabel: { fontSize: 11, fontWeight: FontWeight.semibold, color: Colors.brand.greenButton },
});
