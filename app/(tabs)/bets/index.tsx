import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import type { Translations } from '@/constants/i18n';
import { useAuth } from '@/contexts/auth';
import { LoginPromptCard } from '@/components/login-prompt-card';
import {
  type Bet,
  type BetStatus,
  type HdpOuBet,
  type ParlayBet,
  type SelectedSide,
  formatBetOdds,
  formatHdpOuOddsLine,
} from '@/constants/bets';
import { formatHdpTierLabel } from '@/utils/hdp-settlement';
import { fetchBetSlips } from '@/services/football';
import { formatDrawDate, mapBetSlipsToBets, betTypeDisplayLabel, parlayTypeLabel } from '@/utils/football-ui';

type BetTab = 'unfinished' | 'finished';
type BetTypeFilter =
  | 'all'
  | 'maung'
  | 'maung_fh'
  | 'body'
  | 'body_fh'
  | 'ou'
  | '1x2'
  | 'oe'
  | 'cs'
  | 'esports'
  | 'fight';

function matchesBetTypeFilter(bet: Bet, filter: BetTypeFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'maung') {
    return bet.kind === 'parlay' && bet.period !== 'fh';
  }
  if (filter === 'maung_fh') {
    return bet.kind === 'parlay' && bet.period === 'fh';
  }
  if (bet.kind !== 'hdpou') return false;
  if (filter === 'body') return bet.betType === 'HDP';
  if (filter === 'body_fh') return bet.betType === 'HDP 1H';
  if (filter === 'ou') return bet.betType === 'O/U' || bet.betType === 'O/U 1H';
  if (filter === '1x2') return bet.betType === '1X2';
  if (filter === 'oe') return bet.betType === 'O/E';
  if (filter === 'cs') return bet.betType === 'CS';
  if (filter === 'esports') return bet.betType === 'To Win';
  if (filter === 'fight') return bet.betType === 'Fight';
  return true;
}

function slipTypeForFilter(filter: BetTypeFilter): 'single' | 'mix' | undefined {
  if (filter === 'all') return undefined;
  if (filter === 'maung' || filter === 'maung_fh') return 'mix';
  return 'single';
}

const GREEN = '#27A060';

function MatchTeamsText({
  home,
  away,
  selectedSide,
  style,
  homeStyle,
  awayStyle,
  vsStyle,
}: {
  home: string;
  away: string;
  selectedSide?: SelectedSide | null;
  style?: object;
  homeStyle?: object;
  awayStyle?: object;
  vsStyle?: object;
}) {
  return (
    <Text style={style} numberOfLines={1}>
      <Text style={[homeStyle, selectedSide === 'home' && card.teamSelected]}>{home}</Text>
      <Text style={vsStyle}> vs </Text>
      <Text style={[awayStyle, selectedSide === 'away' && card.teamSelected]}>{away}</Text>
      {selectedSide === 'draw' ? (
        <Text style={card.drawTag}>  · X</Text>
      ) : null}
    </Text>
  );
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
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function statusLabel(status: BetStatus, tr: Translations) {
  if (status === 'win') return tr.betStatusWin;
  if (status === 'loss') return tr.betStatusLoss;
  return tr.betStatusPending;
}

const STATUS_CFG: Record<BetStatus, { bg: string }> = {
  pending: { bg: '#F59E0B' },
  win: { bg: '#16A34A' },
  loss: { bg: '#DC2626' },
};

function StatusBadge({ status }: { status: BetStatus }) {
  const { tr } = useLanguage();
  const { bg } = STATUS_CFG[status];
  return (
    <View style={[badge.root, { backgroundColor: bg }]}>
      <Text style={badge.text}>{statusLabel(status, tr).toUpperCase()}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  root: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  text: { fontSize: 10, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.6 },
});

function openBetDetail(id: string) {
  router.push(`/(tabs)/bets/${id}`);
}

function HdpOuCard({ bet }: { bet: HdpOuBet }) {
  const { tr } = useLanguage();
  const isWin = bet.status === 'win';
  const isPending = bet.status === 'pending';
  const oddsStr = formatHdpOuOddsLine(bet);
  const hasScore = bet.homeScore != null && bet.awayScore != null;
  const tierLabel =
    isWin && bet.betType === 'HDP' && bet.hdpTier
      ? formatHdpTierLabel(bet.hdpTier, bet.line, bet.odds, tr)
      : null;

  return (
    <Pressable onPress={() => openBetDetail(bet.id)} style={({ pressed }) => [pressed && card.pressed]}>
      <View style={card.root}>
        <View style={card.header}>
          <View style={card.typePill}>
            <Text style={card.typePillText}>{betTypeDisplayLabel(bet.betType, tr)}</Text>
          </View>
          <Text style={card.time}>{bet.time}</Text>
          <StatusBadge status={bet.status} />
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
        <MatchTeamsText
          home={bet.home}
          away={bet.away}
          selectedSide={bet.selectedSide}
          style={card.matchTeams}
          vsStyle={card.vs}
        />
        <Text style={card.pickLine} numberOfLines={1}>
          <Text style={card.pickHighlight}>{bet.pick}</Text> · {oddsStr}
          {hasScore ? ` · ${bet.homeScore}-${bet.awayScore}` : ''}
        </Text>
        <View style={card.infoRow}>
          <View style={card.infoCell}>
            <Text style={card.infoLabel}>{tr.betListLineOdds}</Text>
            <Text style={card.infoValue}>{oddsStr}</Text>
          </View>
          <View style={[card.infoCell, card.infoCellBorder]}>
            <Text style={card.infoLabel}>{tr.betListStake}</Text>
            <Text style={card.infoValue}>{bet.stake.toLocaleString()} {tr.currencyUnit}</Text>
          </View>
          {!isPending && (
            <View style={[card.infoCell, card.infoCellBorder]}>
              <Text style={card.infoLabel}>{tr.betListPayout}</Text>
              <Text style={card.infoValue}>
                {isWin ? `+${bet.payout.toLocaleString()} ${tr.currencyUnit}` : '—'}
              </Text>
            </View>
          )}
        </View>
        {!isPending && (
          <View style={[card.resultBar, { backgroundColor: isWin ? '#F0FDF4' : '#FEF2F2' }]}>
            <Ionicons name={isWin ? 'checkmark-circle' : 'close-circle'} size={14} color={isWin ? '#16A34A' : '#DC2626'} />
            <Text style={[card.resultText, { color: isWin ? '#16A34A' : '#DC2626' }]}>
              {isWin
                ? `${tr.betListPayout}  +${bet.payout.toLocaleString()} ${tr.currencyUnit}${tierLabel ? ` · ${tierLabel}` : ''}`
                : tr.betListStkLost}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function ParlayCard({ bet }: { bet: ParlayBet }) {
  const { tr } = useLanguage();
  const isWin = bet.status === 'win';
  const isPending = bet.status === 'pending';

  return (
    <Pressable onPress={() => openBetDetail(bet.id)} style={({ pressed }) => [pressed && card.pressed]}>
      <View style={card.root}>
        <View style={card.header}>
          <View style={[card.typePill, { backgroundColor: '#7C3AED' }]}>
            <Text style={card.typePillText}>{parlayTypeLabel(bet.period, tr)}</Text>
          </View>
          <Text style={card.time}>{bet.picks.length} {tr.betListPicks}</Text>
          <StatusBadge status={bet.status} />
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
        <View style={card.parlayPicks}>
          {bet.picks.map((p, i) => (
            <View key={i} style={card.parlayPickRow}>
              <View style={card.parlayDot} />
              <View style={card.parlayPickBody}>
                <MatchTeamsText
                  home={p.home}
                  away={p.away}
                  selectedSide={p.selectedSide}
                  style={card.parlayPickText}
                  vsStyle={card.vs}
                />
                <Text style={card.parlayPickBold} numberOfLines={1}>
                  → {p.pick}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={card.infoRow}>
          <View style={card.infoCell}>
            <Text style={card.infoLabel}>{tr.betListStake}</Text>
            <Text style={card.infoValue}>{bet.stake.toLocaleString()} {tr.currencyUnit}</Text>
          </View>
          {!isPending && (
            <View style={[card.infoCell, card.infoCellBorder]}>
              <Text style={card.infoLabel}>{tr.betListPayout}</Text>
              <Text style={card.infoValue}>
                {isWin ? `+${bet.payout.toLocaleString()} ${tr.currencyUnit}` : '—'}
              </Text>
            </View>
          )}
        </View>
        {!isPending && (
          <View style={[card.resultBar, { backgroundColor: isWin ? '#F0FDF4' : '#FEF2F2' }]}>
            <Ionicons name={isWin ? 'checkmark-circle' : 'close-circle'} size={14} color={isWin ? '#16A34A' : '#DC2626'} />
            <Text style={[card.resultText, { color: isWin ? '#16A34A' : '#DC2626' }]}>
              {isWin ? `${tr.betListPayout}  +${bet.payout.toLocaleString()} ${tr.currencyUnit}` : tr.betListStkLost}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const card = StyleSheet.create({
  pressed: { opacity: 0.92 },
  root: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F4F2' },
  typePill: { backgroundColor: GREEN, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText: { fontSize: 10, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.6 },
  time: { flex: 1, fontSize: FontSize.xs, color: '#6B7280', fontWeight: FontWeight.medium },
  matchTeams: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#111827', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  pickLine: { fontSize: 11, color: '#6B7280', paddingHorizontal: 12, paddingBottom: 8 },
  pickHighlight: { fontWeight: FontWeight.bold, color: GREEN },
  teamSelected: { color: GREEN, fontWeight: FontWeight.bold },
  drawTag: { color: GREEN, fontWeight: FontWeight.bold },
  vs: { color: '#9CA3AF', fontWeight: FontWeight.regular },
  infoRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F4F2' },
  infoCell: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center' },
  infoCellBorder: { borderLeftWidth: 1, borderLeftColor: '#F0F4F2' },
  infoLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 3, fontWeight: FontWeight.medium },
  infoValue: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: '#111827', textAlign: 'center' },
  resultBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#F0F4F2' },
  resultText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  parlayPicks: { paddingHorizontal: 12, paddingVertical: 8, gap: 5 },
  parlayPickRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  parlayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN, flexShrink: 0, marginTop: 5 },
  parlayPickBody: { flex: 1, gap: 2 },
  parlayPickText: { fontSize: 12, color: '#4B5563' },
  parlayPickBold: { fontWeight: FontWeight.semibold, color: GREEN, fontSize: 12 },
});

function EmptyState() {
  const { tr } = useLanguage();
  return (
    <View style={empty.root}>
      <View style={empty.iconWrap}>
        <Ionicons name="document-text-outline" size={40} color={GREEN} />
      </View>
      <Text style={empty.title}>{tr.betListEmpty}</Text>
      <Text style={empty.sub}>{tr.betListEmptySub}</Text>
    </View>
  );
}

const empty = StyleSheet.create({
  root: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E8F5EE', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#374151', marginBottom: 6 },
  sub: { fontSize: FontSize.sm, color: '#9CA3AF', textAlign: 'center' },
});

export default function BetsScreen() {
  const { tr, lang } = useLanguage();
  const { isAuthenticated, token } = useAuth();
  const [tab, setTab] = useState<BetTab>('unfinished');
  const [betType, setBetType] = useState<BetTypeFilter>('all');
  const [typeOpen, setTypeOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prev = addDays(date, -1);
  const next = addDays(date, 1);

  const typeFilters = [
    { key: 'all' as const, label: tr.betListAll },
    { key: 'maung' as const, label: tr.menuMixParlay },
    { key: 'maung_fh' as const, label: tr.menuMixParlayFh },
    { key: 'body' as const, label: tr.menuHDP },
    { key: 'body_fh' as const, label: tr.menuHdpFh },
    { key: 'ou' as const, label: tr.maungOU },
    { key: '1x2' as const, label: tr.menu1x2 },
    { key: 'oe' as const, label: tr.menuSoneMa },
    { key: 'cs' as const, label: tr.menuCorrectScore },
    { key: 'esports' as const, label: tr.menuEsports },
    { key: 'fight' as const, label: tr.menuFight },
  ];
  const selectedType = typeFilters.find((f) => f.key === betType) ?? typeFilters[0];

  const loadBets = useCallback(async (opts?: { soft?: boolean }) => {
    if (!token) return;
    if (!opts?.soft) setLoading(true);
    setError(null);
    try {
      const slips = await fetchBetSlips(token, {
        draw_date: formatDrawDate(date),
        type: slipTypeForFilter(betType),
        is_settled: tab === 'finished',
      });
      const mapped = mapBetSlipsToBets(slips, tr, lang);
      setBets(
        mapped.filter((b) => {
          const statusOk =
            tab === 'finished' ? b.status !== 'pending' : b.status === 'pending';
          return statusOk && matchesBetTypeFilter(b, betType);
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.footballBetListFailed);
      setBets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, date, betType, tab, tr, lang]);

  useEffect(() => {
    if (isAuthenticated) loadBets();
  }, [isAuthenticated, loadBets]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{tr.betListTitle}</Text>
        </View>
        <View style={s.guestWrap}>
          <LoginPromptCard title={tr.guestWelcomeTitle} subtitle={tr.guestWelcomeSub} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{tr.betListTitle}</Text>
      </View>

      <View style={s.tabBar}>
        {([
          { key: 'unfinished' as BetTab, label: tr.betListUnfinished },
          { key: 'finished' as BetTab, label: tr.betListFinished },
        ]).map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[s.tab, tab === key && s.tabActive]}
            onPress={() => setTab(key)}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.dateNav}>
        <TouchableOpacity style={s.dateBtn} onPress={() => setDate(prev)} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={14} color="#6B7280" />
          <Text style={s.dateSide}>{fmtDate(prev)}</Text>
        </TouchableOpacity>
        <View style={s.dateCenterWrap}>
          <Text style={s.dateCenterText}>{isToday(date) ? tr.betListToday : fmtDate(date)}</Text>
        </View>
        <TouchableOpacity style={s.dateBtn} onPress={() => setDate(next)} activeOpacity={0.7}>
          <Text style={s.dateSide}>{fmtDate(next)}</Text>
          <Ionicons name="chevron-forward" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={s.typeRow}>
        <Text style={s.typeLabel}>{tr.betListType}</Text>
        <TouchableOpacity
          style={s.dropdown}
          onPress={() => setTypeOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={s.dropdownValue} numberOfLines={1}>
            {selectedType.label}
          </Text>
          <Ionicons name="chevron-down" size={16} color={GREEN} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={typeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTypeOpen(false)}
      >
        <View style={s.ddWrap}>
          <Pressable style={s.ddBackdrop} onPress={() => setTypeOpen(false)} />
          <View style={s.ddCard}>
            <Text style={s.ddTitle}>{tr.betListType}</Text>
            <ScrollView bounces={false}>
              {typeFilters.map(({ key, label }) => {
                const active = betType === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[s.ddItem, active && s.ddItemActive]}
                    onPress={() => {
                      setBetType(key);
                      setTypeOpen(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[s.pillDot, active && s.pillDotActive]} />
                    <Text style={[s.ddItemText, active && s.ddItemTextActive]} numberOfLines={1}>
                      {label}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={18} color={GREEN} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadBets({ soft: true });
            }}
            tintColor={GREEN}
            colors={[GREEN]}
          />
        }
      >
        {loading ? (
          <View style={s.loadWrap}>
            <ActivityIndicator color={GREEN} />
            <Text style={s.loadText}>{tr.footballLoadingBets}</Text>
          </View>
        ) : error ? (
          <View style={s.loadWrap}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => void loadBets()} style={s.retryBtn} activeOpacity={0.8}>
              <Text style={s.retryText}>{tr.footballRetry}</Text>
            </TouchableOpacity>
          </View>
        ) : bets.length === 0 ? (
          <EmptyState />
        ) : (
          bets.map(bet =>
            bet.kind === 'hdpou'
              ? <HdpOuCard key={bet.id} bet={bet} />
              : <ParlayCard key={bet.id} bet={bet} />
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EBF5EE' },
  header: { backgroundColor: GREEN, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: GREEN },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: '#9CA3AF' },
  tabTextActive: { color: GREEN, fontWeight: FontWeight.bold },
  dateNav: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  dateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
  dateSide: { fontSize: FontSize.sm, color: '#6B7280' },
  dateCenterWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E5E7EB', paddingVertical: 12 },
  dateCenterText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#111827' },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  typeLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#374151' },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: GREEN,
    backgroundColor: '#E8F5EE',
    gap: 8,
  },
  dropdownValue: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: GREEN,
    lineHeight: 22,
  },
  ddWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  ddBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 59, 36, 0.45)',
  },
  ddCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    paddingVertical: 8,
    ...Shadow.md,
    maxHeight: '80%',
  },
  ddTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 24,
  },
  ddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  ddItemActive: { backgroundColor: '#E8F5EE' },
  ddItemText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: '#374151',
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  },
  ddItemTextActive: { color: GREEN, fontWeight: FontWeight.semibold },
  pillDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: '#fff' },
  pillDotActive: { borderColor: GREEN, backgroundColor: GREEN },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, gap: 10, paddingBottom: 32 },
  loadWrap: { alignItems: 'center', paddingTop: 64, gap: 10 },
  loadText: { fontSize: FontSize.sm, color: '#6B7280' },
  errorText: { fontSize: FontSize.sm, color: '#DC2626', textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E8F5EE',
  },
  retryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: GREEN },
  guestWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 48 },
});
