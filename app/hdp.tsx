import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';

// ─── Types ────────────────────────────────────────────────────────────────────

type BetRow    = 'hdp' | 'ou' | 'oe';
type Side      = 'left' | 'right';
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LEAGUES: LeagueData[] = [
  {
    name: 'ARGENTINA CUP',
    matches: [
      {
        id: 'h1', date: '05-21 02:30',
        home: 'Talleres Cordoba (n)', away: 'Atletico Tucuman',
        hdpGiving: 'home', hdpLine: '0',   hdpOdds: -18,
        ouLine: '2', ouOdds: 4, oeRef: '1',
      },
      {
        id: 'h2', date: '05-21 04:00',
        home: 'Boca Juniors', away: 'River Plate',
        hdpGiving: 'home', hdpLine: '0',   hdpOdds: -34,
        ouLine: '2.5', ouOdds: -12, oeRef: '1',
      },
    ],
  },
  {
    name: 'COPA LIBERTADORES',
    matches: [
      {
        id: 'h3', date: '05-21 04:30',
        home: 'Nacional Montevideo', away: 'Universitario Deportes',
        hdpGiving: 'home', hdpLine: '1',   hdpOdds: 28,
        ouLine: '2', ouOdds: -58, oeRef: '1',
      },
      {
        id: 'h4', date: '05-21 07:00',
        home: 'LDU Quito', away: 'Lanus',
        hdpGiving: 'home', hdpLine: '0',   hdpOdds: -96,
        ouLine: '2', ouOdds: -21, oeRef: '1',
      },
      {
        id: 'h5', date: '05-21 06:30',
        home: 'Atletico Bucaramanga', away: 'Boca Juniors de Cali',
        hdpGiving: 'home', hdpLine: '1.5', hdpOdds: 44,
        ouLine: '3', ouOdds: 20, oeRef: '1',
      },
    ],
  },
  {
    name: 'FINLAND VEIKKAUSLIIGA',
    matches: [
      {
        id: 'h6', date: '05-21 21:00',
        home: 'HJK Helsinki', away: 'IFK Mariehamn',
        hdpGiving: 'home', hdpLine: '1',   hdpOdds: -20,
        ouLine: '3', ouOdds: 8, oeRef: '1',
      },
      {
        id: 'h7', date: '05-21 21:00',
        home: 'FC Inter Turku', away: 'AC Oulu',
        hdpGiving: 'away', hdpLine: '0.5', hdpOdds: -48,
        ouLine: '2.5', ouOdds: 16, oeRef: '1',
      },
    ],
  },
  {
    name: 'ENGLAND PREMIER LEAGUE',
    matches: [
      {
        id: 'h8', date: '05-21 21:00',
        home: 'Arsenal', away: 'Chelsea',
        hdpGiving: 'home', hdpLine: '0',   hdpOdds: -52,
        ouLine: '2.5', ouOdds: -6, oeRef: '1',
      },
      {
        id: 'h9', date: '05-21 23:30',
        home: 'Liverpool', away: 'Man City',
        hdpGiving: 'home', hdpLine: '0',   hdpOdds: -28,
        ouLine: '3', ouOdds: 12, oeRef: '1',
      },
    ],
  },
  {
    name: 'SPAIN LA LIGA',
    matches: [
      {
        id: 'h10', date: '05-21 03:00',
        home: 'Real Madrid', away: 'Barcelona',
        hdpGiving: 'home', hdpLine: '0',   hdpOdds: -40,
        ouLine: '2.5', ouOdds: 6, oeRef: '1',
      },
      {
        id: 'h11', date: '05-21 01:15',
        home: 'Atletico Madrid', away: 'Sevilla',
        hdpGiving: 'home', hdpLine: '0.5', hdpOdds: -22,
        ouLine: '2', ouOdds: -18, oeRef: '1',
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtOdds(line: string, odds: number): string {
  return `${line}${odds >= 0 ? '+' : ''}${odds}`;
}

// ─── Leagues Modal ────────────────────────────────────────────────────────────

function LeaguesModal({
  visible, allLeagues, active, onToggle, onClose,
}: {
  visible: boolean;
  allLeagues: string[];
  active: Set<string>;
  onToggle: (name: string) => void;
  onClose: () => void;
}) {
  const { tr } = useLanguage();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.sheetHeader}>
            <Text style={m.sheetTitle}>{tr.hdpLeagues}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={allLeagues}
            keyExtractor={item => item}
            renderItem={({ item }) => {
              const on = active.has(item);
              return (
                <TouchableOpacity style={m.leagueRow} onPress={() => onToggle(item)} activeOpacity={0.7}>
                  <View style={[m.checkbox, on && m.checkboxOn]}>
                    {on && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={m.leagueRowText}>{item}</Text>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={m.sep} />}
          />
          <TouchableOpacity style={m.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={m.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

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

  const givingName    = match.hdpGiving === 'home' ? match.home : match.away;
  const receivingName = match.hdpGiving === 'home' ? match.away : match.home;

  const hdpSel = sel('hdp');
  const ouSel  = sel('ou');
  const oeSel  = sel('oe');

  return (
    <View style={s.matchCard}>
      <View style={s.dateRow}>
        <Ionicons name="time-outline" size={12} color={Colors.light.textSecondary} />
        <Text style={s.dateText}>Time: {match.date}</Text>
      </View>

      {/* HDP — 2 cells, giving team holds the odds */}
      <View style={s.betRow}>
        <TouchableOpacity
          style={[s.cell, s.cellSide, hdpSel === 'left' && s.cellSelected]}
          onPress={() => tap('hdp', 'left')}
          activeOpacity={0.75}
        >
          <Text style={[s.teamName, hdpSel === 'left' && s.selectedText]} numberOfLines={2}>
            {givingName}
          </Text>
          <Text style={[s.hdpOdds, hdpSel === 'left' && s.selectedOdds]}>
            {fmtOdds(match.hdpLine, match.hdpOdds)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.cell, s.cellSide, s.cellBorderLeft, hdpSel === 'right' && s.cellSelected]}
          onPress={() => tap('hdp', 'right')}
          activeOpacity={0.75}
        >
          <Text style={[s.teamName, hdpSel === 'right' && s.selectedText]} numberOfLines={2}>
            {receivingName}
          </Text>
        </TouchableOpacity>
      </View>

      {/* O/U — 3 cells */}
      <View style={[s.betRow, s.rowBorder]}>
        <TouchableOpacity
          style={[s.cell, s.cellSide, ouSel === 'left' && s.cellSelected]}
          onPress={() => tap('ou', 'left')}
          activeOpacity={0.75}
        >
          <Text style={[s.rowLabel, ouSel === 'left' && s.selectedText]}>{tr.maungOver}</Text>
        </TouchableOpacity>

        <View style={[s.cell, s.cellCenter, s.cellBorderLeft, s.cellBorderRight]}>
          <Text style={s.centerText}>{fmtOdds(match.ouLine, match.ouOdds)}</Text>
        </View>

        <TouchableOpacity
          style={[s.cell, s.cellSide, ouSel === 'right' && s.cellSelected]}
          onPress={() => tap('ou', 'right')}
          activeOpacity={0.75}
        >
          <Text style={[s.rowLabel, ouSel === 'right' && s.selectedText]}>{tr.maungUnder}</Text>
        </TouchableOpacity>
      </View>

      {/* Odd / Even — 3 cells */}
      <View style={[s.betRow, s.rowBorder]}>
        <TouchableOpacity
          style={[s.cell, s.cellSide, oeSel === 'left' && s.cellSelected]}
          onPress={() => tap('oe', 'left')}
          activeOpacity={0.75}
        >
          <Text style={[s.rowLabel, oeSel === 'left' && s.selectedText]}>{tr.maungOdd}</Text>
        </TouchableOpacity>

        <View style={[s.cell, s.cellCenter, s.cellBorderLeft, s.cellBorderRight]}>
          <Text style={s.centerText}>{match.oeRef}</Text>
        </View>

        <TouchableOpacity
          style={[s.cell, s.cellSide, oeSel === 'right' && s.cellSelected]}
          onPress={() => tap('oe', 'right')}
          activeOpacity={0.75}
        >
          <Text style={[s.rowLabel, oeSel === 'right' && s.selectedText]}>{tr.maungEven}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const ALL_LEAGUE_NAMES = LEAGUES.map(l => l.name);

export default function HdpScreen() {
  const { tr } = useLanguage();
  const [selections, setSelections]     = useState<Record<SelectKey, Side>>({});
  const [stake, setStake]               = useState('5000');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeLeagues, setActiveLeagues] = useState<Set<string>>(new Set(ALL_LEAGUE_NAMES));

  const count = Object.keys(selections).length;

  const filteredLeagues = useMemo(
    () => LEAGUES.filter(l => activeLeagues.has(l.name)),
    [activeLeagues],
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

  function toggleLeague(name: string) {
    setActiveLeagues(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function handleReset() {
    setSelections({});
    setStake('5000');
  }

  function handleOK() {
    if (count < 1) {
      Alert.alert('', tr.hdpMinErr);
      return;
    }
    Alert.alert(tr.hdpTitle, `${count} ${tr.hdpUnits} · ${stake} Ks`);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={s.root} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.headerBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{tr.hdpTitle}</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={s.headerBtn} activeOpacity={0.7}>
            <Text style={s.leaguesBtn}>{tr.hdpLeagues}</Text>
          </TouchableOpacity>
        </View>

        {/* Match list */}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredLeagues.map(league => (
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
            <Text style={s.selectedLabel}>
              {tr.hdpSelected} <Text style={s.selectedCount}>{count}</Text> {tr.hdpUnits}
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

      <LeaguesModal
        visible={modalVisible}
        allLeagues={ALL_LEAGUE_NAMES}
        active={activeLeagues}
        onToggle={toggleLeague}
        onClose={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_H = 52;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  headerBtn:    { padding: 4, minWidth: 36 },
  headerTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  leaguesBtn:   { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.brand.gold },

  scroll:        { flex: 1 },
  scrollContent: { padding: 12, gap: 10, paddingBottom: 24 },

  leagueSection: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  leagueName: { fontSize: 12, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.4 },

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

  betRow:    { flexDirection: 'row' },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.light.border },

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

  teamName:     { fontSize: 12, fontWeight: FontWeight.semibold, color: Colors.light.text, textAlign: 'center', lineHeight: 16 },
  hdpOdds:      { fontSize: 13, fontWeight: FontWeight.bold, color: Colors.brand.greenButton, marginTop: 3 },
  selectedText: { color: Colors.brand.greenDark },
  selectedOdds: { color: Colors.brand.greenDark },
  rowLabel:     { fontSize: 13, fontWeight: FontWeight.semibold, color: Colors.light.text },
  centerText:   { fontSize: 13, fontWeight: FontWeight.bold, color: '#fff', textAlign: 'center' },

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
  bottomLeft:     { flex: 1, gap: 6 },
  selectedLabel:  { fontSize: FontSize.sm, color: Colors.light.textSecondary, fontWeight: FontWeight.medium },
  selectedCount:  { color: Colors.brand.greenButton, fontWeight: FontWeight.bold },
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

// ─── Modal Styles ─────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sheetTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.light.text },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: 12,
  },
  leagueRowText: { fontSize: FontSize.sm, color: Colors.light.text, fontWeight: FontWeight.medium },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.brand.greenButton, borderColor: Colors.brand.greenButton },
  sep: { height: 1, backgroundColor: Colors.light.border, marginHorizontal: Spacing.md },
  doneBtn: {
    margin: Spacing.md,
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    ...Shadow.sm,
  },
  doneBtnText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
