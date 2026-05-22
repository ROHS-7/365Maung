import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';

// ─── Types ────────────────────────────────────────────────────────────────────

type BetRow  = 'hdp' | 'ou' | 'oe';
type Side    = 'left' | 'right';
type SelectKey = `${string}:${BetRow}`;

type MatchData = {
  id: string;
  date: string;
  home: string;
  away: string;
  hdpGiving: 'home' | 'away'; // which team gives the handicap
  hdpLine: string;
  hdpOdds: number;
  ouLine: string;
  ouOdds: number;
  oeRef: string;
};

type LeagueData = { name: string; matches: MatchData[] };

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LEAGUES: LeagueData[] = [
  {
    name: 'ARGENTINA CUP',
    matches: [
      {
        id: 'm1', date: '05-21 02:30',
        home: 'Talleres Cordoba (n)', away: 'Atletico Tucuman',
        hdpGiving: 'home', hdpLine: '0',     hdpOdds: -86,
        ouLine: '2',  ouOdds: -14, oeRef: '2',
      },
      {
        id: 'm2', date: '05-21 04:00',
        home: 'Boca Juniors', away: 'River Plate',
        hdpGiving: 'home', hdpLine: '0/0.5', hdpOdds: -56,
        ouLine: '2.5', ouOdds: 98, oeRef: '2',
      },
    ],
  },
  {
    name: 'COPA LIBERTADORES',
    matches: [
      {
        id: 'm3', date: '05-21 04:30',
        home: 'Nacional Montevideo', away: 'Universitario Deportes',
        hdpGiving: 'home', hdpLine: '1',     hdpOdds: 35,
        ouLine: '2',  ouOdds: -58, oeRef: '2',
      },
      {
        id: 'm4', date: '05-21 07:00',
        home: 'LDU Quito', away: 'Lanus',
        hdpGiving: 'home', hdpLine: '0',     hdpOdds: -98,
        ouLine: '2',  ouOdds: -38, oeRef: '2',
      },
      {
        id: 'm5', date: '05-21 06:30',
        home: 'Atletico Bucaramanga', away: 'Boca Juniors de Cali',
        hdpGiving: 'home', hdpLine: '2',     hdpOdds: 76,
        ouLine: '3',  ouOdds: 100, oeRef: '2',
      },
    ],
  },
  {
    name: 'FINLAND VEIKKAUSLIIGA',
    matches: [
      {
        id: 'm6', date: '05-21 21:00',
        home: 'HJK Helsinki', away: 'IFK Mariehamn',
        hdpGiving: 'home', hdpLine: '1.5',   hdpOdds: -42,
        ouLine: '3',  ouOdds: 76, oeRef: '2',
      },
      {
        id: 'm7', date: '05-21 21:00',
        home: 'FC Inter Turku', away: 'AC Oulu',
        hdpGiving: 'away', hdpLine: '0.5',   hdpOdds: -60,
        ouLine: '2.5', ouOdds: 88, oeRef: '2',
      },
    ],
  },
  {
    name: 'ENGLAND PREMIER LEAGUE',
    matches: [
      {
        id: 'm8', date: '05-21 21:00',
        home: 'Arsenal', away: 'Chelsea',
        hdpGiving: 'home', hdpLine: '0',     hdpOdds: -72,
        ouLine: '2.5', ouOdds: -10, oeRef: '2',
      },
      {
        id: 'm9', date: '05-21 23:30',
        home: 'Liverpool', away: 'Man City',
        hdpGiving: 'home', hdpLine: '0/0.5', hdpOdds: -44,
        ouLine: '3',  ouOdds: 92, oeRef: '2',
      },
    ],
  },
];

// ─── MatchCard ────────────────────────────────────────────────────────────────

function MatchCard({
  match, selections, onSelect,
}: {
  match: MatchData;
  selections: Record<SelectKey, Side>;
  onSelect: (key: SelectKey, side: Side) => void;
}) {
  const { tr } = useLanguage();

  function sel(row: BetRow): Side | undefined {
    return selections[`${match.id}:${row}`];
  }
  function tap(row: BetRow, side: Side) {
    onSelect(`${match.id}:${row}`, side);
  }

  // Giving team is always shown on the left cell of the HDP row.
  // If hdpGiving === 'home', left = home (gives), right = away (receives).
  // If hdpGiving === 'away', left = away (gives), right = home (receives).
  const givingName   = match.hdpGiving === 'home' ? match.home : match.away;
  const receivingName = match.hdpGiving === 'home' ? match.away : match.home;
  // Map left/right cell taps back to home/away for consistent state tracking
  const hdpLeftSide: Side  = 'left';
  const hdpRightSide: Side = 'right';

  const hdpSel = sel('hdp');
  const ouSel  = sel('ou');
  const oeSel  = sel('oe');

  return (
    <View style={s.matchCard}>
      {/* Date row */}
      <View style={s.dateRow}>
        <Ionicons name="time-outline" size={12} color={Colors.light.textSecondary} />
        <Text style={s.dateText}>{match.date}</Text>
      </View>

      {/* ── HDP row (2 cells) ── */}
      <View style={s.betRow}>
        {/* Giving team — shows name + odds */}
        <TouchableOpacity
          style={[s.cell, s.cellSide, hdpSel === hdpLeftSide && s.cellSelected]}
          onPress={() => tap('hdp', hdpLeftSide)}
          activeOpacity={0.75}
        >
          <Text style={[s.teamName, hdpSel === hdpLeftSide && s.teamNameSelected]} numberOfLines={2}>
            {givingName}
          </Text>
          <Text style={[s.hdpOdds, hdpSel === hdpLeftSide && s.hdpOddsSelected]}>
            {match.hdpLine}({match.hdpOdds})
          </Text>
        </TouchableOpacity>

        {/* Receiving team — name only */}
        <TouchableOpacity
          style={[s.cell, s.cellSide, s.cellBorderLeft, hdpSel === hdpRightSide && s.cellSelected]}
          onPress={() => tap('hdp', hdpRightSide)}
          activeOpacity={0.75}
        >
          <Text style={[s.teamName, hdpSel === hdpRightSide && s.teamNameSelected]} numberOfLines={2}>
            {receivingName}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── O/U row (3 cells) ── */}
      <View style={[s.betRow, s.betRowBorderTop]}>
        <TouchableOpacity
          style={[s.cell, s.cellSide, ouSel === 'left' && s.cellSelected]}
          onPress={() => tap('ou', 'left')}
          activeOpacity={0.75}
        >
          <Text style={[s.ouLabel, ouSel === 'left' && s.ouLabelSelected]}>{tr.maungOver}</Text>
        </TouchableOpacity>

        <View style={[s.cell, s.cellCenter, s.cellBorderLeft, s.cellBorderRight]}>
          <Text style={s.centerText}>{match.ouLine}({match.ouOdds})</Text>
        </View>

        <TouchableOpacity
          style={[s.cell, s.cellSide, ouSel === 'right' && s.cellSelected]}
          onPress={() => tap('ou', 'right')}
          activeOpacity={0.75}
        >
          <Text style={[s.ouLabel, ouSel === 'right' && s.ouLabelSelected]}>{tr.maungUnder}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Odd / Even row (3 cells) ── */}
      <View style={[s.betRow, s.betRowBorderTop]}>
        <TouchableOpacity
          style={[s.cell, s.cellSide, oeSel === 'left' && s.cellSelected]}
          onPress={() => tap('oe', 'left')}
          activeOpacity={0.75}
        >
          <Text style={[s.ouLabel, oeSel === 'left' && s.ouLabelSelected]}>{tr.maungOdd}</Text>
        </TouchableOpacity>

        <View style={[s.cell, s.cellCenter, s.cellBorderLeft, s.cellBorderRight]}>
          <Text style={s.centerText}>{match.oeRef}</Text>
        </View>

        <TouchableOpacity
          style={[s.cell, s.cellSide, oeSel === 'right' && s.cellSelected]}
          onPress={() => tap('oe', 'right')}
          activeOpacity={0.75}
        >
          <Text style={[s.ouLabel, oeSel === 'right' && s.ouLabelSelected]}>{tr.maungEven}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MaungScreen() {
  const { tr } = useLanguage();
  const [selections, setSelections] = useState<Record<SelectKey, Side>>({});
  const [stake, setStake] = useState('500');

  const count = Object.keys(selections).length;

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

  function handleReset() {
    setSelections({});
    setStake('500');
  }

  function handleOK() {
    if (count < 2) {
      Alert.alert('', tr.maungMinErr);
      return;
    }
    Alert.alert(tr.maungOK, `${count} picks · ${stake} Ks`);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={s.root} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{tr.maungTitle}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Match list */}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {LEAGUES.map(league => (
            <View key={league.name} style={s.leagueSection}>
              <View style={s.leagueHeader}>
                <Ionicons name="football" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={s.leagueName}>{league.name}</Text>
              </View>
              {league.matches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selections={selections}
                  onSelect={handleSelect}
                />
              ))}
            </View>
          ))}
          <View style={{ height: 8 }} />
        </ScrollView>

        {/* Bottom bar */}
        <View style={s.bottomBar}>
          <View style={s.bottomLeft}>
            <Text style={s.betLabel}>
              {tr.maungBetAmount} <Text style={s.betCount}>{count}</Text>
            </Text>
            <TextInput
              style={s.stakeInput}
              value={stake}
              onChangeText={setStake}
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>
          <View style={s.bottomBtns}>
            <TouchableOpacity style={s.btnOK} onPress={handleOK} activeOpacity={0.85}>
              <Text style={s.btnOKText}>{tr.maungOK}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnReset} onPress={handleReset} activeOpacity={0.85}>
              <Text style={s.btnResetText}>{tr.maungReset}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_H = 52;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 12, gap: 10, paddingBottom: 24 },

  // League section
  leagueSection: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  leagueName: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 0.4,
  },

  // Match card
  matchCard: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.brand.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  dateText: { fontSize: 11, color: Colors.light.textSecondary },

  // Bet rows
  betRow:          { flexDirection: 'row' },
  betRowBorderTop: { borderTopWidth: 1, borderTopColor: Colors.light.border },

  // Cells
  cell: {
    height: CELL_H,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#F7F7F7',
  },
  cellSide:        { flex: 1 },
  cellCenter:      { width: 96, backgroundColor: Colors.brand.greenButton },
  cellBorderLeft:  { borderLeftWidth: 1, borderLeftColor: Colors.light.border },
  cellBorderRight: { borderRightWidth: 1, borderRightColor: Colors.light.border },
  cellSelected:    { backgroundColor: Colors.brand.gold },

  // HDP team name + odds
  teamName: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  teamNameSelected: { color: Colors.brand.greenDark },

  hdpOdds: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenButton,
    marginTop: 3,
  },
  hdpOddsSelected: { color: Colors.brand.greenDark },

  // O/U & OE labels
  ouLabel:         { fontSize: 13, fontWeight: FontWeight.semibold, color: Colors.light.text },
  ouLabelSelected: { color: Colors.brand.greenDark, fontWeight: FontWeight.bold },

  // Center cell text
  centerText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#fff',
    textAlign: 'center',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
    ...Shadow.md,
  },
  bottomLeft: { flex: 1, gap: 6 },
  betLabel: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: FontWeight.medium,
  },
  betCount: {
    color: Colors.brand.greenButton,
    fontWeight: FontWeight.bold,
  },
  stakeInput: {
    height: 40,
    backgroundColor: '#F2F5F3',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 10,
    color: Colors.light.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  bottomBtns: { gap: 8 },
  btnOK: {
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: 'center',
    ...Shadow.sm,
  },
  btnOKText:    { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  btnReset: {
    backgroundColor: '#E8572A',
    borderRadius: BorderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnResetText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
