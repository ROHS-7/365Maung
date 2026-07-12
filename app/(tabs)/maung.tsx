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
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useFootballMatches } from '@/hooks/use-football-matches';
import { useAuth } from '@/contexts/auth';
import { submitBetSlip } from '@/services/football';
import {
  buildMatchMap,
  buildSubmitPayload,
  formatOddsDisplay,
  pickLabel,
  type BetRow,
  type SelectKey,
  type BetSide as Side,
  type UiMatchData as MatchData,
  type UiLeagueData as LeagueData,
} from '@/utils/football-ui';

function shortTeam(name: string) {
  const i = name.indexOf(' ');
  return i > 0 && name.length > 14 ? `${name.slice(0, i)}…` : name;
}

function formatOdds(n: number, line?: string) {
  return formatOddsDisplay(n, line);
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
              {match.hdpLine} ({formatOdds(match.hdpOdds, match.hdpLine)})
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
              {match.ouLine} ({formatOdds(match.ouOdds, match.ouLine)})
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
  useRequireAuth();
  const { tr } = useLanguage();
  const { token, refreshUser } = useAuth();
  const { leagues, loading, error, reload } = useFootballMatches('mix');
  const matchMap = useMemo(() => buildMatchMap(leagues), [leagues]);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [selections, setSelections] = useState<Record<SelectKey, Side>>({});
  const [stake, setStake] = useState('500');
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const count = Object.keys(selections).length;
  const canBet = count >= 2;

  const slipItems = useMemo(() => {
    return Object.entries(selections).map(([key, side]) => {
      const [matchId, row] = key.split(':') as [string, BetRow];
      const match = matchMap.get(matchId);
      if (!match) return { key: key as SelectKey, label: key };
      return { key: key as SelectKey, label: pickLabel(match, row, side, tr) };
    });
  }, [selections, tr, matchMap]);

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
      const [matchId] = key.split(':');
      const next = { ...prev };
      // One pick per match: HDP, O/U, or O/E — not multiple on the same match
      for (const k of Object.keys(next)) {
        if (k.startsWith(`${matchId}:`)) {
          delete next[k as SelectKey];
        }
      }
      next[key] = side;
      return next;
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

  async function handleOK() {
    if (!canBet || !token) {
      if (!canBet) Alert.alert('', tr.maungMinErr);
      return;
    }
    const total = parseInt(stake.replace(/,/g, ''), 10);
    if (!total || total < 1) {
      Alert.alert('', tr.footballAmountRequired);
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildSubmitPayload('mix', selections, matchMap, total);
      await submitBetSlip(token, payload);
      await refreshUser();
      setSelections({});
      Alert.alert(tr.footballBetSuccessTitle, tr.footballBetSuccessMsg, [
        { text: tr.footballViewBets, onPress: () => router.push('/(tabs)/bets' as never) },
        { text: 'OK' },
      ]);
    } catch (e) {
      Alert.alert('', e instanceof Error ? e.message : tr.footballBetFailed);
    } finally {
      setSubmitting(false);
    }
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
          {loading ? (
            <View style={s.loadWrap}>
              <Text style={s.loadText}>{tr.footballLoadingMatches}</Text>
            </View>
          ) : error ? (
            <View style={s.loadWrap}>
              <Text style={s.errorText}>{error}</Text>
              <TouchableOpacity onPress={reload} style={s.retryBtn}>
                <Text style={s.retryText}>{tr.footballRetry}</Text>
              </TouchableOpacity>
            </View>
          ) : leagues.length === 0 ? (
            <View style={s.loadWrap}>
              <Text style={s.loadText}>{tr.footballNoMatches}</Text>
            </View>
          ) : (
            leagues.map((league) => (
              <LeagueBlock
                key={league.name}
                league={league}
                selections={selections}
                onSelect={handleSelect}
              />
            ))
          )}
        </ScrollView>

        <BetSlipDrawer
          count={count}
          canBet={canBet && !submitting}
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
  loadWrap: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
  loadText: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  errorText: { fontSize: FontSize.sm, color: Colors.light.error, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton + '22',
  },
  retryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.brand.greenButton },

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
