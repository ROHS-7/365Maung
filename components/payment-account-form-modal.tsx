import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { PAYMENT_PROVIDERS } from '@/constants/payment-providers';
import type { PaymentAccount, PaymentProvider } from '@/types/api';

export type PaymentAccountFormValues = {
  provider: PaymentProvider;
  account_name: string;
  account_number: string;
};

type Props = {
  visible: boolean;
  editing: PaymentAccount | null;
  onClose: () => void;
  onSubmit: (values: PaymentAccountFormValues) => Promise<void>;
  title: string;
  providerLabel: string;
  accountNameLabel: string;
  accountNumberLabel: string;
  saveLabel: string;
  cancelLabel: string;
};

export function PaymentAccountFormModal({
  visible,
  editing,
  onClose,
  onSubmit,
  title,
  providerLabel,
  accountNameLabel,
  accountNumberLabel,
  saveLabel,
  cancelLabel,
}: Props) {
  const [provider, setProvider] = useState<PaymentProvider>('kbz_pay');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setProvider((editing?.provider as PaymentProvider) ?? 'kbz_pay');
    setAccountName(editing?.account_name ?? '');
    setAccountNumber(editing?.account_number ?? '');
    setError(null);
  }, [visible, editing]);

  async function handleSave() {
    if (!accountName.trim() || !accountNumber.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        provider,
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>

          <Text style={s.label}>{providerLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.providerRow}>
            {PAYMENT_PROVIDERS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[s.providerChip, provider === p.id && s.providerChipActive]}
                onPress={() => setProvider(p.id)}
                disabled={!!editing}
              >
                <Text style={[s.providerChipText, provider === p.id && s.providerChipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.label}>{accountNameLabel}</Text>
          <TextInput
            style={s.input}
            value={accountName}
            onChangeText={setAccountName}
            placeholder={accountNameLabel}
            placeholderTextColor={Colors.light.placeholder}
          />

          <Text style={s.label}>{accountNumberLabel}</Text>
          <TextInput
            style={s.input}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder={accountNumberLabel}
            keyboardType="phone-pad"
            placeholderTextColor={Colors.light.placeholder}
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <View style={s.actions}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={s.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.saveText}>{saveLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
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
    maxHeight: '85%',
    ...Shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.light.text, marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  providerRow: { marginBottom: Spacing.sm },
  providerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    marginRight: Spacing.sm,
  },
  providerChipActive: { backgroundColor: Colors.brand.greenButton, borderColor: Colors.brand.greenButton },
  providerChipText: { fontSize: FontSize.sm, color: Colors.light.textSecondary, fontWeight: FontWeight.semibold },
  providerChipTextActive: { color: '#fff' },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  error: { color: Colors.light.error, fontSize: FontSize.sm, marginTop: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  cancelText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.textSecondary },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton,
    alignItems: 'center',
  },
  saveText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
});
