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

// ─── Data ─────────────────────────────────────────────────────────────────────

const ANNOUNCEMENT = '၆ ပါ) မောင်းများကို အနည်းဆုံး (500) ကျပ်မှ အများဆုံး (20,000) ကျပ် ✦ ';

const USER = {
  username: 'မောင်မောင်',
  balance: '၃၆၇',
  phone: '0',
  cashOut: '88880001',
  cashCode: '114947',
};

const MENU = [
  { id: 'mix',      label: 'Mix Parlay',       icon: 'trophy',            bg: '#27AE60' },
  { id: 'hdp',      label: 'HDP&O/U',          icon: 'football',          bg: '#2980B9' },
  { id: 'score',    label: 'Score',            icon: 'stats-chart',       bg: '#E74C3C' },
  { id: 'betlist',  label: 'Bet List',         icon: 'document-text',     bg: '#16A085' },
  { id: 'deposit',  label: 'Auto Deposit',     icon: 'arrow-down-circle', bg: '#E67E22' },
  { id: 'withdraw', label: 'Withdraw',         icon: 'wallet',            bg: '#F39C12' },
  { id: 'rule',     label: 'Rule',             icon: 'book-outline',      bg: '#1ABC9C' },
  { id: 'pw',       label: 'Change Password',  icon: 'lock-closed',       bg: '#9B59B6' },
] as const;

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker({ text }: { text: string }) {
  const x = useRef(new Animated.Value(0)).current;
  const [cw, setCw] = useState(0);
  const [tw, setTw] = useState(0);

  useEffect(() => {
    if (!cw || !tw) return;
    x.setValue(cw);
    Animated.loop(
      Animated.timing(x, {
        toValue: -tw,
        duration: (cw + tw) * 26,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [cw, tw]);

  return (
    <View style={s.ticker} onLayout={e => setCw(e.nativeEvent.layout.width)}>
      <Ionicons name="megaphone-outline" size={13} color={Colors.brand.greenDark} style={{ marginRight: 6 }} />
      <View style={{ flex: 1, overflow: 'hidden', height: 18 }}>
        <Animated.Text
          style={[s.tickerText, { transform: [{ translateX: x }], position: 'absolute' }]}
          onLayout={e => setTw(e.nativeEvent.layout.width)}
          numberOfLines={1}
        >
          {text}
        </Animated.Text>
      </View>
    </View>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard() {
  const spin = useRef(new Animated.Value(0)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  function handleRefresh() {
    anim.current?.stop();
    spin.setValue(0);
    anim.current = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true }),
    );
    anim.current.start();
    setTimeout(() => { anim.current?.stop(); spin.setValue(0); }, 1800);
  }

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={s.profileCard}>
      {/* Left — avatar + name + refresh */}
      <View style={s.profileLeft}>
        <View style={s.avatar}>
          <Ionicons name="person" size={30} color="#fff" />
        </View>
        <Text style={s.username} numberOfLines={1}>{USER.username}</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={handleRefresh} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="refresh" size={12} color="#fff" />
          </Animated.View>
          <Text style={s.refreshLabel}>ငွေဆင်မောင်း</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={s.vDivider} />

      {/* Right — stats */}
      <View style={s.profileRight}>
        {[
          { label: 'Username',  value: USER.username },
          { label: 'Balance',   value: USER.balance },
          { label: 'Phone',     value: USER.phone },
          { label: 'Cash out',  value: USER.cashOut },
          { label: 'Cash Code', value: USER.cashCode },
        ].map(r => (
          <View key={r.label} style={s.statRow}>
            <Text style={s.statLabel}>{r.label}</Text>
            <Text style={s.statColon}> : </Text>
            <Text style={s.statValue} numberOfLines={1}>{r.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Menu Card ────────────────────────────────────────────────────────────────

function MenuCard({ item }: { item: typeof MENU[number] }) {
  return (
    <TouchableOpacity style={s.menuCard} activeOpacity={0.78}>
      <View style={[s.menuCardBg, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon as any} size={34} color="rgba(255,255,255,0.92)" />
      </View>
      <Text style={s.menuLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  return (
    <SafeAreaView style={s.root} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLogo}>
          <Text style={s.logoBet}>bet</Text>
          <Text style={s.logo365}>365</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="person-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ticker */}
        <Ticker text={ANNOUNCEMENT} />

        {/* Profile */}
        <ProfileCard />

        {/* Menu grid */}
        <View style={s.menuGrid}>
          {MENU.map(item => <MenuCard key={item.id} item={item} />)}
        </View>

        {/* Ucenter */}
        <TouchableOpacity style={s.ucenterBtn} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={20} color={Colors.light.textSecondary} />
          <Text style={s.ucenterLabel}>Ucenter</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={s.logoutBtn}
          activeOpacity={0.8}
          onPress={() => router.replace('/login')}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={s.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.brand.greenDark },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'baseline' },
  logoBet:    { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', letterSpacing: -0.5 },
  logo365:    { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.brand.gold, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 2 },
  headerBtn: { padding: 6 },

  // Scroll
  scroll: { flex: 1, backgroundColor: '#F2F5F3' },
  scrollContent: { paddingBottom: 36 },

  // Ticker
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  tickerText: { fontSize: 12, fontWeight: FontWeight.medium, color: Colors.brand.greenDark },

  // Profile card
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.md,
  },
  profileLeft: { alignItems: 'center', width: 88 },
  avatar: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.brand.greenMid,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  username: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold,
    color: Colors.light.text, marginBottom: 8, textAlign: 'center',
  },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  refreshLabel: { fontSize: 10, color: '#fff', fontWeight: FontWeight.semibold },
  vDivider: {
    width: 1, alignSelf: 'stretch',
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.md,
  },
  profileRight: { flex: 1, gap: 5 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statLabel: { fontSize: FontSize.sm, color: Colors.light.textSecondary, width: 70 },
  statColon: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  statValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.text, flex: 1 },

  // Menu grid
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  menuCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuCardBg: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
  },

  // Ucenter
  ucenterBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginTop: Spacing.lg, paddingVertical: Spacing.sm,
  },
  ucenterLabel: { fontSize: FontSize.md, color: Colors.light.textSecondary, fontWeight: FontWeight.medium },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#C0392B',
    marginHorizontal: Spacing.xl, marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md, gap: Spacing.sm,
    ...Shadow.sm,
  },
  logoutLabel: { fontSize: FontSize.md, color: '#fff', fontWeight: FontWeight.bold },
});
