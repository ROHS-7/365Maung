import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import type { CoinRequest } from '@/types/api';
import {
  formatCoinRequestAmount,
  formatCoinRequestBalanceLine,
  formatCoinRequestDate,
  formatCoinRequestRejectReason,
  getCoinRequestAccountLine,
  getCoinRequestDisplayDate,
  getCoinRequestSignedAmount,
  getCoinRequestSourceLabel,
  getCoinRequestStatusColor,
  getCoinRequestStatusLabel,
  getCoinRequestTypeLabel,
} from '@/utils/format-coin-request';

type Props = {
  request: CoinRequest;
  showDivider?: boolean;
};

export function CoinRequestRow({ request, showDivider = true }: Props) {
  const { tr, lang } = useLanguage();
  const signed = getCoinRequestSignedAmount(request);
  const amountColor = signed >= 0 ? Colors.light.success : Colors.light.error;
  const statusColor = getCoinRequestStatusColor(request.status);
  const accountLine = getCoinRequestAccountLine(request);
  const sourceLabel = getCoinRequestSourceLabel(request.source, tr);
  const balanceLine = formatCoinRequestBalanceLine(
    request,
    lang,
    tr.currencyUnit,
    tr.coinRequestBalanceAfter,
  );
  const isRejected = request.status.toLowerCase() === 'rejected';

  return (
    <View style={[s.row, showDivider && s.rowDivider]}>
      <View style={s.body}>
        <View style={s.topRow}>
          <Text style={s.type}>{getCoinRequestTypeLabel(request.type, tr)}</Text>
          {sourceLabel ? (
            <View style={s.sourceBadge}>
              <Text style={s.sourceBadgeText}>{sourceLabel}</Text>
            </View>
          ) : null}
          <View style={[s.badge, { backgroundColor: statusColor }]}>
            <Text style={s.badgeText}>
              {getCoinRequestStatusLabel(request.status, tr).toUpperCase()}
            </Text>
          </View>
        </View>
        {accountLine ? <Text style={s.metaLine}>{accountLine}</Text> : null}
        <Text style={s.date}>
          {formatCoinRequestDate(getCoinRequestDisplayDate(request), lang)}
        </Text>
        {balanceLine ? <Text style={s.metaLine}>{balanceLine}</Text> : null}
        {request.note ? (
          <Text style={s.note} numberOfLines={2}>
            {request.note}
          </Text>
        ) : null}
        {isRejected && request.reject_reason ? (
          <Text style={s.reject} numberOfLines={3}>
            {formatCoinRequestRejectReason(request.reject_reason, tr.coinRequestRejectReason)}
          </Text>
        ) : null}
      </View>
      <Text style={[s.amount, { color: amountColor }]}>
        {formatCoinRequestAmount(signed, lang, tr.currencyUnit)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  body: { flex: 1, minWidth: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  type: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.light.text },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.border,
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 9, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.5 },
  metaLine: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 4 },
  date: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 2 },
  note: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 4, fontStyle: 'italic' },
  reject: { fontSize: FontSize.xs, color: Colors.light.error, marginTop: 4 },
  amount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginLeft: Spacing.xs },
});
