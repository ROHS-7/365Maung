import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import type { Translations } from '@/constants/i18n';
import { BetSlipDrawer } from '@/components/maung-bet-drawer';

type BetRow = 'hdp' | 'ou' | 'oe';
type Side = 'left' | 'right';
type SelectKey = `${string}:${BetRow}`;

type MatchData = {
  id: string;
  date: string;
  home: string;
  away: string;
  hdpGiving: 'home' | 'away';
  hdpLine: string;
  hdpOdds: number;
  ouLine: string;
  ouOdds: number;
  oeRef: string;
};

type LeagueData = { name: string; matches: MatchData[] };

const LEAGUES: LeagueData[] = [
  {
    name: 'ARGENTINA CUP',
    matches: [
      {
        id: 'm1',
        date: '05-21 02:30',
        home: 'Talleres Cordoba (n)',
        away: 'Atletico Tucuman',
        hdpGiving: 'home',
        hdpLine: '0',
        hdpOdds: -86,
        ouLine: '2',
        ouOdds: -14,
        oeRef: '2',
      },
      {
        id: 'm2',
        date: '05-21 04:00',
        home: 'Boca Juniors',
        away: 'River Plate',
        hdpGiving: 'home',
        hdpLine: '0/0.5',
        hdpOdds: -56,
        ouLine: '2.5',
        ouOdds: 98,
        oeRef: '2',
      },
    ],
  },
  {
    name: 'COPA LIBERTADORES',
    matches: [
      {
        id: 'm3',
        date: '05-21 04:30',
        home: 'Nacional Montevideo',
        away: 'Universitario Deportes',
        hdpGiving: 'home',
        hdpLine: '1',
        hdpOdds: 35,
        ouLine: '2',
        ouOdds: -58,
        oeRef: '2',
      },
      {
        id: 'm4',
        date: '05-21 07:00',
        home: 'LDU Quito',
        away: 'Lanus',
        hdpGiving: 'home',
        hdpLine: '0',
        hdpOdds: -98,
        ouLine: '2',
        ouOdds: -38,
        oeRef: '2',
      },
      {
        id: 'm5',
        date: '05-21 06:30',
        home: 'Atletico Bucaramanga',
        away: 'Boca Juniors de Cali',
        hdpGiving: 'home',
        hdpLine: '2',
        hdpOdds: 76,
        ouLine: '3',
        ouOdds: 100,
        oeRef: '2',
      },
    ],
  },
  {
    name: 'FINLAND VEIKKAUSLIIGA',
    matches: [
      {
        id: 'm6',
        date: '05-21 21:00',
        home: 'HJK Helsinki',
        away: 'IFK Mariehamn',
        hdpGiving: 'home',
        hdpLine: '1.5',
        hdpOdds: -42,
        ouLine: '3',
        ouOdds: 76,
        oeRef: '2',
      },
      {
        id: 'm7',
        date: '05-21 21:00',
        home: 'FC Inter Turku',
        away: 'AC Oulu',
        hdpGiving: 'away',
        hdpLine: '0.5',
        hdpOdds: -60,
        ouLine: '2.5',
        ouOdds: 88,
        oeRef: '2',
      },
    ],
  },
  {
    name: 'ENGLAND PREMIER LEAGUE',
    matches: [
      {
        id: 'm8',
        date: '05-21 21:00',
        home: 'Arsenal',
        away: 'Chelsea',
        hdpGiving: 'home',
        hdpLine: '0',
        hdpOdds: -72,
        ouLine: '2.5',
        ouOdds: -10,
        oeRef: '2',
      },
      {
        id: 'm9',
        date: '05-21 23:30',
        home: 'Liverpool',
        away: 'Man City',
        hdpGiving: 'home',
        hdpLine: '0/0.5',
        hdpOdds: -44,
        ouLine: '3',
        ouOdds: 92,
        oeRef: '2',
      },
    ],
  },
];

const MATCH_MAP = new Map(LEAGUES.flatMap(l => l.matches.map(m => [m.id, m] as const)));

function formatOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

function shortTeam(name: string) {
  const i = name.indexOf(' ');
  return i > 0 && name.length > 14 ? `${name.slice(0, i)}…` : name;
}

function pickLabel(match: MatchData, row: BetRow, side: Side, tr: Translations): string {
  const giving = match.hdpGiving === 'home' ? match.home : match.away;
  const receiving = match.hdpGiving === 'home' ? match.away : match.home;
  if (row === 'hdp') {
    const team = side === 'left' ? giving : receiving;
    return `${team} ${match.hdpLine}`;
  }
  if (row === 'ou') {
    const team = side === 'left' ? match.home : match.away;
    const pick = side === 'left' ? tr.maungOver : tr.maungUnder;
    return `${team} · ${pick} ${match.ouLine}`;
  }
  const team = side === 'left' ? match.home : match.away;
  const pick = side === 'left' ? tr.maungOdd : tr.maungEven;
  return `${team} · ${pick}`;
}

function BetCell({
  selected,
  onPress,
  children,
  center,
  style,
}: {
  selected: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  center?: boolean;
  style?: object;
}) {
  const inner = (
    <View style={[s.cell, center && s.cellCenter, selected && s.cellSelected, style]}>
      {children}
      {selected && (
        <View style={s.cellCheck}>
          <Ionicons name="checkmark" size={10} color="#fff" />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.cellPressable, pressed && s.cellPressed]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

function MatchCard({
  match,
  selections,
  onSelect,
}: {
  match: MatchData;
  selections: Record<SelectKey, Side>;
  onSelect: (key: SelectKey, side: Side) => void;
}) {
  const { tr } = useLanguage();

  const sel = (row: BetRow) => selections[`${match.id}:${row}`];
  const tap = (row: BetRow, side: Side) => onSelect(`${match.id}:${row}`, side);

  const givingName = match.hdpGiving === 'home' ? match.home : match.away;
  const receivingName = match.hdpGiving === 'home' ? match.away : match.home;
  const hdpSel = sel('hdp');
  const ouSel = sel('ou');
  const oeSel = sel('oe');

  return (
    <View style={s.matchCard}>
      <View style={s.matchHeader}>
        <Text style={s.matchTeams} numberOfLines={1}>
          {match.home} <Text style={s.matchVs}>{tr.maungVs}</Text> {match.away}
        </Text>
        <View style={s.matchTime}>
          <Ionicons name="time-outline" size={12} color={Colors.light.placeholder} />
          <Text style={s.matchTimeText}>{match.date}</Text>
        </View>
      </View>

      <View style={s.betBlock}>
        <Text style={s.rowTag}>{tr.maungHDP}</Text>
        <View style={s.betRow}>
          <BetCell selected={hdpSel === 'left'} onPress={() => tap('hdp', 'left')}>
            <Text style={[s.teamName, hdpSel === 'left' && s.textSelected]} numberOfLines={2}>
              {givingName}
            </Text>
            <Text style={[s.oddsText, hdpSel === 'left' && s.oddsSelected]}>
              {match.hdpLine} ({formatOdds(match.hdpOdds)})
            </Text>
          </BetCell>
          <BetCell
            selected={hdpSel === 'right'}
            onPress={() => tap('hdp', 'right')}
            style={s.cellBorderLeft}
          >
            <Text style={[s.teamName, hdpSel === 'right' && s.textSelected]} numberOfLines={2}>
              {receivingName}
            </Text>
          </BetCell>
        </View>
      </View>

      <View style={s.betBlock}>
        <Text style={s.rowTag}>{tr.maungOU}</Text>
        <View style={s.betRow}>
          <BetCell selected={ouSel === 'left'} onPress={() => tap('ou', 'left')}>
            <Text style={[s.teamNameSmall, ouSel === 'left' && s.textSelected]} numberOfLines={1}>
              {shortTeam(match.home)}
            </Text>
            <Text style={[s.pickLabel, ouSel === 'left' && s.textSelected]}>{tr.maungOver}</Text>
          </BetCell>
          <BetCell center>
            <Text style={s.centerOdds}>
              {match.ouLine} ({formatOdds(match.ouOdds)})
            </Text>
          </BetCell>
          <BetCell
            selected={ouSel === 'right'}
            onPress={() => tap('ou', 'right')}
            style={s.cellBorderLeft}
          >
            <Text style={[s.teamNameSmall, ouSel === 'right' && s.textSelected]} numberOfLines={1}>
              {shortTeam(match.away)}
            </Text>
            <Text style={[s.pickLabel, ouSel === 'right' && s.textSelected]}>{tr.maungUnder}</Text>
          </BetCell>
        </View>
      </View>

      <View style={[s.betBlock, s.betBlockLast]}>
        <Text style={s.rowTag}>{tr.maungOE}</Text>
        <View style={s.betRow}>
          <BetCell selected={oeSel === 'left'} onPress={() => tap('oe', 'left')}>
            <Text style={[s.teamNameSmall, oeSel === 'left' && s.textSelected]} numberOfLines={1}>
              {shortTeam(match.home)}
            </Text>
            <Text style={[s.pickLabel, oeSel === 'left' && s.textSelected]}>{tr.maungOdd}</Text>
          </BetCell>
          <BetCell center>
            <Text style={s.centerOdds}>{match.oeRef}</Text>
          </BetCell>
          <BetCell
            selected={oeSel === 'right'}
            onPress={() => tap('oe', 'right')}
            style={s.cellBorderLeft}
          >
            <Text style={[s.teamNameSmall, oeSel === 'right' && s.textSelected]} numberOfLines={1}>
              {shortTeam(match.away)}
            </Text>
            <Text style={[s.pickLabel, oeSel === 'right' && s.textSelected]}>{tr.maungEven}</Text>
          </BetCell>
        </View>
      </View>
    </View>
  );
}

function LeagueBlock({
  league,
  selections,
  onSelect,
}: {
  league: LeagueData;
  selections: Record<SelectKey, Side>;
  onSelect: (key: SelectKey, side: Side) => void;
}) {
  return (
    <View style={s.leagueBlock}>
      <View style={s.leagueHeader}>
        <View style={s.leagueIcon}>
          <Ionicons name="football" size={14} color={Colors.brand.greenMid} />
        </View>
        <Text style={s.leagueName}>{league.name}</Text>
        <Text style={s.leagueCount}>{league.matches.length}</Text>
      </View>
      <View style={s.leagueCard}>
        {league.matches.map(match => (
          <MatchCard key={match.id} match={match} selections={selections} onSelect={onSelect} />
        ))}
      </View>
    </View>
  );
}

export default function MaungScreen() {
  const { tr } = useLanguage();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [selections, setSelections] = useState<Record<SelectKey, Side>>({});
  const [stake, setStake] = useState('500');
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  const count = Object.keys(selections).length;
  const canBet = count >= 2;

  const slipItems = useMemo(() => {
    return Object.entries(selections).map(([key, side]) => {
      const [matchId, row] = key.split(':') as [string, BetRow];
      const match = MATCH_MAP.get(matchId);
      if (!match) return { key: key as SelectKey, label: key };
      return { key: key as SelectKey, label: pickLabel(match, row, side, tr) };
    });
  }, [selections, tr]);

  const slipCopy = useMemo(
    () => ({
      slipTitle: tr.maungBetSlip,
      minPicksHint: tr.maungMinPicksHint,
      picksUnit: tr.maungPicks,
      selectedLabel: tr.maungSelected,
      placeBet: tr.maungPlaceBet,
      reviewBet: tr.maungReviewBet,
      betAmount: tr.maungBetAmount,
      clearSlip: tr.maungClearSlip,
      tapToExpand: tr.maungTapToExpand,
      currencyUnit: tr.currencyUnit,
    }),
    [tr],
  );

  function handleSelect(key: SelectKey, side: Side) {
    setSelections(prev => {
      if (prev[key] === side) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: side };
    });
  }

  function handleRemove(key: SelectKey) {
    setSelections(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleReset() {
    setSelections({});
    setStake('500');
  }

  function handleOK() {
    if (!canBet) {
      Alert.alert('', tr.maungMinErr);
      return;
    }
    Alert.alert(tr.maungPlaceBet, `${count} ${tr.maungPicks} · ${stake} ${tr.currencyUnit}`);
  }

  const safeBottom = Math.max(insets.bottom, 8);
  const tabBarOffset = tabBarHeight;
  const scrollBottomPad =
    tabBarOffset + safeBottom + (drawerExpanded ? 320 : count > 0 ? 132 : 96);

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <SafeAreaView style={s.root} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{tr.maungTitle}</Text>
          <View style={s.pickBadge}>
            <Text style={s.pickBadgeText}>{count}</Text>
          </View>
        </View>

        {count === 0 && (
          <View style={s.hintBar}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.brand.greenMid} />
            <Text style={s.hintText}>{tr.maungMinPicksHint}</Text>
          </View>
        )}

        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.scrollContent, { paddingBottom: scrollBottomPad }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {LEAGUES.map(league => (
            <LeagueBlock
              key={league.name}
              league={league}
              selections={selections}
              onSelect={handleSelect}
            />
          ))}
        </ScrollView>

        <BetSlipDrawer
          count={count}
          canBet={canBet}
          stake={stake}
          onStakeChange={setStake}
          slipItems={slipItems}
          onRemove={handleRemove}
          onReset={handleReset}
          onPlaceBet={handleOK}
          safeBottom={safeBottom}
          tabBarOffset={tabBarOffset}
          copy={slipCopy}
          minPicks={2}
          autoExpandAt={2}
          stakePlaceholder="500"
          onExpandedChange={setDrawerExpanded}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const CELL_H = 58;

const s = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: '#F2F5F3' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  backBtn: { padding: 6, width: 36 },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  pickBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pickBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.brand.greenDark },

  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.brand.offWhite,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  hintText: { flex: 1, fontSize: FontSize.sm, color: Colors.light.textSecondary },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.md },

  leagueBlock: { marginBottom: Spacing.xs },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  leagueIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  leagueName: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.light.text },
  leagueCount: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  leagueCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },

  matchCard: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  matchHeader: {
    paddingHorizontal: Spacing.sm + 2,
    paddingTop: Spacing.sm + 2,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.brand.offWhite,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  matchTeams: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.light.text },
  matchVs: { fontWeight: FontWeight.medium, color: Colors.light.textSecondary },
  matchTime: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  matchTimeText: { fontSize: 11, color: Colors.light.placeholder },

  betBlock: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  betBlockLast: { borderBottomWidth: 0 },
  rowTag: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.light.placeholder,
    paddingHorizontal: Spacing.sm + 2,
    paddingTop: 6,
    letterSpacing: 0.5,
  },
  betRow: { flexDirection: 'row' },

  cellPressable: { flex: 1 },
  cellPressed: { opacity: 0.92 },
  cell: {
    minHeight: CELL_H,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: '#FAFBFA',
  },
  cellCenter: {
    flex: 0,
    width: 88,
    backgroundColor: Colors.brand.greenMid,
  },
  cellBorderLeft: { borderLeftWidth: 1, borderLeftColor: Colors.light.border },
  cellSelected: {
    backgroundColor: 'rgba(39, 160, 96, 0.12)',
    borderWidth: 2,
    borderColor: Colors.brand.greenButton,
  },
  cellCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.brand.greenButton,
    alignItems: 'center',
    justifyContent: 'center',
  },

  teamName: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 15,
  },
  oddsText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenButton,
    marginTop: 2,
  },
  oddsSelected: { color: Colors.brand.greenDark },
  teamNameSmall: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  pickLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.text },
  textSelected: { color: Colors.brand.greenDark, fontWeight: FontWeight.bold },
  centerOdds: { fontSize: 12, fontWeight: FontWeight.bold, color: '#fff', textAlign: 'center' },
});
