import { BoundAccountBanner, PaymentAccountGate } from '@/components/bound-account-banner';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Shadow,
} from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { submitWithdrawRequest } from '@/services/coin-requests';
import { fetchPaymentAccounts } from '@/services/payment-accounts';
import type { PaymentAccount } from '@/types/api';
import { formatBalance } from '@/utils/format-balance';
import { showAlert } from '@/utils/app-alert';
import { getBoundAccount } from '@/utils/payment-accounts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { Text, TextInput } from '@/components/app-text';
import { ScreenHeader } from '@/components/screen-header';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WithdrawScreen() {
  useRequireAuth();
  const { tr, lang } = useLanguage();
  const { token, user, refreshUser } = useAuth();
  const [bound, setBound] = useState<PaymentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (opts?: { soft?: boolean }) => {
    if (!token) return;
    if (!opts?.soft) setLoading(true);
    try {
      const accounts = await fetchPaymentAccounts(token);
      setBound(getBoundAccount(accounts));
      if (opts?.soft) await refreshUser();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, refreshUser]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit() {
    if (!token || !bound) return;
    const parsed = parseInt(amount.replace(/,/g, ''), 10);
    if (!parsed || parsed < 1) {
      showAlert('', tr.withdrawAmountRequired);
      return;
    }
    if (user && parsed > user.balance) {
      showAlert('', tr.withdrawInsufficient);
      return;
    }

    showAlert(tr.withdrawConfirmTitle, tr.withdrawConfirmMsg, [
      { text: tr.logoutCancel, style: 'cancel' },
      {
        text: tr.withdrawSubmit,
        onPress: async () => {
          setSubmitting(true);
          try {
            await submitWithdrawRequest(token, {
              amount: parsed,
              payment_account_id: bound.id,
              note: note.trim() || undefined,
            });
            await refreshUser();
            showAlert(tr.withdrawSuccessTitle, tr.withdrawSuccessMsg, [
              {
                text: tr.coinRequestViewRequests,
                onPress: () => router.push('/(tabs)/coin-requests' as never),
              },
              { text: tr.ok },
            ]);
            setAmount('');
            setNote('');
          } catch (e) {
            showAlert('', e instanceof Error ? e.message : tr.withdrawFailed);
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScreenHeader
        title={tr.withdrawTitle}
        subtitle={tr.withdrawSub}
        onBack={() => router.back()}
        backIcon="arrow-back"
        right={<Ionicons name="arrow-up-circle-outline" size={22} color="rgba(255,255,255,0.4)" />}
      />

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={Colors.brand.greenButton} size="large" />
        </View>
      ) : !bound ? (
        <PaymentAccountGate
          title={tr.paymentAccountGateTitle}
          message={tr.paymentAccountGateWithdraw}
          actionLabel={tr.paymentAccountGateAction}
        />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  void load({ soft: true });
                }}
                tintColor={Colors.brand.greenButton}
                colors={[Colors.brand.greenButton]}
              />
            }
          >
            <View style={s.balanceCard}>
              <Text style={s.balanceLabel}>{tr.withdrawAvailable}</Text>
              <Text style={s.balanceValue}>
                {formatBalance(user?.balance ?? 0, lang)} {tr.currencyUnit}
              </Text>
            </View>

            <BoundAccountBanner
              account={bound}
              title={tr.withdrawTo}
              manageLabel={tr.paymentAccountManage}
            />

            <Text style={s.label}>{tr.withdrawAmount}</Text>
            <TextInput
              style={s.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.light.placeholder}
            />

            <Text style={s.label}>{tr.withdrawNote}</Text>
            <TextInput
              style={[s.input, s.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder={tr.withdrawNotePh}
              placeholderTextColor={Colors.light.placeholder}
              multiline
            />

            <View style={s.noteBox}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.light.textSecondary} />
              <Text style={s.noteText}>{tr.withdrawHoldNote}</Text>
            </View>

            <TouchableOpacity
              style={[s.submitBtn, submitting && s.submitDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitText}>{tr.withdrawSubmit}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.md, paddingBottom: 48 },
  balanceCard: {
    backgroundColor: Colors.brand.greenDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  balanceLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },
  balanceValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff', marginTop: 4 },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.light.text,
  },
  noteInput: { minHeight: 72, textAlignVertical: 'top' },
  noteBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadow.sm,
  },
  noteText: { flex: 1, fontSize: FontSize.sm, color: Colors.light.textSecondary, lineHeight: 20 },
  submitBtn: {
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
