import { BetSlipDrawer } from "@/components/maung-bet-drawer";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/language";
import { useEsportsMatches } from "@/hooks/use-esports-matches";
import { useFootballMatches } from "@/hooks/use-football-matches";
import { useHideParentTabBar } from "@/hooks/use-hide-parent-tab-bar";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { submitBetSlip } from "@/services/football";
import type { FootballMarket } from "@/types/football";
import {
  ALL_MARKETS,
  buildMatchMap,
  buildSubmitPayload,
  formatDecimalOdds,
  makeSelectKey,
  parseSelectKey,
  pickLabel,
  hdpMarketFromList,
  ouMarketFromList,
  uiMatchHasValidMarket,
  type UiLeagueData,
  type UiMatchData,
} from "@/utils/football-ui";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Props = {
  title: string;
  mode: "single" | "mix";
  markets: FootballMarket[];
  minPicks: number;
  stakePlaceholder?: string;
  hint: string;
  minErr: string;
  /** Defaults to football matches API. */
  source?: "football" | "esports";
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
        <Text style={[styles.chipOdds, selected && styles.chipOddsSelected]}>
          {odds}
        </Text>
      ) : null}
      <Text
        style={[
          styles.chipLabel,
          !odds && styles.chipLabelOnly,
          selected && styles.chipLabelSelected,
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
      {selected ? (
        <View style={styles.chipSelectedDot}>
          <Ionicons name="checkmark" size={8} color="#fff" />
        </View>
      ) : null}
    </Pressable>
  );
}

/** Left | green center line | Right — like Over | 2.5 | Under */
function TriLineRow({
  leftLabel,
  rightLabel,
  centerLine,
  leftSelected,
  rightSelected,
  onLeft,
  onRight,
}: {
  leftLabel: string;
  rightLabel: string;
  centerLine: string;
  leftSelected: boolean;
  rightSelected: boolean;
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <View style={styles.triRow}>
      <Pressable
        onPress={onLeft}
        style={({ pressed }) => [
          styles.triSide,
          leftSelected && styles.triSideSelected,
          pressed && !leftSelected && styles.chipPressed,
        ]}
      >
        <Text
          style={[styles.triSideText, leftSelected && styles.triSideTextSelected]}
          numberOfLines={1}
        >
          {leftLabel}
        </Text>
      </Pressable>
      <View style={styles.triCenter}>
        <Text style={styles.triCenterText} numberOfLines={1}>
          {centerLine}
        </Text>
      </View>
      <Pressable
        onPress={onRight}
        style={({ pressed }) => [
          styles.triSide,
          rightSelected && styles.triSideSelected,
          pressed && !rightSelected && styles.chipPressed,
        ]}
      >
        <Text
          style={[styles.triSideText, rightSelected && styles.triSideTextSelected]}
          numberOfLines={1}
        >
          {rightLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function MarketSection({
  title,
  children,
  last,
  hideTitle,
}: {
  title: string;
  children: ReactNode;
  last?: boolean;
  hideTitle?: boolean;
}) {
  return (
    <View style={[styles.marketSection, last && styles.marketSectionLast]}>
      {!hideTitle ? (
        <View style={styles.marketTitleRow}>
          <Text style={styles.marketTitle}>{title}</Text>
        </View>
      ) : null}
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
  const giving = match.hdpGiving === "home" ? match.home : match.away;
  const receiving = match.hdpGiving === "home" ? match.away : match.home;
  const hasSelection = selectedKey != null;
  const hideMarketTitle = true;
  const hdpMarket = hdpMarketFromList(markets);
  const ouMarket = ouMarketFromList(markets);

  return (
    <View
      style={[
        styles.matchCard,
        match.isMajor && styles.matchCardMajor,
        hasSelection && styles.matchCardSelected,
      ]}
    >
      <View
        style={[styles.matchHeader, match.isMajor && styles.matchHeaderMajor]}
      >
        <View style={styles.matchMetaRow}>
          {match.isMajor ? (
            <View style={styles.majorBadge}>
              <Ionicons name="star" size={9} color={Colors.brand.greenDark} />
              <Text style={styles.majorBadgeText}>{tr.footballMajorMatch}</Text>
            </View>
          ) : (
            <View />
          )}
          <Text
            style={[
              styles.matchTimeText,
              match.isMajor && styles.matchTimeTextMajor,
            ]}
          >
            {match.date}
          </Text>
        </View>

        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            <Text
              style={[styles.teamName, match.isMajor && styles.teamNameMajor]}
              numberOfLines={1}
            >
              {match.home}
            </Text>
          </View>
          <Text style={[styles.vsText, match.isMajor && styles.vsTextMajor]}>
            {tr.maungVs}
          </Text>
          <View style={[styles.teamCol, styles.teamColAway]}>
            <Text
              style={[
                styles.teamName,
                styles.teamNameAway,
                match.isMajor && styles.teamNameMajor,
              ]}
              numberOfLines={1}
            >
              {match.away}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[styles.marketsBody, match.isMajor && styles.marketsBodyMajor]}
      >
        {hdpMarket &&
          uiMatchHasValidMarket(match, hdpMarket) && (
          <MarketSection title={tr.maungHDP} hideTitle={hideMarketTitle}>
            <View style={styles.chipRow}>
              <OddsChip
                label={giving}
                odds={match.hdpLine}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, hdpMarket, "giving")
                }
                onPress={() => onPick(hdpMarket, "giving")}
              />
              <OddsChip
                label={receiving}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, hdpMarket, "receiving")
                }
                onPress={() => onPick(hdpMarket, "receiving")}
              />
            </View>
          </MarketSection>
        )}

        {ouMarket &&
          uiMatchHasValidMarket(match, ouMarket) && (
          <MarketSection title={tr.maungOU} hideTitle={hideMarketTitle}>
            <TriLineRow
              leftLabel={tr.maungOver}
              rightLabel={tr.maungUnder}
              centerLine={match.ouLine}
              leftSelected={
                selectedKey === makeSelectKey(match.id, ouMarket, "up")
              }
              rightSelected={
                selectedKey === makeSelectKey(match.id, ouMarket, "down")
              }
              onLeft={() => onPick(ouMarket, "up")}
              onRight={() => onPick(ouMarket, "down")}
            />
          </MarketSection>
        )}

        {markets.includes("sone_ma") &&
          uiMatchHasValidMarket(match, "sone_ma") && (
          <MarketSection title={tr.maungOE} hideTitle={hideMarketTitle}>
            <View style={styles.chipRow}>
              <OddsChip
                label={tr.maungOdd}
                odds={formatDecimalOdds(match.soneOdds)}
                selected={
                  selectedKey === makeSelectKey(match.id, "sone_ma", "sone")
                }
                onPress={() => onPick("sone_ma", "sone")}
              />
              <OddsChip
                label={tr.maungEven}
                odds={formatDecimalOdds(match.maOdds)}
                selected={
                  selectedKey === makeSelectKey(match.id, "sone_ma", "ma")
                }
                onPress={() => onPick("sone_ma", "ma")}
              />
            </View>
          </MarketSection>
        )}

        {markets.includes("match_winner_1x2") &&
          uiMatchHasValidMarket(match, "match_winner_1x2") &&
          match.oneXTwo && (
          <MarketSection title={tr.football1x2} hideTitle={hideMarketTitle}>
            <View style={styles.chipRowThree}>
              <OddsChip
                label={match.home}
                odds={formatDecimalOdds(match.oneXTwo.home)}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, "match_winner_1x2", "home")
                }
                onPress={() => onPick("match_winner_1x2", "home")}
              />
              <OddsChip
                label={tr.footballDraw}
                odds={formatDecimalOdds(match.oneXTwo.draw)}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, "match_winner_1x2", "draw")
                }
                onPress={() => onPick("match_winner_1x2", "draw")}
              />
              <OddsChip
                label={match.away}
                odds={formatDecimalOdds(match.oneXTwo.away)}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, "match_winner_1x2", "away")
                }
                onPress={() => onPick("match_winner_1x2", "away")}
              />
            </View>
          </MarketSection>
        )}

        {markets.includes("to_win") &&
          uiMatchHasValidMarket(match, "to_win") &&
          match.toWin && (
          <MarketSection title={tr.esportsToWin} hideTitle={hideMarketTitle}>
            <View style={styles.chipRow}>
              <OddsChip
                label={match.home}
                odds={formatDecimalOdds(match.toWin.home)}
                selected={
                  selectedKey === makeSelectKey(match.id, "to_win", "home")
                }
                onPress={() => onPick("to_win", "home")}
              />
              <OddsChip
                label={match.away}
                odds={formatDecimalOdds(match.toWin.away)}
                selected={
                  selectedKey === makeSelectKey(match.id, "to_win", "away")
                }
                onPress={() => onPick("to_win", "away")}
              />
            </View>
          </MarketSection>
        )}

        {markets.includes("correct_score") &&
          uiMatchHasValidMarket(match, "correct_score") &&
          match.correctScores.length > 0 && (
            <MarketSection
              title={tr.footballCorrectScore}
              hideTitle={hideMarketTitle}
              last
            >
              <View style={styles.csWrap}>
                {match.correctScores.map((item) => (
                  <OddsChip
                    key={item.key}
                    label={item.key}
                    odds={formatDecimalOdds(item.odds)}
                    selected={
                      selectedKey ===
                      makeSelectKey(match.id, "correct_score", item.key)
                    }
                    onPress={() => onPick("correct_score", item.key)}
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
  source = "football",
}: {
  league: UiLeagueData;
  markets: FootballMarket[];
  selections: Record<string, true>;
  onPick: (matchId: string, market: FootballMarket, pick: string) => void;
  source?: "football" | "esports";
}) {
  return (
    <View style={styles.leagueBlock}>
      <View style={styles.leagueHeader}>
        <View style={styles.leagueAccent} />
        <View style={styles.leagueIcon}>
          <Ionicons
            name={source === "esports" ? "game-controller" : "football"}
            size={11}
            color={Colors.brand.greenButton}
          />
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
            Object.keys(selections).find((k) => k.startsWith(`${match.id}:`)) ??
            null;
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
  stakePlaceholder = "500",
  hint,
  minErr,
  source = "football",
}: Props) {
  useRequireAuth();
  useHideParentTabBar();
  const { tr } = useLanguage();
  const { token, refreshUser } = useAuth();
  const football = useFootballMatches(mode, {
    markets: source === "football" ? markets : undefined,
    enabled: source === "football",
  });
  const esports = useEsportsMatches({ enabled: source === "esports" });
  const { leagues, loading, error, reload } =
    source === "esports" ? esports : football;
  const matchMap = useMemo(() => buildMatchMap(leagues), [leagues]);
  const insets = useSafeAreaInsets();
  const [selections, setSelections] = useState<Record<string, true>>({});
  const [stake, setStake] = useState(stakePlaceholder);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  const filteredLeagues = useMemo(() => {
    if (!selectedLeague) return leagues;
    return leagues.filter((l) => l.name === selectedLeague);
  }, [leagues, selectedLeague]);

  useEffect(() => {
    if (
      selectedLeague &&
      leagues.length > 0 &&
      !leagues.some((l) => l.name === selectedLeague)
    ) {
      setSelectedLeague(null);
    }
  }, [leagues, selectedLeague]);

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

      if (mode === "single") {
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
      if (!canBet) Alert.alert("", minErr);
      return;
    }
    const total = parseInt(stake.replace(/,/g, ""), 10);
    if (!total || total < 1) {
      Alert.alert("", tr.footballAmountRequired);
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildSubmitPayload(mode, selections, matchMap, total);
      await submitBetSlip(token, payload);
      await refreshUser();
      setSelections({});
      Alert.alert(tr.footballBetSuccessTitle, tr.footballBetSuccessMsg, [
        {
          text: tr.footballViewBets,
          onPress: () => router.push("/(tabs)/bets" as never),
        },
        { text: "OK" },
      ]);
    } catch (e) {
      Alert.alert("", e instanceof Error ? e.message : tr.footballBetFailed);
    } finally {
      setSubmitting(false);
    }
  }

  const safeBottom = Math.max(insets.bottom, 8);
  const scrollBottomPad =
    safeBottom + (drawerExpanded ? 320 : count > 0 ? 132 : 96);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.pickBadge}>
            <Text style={styles.pickBadgeText}>{count}</Text>
          </View>
        </View>

        {count === 0 && (
          <View style={styles.hintBar}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={Colors.brand.greenMid}
            />
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        )}

        {!loading && !error && leagues.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.leagueFilter}
            contentContainerStyle={styles.leagueFilterContent}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              onPress={() => setSelectedLeague(null)}
              style={[
                styles.leagueChip,
                selectedLeague == null && styles.leagueChipActive,
              ]}
            >
              <Text
                style={[
                  styles.leagueChipText,
                  selectedLeague == null && styles.leagueChipTextActive,
                ]}
              >
                {tr.footballAllLeagues}
              </Text>
            </Pressable>
            {leagues.map((league) => {
              const active = selectedLeague === league.name;
              return (
                <Pressable
                  key={league.name}
                  onPress={() =>
                    setSelectedLeague(active ? null : league.name)
                  }
                  style={[styles.leagueChip, active && styles.leagueChipActive]}
                >
                  <Text
                    style={[
                      styles.leagueChipText,
                      active && styles.leagueChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {league.name}
                  </Text>
                  <Text
                    style={[
                      styles.leagueChipCount,
                      active && styles.leagueChipCountActive,
                    ]}
                  >
                    {league.matches.length}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPad },
          ]}
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
          ) : filteredLeagues.length === 0 ? (
            <View style={styles.loadWrap}>
              <Text style={styles.loadText}>{tr.footballNoMatches}</Text>
            </View>
          ) : (
            filteredLeagues.map((league) => (
              <LeagueBlock
                key={league.name}
                league={league}
                markets={markets}
                selections={selections}
                onPick={handlePick}
                source={source}
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
  root: { flex: 1, backgroundColor: "#E9F0EC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#fff",
    textAlign: "center",
  },
  pickBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pickBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  hintBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadow.sm,
  },
  hintText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  leagueFilter: {
    flexGrow: 0,
    marginTop: Spacing.sm,
  },
  leagueFilterContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    alignItems: "center",
  },
  leagueChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 220,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  leagueChipActive: {
    backgroundColor: Colors.brand.greenButton,
    borderColor: Colors.brand.greenButton,
  },
  leagueChipText: {
    flexShrink: 1,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
  },
  leagueChipTextActive: {
    color: "#fff",
  },
  leagueChipCount: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.light.placeholder,
    backgroundColor: Colors.brand.offWhite,
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  leagueChipCountActive: {
    color: Colors.brand.greenDark,
    backgroundColor: "#fff",
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.sm + 2,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  loadWrap: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  loadText: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.light.error,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton + "22",
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenButton,
  },
  leagueBlock: { gap: 6 },
  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
  },
  leagueAccent: {
    width: 3,
    height: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.brand.greenButton,
  },
  leagueIcon: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  leagueName: {
    flex: 1,
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
    letterSpacing: 0.2,
  },
  leagueCountPill: {
    backgroundColor: "#fff",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    ...Shadow.sm,
  },
  leagueCount: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenMid,
  },
  leagueMatches: { gap: 8 },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadow.sm,
  },
  matchCardMajor: {
    borderColor: Colors.brand.gold,
    borderWidth: 1.5,
    backgroundColor: "#FFFCF5",
  },
  matchCardSelected: {
    borderColor: Colors.brand.greenButton,
    borderWidth: 1.5,
  },
  matchHeader: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: "#F8FBF9",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    gap: 4,
  },
  matchHeaderMajor: {
    backgroundColor: "#FFF6DC",
    borderBottomColor: "#F0D78A",
  },
  matchMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 16,
  },
  majorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.brand.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  majorBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.greenDark,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  matchTimeText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenMid,
  },
  matchTimeTextMajor: {
    color: Colors.brand.greenDark,
    fontWeight: FontWeight.bold,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  teamCol: {
    flex: 1,
    minWidth: 0,
  },
  teamColAway: {
    alignItems: "flex-end",
  },
  teamName: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    lineHeight: 18,
  },
  teamNameAway: {
    textAlign: "right",
  },
  teamNameMajor: {
    color: Colors.brand.greenDark,
  },
  vsText: {
    fontSize: 11,
    fontWeight: FontWeight.extrabold,
    color: Colors.light.textSecondary,
    letterSpacing: 0.2,
  },
  vsTextMajor: {
    color: "#8B6914",
  },
  marketsBody: {
    padding: 6,
    gap: 4,
  },
  marketsBodyMajor: {
    backgroundColor: "#FFFCF5",
  },
  marketSection: {
    gap: 4,
  },
  marketSectionLast: {
    marginBottom: 0,
  },
  marketTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  marketTitle: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenMid,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    gap: 6,
  },
  chipRowThree: {
    flexDirection: "row",
    gap: 6,
  },
  triRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "stretch",
  },
  triSide: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#F4F8F6",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  triSideSelected: {
    backgroundColor: Colors.brand.greenDark,
    borderColor: Colors.brand.greenDark,
  },
  triSideText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    textAlign: "center",
  },
  triSideTextSelected: {
    color: "#fff",
  },
  triCenter: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  triCenterText: {
    fontSize: 13,
    fontWeight: FontWeight.extrabold,
    color: "#fff",
    letterSpacing: -0.2,
  },
  csWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#F4F8F6",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    position: "relative",
  },
  chipCompact: {
    flexGrow: 0,
    flexBasis: "22%",
    minWidth: "22%",
    paddingVertical: 5,
  },
  chipPressed: {
    backgroundColor: "#EEF5F1",
    transform: [{ scale: 0.98 }],
  },
  chipSelected: {
    backgroundColor: Colors.brand.greenButton,
    borderColor: Colors.brand.greenDark,
  },
  chipOdds: {
    fontSize: 13,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.greenDark,
    letterSpacing: -0.2,
  },
  chipOddsSelected: {
    color: "#fff",
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 12,
  },
  chipLabelOnly: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  chipLabelSelected: {
    color: "rgba(255,255,255,0.92)",
  },
  chipSelectedDot: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.brand.greenDark,
    alignItems: "center",
    justifyContent: "center",
  },
});
