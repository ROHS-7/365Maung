import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import type { Activity } from '@/types/api';
import {
  formatActivityAmount,
  formatActivityDate,
  getActivityAmount,
  getActivityIcon,
  getActivityLabel,
} from '@/utils/format-activity';

type Props = {
  activity: Activity;
  showDivider?: boolean;
};

export function ActivityRow({ activity, showDivider = true }: Props) {
  const { tr, lang } = useLanguage();
  const label = getActivityLabel(activity);
  const amount = getActivityAmount(activity);
  const icon = getActivityIcon(activity.type);
  const amountColor =
    amount == null ? Colors.light.textSecondary : amount >= 0 ? Colors.light.success : Colors.light.error;

  return (
    <View style={[s.row, showDivider && s.rowDivider]}>
      <View style={s.iconWrap}>
        <Ionicons name={icon} size={18} color={Colors.brand.greenButton} />
      </View>
      <View style={s.body}>
        <Text style={s.label} numberOfLines={2}>
          {label}
        </Text>
        <Text style={s.date}>{formatActivityDate(activity.created_at, lang)}</Text>
      </View>
      {amount != null ? (
        <Text style={[s.amount, { color: amountColor }]}>
          {formatActivityAmount(amount, lang, tr.currencyUnit)}
        </Text>
      ) : null}
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
    backgroundColor: Colors.brand.greenButton + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
