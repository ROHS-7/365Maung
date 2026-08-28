import { PaymentAccountFormModal } from '@/components/payment-account-form-modal';
import { PaymentProviderLogo } from '@/components/payment-provider-logo';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Shadow,
} from '@/constants/theme';
import { getProviderMeta } from '@/constants/payment-providers';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { useRequireAuth } from '@/hooks/use-require-auth';
import {
  bindPaymentAccount,
  createPaymentAccount,
  deletePaymentAccount,
  fetchPaymentAccounts,
  updatePaymentAccount,
} from '@/services/payment-accounts';
import type { PaymentAccount } from '@/types/api';
import { maskAccountNumber } from '@/utils/payment-accounts';
import { showAlert } from '@/utils/app-alert';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/app-text';
import { ScreenHeader } from '@/components/screen-header';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentAccountsScreen() {
  useRequireAuth();
  const { tr } = useLanguage();
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentAccount | null>(null);
  const [bindingId, setBindingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchPaymentAccounts(token);
      setAccounts(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(account: PaymentAccount) {
    setEditing(account);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: {
    provider: import('@/types/api').PaymentProvider;
    account_name: string;
    account_number: string;
  }) {
    if (!token) return;
    if (editing) {
      await updatePaymentAccount(token, editing.id, values);
    } else {
      const created = await createPaymentAccount(token, values);
      if (accounts.length === 0) {
        await bindPaymentAccount(token, created.id);
      }
    }
    await load();
  }

  async function handleBind(id: number) {
    if (!token) return;
    setBindingId(id);
    try {
      await bindPaymentAccount(token, id);
      await load();
    } finally {
      setBindingId(null);
    }
  }

  async function handleToggleEnabled(account: PaymentAccount, enabled: boolean) {
    if (!token) return;
    await updatePaymentAccount(token, account.id, { is_enabled: enabled });
    await load();
  }

  function handleDelete(account: PaymentAccount) {
    showAlert(tr.paymentAccountDeleteTitle, tr.paymentAccountDeleteMsg, [
      { text: tr.logoutCancel, style: 'cancel' },
      {
        text: tr.paymentAccountDeleteConfirm,
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          try {
            await deletePaymentAccount(token, account.id);
            await load();
          } catch (e) {
            showAlert('', e instanceof Error ? e.message : tr.paymentAccountDeleteFailed);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScreenHeader
        title={tr.paymentAccountsTitle}
        subtitle={tr.paymentAccountsSub}
        onBack={() => router.back()}
        backIcon="arrow-back"
        right={<Ionicons name="card-outline" size={22} color="rgba(255,255,255,0.4)" />}
      />

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={Colors.brand.greenButton} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.brand.greenButton} />
          }
        >
          {accounts.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="wallet-outline" size={40} color={Colors.light.textSecondary} />
              <Text style={s.emptyTitle}>{tr.paymentAccountsEmpty}</Text>
              <Text style={s.emptySub}>{tr.paymentAccountsEmptySub}</Text>
            </View>
          ) : (
            accounts.map((account) => {
              const meta = getProviderMeta(account.provider);
              return (
                <View key={account.id} style={s.card}>
                  <View style={s.cardTop}>
                    <PaymentProviderLogo provider={account.provider} size={40} />
                    <View style={s.cardInfo}>
                      <Text style={s.cardProvider}>{meta.label}</Text>
                      <Text style={s.cardName}>{account.account_name}</Text>
                      <Text style={s.cardNumber}>{maskAccountNumber(account.account_number)}</Text>
                    </View>
                    {account.is_bound ? (
                      <View style={s.activeBadge}>
                        <Text style={s.activeBadgeText}>{tr.paymentAccountActive}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={s.enabledRow}>
                    <Text style={s.enabledLabel}>{tr.paymentAccountEnabled}</Text>
                    <Switch
                      value={account.is_enabled}
                      onValueChange={(v) => handleToggleEnabled(account, v)}
                      trackColor={{ true: Colors.brand.greenButton }}
                    />
                  </View>

                  <View style={s.actions}>
                    {!account.is_bound && account.is_enabled ? (
                      <TouchableOpacity
                        style={s.bindBtn}
                        onPress={() => handleBind(account.id)}
                        disabled={bindingId === account.id}
                      >
                        {bindingId === account.id ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={s.bindBtnText}>{tr.paymentAccountBind}</Text>
                        )}
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity style={s.ghostBtn} onPress={() => openEdit(account)}>
                      <Text style={s.ghostBtnText}>{tr.paymentAccountEdit}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.dangerBtn} onPress={() => handleDelete(account)}>
                      <Ionicons name="trash-outline" size={18} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          <TouchableOpacity style={s.addBtn} onPress={openAdd} activeOpacity={0.85}>
            <Ionicons name="add-circle" size={22} color="#fff" />
            <Text style={s.addBtnText}>{tr.paymentAccountAdd}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <PaymentAccountFormModal
        visible={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        title={editing ? tr.paymentAccountEditTitle : tr.paymentAccountAddTitle}
        providerLabel={tr.paymentAccountProvider}
        accountNameLabel={tr.accountName}
        accountNumberLabel={tr.accountNumber}
        saveLabel={tr.paymentAccountSave}
        cancelLabel={tr.logoutCancel}
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
  scroll: { padding: Spacing.md, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.light.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.light.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardInfo: { flex: 1 },
  cardProvider: { fontSize: FontSize.xs, color: Colors.light.textSecondary },
  cardName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.light.text },
  cardNumber: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 2 },
  activeBadge: {
    backgroundColor: Colors.brand.greenButton + '22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  activeBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.brand.greenButton },
  enabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  enabledLabel: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, alignItems: 'center' },
  bindBtn: {
    flex: 1,
    backgroundColor: Colors.brand.greenButton,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  bindBtnText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  ghostBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  ghostBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.text },
  dangerBtn: { padding: 10 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.brand.greenButton,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  addBtnText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
