import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import type { CoinTransaction } from '@/types/api';
import {
  formatTransactionAmount,
  formatTransactionDate,
  getSignedTransactionAmount,
  getTransactionIcon,
  getTransactionLabel,
} from '@/utils/format-transaction';

type Props = {
  transaction: CoinTransaction;
  showDivider?: boolean;
};

export function TransactionRow({ transaction, showDivider = true }: Props) {
  const { tr, lang } = useLanguage();
  const label = getTransactionLabel(transaction, tr);
  const signedAmount = getSignedTransactionAmount(transaction);
  const icon = getTransactionIcon(transaction.direction);
  const amountColor =
    signedAmount >= 0 ? Colors.light.success : Colors.light.error;

  return (
    <View style={[s.row, showDivider && s.rowDivider]}>
      <View style={[s.iconWrap, signedAmount >= 0 ? s.iconReceived : s.iconSent]}>
        <Ionicons name={icon} size={18} color={signedAmount >= 0 ? Colors.light.success : Colors.light.error} />
      </View>
      <View style={s.body}>
        <Text style={s.label} numberOfLines={2}>
          {label}
        </Text>
        <Text style={s.date}>{formatTransactionDate(transaction.created_at, lang)}</Text>
      </View>
      <Text style={[s.amount, { color: amountColor }]}>
        {formatTransactionAmount(signedAmount, lang, tr.currencyUnit)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconReceived: { backgroundColor: Colors.light.success + '18' },
  iconSent: { backgroundColor: Colors.light.error + '18' },
  body: { flex: 1, minWidth: 0 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    lineHeight: 18,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginLeft: Spacing.xs,
  },
});
