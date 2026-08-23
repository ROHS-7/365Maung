import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { getProviderMeta } from '@/constants/payment-providers';
import { PaymentProviderLogo } from '@/components/payment-provider-logo';
import { maskAccountNumber } from '@/utils/payment-accounts';
import type { PaymentAccount } from '@/types/api';

type Props = {
  account: PaymentAccount;
  onPress?: () => void;
  selected?: boolean;
  viewLabel?: string;
  accountNameLabel?: string;
};

export function PaymentAccountCard({
  account,
  onPress,
  selected = false,
  viewLabel = 'View',
  accountNameLabel = 'Account name',
}: Props) {
  const meta = getProviderMeta(account.provider);
  const fg = meta.lightText ? '#fff' : '#1A1A1A';
  const fgMuted = meta.lightText ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)';
  const btnBorder = meta.lightText ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.25)';
  const chipBorder = meta.lightText ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';

  const content = (
    <View style={[s.root, { backgroundColor: meta.cardBg }, selected && s.selected]}>
      <View style={[s.circle1, { backgroundColor: meta.cardBg2 }]} />
      <View style={[s.circle2, { backgroundColor: meta.cardBg2 }]} />

      <View style={s.row1}>
        <PaymentProviderLogo provider={account.provider} size={48} />
        <View style={[s.chip, { borderColor: chipBorder }]}>
          <View style={s.chipGrid}>
            {[0, 1, 2, 3, 5, 6, 7, 8].map((i) => (
              <View key={i} style={[s.chipCell, { backgroundColor: chipBorder }]} />
            ))}
          </View>
        </View>
      </View>

      <Text style={[s.number, { color: fg }]} numberOfLines={1}>
        {maskAccountNumber(account.account_number)}
      </Text>

      <View style={s.row3}>
        <View style={{ flex: 1 }}>
          <Text style={[s.holderLabel, { color: fgMuted }]}>{accountNameLabel}</Text>
          <Text style={[s.holderName, { color: fg }]} numberOfLines={1}>
            {account.account_name}
          </Text>
          <Text style={[s.providerLabel, { color: fgMuted }]}>{meta.label}</Text>
        </View>
        {onPress ? (
          <TouchableOpacity
            style={[s.viewBtn, { borderColor: btnBorder }]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={[s.viewText, { color: fg }]}>{viewLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

const s = StyleSheet.create({
  root: {
    borderRadius: 20,
    aspectRatio: 1.586,
    padding: Spacing.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...Shadow.lg,
  },
  selected: { borderWidth: 3, borderColor: '#fff' },
  circle1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.55,
    top: -90,
    right: -70,
  },
  circle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.4,
    bottom: -60,
    left: -30,
  },
  row1: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  chip: {
    width: 38,
    height: 28,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: 3,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  chipCell: { width: 7, height: 7, borderRadius: 1, opacity: 0.5 },
  number: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    letterSpacing: 2,
    alignSelf: 'flex-start',
  },
  row3: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.sm },
  holderLabel: { fontSize: 10, marginBottom: 2, letterSpacing: 0.5 },
  holderName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  providerLabel: { fontSize: 10, marginTop: 2 },
  viewBtn: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  viewText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
