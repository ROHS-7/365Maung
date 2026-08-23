import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/app-text';
import { TeamBadge } from '@/components/team-badge';
import { LeagueFilterModal } from '@/components/league-filter-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoginPromptCard } from '@/components/login-prompt-card';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { fetchFootballMatchResults } from '@/services/football';
import type { FootballMatchResult } from '@/types/football';
import { formatDrawDate, teamDisplayName } from '@/utils/football-ui';
import { teamBadgeName, teamLogoUrl } from '@/utils/team-logo';
import { safeBack } from '@/utils/navigation';

type MatchRow = {
  id: number;
  time: string;
  home: string;
  away: string;
  homeBadgeName: string;
  awayBadgeName: string;
  homeLogo?: string;
  awayLogo?: string;
  /** Score shown in the main pill (FT preferred, else HT). */
  displayHome: number | null;
  displayAway: number | null;
  htHome: number | null;
  htAway: number | null;
  hasFt: boolean;
  hasHt: boolean;
  status: 'FT' | 'HT' | 'FT/HT';
};

type League = { name: string; matches: MatchRow[] };

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
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function formatMatchTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
}

function hasFtPair(m: FootballMatchResult): boolean {
  return m.home_result != null && m.away_result != null;
}

function hasHtPair(m: FootballMatchResult): boolean {
  return m.home_ht_result != null && m.away_ht_result != null;
}

function mapResultToRow(
  m: FootballMatchResult,
  lang: 'en' | 'my',
): MatchRow | null {
  const ft = hasFtPair(m);
  const ht = hasHtPair(m);
  if (!ft && !ht) return null;

  let status: MatchRow['status'] = 'FT';
  if (ft && ht) status = 'FT/HT';
  else if (ht && !ft) status = 'HT';
  else status = 'FT';

  return {
    id: m.id,
    time: formatMatchTime(m.match_time),
    home: teamDisplayName(m.home, lang),
    away: teamDisplayName(m.away, lang),
    homeBadgeName: teamBadgeName(m.home),
    awayBadgeName: teamBadgeName(m.away),
    homeLogo: teamLogoUrl(m.home),
    awayLogo: teamLogoUrl(m.away),
    displayHome: ft ? m.home_result : m.home_ht_result,
    displayAway: ft ? m.away_result : m.away_ht_result,
    htHome: ht ? m.home_ht_result : null,
    htAway: ht ? m.away_ht_result : null,
    hasFt: ft,
    hasHt: ht,
    status,
  };
}

function groupResultsByLeague(
  matches: FootballMatchResult[],
  lang: 'en' | 'my',
): League[] {
  const map = new Map<string, MatchRow[]>();
  for (const m of matches) {
    const row = mapResultToRow(m, lang);
    if (!row) continue;
    const name = m.league.name || 'Football';
    const arr = map.get(name) ?? [];
    arr.push(row);
    map.set(name, arr);
  }
  return Array.from(map.entries()).map(([name, leagueMatches]) => ({
    name,
    matches: leagueMatches,
  }));
}

function MatchCard({ m, last }: { m: MatchRow; last: boolean }) {
  const highlight = m.hasFt;
  const homeWin =
    highlight &&
    m.displayHome != null &&
    m.displayAway != null &&
    m.displayHome > m.displayAway;
  const awayWin =
    highlight &&
    m.displayHome != null &&
    m.displayAway != null &&
    m.displayAway > m.displayHome;
  const isDraw =
    highlight &&
    m.displayHome != null &&
    m.displayAway != null &&
    m.displayHome === m.displayAway;

  return (
    <View style={[s.matchCard, !last && s.matchCardBorder]}>
      <View style={s.matchTop}>
        <View
          style={[
            s.statusPill,
            m.status === 'HT' ? s.statusPillHt : s.statusPillFt,
          ]}
        >
          <RNText style={s.statusPillText}>{m.status}</RNText>
        </View>
        <Text style={s.matchTime}>{m.time}</Text>
      </View>

      <View style={s.matchBody}>
        <View style={s.teamCol}>
          <TeamBadge name={m.homeBadgeName} logo={m.homeLogo} size={20} />
          <View style={s.teamNameClip}>
            <Text
              compact
              style={[
                s.teamLineName,
                (homeWin || isDraw) && s.teamLineNameWin,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {m.home}
            </Text>
          </View>
        </View>

        <View style={s.scorePill}>
          <RNText style={[s.scorePillNum, homeWin && s.scorePillNumWin]}>
            {m.displayHome ?? '—'}
          </RNText>
          <RNText style={s.scorePillSep}>:</RNText>
          <RNText style={[s.scorePillNum, awayWin && s.scorePillNumWin]}>
            {m.displayAway ?? '—'}
          </RNText>
        </View>

        <View style={[s.teamCol, s.teamColRight]}>
          <View style={s.teamNameClip}>
            <Text
              compact
              style={[
                s.teamLineName,
                s.teamLineNameRight,
                (awayWin || isDraw) && s.teamLineNameWin,
              ]}
              numberOfLines={1}
              ellipsizeMode="head"
            >
              {m.away}
            </Text>
          </View>
          <TeamBadge name={m.awayBadgeName} logo={m.awayLogo} size={20} />
        </View>
      </View>

      {m.hasHt && m.hasFt ? (
        <Text style={s.htLine}>
          HT {m.htHome} - {m.htAway}
        </Text>
      ) : null}
    </View>
  );
}

function LeagueCard({ league }: { league: League }) {
  return (
    <View style={s.leagueSection}>
      <View style={s.leagueHeader}>
        <View style={s.leagueIconWrap}>
          <Ionicons name="football" size={15} color={Colors.brand.greenMid} />
        </View>
        <Text style={s.leagueName}>{league.name}</Text>
        <View style={s.leagueCountPill}>
          <RNText style={s.leagueCount}>{league.matches.length}</RNText>
        </View>
      </View>
      <View style={s.leagueCard}>
        {league.matches.map((m, i) => (
          <MatchCard
            key={m.id}
            m={m}
            last={i === league.matches.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

function BadgeCount({
  value,
  style,
}: {
  value: string | number;
  style: object;
}) {
  return <RNText style={[s.badgeCircleText, style]}>{value}</RNText>;
}

export default function ScoresScreen() {
  const { tr, lang } = useLanguage();
  const { isAuthenticated, token } = useAuth();
  const [date, setDate] = useState(new Date());
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeagues, setSelectedLeagues] = useState<string[] | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const drawDateStr = useMemo(() => formatDrawDate(date), [date.toDateString()]);

  const filteredLeagues = useMemo(() => {
    if (selectedLeagues == null) return leagues;
    if (selectedLeagues.length === 0) return [];
    const set = new Set(selectedLeagues);
    return leagues.filter((l) => set.has(l.name));
  }, [leagues, selectedLeagues]);

  const visibleMatchCount = useMemo(
    () => filteredLeagues.reduce((sum, league) => sum + league.matches.length, 0),
    [filteredLeagues],
  );

  const filterActive = selectedLeagues != null;
  const filterSummary = filterActive ? String(selectedLeagues.length) : tr.footballAllLeagues;
  const canFilter = !loading && !error && leagues.length > 0;

  const load = useCallback(
    async (opts?: { soft?: boolean }) => {
      if (!token) return;
      if (!opts?.soft) setLoading(true);
      setError(null);
      try {
        const data = await fetchFootballMatchResults(token, drawDateStr);
        setLeagues(groupResultsByLeague(data.matches, lang));
      } catch (e) {
        setError(e instanceof Error ? e.message : tr.scoresEmpty);
        setLeagues([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, drawDateStr, lang, tr.scoresEmpty],
  );

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  useEffect(() => {
    setSelectedLeagues(null);
  }, [drawDateStr]);

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

  const prev = addDays(date, -1);
  const next = addDays(date, 1);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => safeBack()}
            style={s.headerBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{tr.scoresTitle}</Text>
          <View style={s.headerBtn} />
        </View>
        <View style={s.guestWrap}>
          <LoginPromptCard
            title={tr.guestWelcomeTitle}
            subtitle={tr.guestWelcomeSub}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => safeBack()}
          style={s.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{tr.scoresTitle}</Text>
        <View style={s.headerRight}>
          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            disabled={!canFilter}
            style={[
              s.headerFilterPill,
              filterActive && s.headerFilterPillActive,
              !canFilter && s.headerFilterPillDisabled,
            ]}
            hitSlop={4}
            activeOpacity={0.75}
          >
            <Ionicons
              name="options-outline"
              size={15}
              color={
                !canFilter
                  ? 'rgba(255,255,255,0.35)'
                  : filterActive
                    ? Colors.brand.gold
                    : '#fff'
              }
            />
            <Text
              style={[
                s.headerFilterLabel,
                filterActive && s.headerFilterLabelActive,
                !canFilter && s.headerFilterLabelDisabled,
              ]}
              numberOfLines={1}
            >
              {tr.footballLeagueFilter}
            </Text>
            {filterActive ? (
              <View style={s.headerFilterActiveBadge}>
                <BadgeCount
                  value={filterSummary}
                  style={s.headerFilterActiveBadgeText}
                />
              </View>
            ) : null}
          </TouchableOpacity>
          <View style={s.pickBadge}>
            <BadgeCount value={visibleMatchCount} style={s.pickBadgeText} />
          </View>
        </View>
      </View>

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

      <View style={s.dateNav}>
        <TouchableOpacity
          style={s.dateBtn}
          onPress={() => setDate(prev)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={14}
            color={Colors.light.textSecondary}
          />
          <Text style={s.dateSide}>{fmtDate(prev)}</Text>
        </TouchableOpacity>
        <View style={s.dateCenter}>
          <Text style={s.dateCenterText}>
            {isToday(date) ? tr.betListToday : fmtDate(date)}
          </Text>
        </View>
        <TouchableOpacity
          style={s.dateBtn}
          onPress={() => setDate(next)}
          activeOpacity={0.7}
        >
          <Text style={s.dateSide}>{fmtDate(next)}</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={Colors.light.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load({ soft: true });
            }}
            tintColor={Colors.brand.greenButton}
          />
        }
      >
        {loading && leagues.length === 0 ? (
          <View style={s.stateWrap}>
            <ActivityIndicator color={Colors.brand.greenButton} />
          </View>
        ) : error ? (
          <View style={s.stateWrap}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => load()}>
              <Text style={s.retryText}>{tr.footballRetry}</Text>
            </TouchableOpacity>
          </View>
        ) : filteredLeagues.length === 0 ? (
          <View style={s.stateWrap}>
            <Text style={s.emptyText}>{tr.scoresEmpty}</Text>
          </View>
        ) : (
          filteredLeagues.map((league) => (
            <LeagueCard key={league.name} league={league} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDEEF2' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  headerBtn: { padding: 4, width: 36 },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flexShrink: 1,
    maxWidth: '46%',
  },
  headerFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: 132,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  headerFilterPillActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: Colors.brand.gold,
  },
  headerFilterPillDisabled: {
    opacity: 0.5,
  },
  headerFilterLabel: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },
  headerFilterLabelActive: {
    color: Colors.brand.gold,
  },
  headerFilterLabelDisabled: {
    color: 'rgba(255,255,255,0.35)',
  },
  headerFilterActiveBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerFilterActiveBadgeText: {
    fontSize: 9,
    lineHeight: 9,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  badgeCircleText: {
    textAlign: 'center',
    includeFontPadding: false,
    paddingTop: 0,
    paddingBottom: 0,
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const }
      : {}),
  },
  pickBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pickBadgeText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },

  dateNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 13,
  },
  dateSide: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: 13,
  },
  dateCenterText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 12, gap: 4, paddingBottom: 32, flexGrow: 1 },

  guestWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryBtn: {
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: '#fff',
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },

  leagueSection: { marginBottom: 14 },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
    gap: 8,
  },
  leagueIconWrap: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  leagueCountPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    ...Shadow.sm,
  },
  leagueCount: {
    fontSize: 10,
    lineHeight: 10,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenMid,
    textAlign: 'center',
    includeFontPadding: false,
  },

  leagueCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Shadow.sm,
  },

  matchCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  matchCardBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  matchTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillFt: {
    backgroundColor: '#EF8121',
  },
  statusPillHt: {
    backgroundColor: '#F09440',
  },
  statusPillText: {
    fontSize: 9,
    lineHeight: 9,
    fontWeight: FontWeight.extrabold,
    color: '#FFF5E1',
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  matchTime: { fontSize: 11, color: Colors.light.placeholder },
  matchBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamCol: {
    flex: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  teamColRight: {
    justifyContent: 'flex-end',
  },
  teamNameClip: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  teamLineName: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: FontWeight.medium,
    color: Colors.light.textSecondary,
  },
  teamLineNameRight: { textAlign: 'right' },
  teamLineNameWin: {
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  scorePill: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.offWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 2,
    minWidth: 52,
    justifyContent: 'center',
  },
  scorePillNum: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.extrabold,
    color: Colors.light.placeholder,
    minWidth: 12,
    textAlign: 'center',
  },
  scorePillNumWin: { color: Colors.light.text },
  scorePillSep: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.light.placeholder,
  },
  htLine: {
    fontSize: 10,
    color: Colors.light.placeholder,
    textAlign: 'center',
    marginTop: 6,
  },
});
