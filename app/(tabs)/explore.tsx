import { View, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { Text } from '@/components/app-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import type { Lang } from '@/constants/i18n';
import { useAuth } from '@/contexts/auth';
import { useAuthGate } from '@/hooks/use-auth-gate';
import { LoginPromptCard } from '@/components/login-prompt-card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { formatBalance, formatCashOut } from '@/utils/format-balance';
import { useCallback, useState } from 'react';

const ROW_ROUTES: Record<string, string> = {
  rule: '/rule',
  pw: '/change-password',
  deposit: '/auto-deposit',
  withdraw: '/withdraw',
  payment: '/payment-accounts',
  requests: '/coin-requests',
};

export default function AccountScreen() {
  const { tr, lang, setLang } = useLanguage();
  const { isAuthenticated, user, logout, refreshUser, isRefreshing } = useAuth();
  const { navigate } = useAuthGate();
  const [refreshing, setRefreshing] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated, refreshUser]);

  const ACCOUNT_ITEMS = [
    { id: 'deposit',  label: tr.accountDeposit,   sublabel: tr.accountDepositSub,   icon: 'arrow-down-circle', color: '#E67E22' },
    { id: 'withdraw', label: tr.accountWithdraw,   sublabel: tr.accountWithdrawSub,  icon: 'wallet',            color: '#F39C12' },
    { id: 'payment',  label: tr.accountPaymentAccounts, sublabel: tr.accountPaymentAccountsSub, icon: 'card-outline', color: '#2980B9' },
    { id: 'requests', label: tr.accountCoinRequests, sublabel: tr.accountCoinRequestsSub, icon: 'swap-horizontal', color: '#16A085' },
    { id: 'pw',       label: tr.accountChangePw,   sublabel: tr.accountChangePwSub,  icon: 'lock-closed',       color: '#9B59B6' },
    { id: 'rule',     label: tr.accountRule,        sublabel: tr.accountRuleSub,      icon: 'book-outline',      color: '#1ABC9C' },
  ] as const;

  async function confirmLogout() {
    setLoggingOut(true);
    try {
      await logout();
      setLogoutOpen(false);
      router.replace('/');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.topGreen}>
        <Text style={s.headerTitle}>{tr.accountTitle}</Text>

        {isAuthenticated && user ? (
          <View style={s.profileBanner}>
            <View style={s.bannerCircle1} />
            <View style={s.bannerCircle2} />

            <View style={s.profileRow}>
              <View style={s.avatar}>
                <Ionicons name="person" size={24} color={Colors.brand.greenMid} />
              </View>
              <View style={s.profileInfo}>
                <Text style={s.bannerName}>{user.username}</Text>
              </View>
            </View>

            <View style={s.bannerRow}>
              <View style={s.bannerChip}>
                <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={s.bannerChipLabel}>{tr.accountBalance}</Text>
                <Text style={s.bannerChipValue}>
                  {formatBalance(user.balance, lang)} {tr.currencyUnit}
                </Text>
              </View>
              <View style={s.bannerChip}>
                <Ionicons name="cash-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={s.bannerChipLabel}>{tr.profileCashOut}</Text>
                <Text style={s.bannerChipValue}>{formatCashOut(user.cash_out, lang, tr.currencyUnit)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={s.guestBanner}>
            <LoginPromptCard compact />
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl
              refreshing={refreshing || isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.brand.greenButton}
              colors={[Colors.brand.greenButton]}
            />
          ) : undefined
        }
      >
        {/* Account rows */}
        <View style={s.section}>
          {ACCOUNT_ITEMS.map((item, i) => {
            const route = ROW_ROUTES[item.id];
            const isPublic = item.id === 'rule';
            if (!isAuthenticated && !isPublic) return null;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={s.row}
                  activeOpacity={0.7}
                  onPress={() => navigate(item.id, route)}
                >
                  <View style={[s.rowIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={s.rowText}>
                    <Text style={s.rowLabel}>{item.label}</Text>
                    <Text style={s.rowSublabel}>{item.sublabel}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.light.placeholder} />
                </TouchableOpacity>
                {i < ACCOUNT_ITEMS.length - 1 && <View style={s.separator} />}
              </View>
            );
          })}
        </View>

        {/* Language selector */}
        <View style={[s.section, s.langSection]}>
          <View style={[s.row, s.langRow]}>
            <View style={[s.rowIcon, { backgroundColor: Colors.brand.greenButton + '18' }]}>
              <Ionicons name="language-outline" size={20} color={Colors.brand.greenButton} />
            </View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>{tr.accountLanguage}</Text>
              <Text style={s.rowSublabel}>{tr.accountLanguageSub}</Text>
            </View>
            <View style={s.langPicker}>
              {(['en', 'my'] as Lang[]).map(l => (
                <TouchableOpacity
                  key={l}
                  style={[s.langBtn, lang === l && s.langBtnActive]}
                  onPress={() => setLang(l)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.langBtnText, lang === l && s.langBtnTextActive]}>
                    {l === 'en' ? tr.langEnglish : tr.langMyanmar}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Logout */}
        {isAuthenticated && (
          <TouchableOpacity style={s.logoutBtn} onPress={() => setLogoutOpen(true)} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={s.logoutText}>{tr.accountLogout}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={logoutOpen}
        title={tr.logoutConfirmTitle}
        message={tr.logoutConfirmMsg}
        cancelLabel={tr.logoutCancel}
        confirmLabel={tr.logoutConfirm}
        destructive
        busy={loggingOut}
        onCancel={() => {
          if (!loggingOut) setLogoutOpen(false);
        }}
        onConfirm={() => {
          void confirmLogout();
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },
  topGreen: {
    backgroundColor: Colors.brand.greenButton,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 10,
  },
  profileBanner: {
    backgroundColor: Colors.brand.greenDark,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  bannerCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: -20,
  },
  bannerCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: -10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  bannerName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  bannerRow: { flexDirection: 'row', gap: Spacing.sm },
  bannerChip: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
  },
  bannerChipLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)' },
  bannerChipValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
  guestBanner: { marginHorizontal: Spacing.md },
  scrollContent: { paddingBottom: 40, paddingTop: Spacing.sm },
  section: {
    backgroundColor: '#fff', margin: Spacing.md, marginBottom: 0,
    borderRadius: BorderRadius.xl, ...Shadow.sm,
  },
  langSection: Platform.select({
    web: { overflow: 'visible' },
    default: {},
  }),
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  langRow: Platform.select({
    web: { alignItems: 'center', paddingVertical: 18, minHeight: 72 },
    default: {},
  }),
  rowIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  rowText: { flex: 1, minWidth: 0, marginRight: 8 },
  rowLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  rowSublabel: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 1,
    ...Platform.select({
      web: { marginTop: 4, paddingBottom: 2 },
      default: {},
    }),
  },
  separator: { height: 1, backgroundColor: Colors.light.border, marginLeft: 68 },

  // Language picker
  langPicker: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
    alignItems: 'center',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        minHeight: 40,
        overflow: 'visible',
      },
      default: {},
    }),
  },
  langBtnActive: { backgroundColor: Colors.brand.greenButton, borderColor: Colors.brand.greenButton },
  langBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
    ...Platform.select({
      web: {
        paddingVertical: 2,
        overflow: 'visible',
      },
      default: {},
    }),
  },
  langBtnTextActive: { color: '#fff' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#C0392B', marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.md, gap: Spacing.sm, ...Shadow.sm,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
});
