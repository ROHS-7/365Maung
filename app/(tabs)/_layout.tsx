import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontWeight } from '@/constants/theme';

function LiveTabButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.liveWrap}>
      <View style={s.liveDiamond}>
        <View style={s.liveDiamondInner}>
          <Ionicons name="radio" size={22} color="#fff" />
        </View>
      </View>
      <Text style={s.liveLabel}>Live</Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.greenButton,
        tabBarInactiveTintColor: '#A0ADB5',
        tabBarStyle: s.tabBar,
        tabBarLabelStyle: s.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bets"
        options={{
          title: 'Bet',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: '',
          tabBarButton: (props) => <LiveTabButton onPress={props.onPress ?? undefined} />,
        }}
      />
      <Tabs.Screen
        name="scores"
        options={{
          title: 'Scores',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
  },

  // Center "Live" diamond button
  liveWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    flex: 1,
  },
  liveDiamond: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.brand.greenButton,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: -20,
    shadowColor: Colors.brand.greenButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  liveDiamondInner: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenButton,
  },
});
