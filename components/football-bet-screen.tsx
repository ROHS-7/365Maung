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
import { useFightMatches } from "@/hooks/use-fight-matches";
import { useFootballMatches } from "@/hooks/use-football-matches";
import { useHideParentTabBar } from "@/hooks/use-hide-parent-tab-bar";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { submitBetSlip } from "@/services/football";
import { showAlert } from "@/utils/app-alert";
import type { FootballMarket } from "@/types/football";
import {
  ALL_MARKETS,
  buildMatchMap,
  buildSubmitPayload,
  findOddsChangedMatchIds,
  formatDecimalOdds,
  makeSelectKey,
  parseSelectKey,
  pickLabel,
  hdpMarketFromList,
  ouMarketFromList,
  toWinMarketFromList,
  uiMatchHasValidMarket,
  type UiLeagueData,
  type UiMatchData,
} from "@/utils/football-ui";
import { safeBack } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { router, useFocusEffect } from "expo-router";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
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

type LeagueFilterModalProps = {
  visible: boolean;
  leagues: UiLeagueData[];
  /** `null` = all leagues. `[]` = none. Otherwise explicit names. */
  selected: string[] | null;
  onClose: () => void;
  onApply: (names: string[] | null) => void;
  title: string;
  allLabel: string;
  applyLabel: string;
};

type Props = {
  title: string;
  mode: "single" | "mix";
  markets: FootballMarket[];
  minPicks: number;
  stakePlaceholder?: string;
  hint: string;
  minErr: string;
  /** Defaults to football matches API. */
  source?: "football" | "esports" | "fight";
  /** When false, odds are shown but picks / slip / submit are disabled. */
  allowBetting?: boolean;
};

type BetSource = NonNullable<Props["source"]>;

function LeagueFilterModal({
  visible,
  leagues,
  selected,
  onClose,
  onApply,
  title,
  allLabel,
  applyLabel,
}: LeagueFilterModalProps) {
  const [draft, setDraft] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    // Show explicit checks: null (all) → every league checked.
    setDraft(
      selected == null ? leagues.map((l) => l.name) : [...selected],
    );
  }, [visible, selected, leagues]);

  const allNames = useMemo(() => leagues.map((l) => l.name), [leagues]);
  const allSelected =
    leagues.length > 0 && draft.length === leagues.length;

  function toggleAll() {
    setDraft(allSelected ? [] : allNames);
  }

  function toggleLeague(name: string) {
    setDraft((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name],
    );
  }

  function handleApply() {
    if (draft.length === 0) {
      onApply([]);
      return;
    }
    if (draft.length === leagues.length) {
      onApply(null);
      return;
    }
    onApply(draft);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.filterOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.filterSheet}
          onPress={(e) => e.stopPropagation?.()}
        >
          <View style={styles.filterHandle} />
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons
                name="close"
                size={22}
                color={Colors.light.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.filterList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable onPress={toggleAll} style={styles.filterRow}>
              <Ionicons
                name={allSelected ? "checkbox" : "square-outline"}
                size={22}
                color={
                  allSelected
                    ? Colors.brand.greenButton
                    : Colors.light.placeholder
                }
              />
              <Text style={styles.filterRowText}>{allLabel}</Text>
            </Pressable>

            {leagues.map((league) => {
              const checked = draft.includes(league.name);
              return (
                <Pressable
                  key={league.name}
                  onPress={() => toggleLeague(league.name)}
                  style={styles.filterRow}
                >
                  <Ionicons
                    name={checked ? "checkbox" : "square-outline"}
                    size={22}
                    color={
                      checked
                        ? Colors.brand.greenButton
                        : Colors.light.placeholder
                    }
                  />
                  <Text style={styles.filterRowText} numberOfLines={2}>
                    {league.name}
                  </Text>
                  <Text style={styles.filterRowCount}>
                    {league.matches.length}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.filterApplyBtn}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Text style={styles.filterApplyText}>{applyLabel}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const OddsChip = memo(function OddsChip({
  label,
  odds,
  selected,
  onPress,
  compact,
}: {
  label: string;
  odds?: string;
  selected: boolean;
  onPress?: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.chipCompact,
        selected && styles.chipSelected,
        pressed && !!onPress && !selected && styles.chipPressed,
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
});

/** Left | green center line | Right — like Over | 2.5 | Under */
const TriLineRow = memo(function TriLineRow({
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
});

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

const MatchMarkets = memo(function MatchMarkets({
  match,
  markets,
  selectedKey,
  onPick,
  flash,
  exiting,
  onExited,
  interactive = true,
}: {
  match: UiMatchData;
  markets: FootballMarket[];
  selectedKey: string | null;
  onPick: (matchId: string, market: FootballMarket, pick: string) => void;
  flash?: boolean;
  exiting?: boolean;
  onExited?: (matchId: string) => void;
  interactive?: boolean;
}) {
  const { tr } = useLanguage();
  // Always home left / away right (match header order). Odds line stays on giving team.
  const homeIsGiving = match.hdpGiving === "home";
  const homePick = homeIsGiving ? "giving" : "receiving";
  const awayPick = homeIsGiving ? "receiving" : "giving";
  const hasSelection = selectedKey != null;
  const hideMarketTitle = true;
  const hdpMarket = hdpMarketFromList(markets);
  const ouMarket = ouMarketFromList(markets);
  const toWinMarket = toWinMarketFromList(markets);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitTranslate = useRef(new Animated.Value(0)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitedRef = useRef(false);

  useEffect(() => {
    if (!flash || exiting) {
      flashAnim.setValue(0);
      return;
    }
    flashAnim.setValue(0);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 5 },
    );
    anim.start();
    return () => anim.stop();
  }, [flash, exiting, flashAnim]);

  useEffect(() => {
    if (!exiting || exitedRef.current) return;
    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(exitTranslate, {
        toValue: -16,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(exitScale, {
        toValue: 0.96,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !exitedRef.current) {
        exitedRef.current = true;
        onExited?.(match.id);
      }
    });
  }, [exiting, exitOpacity, exitTranslate, exitScale, match.id, onExited]);

  const showFlash = Boolean(flash && !exiting);

  const staticCardStyle = [
    styles.matchCard,
    match.isMajor && styles.matchCardMajor,
    hasSelection && styles.matchCardSelected,
  ];

  const cardInner = (
    <>
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
                label={match.home}
                odds={homeIsGiving ? match.hdpLine : undefined}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, hdpMarket, homePick)
                }
                onPress={() => onPick(match.id, hdpMarket, homePick)}
              />
              <OddsChip
                label={match.away}
                odds={homeIsGiving ? undefined : match.hdpLine}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, hdpMarket, awayPick)
                }
                onPress={() => onPick(match.id, hdpMarket, awayPick)}
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
              onLeft={() => onPick(match.id, ouMarket, "up")}
              onRight={() => onPick(match.id, ouMarket, "down")}
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
                onPress={() => onPick(match.id, "sone_ma", "sone")}
              />
              <OddsChip
                label={tr.maungEven}
                odds={formatDecimalOdds(match.maOdds)}
                selected={
                  selectedKey === makeSelectKey(match.id, "sone_ma", "ma")
                }
                onPress={() => onPick(match.id, "sone_ma", "ma")}
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
                onPress={() => onPick(match.id, "match_winner_1x2", "home")}
              />
              <OddsChip
                label={tr.footballDraw}
                odds={formatDecimalOdds(match.oneXTwo.draw)}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, "match_winner_1x2", "draw")
                }
                onPress={() => onPick(match.id, "match_winner_1x2", "draw")}
              />
              <OddsChip
                label={match.away}
                odds={formatDecimalOdds(match.oneXTwo.away)}
                selected={
                  selectedKey ===
                  makeSelectKey(match.id, "match_winner_1x2", "away")
                }
                onPress={() => onPick(match.id, "match_winner_1x2", "away")}
              />
            </View>
          </MarketSection>
        )}

        {toWinMarket &&
          uiMatchHasValidMarket(match, toWinMarket) &&
          match.toWin && (
          <MarketSection title={tr.esportsToWin} hideTitle={hideMarketTitle}>
            <View style={styles.chipRow}>
              <OddsChip
                label={match.home}
                odds={formatDecimalOdds(match.toWin.home)}
                selected={
                  selectedKey === makeSelectKey(match.id, toWinMarket, "home")
                }
                onPress={
                  interactive
                    ? () => onPick(match.id, toWinMarket, "home")
                    : undefined
                }
              />
              <OddsChip
                label={match.away}
                odds={formatDecimalOdds(match.toWin.away)}
                selected={
                  selectedKey === makeSelectKey(match.id, toWinMarket, "away")
                }
                onPress={
                  interactive
                    ? () => onPick(match.id, toWinMarket, "away")
                    : undefined
                }
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
                {Array.from(
                  { length: Math.ceil(match.correctScores.length / 4) },
                  (_, rowIndex) => {
                    const row = match.correctScores.slice(
                      rowIndex * 4,
                      rowIndex * 4 + 4,
                    );
                    return (
                      <View key={rowIndex} style={styles.csRow}>
                        {row.map((item) => (
                          <View key={item.key} style={styles.csCell}>
                            <OddsChip
                              label={item.key}
                              odds={formatDecimalOdds(item.odds)}
                              selected={
                                selectedKey ===
                                makeSelectKey(match.id, "correct_score", item.key)
                              }
                              onPress={() =>
                                onPick(match.id, "correct_score", item.key)
                              }
                              compact
                            />
                          </View>
                        ))}
                        {row.length < 4
                          ? Array.from(
                              { length: 4 - row.length },
                              (_, pad) => (
                                <View key={`pad-${pad}`} style={styles.csCell} />
                              ),
                            )
                          : null}
                      </View>
                    );
                  },
                )}
              </View>
            </MarketSection>
          )}
      </View>
    </>
  );

  const card = (
    <View style={staticCardStyle}>
      {cardInner}
      {showFlash ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.flashOverlay, { opacity: flashAnim }]}
        />
      ) : null}
    </View>
  );

  if (exiting) {
    return (
      <Animated.View
        style={{
          opacity: exitOpacity,
          transform: [{ translateY: exitTranslate }, { scale: exitScale }],
        }}
      >
        {card}
      </Animated.View>
    );
  }

  return card;
});

type LeagueBlockProps = {
  league: UiLeagueData;
  markets: FootballMarket[];
  selectedByMatch: Record<string, string>;
  onPick: (matchId: string, market: FootballMarket, pick: string) => void;
  source?: BetSource;
  interactive?: boolean;
  flashIds: Set<string>;
  exitingIds: Set<string>;
  onMatchExited: (matchId: string) => void;
};

function leagueHasId(league: UiLeagueData, ids: Set<string>): boolean {
  for (const match of league.matches) {
    if (ids.has(match.id)) return true;
  }
  return false;
}

function areLeagueBlocksEqual(
  prev: LeagueBlockProps,
  next: LeagueBlockProps,
): boolean {
  if (
    prev.league !== next.league ||
    prev.markets !== next.markets ||
    prev.onPick !== next.onPick ||
    prev.source !== next.source ||
    prev.interactive !== next.interactive ||
    prev.onMatchExited !== next.onMatchExited
  ) {
    return false;
  }
  if (prev.flashIds !== next.flashIds) {
    if (
      leagueHasId(prev.league, prev.flashIds) ||
      leagueHasId(next.league, next.flashIds)
    ) {
      return false;
    }
  }
  if (prev.exitingIds !== next.exitingIds) {
    if (
      leagueHasId(prev.league, prev.exitingIds) ||
      leagueHasId(next.league, next.exitingIds)
    ) {
      return false;
    }
  }
  for (const match of next.league.matches) {
    if (prev.selectedByMatch[match.id] !== next.selectedByMatch[match.id]) {
      return false;
    }
  }
  return true;
}

const LeagueBlock = memo(function LeagueBlock({
  league,
  markets,
  selectedByMatch,
  onPick,
  source = "football",
  interactive = true,
  flashIds,
  exitingIds,
  onMatchExited,
}: LeagueBlockProps) {
  const leagueIcon =
    source === "esports"
      ? "game-controller"
      : source === "fight"
        ? "flash"
        : "football";
  return (
    <View style={styles.leagueBlock}>
      <View style={styles.leagueHeader}>
        <View style={styles.leagueAccent} />
        <View style={styles.leagueIcon}>
          <Ionicons
            name={leagueIcon}
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
        {league.matches.map((match) => (
          <MatchMarkets
            key={match.id}
            match={match}
            markets={markets}
            selectedKey={selectedByMatch[match.id] ?? null}
            onPick={onPick}
            interactive={interactive}
            flash={flashIds.has(match.id)}
            exiting={exitingIds.has(match.id)}
            onExited={onMatchExited}
          />
        ))}
      </View>
    </View>
  );
}, areLeagueBlocksEqual);

export function FootballBetScreen({
  title,
  mode,
  markets,
  minPicks,
  stakePlaceholder = "500",
  hint,
  minErr,
  source = "football",
  allowBetting = true,
}: Props) {
  useRequireAuth();
  useHideParentTabBar();
  const { tr } = useLanguage();
  const { token, refreshUser } = useAuth();
  const isFocused = useIsFocused();
  const football = useFootballMatches(mode, {
    markets: source === "football" ? markets : undefined,
    enabled: source === "football" && isFocused,
  });
  const esports = useEsportsMatches({
    enabled: source === "esports" && isFocused,
  });
  const fight = useFightMatches({
    enabled: source === "fight" && isFocused,
  });
  const { leagues, loading, error, reload } =
    source === "esports" ? esports : source === "fight" ? fight : football;
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  const matchMap = useMemo(() => buildMatchMap(leagues), [leagues]);
  const insets = useSafeAreaInsets();
  const [selections, setSelections] = useState<Record<string, true>>({});
  const [stake, setStake] = useState(stakePlaceholder);
  const [submitting, setSubmitting] = useState(false);
  /** `null` = all leagues. `[]` = none. Otherwise explicit names. */
  const [selectedLeagues, setSelectedLeagues] = useState<string[] | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [flashIds, setFlashIds] = useState<Set<string>>(() => new Set());
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const prevLeaguesRef = useRef<UiLeagueData[] | null>(null);
  const filteredLeaguesRef = useRef<UiLeagueData[]>([]);
  const removedIdsRef = useRef(removedIds);
  const exitingIdsRef = useRef(exitingIds);
  const interactingRef = useRef(false);
  const pendingPollRef = useRef(false);
  const interactTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const marketsKey = markets.join(",");
  const stableMarkets = useMemo(
    () => markets,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marketsKey],
  );

  const filteredLeagues = useMemo(() => {
    if (selectedLeagues == null) return leagues;
    if (selectedLeagues.length === 0) return [];
    const set = new Set(selectedLeagues);
    return leagues.filter((l) => set.has(l.name));
  }, [leagues, selectedLeagues]);

  filteredLeaguesRef.current = filteredLeagues;
  removedIdsRef.current = removedIds;
  exitingIdsRef.current = exitingIds;

  const markDueMatches = useCallback(() => {
    const now = Date.now();
    const removed = removedIdsRef.current;
    const exiting = exitingIdsRef.current;
    const due: string[] = [];
    for (const league of filteredLeaguesRef.current) {
      for (const match of league.matches) {
        if (
          match.matchTimeMs <= now &&
          !removed.has(match.id) &&
          !exiting.has(match.id)
        ) {
          due.push(match.id);
        }
      }
    }
    if (due.length === 0) return;

    setExitingIds((prev) => {
      const next = new Set(prev);
      for (const id of due) next.add(id);
      return next;
    });
    setSelections((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;
      let changed = false;
      const next: Record<string, true> = { ...prev };
      for (const key of keys) {
        const { matchId } = parseSelectKey(key);
        if (due.includes(matchId)) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  // Kickoff clock + odds poll only while focused. Skip polls while the
  // user is tapping/scrolling so selection stays instant.
  useFocusEffect(
    useCallback(() => {
      markDueMatches();
      const tickId = setInterval(markDueMatches, 1000);
      const pollId =
        source === "fight"
          ? null
          : setInterval(() => {
              if (interactingRef.current) {
                pendingPollRef.current = true;
                return;
              }
              void reloadRef.current();
            }, 5000);
      return () => {
        clearInterval(tickId);
        if (pollId) clearInterval(pollId);
        if (interactTimerRef.current) {
          clearTimeout(interactTimerRef.current);
          interactTimerRef.current = null;
        }
      };
    }, [markDueMatches, source]),
  );

  const beginInteract = useCallback(() => {
    interactingRef.current = true;
    if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
    interactTimerRef.current = setTimeout(() => {
      interactingRef.current = false;
      interactTimerRef.current = null;
      if (!pendingPollRef.current) return;
      pendingPollRef.current = false;
      void reloadRef.current();
    }, 2000);
  }, []);

  const endInteract = useCallback(() => {
    if (interactTimerRef.current) {
      clearTimeout(interactTimerRef.current);
      interactTimerRef.current = null;
    }
    interactingRef.current = false;
    if (!pendingPollRef.current) return;
    pendingPollRef.current = false;
    InteractionManager.runAfterInteractions(() => {
      void reloadRef.current();
    });
  }, []);

  const displayLeagues = useMemo(() => {
    const now = Date.now();
    let changed = false;
    const out: UiLeagueData[] = [];
    for (const league of filteredLeagues) {
      const matches = league.matches.filter(
        (m) =>
          !removedIds.has(m.id) &&
          (m.matchTimeMs > now || exitingIds.has(m.id)),
      );
      if (matches.length === 0) {
        changed = true;
        continue;
      }
      if (matches.length === league.matches.length) {
        out.push(league);
      } else {
        changed = true;
        out.push({ ...league, matches });
      }
    }
    if (!changed && out.length === filteredLeagues.length) return filteredLeagues;
    return out;
  }, [filteredLeagues, exitingIds, removedIds]);

  const handleMatchExited = useCallback((matchId: string) => {
    setExitingIds((prev) => {
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(matchId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (selectedLeagues == null || leagues.length === 0) return;
    const names = new Set(leagues.map((l) => l.name));
    const next = selectedLeagues.filter((n) => names.has(n));
    if (next.length !== selectedLeagues.length) {
      setSelectedLeagues(next.length === leagues.length ? null : next);
    } else if (next.length === leagues.length) {
      setSelectedLeagues(null);
    }
  }, [leagues, selectedLeagues]);

  // Detect odds changes after poll/refresh and flash those match cards.
  useEffect(() => {
    const prev = prevLeaguesRef.current;
    prevLeaguesRef.current = leagues;
    if (!prev || prev.length === 0 || leagues.length === 0) return;

    const changed = findOddsChangedMatchIds(prev, leagues);
    if (changed.length === 0) return;

    setFlashIds((old) => {
      const next = new Set(old);
      for (const id of changed) next.add(id);
      return next;
    });

    const timer = setTimeout(() => {
      setFlashIds((old) => {
        const next = new Set(old);
        for (const id of changed) next.delete(id);
        return next;
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, [leagues]);

  // Drop slip picks when a match disappears or its market odds become invalid after API refresh.
  useEffect(() => {
    setSelections((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;
      let changed = false;
      const next: Record<string, true> = {};
      for (const key of keys) {
        const { matchId, market } = parseSelectKey(key);
        const match = matchMap.get(matchId);
        if (match && uiMatchHasValidMarket(match, market)) {
          next[key] = true;
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [matchMap]);

  const filterActive = selectedLeagues != null;
  const filterSummary = filterActive
    ? String(selectedLeagues.length)
    : tr.footballAllLeagues;

  const count = Object.keys(selections).length;
  const canBet = count >= minPicks;

  const selectedByMatch = useMemo(() => {
    const map: Record<string, string> = {};
    for (const key of Object.keys(selections)) {
      map[parseSelectKey(key).matchId] = key;
    }
    return map;
  }, [selections]);

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload({ immediate: true });
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const handlePick = useCallback(
    (matchId: string, market: FootballMarket, pick: string) => {
      if (!allowBetting) return;
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
    },
    [mode, allowBetting],
  );

  const handleRemove = useCallback((key: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelections({});
    setStake(stakePlaceholder);
  }, [stakePlaceholder]);

  async function handleOK() {
    if (!allowBetting) return;
    if (!canBet || !token) {
      if (!canBet) showAlert("", minErr);
      return;
    }
    const total = parseInt(stake.replace(/,/g, ""), 10);
    if (!total || total < 1) {
      showAlert("", tr.footballAmountRequired);
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildSubmitPayload(mode, selections, matchMap, total);
      await submitBetSlip(token, payload);
      await refreshUser();
      setSelections({});
      showAlert(tr.footballBetSuccessTitle, tr.footballBetSuccessMsg, [
        {
          text: tr.footballViewBets,
          onPress: () => router.push("/(tabs)/bets" as never),
        },
        { text: tr.ok },
      ]);
    } catch (e) {
      showAlert("", e instanceof Error ? e.message : tr.footballBetFailed);
    } finally {
      setSubmitting(false);
    }
  }

  const safeBottom = Math.max(insets.bottom, 8);
  // Stable pad so opening the slip does not relayout the match list.
  const scrollBottomPad = allowBetting ? safeBottom + 320 : safeBottom + 24;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => safeBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          {allowBetting ? (
            <View style={styles.pickBadge}>
              <Text style={styles.pickBadgeText}>{count}</Text>
            </View>
          ) : (
            <View style={styles.backBtn} />
          )}
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
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={[
                styles.filterBtn,
                filterActive && styles.filterBtnActive,
              ]}
              onPress={() => setFilterOpen(true)}
              activeOpacity={0.85}
            >
              <Ionicons
                name="options-outline"
                size={16}
                color={filterActive ? "#fff" : Colors.brand.greenMid}
              />
              <Text
                style={[
                  styles.filterBtnText,
                  filterActive && styles.filterBtnTextActive,
                ]}
              >
                {tr.footballLeagueFilter}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  filterActive && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filterActive && styles.filterBadgeTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {filterSummary}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <LeagueFilterModal
          visible={filterOpen}
          leagues={leagues}
          selected={selectedLeagues}
          onClose={() => setFilterOpen(false)}
          onApply={(names) => {
            setSelectedLeagues(names);
            setFilterOpen(false);
          }}
          title={tr.hdpLeagues}
          allLabel={tr.footballAllLeagues}
          applyLabel={tr.footballApplyFilter}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPad },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={Platform.OS === "android"}
          onScrollBeginDrag={beginInteract}
          onScrollEndDrag={endInteract}
          onMomentumScrollEnd={endInteract}
          onTouchStart={beginInteract}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.brand.greenButton}
              colors={[Colors.brand.greenButton]}
            />
          }
        >
          {loading ? (
            <View style={styles.loadWrap}>
              <Text style={styles.loadText}>{tr.footballLoadingMatches}</Text>
            </View>
          ) : error ? (
            <View style={styles.loadWrap}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => void reload({ immediate: true })}
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>{tr.footballRetry}</Text>
              </TouchableOpacity>
            </View>
          ) : displayLeagues.length === 0 ? (
            <View style={styles.loadWrap}>
              <Text style={styles.loadText}>{tr.footballNoMatches}</Text>
            </View>
          ) : (
            displayLeagues.map((league) => (
              <LeagueBlock
                key={league.name}
                league={league}
                markets={stableMarkets}
                selectedByMatch={selectedByMatch}
                onPick={handlePick}
                source={source}
                interactive={allowBetting}
                flashIds={flashIds}
                exitingIds={exitingIds}
                onMatchExited={handleMatchExited}
              />
            ))
          )}
        </ScrollView>

               {allowBetting ? (
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
            stakePlaceholder={stakePlaceholder}
          />
        ) : null}
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
  filterBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...Shadow.sm,
  },
  filterBtnActive: {
    backgroundColor: Colors.brand.greenButton,
    borderColor: Colors.brand.greenButton,
  },
  filterBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenMid,
  },
  filterBtnTextActive: { color: "#fff" },
  filterBadge: {
    maxWidth: 120,
    backgroundColor: Colors.brand.offWhite,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  filterBadgeActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.light.textSecondary,
  },
  filterBadgeTextActive: { color: "#fff" },
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 28,
    maxHeight: "75%",
    ...Shadow.lg,
  },
  filterHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  filterTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  filterList: { flexGrow: 0 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  filterRowText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
  },
  filterRowCount: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
  },
  filterApplyBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.xl,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  filterApplyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: "#fff",
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
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(46, 160, 90, 0.18)",
    borderRadius: BorderRadius.md,
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
    gap: 6,
  },
  csRow: {
    flexDirection: "row",
    gap: 6,
  },
  csCell: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
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
    width: "100%",
    flex: 0,
    alignSelf: "stretch",
    minHeight: 52,
    paddingVertical: 8,
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
