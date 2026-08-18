import { BoundAccountBanner, PaymentAccountGate } from '@/components/bound-account-banner';
import { PaymentAccountCard } from '@/components/payment-account-card';
import { PaymentAccountDetailModal } from '@/components/payment-account-detail-modal';
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
import { submitDepositRequest } from '@/services/coin-requests';
import { fetchDepositPaymentAccounts } from '@/services/deposit-accounts';
import { fetchPaymentAccounts } from '@/services/payment-accounts';
import type { AgentSummary, PaymentAccount } from '@/types/api';
import { agentDisplayName, filterByProvider, getBoundAccount } from '@/utils/payment-accounts';
import { showAlert } from '@/utils/app-alert';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AutoDepositScreen() {
  useRequireAuth();
  const { tr } = useLanguage();
  const { token } = useAuth();
  const [bound, setBound] = useState<PaymentAccount | null>(null);
  const [agent, setAgent] = useState<AgentSummary | null>(null);
  const [agentAccounts, setAgentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailAccount, setDetailAccount] = useState<PaymentAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (opts?: { soft?: boolean }) => {
    if (!token) return;
    if (!opts?.soft) setLoading(true);
    setLoadError(null);
    try {
      const [userAccounts, depositData] = await Promise.all([
        fetchPaymentAccounts(token),
        fetchDepositPaymentAccounts(token),
      ]);
      const boundAccount = getBoundAccount(userAccounts);
      setBound(boundAccount);
      setAgent(depositData.agent);

      if (!depositData.agent) {
        setAgentAccounts([]);
        setLoadError(tr.depositNoAgent);
        return;
      }

      const matching = boundAccount
        ? filterByProvider(depositData.payment_accounts, boundAccount.provider)
        : depositData.payment_accounts.filter((a) => a.is_enabled);

      setAgentAccounts(matching);
      setSelectedId(matching[0]?.id ?? null);

      if (matching.length === 0 && boundAccount) {
        setLoadError(tr.depositNoMatchingProvider);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : tr.depositLoadFailed);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, tr.depositNoAgent, tr.depositNoMatchingProvider, tr.depositLoadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = agentAccounts.find((a) => a.id === selectedId) ?? null;

  async function handleSubmit() {
    if (!token || !selected) return;
    const parsed = parseInt(amount.replace(/,/g, ''), 10);
    if (!parsed || parsed < 1) {
      showAlert('', tr.depositAmountRequired);
      return;
    }

    showAlert(tr.depositConfirmTitle, tr.depositConfirmMsg, [
      { text: tr.logoutCancel, style: 'cancel' },
      {
        text: tr.depositSubmit,
        onPress: async () => {
          setSubmitting(true);
          try {
            await submitDepositRequest(token, {
              amount: parsed,
              payment_account_id: selected.id,
              note: note.trim() || undefined,
            });
            showAlert(tr.depositSuccessTitle, tr.depositSuccessMsg, [
              {
                text: tr.coinRequestViewRequests,
                onPress: () => router.push('/(tabs)/coin-requests' as never),
              },
              { text: tr.ok },
            ]);
            setAmount('');
            setNote('');
          } catch (e) {
            showAlert('', e instanceof Error ? e.message : tr.depositFailed);
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{tr.autoDepositTitle}</Text>
          <Text style={s.headerSub}>{tr.autoDepositSub}</Text>
        </View>
        <Ionicons name="arrow-down-circle-outline" size={22} color="rgba(255,255,255,0.4)" />
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={Colors.brand.greenButton} size="large" />
        </View>
      ) : !bound ? (
        <PaymentAccountGate
          title={tr.paymentAccountGateTitle}
          message={tr.paymentAccountGateDeposit}
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
            <BoundAccountBanner
              account={bound}
              title={tr.depositSendFrom}
              manageLabel={tr.paymentAccountManage}
            />

            {agent ? (
              <View style={s.agentRow}>
                <Ionicons name="person-circle-outline" size={18} color={Colors.light.textSecondary} />
                <Text style={s.agentText}>
                  {tr.depositAgent}: {agentDisplayName(agent)}
                </Text>
              </View>
            ) : null}

            {loadError ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{loadError}</Text>
              </View>
            ) : null}

            <Text style={s.sectionTitle}>{tr.depositSendTo}</Text>
            {agentAccounts.map((account) => (
              <Pressable
                key={account.id}
                onPress={() => setSelectedId(account.id)}
                style={{ marginBottom: Spacing.md }}
              >
                <PaymentAccountCard
                  account={account}
                  selected={account.id === selectedId}
                  onPress={() => setDetailAccount(account)}
                  viewLabel={tr.viewAccount}
                  accountNameLabel={tr.accountName}
                />
              </Pressable>
            ))}

            {agentAccounts.length > 0 ? (
              <>
                <Text style={s.sectionTitle}>{tr.depositAfterTransfer}</Text>
                <Text style={s.label}>{tr.depositAmount}</Text>
                <TextInput
                  style={s.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.light.placeholder}
                />
                <Text style={s.label}>{tr.depositNote}</Text>
                <TextInput
                  style={[s.input, s.noteInput]}
                  value={note}
                  onChangeText={setNote}
                  placeholder={tr.depositNotePh}
                  placeholderTextColor={Colors.light.placeholder}
                  multiline
                />
                <View style={s.noteBox}>
                  <Ionicons name="information-circle-outline" size={18} color={Colors.light.textSecondary} />
                  <Text style={s.noteText}>{tr.depositPendingNote}</Text>
                </View>
                <TouchableOpacity
                  style={[s.submitBtn, submitting && s.submitDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting || !selected}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.submitText}>{tr.depositSubmit}</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <PaymentAccountDetailModal
        account={detailAccount}
        visible={detailAccount !== null}
        onClose={() => setDetailAccount(null)}
        bankCardLabel={tr.bankCard}
        accountNumberLabel={tr.accountNumber}
        accountNameLabel={tr.accountName}
        closeLabel={tr.close}
      />
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
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  agentText: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  errorBox: {
    backgroundColor: Colors.light.error + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { fontSize: FontSize.sm, color: Colors.light.error, lineHeight: 20 },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
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
