import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import type { Lang } from '@/constants/i18n';

const USER = { username: 'မောင်မောင်', balance: '၃၆၇', cashCode: '114947' };

const ROW_ROUTES: Record<string, string> = { rule: '/rule', pw: '/change-password', deposit: '/auto-deposit' };

export default function AccountScreen() {
  const { tr, lang, setLang } = useLanguage();

  const ACCOUNT_ITEMS = [
    { id: 'deposit',  label: tr.accountDeposit,   sublabel: tr.accountDepositSub,   icon: 'arrow-down-circle', color: '#E67E22' },
    { id: 'withdraw', label: tr.accountWithdraw,   sublabel: tr.accountWithdrawSub,  icon: 'wallet',            color: '#F39C12' },
    { id: 'pw',       label: tr.accountChangePw,   sublabel: tr.accountChangePwSub,  icon: 'lock-closed',       color: '#9B59B6' },
    { id: 'rule',     label: tr.accountRule,        sublabel: tr.accountRuleSub,      icon: 'book-outline',      color: '#1ABC9C' },
    { id: 'ucenter',  label: tr.accountUcenter,    sublabel: tr.accountUcenterSub,   icon: 'settings-outline',  color: '#7F8C8D' },
  ] as const;

  function handleLogout() {
    Alert.alert(tr.logoutConfirmTitle, tr.logoutConfirmMsg, [
      { text: tr.logoutCancel, style: 'cancel' },
      { text: tr.logoutConfirm, style: 'destructive', onPress: () => router.replace('/login') },
    ]);
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.topGreen}>
        <Text style={s.headerTitle}>{tr.accountTitle}</Text>

        <View style={s.profileBanner}>
          <View style={s.bannerCircle1} />
          <View style={s.bannerCircle2} />

          <View style={s.profileRow}>
            <View style={s.avatar}>
              <Ionicons name="person" size={24} color={Colors.brand.greenMid} />
            </View>
            <View style={s.profileInfo}>
              <Text style={s.bannerName}>{USER.username}</Text>
            </View>
          </View>

          <View style={s.bannerRow}>
            <View style={s.bannerChip}>
              <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={s.bannerChipLabel}>{tr.accountBalance}</Text>
              <Text style={s.bannerChipValue}>{USER.balance} {tr.currencyUnit}</Text>
            </View>
            <View style={s.bannerChip}>
              <Ionicons name="key-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={s.bannerChipLabel}>{tr.accountCashCode}</Text>
              <Text style={s.bannerChipValue}>{USER.cashCode}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Account rows */}
        <View style={s.section}>
          {ACCOUNT_ITEMS.map((item, i) => {
            const route = ROW_ROUTES[item.id];
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={s.row}
                  activeOpacity={0.7}
                  onPress={route ? () => router.push(route as any) : undefined}
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
        <View style={s.section}>
          <View style={s.row}>
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
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={s.logoutText}>{tr.accountLogout}</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: { paddingBottom: 40, paddingTop: Spacing.sm },
  section: {
    backgroundColor: '#fff', margin: Spacing.md, marginBottom: 0,
    borderRadius: BorderRadius.xl, ...Shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  rowText: { flex: 1 },
  rowLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.light.text },
  rowSublabel: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 1 },
  separator: { height: 1, backgroundColor: Colors.light.border, marginLeft: 68 },

  // Language picker
  langPicker: { flexDirection: 'row', gap: 6 },
  langBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.light.border,
  },
  langBtnActive: { backgroundColor: Colors.brand.greenButton, borderColor: Colors.brand.greenButton },
  langBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.textSecondary },
  langBtnTextActive: { color: '#fff' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#C0392B', marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.md, gap: Spacing.sm, ...Shadow.sm,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
});
