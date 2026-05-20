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
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

// ─── Mock data ───────────────────────────────────────────────────────────────

const ANNOUNCEMENT =
  '0,000) ကျပ် အတိကများနှင်ပါသည်!! (ဘောဒီ အကောင် 5% ပါ) မောင်း ✦ ';

const MATCHES = [
  { id: '1', home: 'MUN', away: 'CHE', hs: 2, as: 1, status: 'FT' },
  { id: '2', home: 'ARS', away: 'LIV', hs: 0, as: 0, status: '45\'' },
  { id: '3', home: 'MCI', away: 'TOT', hs: 3, as: 2, status: 'FT' },
  { id: '4', home: 'BAR', away: 'RMA', hs: 1, as: 1, status: '78\'' },
  { id: '5', home: 'JUV', away: 'INT', hs: 0, as: 1, status: 'FT' },
];

const LEAGUES = [
  { id: 'pl',     name: 'Premier\nLeague',     icon: 'football',          color: '#3700B3' },
  { id: 'cl',     name: 'Champions\nLeague',   icon: 'star',              color: '#1565C0' },
  { id: 'laliga', name: 'La Liga',             icon: 'shield-outline',    color: '#E65100' },
  { id: 'bl',     name: 'Bundesliga',          icon: 'ribbon-outline',    color: '#C62828' },
  { id: 'sa',     name: 'Serie A',             icon: 'trophy-outline',    color: '#283593' },
  { id: 'l1',     name: 'Ligue 1',             icon: 'flame-outline',     color: '#006064' },
] as const;

const FEATURES = [
  { id: 'mix',      title: 'Mix Parlay',       subtitle: 'ဘောလုံးပွဲများ',      icon: 'trophy',            bg: '#27AE60' },
  { id: 'hdp',      title: 'HDP & O/U',        subtitle: 'ပွဲကြိုများ',          icon: 'football',          bg: '#2980B9' },
  { id: 'deposit',  title: 'Auto Deposit',     subtitle: 'ငွေသွင်းရန်',          icon: 'arrow-down-circle', bg: '#E67E22' },
  { id: 'withdraw', title: 'Withdraw',         subtitle: 'ငွေထုတ်ရန်',           icon: 'wallet',            bg: '#F39C12' },
  { id: 'score',    title: 'Live Score',       subtitle: 'အဏ္ဏတ်ရလဒ်',           icon: 'stats-chart',       bg: '#E74C3C' },
  { id: 'betlist',  title: 'Bet List',         subtitle: 'လောင်းကစားစာရင်း',     icon: 'document-text',     bg: '#16A085' },
  { id: 'rule',     title: 'Rule',             subtitle: 'စည်းမျဉ်းများ',         icon: 'book-outline',      bg: '#1ABC9C' },
  { id: 'pw',       title: 'Change Password',  subtitle: 'စကားဝှက်ပြောင်း',       icon: 'lock-closed',       bg: '#9B59B6' },
] as const;

const USER = { username: 'မောင်မောင်', balance: '၃၆၇ ကျပ်', cashCode: '114947' };

// ─── Ticker ──────────────────────────────────────────────────────────────────

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

// ─── Match Score Card ─────────────────────────────────────────────────────────

function MatchCard({ m }: { m: typeof MATCHES[number] }) {
  const live = !m.status.includes('T');
  return (
    <View style={s.matchCard}>
      <View style={[s.matchStatus, live && s.matchStatusLive]}>
        <Text style={[s.matchStatusText, live && s.matchStatusTextLive]}>{m.status}</Text>
      </View>
      <View style={s.matchTeams}>
        <View style={s.teamCol}>
          <View style={[s.teamBadge, { backgroundColor: Colors.brand.greenMid }]}>
            <Text style={s.teamInitial}>{m.home[0]}</Text>
          </View>
          <Text style={s.teamName}>{m.home}</Text>
        </View>
        <View style={s.scoreBox}>
          <Text style={s.scoreText}>{m.hs} : {m.as}</Text>
        </View>
        <View style={s.teamCol}>
          <View style={[s.teamBadge, { backgroundColor: '#C0392B' }]}>
            <Text style={s.teamInitial}>{m.away[0]}</Text>
          </View>
          <Text style={s.teamName}>{m.away}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── League Circle ────────────────────────────────────────────────────────────

function LeagueCircle({ item }: { item: typeof LEAGUES[number] }) {
  return (
    <TouchableOpacity style={s.leagueItem} activeOpacity={0.75}>
      <View style={[s.leagueCircle, { backgroundColor: item.color + '18', borderColor: item.color + '55' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text style={s.leagueName} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({ item }: { item: typeof FEATURES[number] }) {
  return (
    <TouchableOpacity style={s.featureCard} activeOpacity={0.8}>
      <View style={[s.featureBg, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon as any} size={36} color="rgba(255,255,255,0.9)" />
        <View style={s.featureOverlay} />
      </View>
      <View style={s.featureInfo}>
        <Text style={s.featureTitle}>{item.title}</Text>
        <Text style={s.featureSub}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Ionicons name={icon as any} size={16} color={Colors.brand.greenButton} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLogo}>
          <Text style={s.logoBet}>bet</Text>
          <Text style={s.logo365}>365</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerIcon}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerIcon}>
            <Ionicons name="person-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Ticker */}
        <Ticker text={ANNOUNCEMENT} />

        {/* Balance strip */}
        <View style={s.balanceStrip}>
          <View>
            <Text style={s.balanceLabel}>Balance</Text>
            <Text style={s.balanceValue}>{USER.balance}</Text>
          </View>
          <View style={s.balanceDivider} />
          <View>
            <Text style={s.balanceLabel}>Cash Code</Text>
            <Text style={s.balanceValue}>{USER.cashCode}</Text>
          </View>
          <TouchableOpacity style={s.depositBtn}>
            <Ionicons name="add-circle" size={14} color="#fff" />
            <Text style={s.depositText}>Deposit</Text>
          </TouchableOpacity>
        </View>

        {/* Live Scores */}
        <SectionHeader icon="radio-outline" title="Live & Recent Scores" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hScroll}>
          {MATCHES.map(m => <MatchCard key={m.id} m={m} />)}
        </ScrollView>

        {/* Leagues */}
        <SectionHeader icon="trophy-outline" title="Leagues" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hScroll}>
          {LEAGUES.map(l => <LeagueCircle key={l.id} item={l} />)}
        </ScrollView>

        {/* Features */}
        <SectionHeader icon="football-outline" title="bet365 ကဏ္ဍပေါင်းစုံ" />
        <View style={s.featureGrid}>
          {FEATURES.map(f => <FeatureCard key={f.id} item={f} />)}
        </View>

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
    backgroundColor: Colors.brand.greenDark,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'baseline' },
  logoBet: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', letterSpacing: -0.5 },
  logo365: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.brand.gold, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', gap: 4 },
  headerIcon: { padding: 6 },

  scroll: { flex: 1, backgroundColor: '#F2F5F3' },
  scrollContent: { paddingBottom: 32 },

  // Ticker
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  tickerText: { fontSize: 12, fontWeight: FontWeight.medium, color: Colors.brand.greenDark },

  // Balance strip
  balanceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenMid,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  balanceLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: FontWeight.medium },
  balanceValue: { fontSize: FontSize.md, color: '#fff', fontWeight: FontWeight.bold, marginTop: 1 },
  balanceDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.25)' },
  depositBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 4,
  },
  depositText: { fontSize: FontSize.sm, color: '#fff', fontWeight: FontWeight.semibold },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 6,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.light.text },

  // Horizontal scroll
  hScroll: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: 4 },

  // Match card
  matchCard: {
    width: 148,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    ...Shadow.sm,
  },
  matchStatus: {
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: Spacing.sm,
  },
  matchStatusLive: { backgroundColor: '#E74C3C' },
  matchStatusText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.light.textSecondary },
  matchStatusTextLive: { color: '#fff' },
  matchTeams: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamCol: { alignItems: 'center', width: 40 },
  teamBadge: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  teamInitial: { fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, color: '#fff' },
  teamName: { fontSize: 10, fontWeight: FontWeight.semibold, color: Colors.light.text },
  scoreBox: { alignItems: 'center' },
  scoreText: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.light.text },

  // League circle
  leagueItem: { alignItems: 'center', width: 72 },
  leagueCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  leagueName: { fontSize: 10, color: Colors.light.textSecondary, textAlign: 'center', lineHeight: 13 },

  // Feature grid
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  featureBg: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  featureInfo: { padding: Spacing.sm },
  featureTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.light.text },
  featureSub: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },
});
