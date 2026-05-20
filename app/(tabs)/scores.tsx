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

// ─── TeamSide ─────────────────────────────────────────────────────────────────

function TeamSide({ name, score, align }: { name: string; score: number; align: 'left' | 'right' }) {
  const color = avatarColor(name);
  const isRight = align === 'right';

  return (
    <View style={[s.teamSide, isRight && s.teamSideRight]}>
      {!isRight && (
        <View style={[s.avatar, { backgroundColor: color }]}>
          <Text style={s.avatarText}>{initials(name)}</Text>
        </View>
      )}
      <Text
        style={[s.teamName, isRight ? s.teamNameRight : s.teamNameLeft]}
        numberOfLines={2}
      >
        {name}
      </Text>
      {isRight && (
        <View style={[s.avatar, { backgroundColor: color }]}>
          <Text style={s.avatarText}>{initials(name)}</Text>
        </View>
      )}
    </View>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────

function MatchCard({ m, last }: { m: Match; last: boolean }) {
  const isDraw = m.homeScore === m.awayScore;
  const homeWin = m.homeScore > m.awayScore;

  return (
    <View style={[s.matchCard, !last && s.matchCardBorder]}>
      <TeamSide name={m.home} score={m.homeScore} align="left" />

      {/* Score block */}
      <View style={s.scoreBlock}>
        <View style={s.statusBadge}>
          <Text style={s.statusText}>{m.status}</Text>
        </View>
        <View style={s.scoreRow}>
          <Text style={[s.scoreNum, (homeWin || isDraw) && s.scoreNumBright]}>{m.homeScore}</Text>
          <Text style={s.scoreSep}>-</Text>
          <Text style={[s.scoreNum, (!homeWin || isDraw) && s.scoreNumBright]}>{m.awayScore}</Text>
        </View>
        <Text style={s.htText}>HT {m.htHome} - {m.htAway}</Text>
        <Text style={s.timeText}>{m.time}</Text>
      </View>

      <TeamSide name={m.away} score={m.awayScore} align="right" />
    </View>
  );
}

// ─── LeagueCard ───────────────────────────────────────────────────────────────

function LeagueCard({ league }: { league: League }) {
  return (
    <View style={s.leagueCard}>
      <View style={s.leagueHeader}>
        <Ionicons name="football" size={14} color="rgba(255,255,255,0.8)" style={{ marginRight: 7 }} />
        <Text style={s.leagueName}>{league.name}</Text>
      </View>
      {league.matches.map((m, i) => (
        <MatchCard key={i} m={m} last={i === league.matches.length - 1} />
      ))}
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
  scrollContent: { padding: 12, gap: 12, paddingBottom: 32 },

  // League card
  leagueCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Shadow.md,
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  leagueName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    letterSpacing: 0.2,
  },

  // Match card
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  matchCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F4',
  },

  // Team side
  teamSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamSideRight: {
    flexDirection: 'row-reverse',
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },

  teamName: {
    flex: 1,
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    lineHeight: 16,
  },
  teamNameLeft: { textAlign: 'left' },
  teamNameRight: { textAlign: 'right' },

  // Score block
  scoreBlock: {
    width: 90,
    alignItems: 'center',
    gap: 2,
  },
  statusBadge: {
    backgroundColor: '#F1F3F5',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreNum: {
    fontSize: 22,
    fontWeight: FontWeight.extrabold,
    color: '#C0C4CC',
    lineHeight: 26,
  },
  scoreNumBright: {
    color: Colors.light.text,
  },
  scoreSep: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#C0C4CC',
  },
  htText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  timeText: {
    fontSize: 10,
    color: '#B0B8C4',
    marginTop: 1,
  },
});
