import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoginPromptCard } from '@/components/login-prompt-card';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { fetchFootballMatchResults } from '@/services/football';
import type { FootballMatchResult } from '@/types/football';
import { formatDrawDate, teamDisplayName } from '@/utils/football-ui';
import { safeBack } from '@/utils/navigation';

type MatchRow = {
  id: number;
  time: string;
  home: string;
  away: string;
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

const AVATAR_COLORS = [
  '#2563EB',
  '#DC2626',
  '#D97706',
  '#7C3AED',
  '#059669',
  '#DB2777',
  '#0891B2',
  '#EA580C',
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
        <View style={s.statusPill}>
          <Text style={s.statusPillText}>{m.status}</Text>
        </View>
        <Text style={s.matchTime}>{m.time}</Text>
      </View>

      <View style={s.matchBody}>
        <View style={s.teamLine}>
          <View style={[s.teamBadge, { backgroundColor: avatarColor(m.home) }]}>
            <Text style={s.teamBadgeText}>{initials(m.home)}</Text>
          </View>
          <Text
            style={[s.teamLineName, (homeWin || isDraw) && s.teamLineNameWin]}
            numberOfLines={1}
          >
            {m.home}
          </Text>
        </View>

        <View style={s.scorePill}>
          <Text style={[s.scorePillNum, homeWin && s.scorePillNumWin]}>
            {m.displayHome ?? '—'}
          </Text>
          <Text style={s.scorePillSep}>:</Text>
          <Text style={[s.scorePillNum, awayWin && s.scorePillNumWin]}>
            {m.displayAway ?? '—'}
          </Text>
        </View>

        <View style={[s.teamLine, s.teamLineRight]}>
          <Text
            style={[
              s.teamLineName,
              s.teamLineNameRight,
              (awayWin || isDraw) && s.teamLineNameWin,
            ]}
            numberOfLines={1}
          >
            {m.away}
          </Text>
          <View style={[s.teamBadge, { backgroundColor: avatarColor(m.away) }]}>
            <Text style={s.teamBadgeText}>{initials(m.away)}</Text>
          </View>
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
        <Text style={s.leagueCount}>{league.matches.length}</Text>
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

export default function ScoresScreen() {
  const { tr, lang } = useLanguage();
  const { isAuthenticated, token } = useAuth();
  const [date, setDate] = useState(new Date());
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drawDateStr = useMemo(() => formatDrawDate(date), [date.toDateString()]);

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
        <View style={s.headerBtn} />
      </View>

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
        ) : leagues.length === 0 ? (
          <View style={s.stateWrap}>
            <Text style={s.emptyText}>{tr.scoresEmpty}</Text>
          </View>
        ) : (
          leagues.map((league) => (
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
    justifyContent: 'space-between',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  headerBtn: { padding: 4, minWidth: 36 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
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
  leagueCount: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
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
    backgroundColor: Colors.brand.offWhite,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenMid,
    letterSpacing: 0.4,
  },
  matchTime: { fontSize: 11, color: Colors.light.placeholder },
  matchBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  teamLineRight: { flexDirection: 'row', justifyContent: 'flex-end' },
  teamBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  teamBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  teamLineName: {
    flexShrink: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.light.textSecondary,
  },
  teamLineNameRight: { textAlign: 'right' },
  teamLineNameWin: {
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.offWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
    minWidth: 58,
    justifyContent: 'center',
  },
  scorePillNum: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.light.placeholder,
    minWidth: 14,
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
