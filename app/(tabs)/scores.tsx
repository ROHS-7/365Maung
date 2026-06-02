import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';

// ─── Types ────────────────────────────────────────────────────────────────────

type Match = {
  time: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  htHome: number;
  htAway: number;
  status: string;
};

type League = { name: string; matches: Match[] };

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LEAGUES: League[] = [
  {
    name: 'Italy Serie A',
    matches: [
      { time: '00:30', home: 'Bologna',       away: 'Salernitana', homeScore: 3, awayScore: 2, htHome: 3, htAway: 2, status: 'FT' },
      { time: '02:45', home: 'Empoli',        away: 'Lazio',        homeScore: 1, awayScore: 3, htHome: 1, htAway: 3, status: 'FT' },
      { time: '00:30', home: 'Hellas Verona', away: 'US Sassuolo',  homeScore: 2, awayScore: 3, htHome: 2, htAway: 3, status: 'FT' },
      { time: '00:30', home: 'Inter Milan',   away: 'Genoa',        homeScore: 4, awayScore: 0, htHome: 4, htAway: 0, status: 'FT' },
      { time: '02:45', home: 'Napoli',        away: 'Venezia',      homeScore: 2, awayScore: 0, htHome: 2, htAway: 0, status: 'FT' },
      { time: '02:45', home: 'AS Roma',       away: 'Fiorentina',   homeScore: 3, awayScore: 1, htHome: 3, htAway: 1, status: 'FT' },
      { time: '02:45', home: 'Torino',        away: 'Atalanta',     homeScore: 1, awayScore: 2, htHome: 1, htAway: 2, status: 'FT' },
      { time: '00:30', home: 'Udinese',       away: 'Juventus',     homeScore: 2, awayScore: 2, htHome: 2, htAway: 2, status: 'FT' },
    ],
  },
  {
    name: 'England Premier League',
    matches: [
      { time: '21:00', home: 'Arsenal',   away: 'Chelsea',  homeScore: 2, awayScore: 1, htHome: 1, htAway: 0, status: 'FT' },
      { time: '23:30', home: 'Liverpool', away: 'Man City', homeScore: 3, awayScore: 3, htHome: 2, htAway: 1, status: 'FT' },
      { time: '21:00', home: 'Tottenham', away: 'Everton',  homeScore: 1, awayScore: 0, htHome: 0, htAway: 0, status: 'FT' },
    ],
  },
  {
    name: 'Spain La Liga',
    matches: [
      { time: '03:00', home: 'Real Madrid', away: 'Barcelona', homeScore: 2, awayScore: 0, htHome: 1, htAway: 0, status: 'FT' },
      { time: '01:15', home: 'Atletico',    away: 'Sevilla',   homeScore: 1, awayScore: 1, htHome: 0, htAway: 1, status: 'FT' },
    ],
  },
];

// ─── Avatar colors ────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#2563EB','#DC2626','#D97706','#7C3AED','#059669','#DB2777','#0891B2','#EA580C'];

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

// ─── MatchCard ────────────────────────────────────────────────────────────────

function MatchCard({ m, last }: { m: Match; last: boolean }) {
  const homeWin = m.homeScore > m.awayScore;
  const awayWin = m.awayScore > m.homeScore;
  const isDraw = m.homeScore === m.awayScore;

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
          <Text style={[s.teamLineName, (homeWin || isDraw) && s.teamLineNameWin]} numberOfLines={1}>
            {m.home}
          </Text>
        </View>

        <View style={s.scorePill}>
          <Text style={[s.scorePillNum, homeWin && s.scorePillNumWin]}>{m.homeScore}</Text>
          <Text style={s.scorePillSep}>:</Text>
          <Text style={[s.scorePillNum, awayWin && s.scorePillNumWin]}>{m.awayScore}</Text>
        </View>

        <View style={[s.teamLine, s.teamLineRight]}>
          <Text style={[s.teamLineName, s.teamLineNameRight, (awayWin || isDraw) && s.teamLineNameWin]} numberOfLines={1}>
            {m.away}
          </Text>
          <View style={[s.teamBadge, { backgroundColor: avatarColor(m.away) }]}>
            <Text style={s.teamBadgeText}>{initials(m.away)}</Text>
          </View>
        </View>
      </View>

      <Text style={s.htLine}>HT {m.htHome} - {m.htAway}</Text>
    </View>
  );
}

// ─── LeagueCard ───────────────────────────────────────────────────────────────

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
          <MatchCard key={i} m={m} last={i === league.matches.length - 1} />
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ScoresScreen() {
  const { tr } = useLanguage();
  const [date, setDate] = useState(new Date());

  const prev = addDays(date, -1);
  const next = addDays(date, 1);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{tr.scoresTitle}</Text>
        <View style={s.headerBtn} />
      </View>

      {/* Date navigator */}
      <View style={s.dateNav}>
        <TouchableOpacity style={s.dateBtn} onPress={() => setDate(prev)} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={14} color={Colors.light.textSecondary} />
          <Text style={s.dateSide}>{fmtDate(prev)}</Text>
        </TouchableOpacity>
        <View style={s.dateCenter}>
          <Text style={s.dateCenterText}>{isToday(date) ? 'Today' : fmtDate(date)}</Text>
        </View>
        <TouchableOpacity style={s.dateBtn} onPress={() => setDate(next)} activeOpacity={0.7}>
          <Text style={s.dateSide}>{fmtDate(next)}</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {MOCK_LEAGUES.map((league, i) => (
          <LeagueCard key={i} league={league} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  headerBtn:   { padding: 4, minWidth: 36 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },

  // Date nav
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
  dateCenterText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.light.text },

  scroll: { flex: 1 },
  scrollContent: { padding: 12, gap: 4, paddingBottom: 32 },

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
