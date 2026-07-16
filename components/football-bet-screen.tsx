import { BetSlipDrawer } from '@/components/maung-bet-drawer';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { useFootballMatches } from '@/hooks/use-football-matches';
import { useHideParentTabBar } from '@/hooks/use-hide-parent-tab-bar';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { submitBetSlip } from '@/services/football';
import type { FootballMarket } from '@/types/football';
import {
  ALL_MARKETS,
  buildMatchMap,
  buildSubmitPayload,
  formatDecimalOdds,
  formatOddsDisplay,
  makeSelectKey,
  parseSelectKey,
  pickLabel,
  type UiLeagueData,
  type UiMatchData,
} from '@/utils/football-ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  mode: 'single' | 'mix';
  markets: FootballMarket[];
  minPicks: number;
  stakePlaceholder?: string;
  hint: string;
  minErr: string;
};

function OddsChip({
  label,
  odds,
  selected,
  onPress,
  compact,
}: {
  label: string;
  odds?: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.chipCompact,
        selected && styles.chipSelected,
        pressed && !selected && styles.chipPressed,
      ]}
    >
      {odds ? (
        <Text style={[styles.chipOdds, selected && styles.chipOddsSelected]}>{odds}</Text>
      ) : null}
      <Text
        style={[styles.chipLabel, !odds && styles.chipLabelOnly, selected && styles.chipLabelSelected]}
        numberOfLines={2}
      >
        {label}
      </Text>
      {selected ? (
        <View style={styles.chipSelectedDot}>
          <Ionicons name="checkmark" size={10} color="#fff" />
        </View>
      ) : null}
    </Pressable>
  );
}

function MarketSection({
  title,
  children,
  last,
}: {
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[styles.marketSection, last && styles.marketSectionLast]}>
      <View style={styles.marketTitleRow}>
        <View style={styles.marketTitlePill}>
          <Text style={styles.marketTitle}>{title}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function MatchMarkets({
  match,
  markets,
  selectedKey,
  onPick,
}: {
  match: UiMatchData;
  markets: FootballMarket[];
  selectedKey: string | null;
  onPick: (market: FootballMarket, pick: string) => void;
}) {
  const { tr } = useLanguage();
  const giving = match.hdpGiving === 'home' ? match.home : match.away;
  const receiving = match.hdpGiving === 'home' ? match.away : match.home;
  const hasSelection = selectedKey != null;

  return (
    <View
      style={[
        styles.matchCard,
        match.isMajor && styles.matchCardMajor,
        hasSelection && styles.matchCardSelected,
      ]}
    >
      {match.isMajor ? (
        <View style={styles.majorRibbon}>
          <View style={styles.majorRibbonInner}>
            <Ionicons name="star" size={12} color={Colors.brand.greenDark} />
            <Text style={styles.majorRibbonText}>{tr.footballMajorMatch}</Text>
            <Ionicons name="star" size={12} color={Colors.brand.greenDark} />
          </View>
          <View style={styles.matchTimePillMajor}>
            <Ionicons name="time-outline" size={11} color={Colors.brand.greenDark} />
            <Text style={styles.matchTimeTextMajor}>{match.date}</Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.matchHeader, match.isMajor && styles.matchHeaderMajor]}>
        {!match.isMajor ? (
          <View style={styles.matchHeaderTop}>
            <View />
            <View style={styles.matchTimePill}>
              <Ionicons name="time-outline" size={11} color={Colors.brand.greenMid} />
              <Text style={styles.matchTimeText}>{match.date}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            <Text style={[styles.teamName, match.isMajor && styles.teamNameMajor]} numberOfLines={2}>
              {match.home}
            </Text>
          </View>
          <View style={[styles.vsBadge, match.isMajor && styles.vsBadgeMajor]}>
            <Text style={[styles.vsText, match.isMajor && styles.vsTextMajor]}>{tr.maungVs}</Text>
          </View>
          <View style={[styles.teamCol, styles.teamColAway]}>
            <Text
              style={[styles.teamName, styles.teamNameAway, match.isMajor && styles.teamNameMajor]}
              numberOfLines={2}
            >
              {match.away}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.marketsBody, match.isMajor && styles.marketsBodyMajor]}>
        {markets.includes('asian_handicap') && (
          <MarketSection title={tr.maungHDP}>
            <View style={styles.chipRow}>
              <OddsChip
                label={`${giving} ${match.hdpLine}`}
                odds={formatOddsDisplay(match.hdpOdds, match.hdpLine)}
                selected={selectedKey === makeSelectKey(match.id, 'asian_handicap', 'giving')}
                onPress={() => onPick('asian_handicap', 'giving')}
              />
              <OddsChip
                label={receiving}
                selected={selectedKey === makeSelectKey(match.id, 'asian_handicap', 'receiving')}
                onPress={() => onPick('asian_handicap', 'receiving')}
              />
            </View>
          </MarketSection>
        )}

        {markets.includes('goals_ou') && (
          <MarketSection title={tr.maungOU}>
            <View style={styles.chipRow}>
              <OddsChip
                label={`${tr.maungOver} ${match.ouLine}`}
                odds={formatOddsDisplay(match.ouOdds)}
                selected={selectedKey === makeSelectKey(match.id, 'goals_ou', 'up')}
                onPress={() => onPick('goals_ou', 'up')}
              />
              <OddsChip
                label={`${tr.maungUnder} ${match.ouLine}`}
                selected={selectedKey === makeSelectKey(match.id, 'goals_ou', 'down')}
                onPress={() => onPick('goals_ou', 'down')}
              />
            </View>
          </MarketSection>
        )}

        {markets.includes('sone_ma') && (
          <MarketSection title={tr.maungOE}>
            <View style={styles.chipRow}>
              <OddsChip
                label={tr.maungOdd}
                odds={formatDecimalOdds(match.soneOdds)}
                selected={selectedKey === makeSelectKey(match.id, 'sone_ma', 'sone')}
                onPress={() => onPick('sone_ma', 'sone')}
              />
              <OddsChip
                label={tr.maungEven}
                odds={formatDecimalOdds(match.maOdds)}
                selected={selectedKey === makeSelectKey(match.id, 'sone_ma', 'ma')}
                onPress={() => onPick('sone_ma', 'ma')}
              />
            </View>
          </MarketSection>
        )}

        {markets.includes('match_winner_1x2') && match.oneXTwo && (
          <MarketSection title={tr.football1x2}>
            <View style={styles.chipRowThree}>
              <OddsChip
                label={match.home}
                odds={formatDecimalOdds(match.oneXTwo.home)}
                selected={selectedKey === makeSelectKey(match.id, 'match_winner_1x2', 'home')}
                onPress={() => onPick('match_winner_1x2', 'home')}
              />
              <OddsChip
                label={tr.footballDraw}
                odds={formatDecimalOdds(match.oneXTwo.draw)}
                selected={selectedKey === makeSelectKey(match.id, 'match_winner_1x2', 'draw')}
                onPress={() => onPick('match_winner_1x2', 'draw')}
              />
              <OddsChip
                label={match.away}
                odds={formatDecimalOdds(match.oneXTwo.away)}
                selected={selectedKey === makeSelectKey(match.id, 'match_winner_1x2', 'away')}
                onPress={() => onPick('match_winner_1x2', 'away')}
              />
            </View>
          </MarketSection>
        )}

        {markets.includes('correct_score') && match.correctScores.length > 0 && (
          <MarketSection title={tr.footballCorrectScore} last>
            <View style={styles.csWrap}>
              {match.correctScores.map((item) => (
                <OddsChip
                  key={item.key}
                  label={item.key}
                  odds={formatDecimalOdds(item.odds)}
                  selected={selectedKey === makeSelectKey(match.id, 'correct_score', item.key)}
                  onPress={() => onPick('correct_score', item.key)}
                  compact
                />
              ))}
            </View>
          </MarketSection>
        )}
      </View>
    </View>
  );
}

function LeagueBlock({
  league,
  markets,
  selections,
  onPick,
}: {
  league: UiLeagueData;
  markets: FootballMarket[];
  selections: Record<string, true>;
  onPick: (matchId: string, market: FootballMarket, pick: string) => void;
}) {
  return (
    <View style={styles.leagueBlock}>
      <View style={styles.leagueHeader}>
        <View style={styles.leagueAccent} />
        <View style={styles.leagueIcon}>
          <Ionicons name="football" size={13} color={Colors.brand.greenButton} />
        </View>
        <Text style={styles.leagueName} numberOfLines={1}>
          {league.name}
        </Text>
        <View style={styles.leagueCountPill}>
          <Text style={styles.leagueCount}>{league.matches.length}</Text>
        </View>
      </View>
      <View style={styles.leagueMatches}>
        {league.matches.map((match) => {
          const selectedKey =
            Object.keys(selections).find((k) => k.startsWith(`${match.id}:`)) ?? null;
          return (
            <MatchMarkets
              key={match.id}
              match={match}
              markets={markets}
              selectedKey={selectedKey}
              onPick={(market, pick) => onPick(match.id, market, pick)}
            />
          );
        })}
      </View>
    </View>
  );
}

export function FootballBetScreen({
  title,
  mode,
  markets,
  minPicks,
  stakePlaceholder = '500',
  hint,
  minErr,
}: Props) {
  useRequireAuth();
  useHideParentTabBar();
  const { tr } = useLanguage();
  const { token, refreshUser } = useAuth();
  const { leagues, loading, error, reload } = useFootballMatches(mode);
  const matchMap = useMemo(() => buildMatchMap(leagues), [leagues]);
  const insets = useSafeAreaInsets();
  const [selections, setSelections] = useState<Record<string, true>>({});
  const [stake, setStake] = useState(stakePlaceholder);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const count = Object.keys(selections).length;
  const canBet = count >= minPicks;

  const slipItems = useMemo(() => {
    return Object.keys(selections).map((key) => {
      const { matchId, market, pick } = parseSelectKey(key);
      const match = matchMap.get(matchId);
      if (!match) return { key, label: key };
      return { key, label: pickLabel(match, market, pick, tr) };
    });
  }, [selections, tr, matchMap]);

  const slipCopy = useMemo(
    () => ({
      slipTitle: tr.maungBetSlip,
      minPicksHint: hint,
      picksUnit: tr.maungPicks,
      selectedLabel: tr.maungSelected,
      placeBet: tr.maungPlaceBet,
      reviewBet: tr.maungReviewBet,
      betAmount: tr.maungBetAmount,
      clearSlip: tr.maungClearSlip,
      tapToExpand: tr.maungTapToExpand,
      currencyUnit: tr.currencyUnit,
    }),
    [tr, hint],
  );

  function handlePick(matchId: string, market: FootballMarket, pick: string) {
    const key = makeSelectKey(matchId, market, pick);
    setSelections((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }

      if (mode === 'single') {
        return { [key]: true };
      }

      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k.startsWith(`${matchId}:`)) delete next[k];
      }
      next[key] = true;
      return next;
    });
  }

  function handleRemove(key: string) {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleReset() {
    setSelections({});
    setStake(stakePlaceholder);
  }

  async function handleOK() {
    if (!canBet || !token) {
      if (!canBet) Alert.alert('', minErr);
      return;
    }
    const total = parseInt(stake.replace(/,/g, ''), 10);
    if (!total || total < 1) {
      Alert.alert('', tr.footballAmountRequired);
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildSubmitPayload(mode, selections, matchMap, total);
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
  const scrollBottomPad = safeBottom + (drawerExpanded ? 320 : count > 0 ? 132 : 96);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.pickBadge}>
            <Text style={styles.pickBadgeText}>{count}</Text>
          </View>
        </View>

        {count === 0 && (
          <View style={styles.hintBar}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.brand.greenMid} />
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View style={styles.loadWrap}>
              <Text style={styles.loadText}>{tr.footballLoadingMatches}</Text>
            </View>
          ) : error ? (
            <View style={styles.loadWrap}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={reload} style={styles.retryBtn}>
                <Text style={styles.retryText}>{tr.footballRetry}</Text>
              </TouchableOpacity>
            </View>
          ) : leagues.length === 0 ? (
            <View style={styles.loadWrap}>
              <Text style={styles.loadText}>{tr.footballNoMatches}</Text>
            </View>
          ) : (
            leagues.map((league) => (
              <LeagueBlock
                key={league.name}
                league={league}
                markets={markets}
                selections={selections}
                onPick={handlePick}
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
          tabBarOffset={0}
          copy={slipCopy}
          minPicks={minPicks}
          autoExpandAt={minPicks}
          stakePlaceholder={stakePlaceholder}
          onExpandedChange={setDrawerExpanded}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

export { ALL_MARKETS };

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: '#E9F0EC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  backBtn: { padding: 6, width: 36 },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
    textAlign: 'center',
  },
  pickBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pickBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadow.sm,
  },
  hintText: { flex: 1, fontSize: FontSize.sm, color: Colors.light.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.lg },
  loadWrap: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
  loadText: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  errorText: { fontSize: FontSize.sm, color: Colors.light.error, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton + '22',
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenButton,
  },
  leagueBlock: { gap: Spacing.sm },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: 2,
  },
  leagueAccent: {
    width: 3,
    height: 18,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.brand.greenButton,
  },
  leagueIcon: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  leagueName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
    letterSpacing: 0.2,
  },
  leagueCountPill: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...Shadow.sm,
  },
  leagueCount: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenMid,
  },
  leagueMatches: { gap: Spacing.md },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadow.md,
  },
  matchCardMajor: {
    borderColor: Colors.brand.gold,
    borderWidth: 2,
    backgroundColor: '#FFFCF5',
    ...Platform.select({
      ios: {
        shadowColor: Colors.brand.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  matchCardSelected: {
    borderColor: Colors.brand.greenButton,
    borderWidth: 1.5,
  },
  majorRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brand.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
  },
  majorRibbonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  majorRibbonText: {
    fontSize: 11,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.greenDark,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  matchTimePillMajor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(13, 59, 36, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  matchTimeTextMajor: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenDark,
  },
  matchHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm + 2,
    backgroundColor: '#F8FBF9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  matchHeaderMajor: {
    backgroundColor: '#FFF6DC',
    borderBottomColor: '#F0D78A',
    paddingTop: Spacing.sm + 4,
  },
  matchHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 2,
    minHeight: 22,
  },
  matchTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  matchTimeText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: Colors.brand.greenMid,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teamCol: {
    flex: 1,
    minWidth: 0,
  },
  teamColAway: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    lineHeight: 18,
  },
  teamNameAway: {
    textAlign: 'right',
  },
  teamNameMajor: {
    color: Colors.brand.greenDark,
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  vsBadge: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsBadgeMajor: {
    width: 38,
    height: 38,
    borderColor: Colors.brand.gold,
    borderWidth: 2,
    backgroundColor: Colors.brand.gold,
  },
  vsText: {
    fontSize: 10,
    fontWeight: FontWeight.extrabold,
    color: Colors.light.textSecondary,
    letterSpacing: 0.3,
  },
  vsTextMajor: {
    color: Colors.brand.greenDark,
  },
  marketsBody: {
    padding: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  marketsBodyMajor: {
    backgroundColor: '#FFFCF5',
  },
  marketSection: {
    backgroundColor: '#F4F8F6',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  marketSectionLast: {
    marginBottom: 0,
  },
  marketTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketTitlePill: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  marketTitle: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenMid,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chipRowThree: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  csWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  chipCompact: {
    flexGrow: 0,
    flexBasis: '22%',
    minWidth: '22%',
    paddingVertical: 8,
  },
  chipPressed: {
    backgroundColor: '#EEF5F1',
    transform: [{ scale: 0.98 }],
  },
  chipSelected: {
    backgroundColor: Colors.brand.greenButton,
    borderColor: Colors.brand.greenDark,
  },
  chipOdds: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.greenDark,
    letterSpacing: -0.3,
  },
  chipOddsSelected: {
    color: '#fff',
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  chipLabelOnly: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  chipLabelSelected: {
    color: 'rgba(255,255,255,0.92)',
  },
  chipSelectedDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.brand.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
