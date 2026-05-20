import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

// --- Mock user data ---
const USER = {
  username: 'မောင်မောင်',
  balance: '၃၆၇',
  phone: '09xxxxxxxx',
  cashOut: '88880001',
  cashCode: '114947',
};

const ANNOUNCEMENT =
  '0,000) ကျပ် အတိကများနှင်ပါသည်!! (ဘောဒီ အကောင် 5% ပါ) မောင်း — 0,000) ကျပ် အတိကများနှင်ပါသည်!! (ဘောဒီ အကောင် 5% ပါ) မောင်း';

// --- Menu items ---
const MENU = [
  { id: 'mix_parlay',  label: 'Mix Parlay',       icon: 'trophy',           bg: '#27AE60' },
  { id: 'hdp',         label: 'HDP&O/U',           icon: 'football',         bg: '#2980B9' },
  { id: 'score',       label: 'Score',             icon: 'stats-chart',      bg: '#E74C3C' },
  { id: 'bet_list',    label: 'Bet List',          icon: 'document-text',    bg: '#16A085' },
  { id: 'deposit',     label: 'Auto Deposit',      icon: 'arrow-down-circle',bg: '#E67E22' },
  { id: 'withdraw',    label: 'Withdraw',          icon: 'wallet',           bg: '#F39C12' },
  { id: 'rule',        label: 'Rule',              icon: 'book-outline',     bg: '#1ABC9C' },
  { id: 'change_pw',   label: 'Change Password',   icon: 'lock-closed',      bg: '#9B59B6' },
] as const;

// --- Scrolling ticker ---
function Ticker({ text }: { text: string }) {
  const x = useRef(new Animated.Value(0)).current;
  const [containerW, setContainerW] = useState(0);
  const [textW, setTextW] = useState(0);

  useEffect(() => {
    if (!containerW || !textW) return;
    x.setValue(containerW);
    Animated.loop(
      Animated.timing(x, {
        toValue: -textW,
        duration: (containerW + textW) * 28,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [containerW, textW]);

  return (
    <View
      style={styles.ticker}
      onLayout={e => setContainerW(e.nativeEvent.layout.width)}
    >
      <Ionicons name="megaphone-outline" size={14} color={Colors.brand.greenDark} style={{ marginRight: 6 }} />
      <View style={{ flex: 1, overflow: 'hidden', height: 20 }}>
        <Animated.Text
          style={[styles.tickerText, { transform: [{ translateX: x }], position: 'absolute', whiteSpace: 'nowrap' }]}
          onLayout={e => setTextW(e.nativeEvent.layout.width)}
          numberOfLines={1}
        >
          {text}
        </Animated.Text>
      </View>
    </View>
  );
}

// --- Profile card ---
function ProfileCard() {
  const [refreshing, setRefreshing] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;

  function handleRefresh() {
    setRefreshing(true);
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.linear }),
    ).start();
    setTimeout(() => { setRefreshing(false); spin.stopAnimation(); spin.setValue(0); }, 2000);
  }

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.profileCard}>
      {/* Avatar + username */}
      <View style={styles.profileLeft}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={Colors.brand.white} />
        </View>
        <Text style={styles.username} numberOfLines={1}>{USER.username}</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="refresh" size={14} color={Colors.brand.white} />
          </Animated.View>
          <Text style={styles.refreshText}>ငွေဆင်</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats */}
      <View style={styles.profileRight}>
        {[
          { label: 'Balance',   value: USER.balance },
          { label: 'Phone',     value: USER.phone },
          { label: 'Cash Out',  value: USER.cashOut },
          { label: 'Cash Code', value: USER.cashCode },
        ].map(item => (
          <View key={item.label} style={styles.statRow}>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statSep}>:</Text>
            <Text style={styles.statValue} numberOfLines={1}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- Menu grid item ---
function MenuItem({ item }: { item: typeof MENU[number] }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
      <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon as any} size={28} color="#fff" />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
}

// --- Home Screen ---
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerBet}>bet</Text>
        <Text style={styles.header365}>365</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ticker */}
        <Ticker text={ANNOUNCEMENT} />

        {/* Profile */}
        <ProfileCard />

        {/* Menu */}
        <View style={styles.menuGrid}>
          {MENU.map(item => <MenuItem key={item.id} item={item} />)}
        </View>

        {/* Ucenter */}
        <TouchableOpacity style={styles.ucenterBtn} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={20} color={Colors.light.textSecondary} />
          <Text style={styles.ucenterText}>Ucenter</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={() => router.replace('/login')}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.brand.greenDark,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.brand.greenDark,
  },
  headerBet: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.white,
    letterSpacing: -0.5,
  },
  header365: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.gold,
    letterSpacing: -0.5,
  },

  scroll: { flex: 1, backgroundColor: Colors.brand.offWhite },
  scrollContent: { paddingBottom: Spacing.xxl },

  // Ticker
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  tickerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.brand.greenDark,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    backgroundColor: Colors.brand.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.md,
  },
  profileLeft: {
    alignItems: 'center',
    width: 90,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.brand.greenMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  username: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  refreshText: {
    fontSize: FontSize.xs,
    color: Colors.brand.white,
    fontWeight: FontWeight.semibold,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.md,
  },
  profileRight: {
    flex: 1,
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    width: 72,
  },
  statSep: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    flex: 1,
  },

  // Menu Grid
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  menuItem: {
    width: '48%',
    backgroundColor: Colors.brand.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    textAlign: 'center',
  },

  // Ucenter
  ucenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  ucenterText: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    fontWeight: FontWeight.medium,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C0392B',
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    color: Colors.brand.white,
    fontWeight: FontWeight.bold,
  },
});
