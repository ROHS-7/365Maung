import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { getProviderMeta } from '@/constants/payment-providers';
import { maskAccountNumber } from '@/utils/payment-accounts';
import type { PaymentAccount } from '@/types/api';

type Props = {
  account: PaymentAccount;
  title: string;
  manageLabel: string;
};

export function BoundAccountBanner({ account, title, manageLabel }: Props) {
  const meta = getProviderMeta(account.provider);

  return (
    <View style={s.root}>
      <View style={s.row}>
        <Ionicons name="wallet-outline" size={20} color={Colors.brand.greenButton} />
        <View style={s.text}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.detail}>
            {meta.label} · {account.account_name} · {maskAccountNumber(account.account_number)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={s.link}
        onPress={() => router.push('/(tabs)/payment-accounts' as never)}
        activeOpacity={0.7}
      >
        <Text style={s.linkText}>{manageLabel}</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.brand.greenButton} />
      </TouchableOpacity>
    </View>
  );
}

type GateProps = {
  title: string;
  message: string;
  actionLabel: string;
};

export function PaymentAccountGate({ title, message, actionLabel }: GateProps) {
  return (
    <View style={s.gate}>
      <Ionicons name="card-outline" size={40} color={Colors.light.textSecondary} />
      <Text style={s.gateTitle}>{title}</Text>
      <Text style={s.gateMsg}>{message}</Text>
      <TouchableOpacity
        style={s.gateBtn}
        onPress={() => router.push('/(tabs)/payment-accounts' as never)}
        activeOpacity={0.85}
      >
        <Text style={s.gateBtnText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  text: { flex: 1 },
  title: { fontSize: FontSize.xs, color: Colors.light.textSecondary, fontWeight: FontWeight.semibold },
  detail: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.light.text, marginTop: 2 },
  link: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, alignSelf: 'flex-start' },
  linkText: { fontSize: FontSize.sm, color: Colors.brand.greenButton, fontWeight: FontWeight.semibold },
  gate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  gateTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.light.text, textAlign: 'center' },
  gateMsg: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  gateBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  gateBtnText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
});
