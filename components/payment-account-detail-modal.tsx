import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { getProviderMeta } from '@/constants/payment-providers';
import { PaymentProviderLogo } from '@/components/payment-provider-logo';
import type { PaymentAccount } from '@/types/api';

type Props = {
  account: PaymentAccount | null;
  visible: boolean;
  onClose: () => void;
  bankCardLabel: string;
  accountNumberLabel: string;
  accountNameLabel: string;
  closeLabel: string;
};

export function PaymentAccountDetailModal({
  account,
  visible,
  onClose,
  bankCardLabel,
  accountNumberLabel,
  accountNameLabel,
  closeLabel,
}: Props) {
  if (!account) return null;
  const meta = getProviderMeta(account.provider);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={s.sheet}>
          <View style={s.handle} />
          <View style={s.modalTop}>
            <PaymentProviderLogo provider={account.provider} size={52} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={s.modalName}>{meta.label}</Text>
              <Text style={s.modalSub}>{bankCardLabel}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={[s.iconWrap, { backgroundColor: meta.cardBg + '22' }]}>
              <Ionicons name="call-outline" size={20} color={meta.cardBg} />
            </View>
            <View>
              <Text style={s.rowLabel}>{accountNumberLabel}</Text>
              <Text style={s.rowValue} selectable>
                {account.account_number}
              </Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={[s.iconWrap, { backgroundColor: meta.cardBg + '22' }]}>
              <Ionicons name="person-outline" size={20} color={meta.cardBg} />
            </View>
            <View>
              <Text style={s.rowLabel}>{accountNameLabel}</Text>
              <Text style={s.rowValue}>{account.account_name}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.closeBtn, { backgroundColor: meta.cardBg }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[s.closeBtnText, { color: meta.lightText ? '#fff' : '#1A1A1A' }]}>
              {closeLabel}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingBottom: 36,
    ...Shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  modalName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.light.text },
  modalSub: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.light.border, marginVertical: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginBottom: 3 },
  rowValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.light.text },
  closeBtn: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.xl,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
