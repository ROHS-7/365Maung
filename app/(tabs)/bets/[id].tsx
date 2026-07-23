import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import type { Translations } from '@/constants/i18n';
import { useHideParentTabBar } from '@/hooks/use-hide-parent-tab-bar';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAuth } from '@/contexts/auth';
import { useEffect, useState } from 'react';
import {
  formatBetOdds,
  type BetStatus,
  type HdpOuBet,
  type ParlayBet,
  type Bet,
  type SelectedSide,
} from '@/constants/bets';
import { formatHdpTierLabel } from '@/utils/hdp-settlement';
import { fetchBetSlips, getCachedBetSlip } from '@/services/football';
import { mapBetSlipToBet } from '@/utils/football-ui';

const GREEN = '#27A060';

function MatchTeamsTitle({
  home,
  away,
  selectedSide,
  compact,
}: {
  home: string;
  away: string;
  selectedSide?: SelectedSide | null;
  compact?: boolean;
}) {
  return (
    <Text style={compact ? d.legMatch : d.matchTitle}>
      <Text style={selectedSide === 'home' ? d.teamSelected : undefined}>{home}</Text>
      <Text style={d.vsText}> vs </Text>
      <Text style={selectedSide === 'away' ? d.teamSelected : undefined}>{away}</Text>
      {selectedSide === 'draw' ? <Text style={d.teamSelected}> · X</Text> : null}
    </Text>
  );
}

function statusLabel(status: BetStatus, tr: Translations) {
  if (status === 'win') return tr.betStatusWin;
  if (status === 'loss') return tr.betStatusLoss;
  return tr.betStatusPending;
}

const STATUS_CFG: Record<BetStatus, { bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { bg: '#F59E0B', icon: 'time-outline' },
  win: { bg: '#16A34A', icon: 'checkmark-circle' },
  loss: { bg: '#DC2626', icon: 'close-circle' },
};

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={d.row}>
      <Text style={d.rowLabel}>{label}</Text>
      <Text style={[d.rowValue, highlight && d.rowValueHighlight]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function HdpOuDetail({ bet }: { bet: HdpOuBet }) {
  const { tr } = useLanguage();
  const cfg = STATUS_CFG[bet.status];
  const isPending = bet.status === 'pending';
  const isWin = bet.status === 'win';
  const oddsStr = `${bet.line} (${formatBetOdds(bet.odds)})`;
  const hasScore = bet.homeScore != null && bet.awayScore != null;
  const tierLabel =
    isWin && bet.betType === 'HDP' && bet.hdpTier
      ? formatHdpTierLabel(bet.hdpTier, bet.line, bet.odds, tr)
      : null;

  return (
    <>
      <View style={[d.statusBanner, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={22} color="#fff" />
        <Text style={d.statusBannerText}>{statusLabel(bet.status, tr)}</Text>
      </View>

      <View style={d.card}>
        <View style={d.cardHeader}>
          <View style={d.typePill}>
            <Text style={d.typePillText}>{bet.betType}</Text>
          </View>
          <Text style={d.cardMeta}>{tr.betDetailPlacedAt} · {bet.time}</Text>
        </View>

        <Text style={d.sectionTitle}>{tr.betDetailMatch}</Text>
        <MatchTeamsTitle home={bet.home} away={bet.away} selectedSide={bet.selectedSide} />
        {hasScore && (
          <Text style={d.finalScore}>
            {tr.betDetailScore}: {bet.homeScore} – {bet.awayScore}
          </Text>
        )}

        <View style={d.divider} />

        <Text style={d.sectionTitle}>{tr.betDetailSummary}</Text>
        <DetailRow label={tr.betDetailBetId} value={bet.id.toUpperCase()} />
        <DetailRow label={tr.betListPick} value={bet.pick} highlight />
        <DetailRow label={tr.betListLineOdds} value={oddsStr} />
        {tierLabel && <DetailRow label={tr.betListPayout} value={tierLabel} />}
        <DetailRow label={tr.betListStake} value={`${bet.stake.toLocaleString()} ${tr.currencyUnit}`} highlight />
        {!isPending && (
          <DetailRow
            label={tr.betListPayout}
            value={
              isWin
                ? `+${bet.payout.toLocaleString()} ${tr.currencyUnit}`
                : tr.betListStkLost
            }
            highlight
          />
        )}
      </View>

      {isPending && (
        <View style={d.pendingNote}>
          <Ionicons name="information-circle-outline" size={18} color={GREEN} />
          <Text style={d.pendingNoteText}>{tr.betDetailPendingNote}</Text>
        </View>
      )}
    </>
  );
}

function ParlayDetail({ bet }: { bet: ParlayBet }) {
  const { tr } = useLanguage();
  const cfg = STATUS_CFG[bet.status];
  const isPending = bet.status === 'pending';
  const isWin = bet.status === 'win';

  return (
    <>
      <View style={[d.statusBanner, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={22} color="#fff" />
        <Text style={d.statusBannerText}>{statusLabel(bet.status, tr)}</Text>
      </View>

      <View style={d.card}>
        <View style={d.cardHeader}>
          <View style={[d.typePill, { backgroundColor: '#7C3AED' }]}>
            <Text style={d.typePillText}>PARLAY</Text>
          </View>
          <Text style={d.cardMeta}>{tr.betDetailPlacedAt} · {bet.time}</Text>
        </View>

        <Text style={d.sectionTitle}>{tr.betDetailSelections}</Text>
        {bet.picks.map((p, i) => (
          <View key={i} style={d.legRow}>
            <View style={d.legIndex}>
              <Text style={d.legIndexText}>{i + 1}</Text>
            </View>
            <View style={d.legBody}>
              <MatchTeamsTitle home={p.home} away={p.away} selectedSide={p.selectedSide} compact />
              <Text style={d.legPick}>{p.pick}</Text>
            </View>
          </View>
        ))}

        <View style={d.divider} />

        <Text style={d.sectionTitle}>{tr.betDetailSummary}</Text>
        <DetailRow label={tr.betDetailBetId} value={bet.id.toUpperCase()} />
        <DetailRow label={tr.betListStake} value={`${bet.stake.toLocaleString()} ${tr.currencyUnit}`} highlight />
        {!isPending && (
          <DetailRow
            label={tr.betListPayout}
            value={
              isWin
                ? `+${bet.payout.toLocaleString()} ${tr.currencyUnit}`
                : tr.betListStkLost
            }
            highlight
          />
        )}
      </View>

      {isPending && (
        <View style={d.pendingNote}>
          <Ionicons name="information-circle-outline" size={18} color={GREEN} />
          <Text style={d.pendingNoteText}>{tr.betDetailPendingNote}</Text>
        </View>
      )}
    </>
  );
}

export default function BetDetailScreen() {
  useRequireAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tr, lang } = useLanguage();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  useHideParentTabBar();
  const [bet, setBet] = useState<Bet | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setBet(undefined);
      setLoading(false);
      return;
    }

    const cached = getCachedBetSlip(id);
    if (cached) {
      setBet(mapBetSlipToBet(cached, tr, lang));
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const slips = await fetchBetSlips(token, {});
        if (cancelled) return;
        const slip = slips.find((s) => String(s.id) === id);
        setBet(slip ? mapBetSlipToBet(slip, tr, lang) : undefined);
      } catch {
        if (!cancelled) setBet(undefined);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, token, tr, lang]);

  if (loading) {
    return (
      <SafeAreaView style={[d.missing, { paddingTop: insets.top }]} edges={['bottom']}>
        <ActivityIndicator color={GREEN} size="large" />
        <Text style={d.missingText}>{tr.footballLoadingBets}</Text>
      </SafeAreaView>
    );
  }

  if (!bet) {
    return (
      <SafeAreaView style={[d.missing, { paddingTop: insets.top }]} edges={['bottom']}>
        <TouchableOpacity onPress={() => router.back()} style={d.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={d.missingText}>{tr.betDetailNotFound}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={d.root} edges={['top']}>
      <View style={d.header}>
        <TouchableOpacity onPress={() => router.back()} style={d.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={d.headerTitle}>{tr.betDetailTitle}</Text>
        <View style={d.backBtn} />
      </View>

      <ScrollView
        style={d.scroll}
        contentContainerStyle={[d.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {bet.kind === 'hdpou' ? <HdpOuDetail bet={bet} /> : <ParlayDetail bet={bet} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const d = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EBF5EE' },
  missing: { flex: 1, backgroundColor: '#EBF5EE', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },
  missingText: { fontSize: FontSize.md, color: '#6B7280', marginTop: Spacing.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  backBtn: { padding: 6, width: 36 },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff', textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.md },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  statusBannerText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },

  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.md },
  typePill: { backgroundColor: GREEN, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  typePillText: { fontSize: 11, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.5 },
  cardMeta: { flex: 1, fontSize: FontSize.sm, color: '#6B7280' },

  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: GREEN,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  matchTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#111827', marginBottom: Spacing.sm },
  teamSelected: { color: GREEN, fontWeight: FontWeight.extrabold },
  vsText: { color: '#9CA3AF', fontWeight: FontWeight.medium },
  finalScore: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#374151', marginBottom: Spacing.sm },
  divider: { height: 1, backgroundColor: '#F0F4F2', marginVertical: Spacing.md },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F4F2',
  },
  rowLabel: { fontSize: FontSize.sm, color: '#6B7280', flex: 1 },
  rowValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#111827', flex: 1, textAlign: 'right' },
  rowValueHighlight: { color: GREEN, fontWeight: FontWeight.bold },

  legRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F4F2',
  },
  legIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legIndexText: { fontSize: 12, fontWeight: FontWeight.bold, color: GREEN },
  legBody: { flex: 1 },
  legMatch: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#111827' },
  legPick: { fontSize: FontSize.sm, color: GREEN, marginTop: 2, fontWeight: FontWeight.semibold },

  pendingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#D9EAE2',
  },
  pendingNoteText: { flex: 1, fontSize: FontSize.sm, color: '#4B5563', lineHeight: 20 },
});
