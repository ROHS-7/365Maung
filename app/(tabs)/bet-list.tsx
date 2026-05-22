import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';

// ─── Types ────────────────────────────────────────────────────────────────────

type BetTab    = 'unfinished' | 'finished';
type BetType   = 'hdpou' | 'parlay';
type BetStatus = 'pending' | 'win' | 'loss';

type HdpOuBet = {
  kind: 'hdpou';
  id: string;
  time: string;
  home: string;
  away: string;
  betType: 'HDP' | 'O/U' | 'O/E';
  pick: string;
  line: string;
  odds: number;
  stake: number;
  payout: number;
  status: BetStatus;
};

type ParlayBet = {
  kind: 'parlay';
  id: string;
  time: string;
  picks: { home: string; away: string; pick: string }[];
  totalOdds: number;
  stake: number;
  payout: number;
  status: BetStatus;
};

type Bet = HdpOuBet | ParlayBet;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const FINISHED_HDPOU: HdpOuBet[] = [
  { kind: 'hdpou', id: 'f1', time: '21:00', home: 'Arsenal', away: 'Chelsea', betType: 'HDP', pick: 'Arsenal', line: '0', odds: -18, stake: 5000, payout: 4550, status: 'win' },
  { kind: 'hdpou', id: 'f2', time: '23:30', home: 'Liverpool', away: 'Man City', betType: 'O/U', pick: 'Over', line: '3', odds: 12, stake: 3000, payout: 0, status: 'loss' },
  { kind: 'hdpou', id: 'f3', time: '03:00', home: 'Real Madrid', away: 'Barcelona', betType: 'HDP', pick: 'Real Madrid', line: '0', odds: -40, stake: 10000, payout: 9600, status: 'win' },
  { kind: 'hdpou', id: 'f4', time: '01:15', home: 'Atletico Madrid', away: 'Sevilla', betType: 'O/U', pick: 'Under', line: '2', odds: -18, stake: 5000, payout: 0, status: 'loss' },
];

const FINISHED_PARLAY: ParlayBet[] = [
  {
    kind: 'parlay', id: 'fp1', time: '20:00',
    picks: [
      { home: 'Arsenal', away: 'Chelsea', pick: 'Arsenal' },
      { home: 'Real Madrid', away: 'Barcelona', pick: 'Real Madrid' },
      { home: 'Bayern Munich', away: 'Dortmund', pick: 'Over 3' },
    ],
    totalOdds: 3.25, stake: 2000, payout: 0, status: 'loss',
  },
  {
    kind: 'parlay', id: 'fp2', time: '22:00',
    picks: [
      { home: 'Liverpool', away: 'Man City', pick: 'Liverpool' },
      { home: 'Napoli', away: 'Juventus', pick: 'Over 2.5' },
    ],
    totalOdds: 2.80, stake: 3000, payout: 8400, status: 'win',
  },
];

const UNFINISHED_HDPOU: HdpOuBet[] = [
  { kind: 'hdpou', id: 'u1', time: '04:00', home: 'Boca Juniors', away: 'River Plate', betType: 'HDP', pick: 'Boca Juniors', line: '0', odds: -34, stake: 5000, payout: 0, status: 'pending' },
  { kind: 'hdpou', id: 'u2', time: '04:30', home: 'Nacional', away: 'Universitario', betType: 'O/U', pick: 'Under', line: '2', odds: -58, stake: 3000, payout: 0, status: 'pending' },
];

const UNFINISHED_PARLAY: ParlayBet[] = [
  {
    kind: 'parlay', id: 'up1', time: '06:30',
    picks: [
      { home: 'LDU Quito', away: 'Lanus', pick: 'LDU Quito' },
      { home: 'Atletico Bucaramanga', away: 'Boca Cali', pick: 'Over 3' },
    ],
    totalOdds: 4.10, stake: 1000, payout: 0, status: 'pending',
  },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function fmtDate(d: Date) {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function isToday(d: Date) {
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const STATUS_CFG: Record<BetStatus, { label: string; bg: string }> = {
  pending: { label: 'PENDING', bg: '#F59E0B' },
  win:     { label: 'WIN',     bg: '#16A34A' },
  loss:    { label: 'LOSS',    bg: '#DC2626' },
};

function StatusBadge({ status }: { status: BetStatus }) {
  const { label, bg } = STATUS_CFG[status];
  return (
    <View style={[badge.root, { backgroundColor: bg }]}>
      <Text style={badge.text}>{label}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  root: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  text: { fontSize: 10, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.6 },
});

// ─── HdpOuCard ────────────────────────────────────────────────────────────────

function HdpOuCard({ bet }: { bet: HdpOuBet }) {
  const { tr } = useLanguage();
  const isWin = bet.status === 'win';
  const isPending = bet.status === 'pending';
  const oddsStr = `${bet.line} (${bet.odds > 0 ? '+' : ''}${bet.odds})`;

  return (
    <View style={card.root}>
      <View style={card.header}>
        <View style={card.typePill}>
          <Text style={card.typePillText}>{bet.betType}</Text>
        </View>
        <Text style={card.time}>{bet.time}</Text>
        <StatusBadge status={bet.status} />
      </View>

      <Text style={card.matchTeams} numberOfLines={1}>
        {bet.home} <Text style={card.vs}>vs</Text> {bet.away}
      </Text>

      <View style={card.infoRow}>
        <View style={card.infoCell}>
          <Text style={card.infoLabel}>{tr.betListPick}</Text>
          <Text style={card.infoValue} numberOfLines={1}>{bet.pick}</Text>
        </View>
        <View style={[card.infoCell, card.infoCellBorder]}>
          <Text style={card.infoLabel}>{tr.betListLineOdds}</Text>
          <Text style={card.infoValue}>{oddsStr}</Text>
        </View>
        <View style={[card.infoCell, card.infoCellBorder]}>
          <Text style={card.infoLabel}>{tr.betListStake}</Text>
          <Text style={card.infoValue}>{bet.stake.toLocaleString()} Ks</Text>
        </View>
      </View>

      {!isPending && (
        <View style={[card.resultBar, { backgroundColor: isWin ? '#F0FDF4' : '#FEF2F2' }]}>
          <Ionicons
            name={isWin ? 'checkmark-circle' : 'close-circle'}
            size={14}
            color={isWin ? '#16A34A' : '#DC2626'}
          />
          <Text style={[card.resultText, { color: isWin ? '#16A34A' : '#DC2626' }]}>
            {isWin ? `${tr.betListPayout}  +${bet.payout.toLocaleString()} Ks` : tr.betListStkLost}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── ParlayCard ───────────────────────────────────────────────────────────────

function ParlayCard({ bet }: { bet: ParlayBet }) {
  const { tr } = useLanguage();
  const isWin = bet.status === 'win';
  const isPending = bet.status === 'pending';

  return (
    <View style={card.root}>
      <View style={card.header}>
        <View style={[card.typePill, { backgroundColor: '#7C3AED' }]}>
          <Text style={card.typePillText}>PARLAY</Text>
        </View>
        <Text style={card.time}>{bet.picks.length} {tr.betListPicks} · ×{bet.totalOdds}</Text>
        <StatusBadge status={bet.status} />
      </View>

      <View style={card.parlayPicks}>
        {bet.picks.map((p, i) => (
          <View key={i} style={card.parlayPickRow}>
            <View style={card.parlayDot} />
            <Text style={card.parlayPickText} numberOfLines={1}>
              {p.home} vs {p.away}
              <Text style={card.parlayPickBold}>  →  {p.pick}</Text>
            </Text>
          </View>
        ))}
      </View>

      <View style={card.infoRow}>
        <View style={card.infoCell}>
          <Text style={card.infoLabel}>{tr.betListTotalOdds}</Text>
          <Text style={card.infoValue}>×{bet.totalOdds}</Text>
        </View>
        <View style={[card.infoCell, card.infoCellBorder]}>
          <Text style={card.infoLabel}>{tr.betListStake}</Text>
          <Text style={card.infoValue}>{bet.stake.toLocaleString()} Ks</Text>
        </View>
        <View style={[card.infoCell, card.infoCellBorder]}>
          <Text style={card.infoLabel}>{tr.betListPotential}</Text>
          <Text style={card.infoValue}>{(bet.stake * bet.totalOdds).toLocaleString()} Ks</Text>
        </View>
      </View>

      {!isPending && (
        <View style={[card.resultBar, { backgroundColor: isWin ? '#F0FDF4' : '#FEF2F2' }]}>
          <Ionicons
            name={isWin ? 'checkmark-circle' : 'close-circle'}
            size={14}
            color={isWin ? '#16A34A' : '#DC2626'}
          />
          <Text style={[card.resultText, { color: isWin ? '#16A34A' : '#DC2626' }]}>
            {isWin ? `${tr.betListPayout}  +${bet.payout.toLocaleString()} Ks` : tr.betListStkLost}
          </Text>
        </View>
      )}
    </View>
  );
}

const GREEN = '#27A060';

const card = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  typePill: {
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typePillText: { fontSize: 10, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.6 },
  time: { flex: 1, fontSize: FontSize.xs, color: '#6B7280', fontWeight: FontWeight.medium },
  matchTeams: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  vs: { color: '#9CA3AF', fontWeight: FontWeight.regular },
  infoRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  },
  infoCell: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center' },
  infoCellBorder: { borderLeftWidth: 1, borderLeftColor: '#F0F4F2' },
  infoLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 3, fontWeight: FontWeight.medium },
  infoValue: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: '#111827', textAlign: 'center' },
  resultBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  },
  resultText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  parlayPicks: { paddingHorizontal: 12, paddingVertical: 8, gap: 5 },
  parlayPickRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  parlayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN, flexShrink: 0 },
  parlayPickText: { flex: 1, fontSize: 12, color: '#4B5563' },
  parlayPickBold: { fontWeight: FontWeight.semibold, color: '#111827' },
});

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  const { tr } = useLanguage();
  return (
    <View style={empty.root}>
      <View style={empty.iconWrap}>
        <Ionicons name="document-text-outline" size={40} color={GREEN} />
      </View>
      <Text style={empty.title}>{tr.betListEmpty}</Text>
      <Text style={empty.sub}>{tr.betListEmptySub}</Text>
    </View>
  );
}

const empty = StyleSheet.create({
  root: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#E8F5EE', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#374151', marginBottom: 6 },
  sub: { fontSize: FontSize.sm, color: '#9CA3AF', textAlign: 'center' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BetListScreen() {
  const { tr } = useLanguage();
  const [tab, setTab]         = useState<BetTab>('unfinished');
  const [betType, setBetType] = useState<BetType>('hdpou');
  const [date, setDate]       = useState(new Date());

  const prev = addDays(date, -1);
  const next = addDays(date, 1);

  const bets: Bet[] = tab === 'finished'
    ? (betType === 'hdpou' ? FINISHED_HDPOU : FINISHED_PARLAY)
    : (betType === 'hdpou' ? UNFINISHED_HDPOU : UNFINISHED_PARLAY);

  return (
    <SafeAreaView style={s.root} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{tr.betListTitle}</Text>
        <View style={s.headerBtn} />
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {([
          { key: 'unfinished' as BetTab, label: tr.betListUnfinished },
          { key: 'finished'   as BetTab, label: tr.betListFinished },
        ]).map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[s.tab, tab === key && s.tabActive]}
            onPress={() => setTab(key)}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date navigator */}
      <View style={s.dateNav}>
        <TouchableOpacity style={s.dateBtn} onPress={() => setDate(prev)} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={14} color="#6B7280" />
          <Text style={s.dateSide}>{fmtDate(prev)}</Text>
        </TouchableOpacity>
        <View style={s.dateCenterWrap}>
          <Text style={s.dateCenterText}>{isToday(date) ? tr.betListToday : fmtDate(date)}</Text>
        </View>
        <TouchableOpacity style={s.dateBtn} onPress={() => setDate(next)} activeOpacity={0.7}>
          <Text style={s.dateSide}>{fmtDate(next)}</Text>
          <Ionicons name="chevron-forward" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Type filter */}
      <View style={s.typeRow}>
        <Text style={s.typeLabel}>{tr.betListType}</Text>
        <View style={s.typePills}>
          {([
            { key: 'hdpou'  as BetType, label: tr.betListHdpOu },
            { key: 'parlay' as BetType, label: tr.menuMixParlay },
          ]).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[s.pill, betType === key && s.pillActive]}
              onPress={() => setBetType(key)}
              activeOpacity={0.8}
            >
              <View style={[s.pillDot, betType === key && s.pillDotActive]} />
              <Text style={[s.pillText, betType === key && s.pillTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bet list */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bets.length === 0 ? (
          <EmptyState />
        ) : (
          bets.map(bet =>
            bet.kind === 'hdpou'
              ? <HdpOuCard key={bet.id} bet={bet} />
              : <ParlayCard key={bet.id} bet={bet} />
          )
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const LIGHT_GREEN_BG = '#EBF5EE';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_GREEN_BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerBtn:   { padding: 4, minWidth: 36 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive:     { borderBottomColor: GREEN },
  tabText:       { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: '#9CA3AF' },
  tabTextActive: { color: GREEN, fontWeight: FontWeight.bold },

  dateNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  dateSide: { fontSize: FontSize.sm, color: '#6B7280' },
  dateCenterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
  },
  dateCenterText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#111827' },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 14,
  },
  typeLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#374151' },
  typePills: { flexDirection: 'row', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  pillActive:   { borderColor: GREEN, backgroundColor: '#E8F5EE' },
  pillDot: {
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: '#fff',
  },
  pillDotActive: { borderColor: GREEN, backgroundColor: GREEN },
  pillText:       { fontSize: FontSize.sm, color: '#6B7280', fontWeight: FontWeight.medium },
  pillTextActive: { color: GREEN, fontWeight: FontWeight.semibold },

  scroll:        { flex: 1 },
  scrollContent: { padding: 12, gap: 10, paddingBottom: 32 },
});
