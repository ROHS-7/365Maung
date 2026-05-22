import { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';


const USER = { username: 'မောင်မောင်', balance: '၃၆၇', phone: '0', cashOut: '88880001', cashCode: '114947' };

const MENU_ROUTES: Record<string, string> = { rule: '/(tabs)/rule', pw: '/(tabs)/change-password', deposit: '/(tabs)/auto-deposit', score: '/(tabs)/scores', mix: '/(tabs)/maung', hdp: '/(tabs)/hdp', betlist: '/(tabs)/bet-list' };

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker({ text }: { text: string }) {
  const x = useRef(new Animated.Value(0)).current;
  const [cw, setCw] = useState(0);
  const [tw, setTw] = useState(0);

  useEffect(() => {
    if (!cw || !tw) return;
    x.setValue(cw);
    Animated.loop(
      Animated.timing(x, { toValue: -tw, duration: (cw + tw) * 26, easing: Easing.linear, useNativeDriver: true }),
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
  const { tr } = useLanguage();
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
    <View style={s.card}>
      <View style={s.cardCircle1} />
      <View style={s.cardCircle2} />

      <View style={s.cardTop}>
        <View style={s.cardAvatar}>
          <Ionicons name="person" size={22} color={Colors.brand.greenMid} />
        </View>
        <Text style={s.cardUsername}>{USER.username}</Text>
        <TouchableOpacity onPress={handleRefresh} style={s.cardRefresh} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="refresh-outline" size={18} color="rgba(255,255,255,0.8)" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={s.cardBalanceRow}>
        <Text style={s.cardBalanceLabel}>{tr.profileBalance}</Text>
        <Text style={s.cardBalanceValue}>{USER.balance} {tr.currencyUnit}</Text>
      </View>

      <View style={s.cardDivider} />

      <View style={s.cardStats}>
        {([
          { key: 'profilePhone',    value: USER.phone },
          { key: 'profileCashOut',  value: USER.cashOut },
          { key: 'profileCashCode', value: USER.cashCode },
        ] as const).map((item, i) => (
          <View key={item.key} style={[s.cardStat, i > 0 && s.cardStatBorder]}>
            <Text style={s.cardStatLabel}>{tr[item.key]}</Text>
            <Text style={s.cardStatValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────

type MenuEntry = { id: string; labelKey: string; icon: string; bg: string };

function MenuItem({ item }: { item: MenuEntry }) {
  const { tr } = useLanguage();
  const route = MENU_ROUTES[item.id];
  return (
    <TouchableOpacity
      style={s.menuItem}
      activeOpacity={0.75}
      onPress={route ? () => router.push(route as any) : undefined}
    >
      <View style={[s.menuIconCircle, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon as any} size={22} color="#fff" />
      </View>
      <Text style={s.menuLabel}>{(tr as any)[item.labelKey]}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const MENU: MenuEntry[] = [
  { id: 'mix',      labelKey: 'menuMixParlay', icon: 'trophy',            bg: '#27AE60' },
  { id: 'hdp',      labelKey: 'menuHDP',       icon: 'football',          bg: '#2980B9' },
  { id: 'score',    labelKey: 'menuScore',     icon: 'stats-chart',       bg: '#E74C3C' },
  { id: 'betlist',  labelKey: 'menuBetList',   icon: 'document-text',     bg: '#16A085' },
  { id: 'deposit',  labelKey: 'menuDeposit',   icon: 'arrow-down-circle', bg: '#E67E22' },
  { id: 'withdraw', labelKey: 'menuWithdraw',  icon: 'wallet',            bg: '#F39C12' },
  { id: 'rule',     labelKey: 'menuRule',      icon: 'book-outline',      bg: '#1ABC9C' },
  { id: 'pw',       labelKey: 'menuChangePw',  icon: 'lock-closed',       bg: '#9B59B6' },
];

export default function HomeScreen() {
  const { tr } = useLanguage();

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <View style={s.headerLogo}>
          <Text style={s.logoBet}>bet</Text>
          <Text style={s.logo365}>365</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => router.push('/profile' as any)}>
            <Ionicons name="person-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Ticker text={tr.announcement} />
        <ProfileCard />
        <Text style={s.sectionLabel}>{tr.sectionMenu}</Text>
        <View style={s.menuGrid}>
          {MENU.map(item => <MenuItem key={item.id} item={item} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.brand.greenButton },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'baseline' },
  logoBet: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', letterSpacing: -0.5 },
  logo365: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.brand.gold, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 2 },
  headerBtn: { padding: 6 },
  scroll: { flex: 1, backgroundColor: '#F2F5F3' },
  scrollContent: { paddingBottom: 32 },
  ticker: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.brand.gold, paddingHorizontal: Spacing.md, paddingVertical: 7,
  },
  tickerText: { fontSize: 12, fontWeight: FontWeight.medium, color: Colors.brand.greenDark },
  card: {
    margin: Spacing.md, borderRadius: 20,
    backgroundColor: Colors.brand.greenMid, padding: Spacing.md, overflow: 'hidden', ...Shadow.lg,
  },
  cardCircle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
  },
  cardCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: 20,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  cardUsername: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  cardRefresh: { padding: 4 },
  cardBalanceRow: { marginBottom: 14 },
  cardBalanceLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  cardBalanceValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: '#fff', letterSpacing: -0.5 },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 },
  cardStats: { flexDirection: 'row' },
  cardStat: { flex: 1, alignItems: 'center' },
  cardStatBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  cardStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 3 },
  cardStatValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
  sectionLabel: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.light.text,
    marginHorizontal: Spacing.md, marginTop: Spacing.sm, marginBottom: 4,
  },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  menuItem: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  menuIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.text, lineHeight: 18 },
});
