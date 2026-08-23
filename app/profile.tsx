import { View, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text } from '@/components/app-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { formatBalance, formatCashOut } from '@/utils/format-balance';
import { useCallback, useState } from 'react';

export default function ProfileScreen() { 
  useRequireAuth();
  const { tr, lang } = useLanguage();
  const { user, refreshUser, isRefreshing } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  if (!user) return null;

  const infoRows = [
    { icon: 'call-outline', label: tr.profilePhone, value: user.phone ?? '—' },
    { icon: 'cash-outline', label: tr.profileCashOut, value: formatCashOut(user.cash_out, lang, tr.currencyUnit) },
    { icon: 'keypad-outline', label: tr.profileCashCode, value: user.cash_code ?? '—' },
  ] as const;

  return (
    <SafeAreaView style={s.root} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{tr.profileTitle}</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.brand.greenButton}
            colors={[Colors.brand.greenButton]}
          />
        }
      >

        {/* Avatar banner */}
        <View style={s.banner}>
          <View style={s.bannerCircle1} />
          <View style={s.bannerCircle2} />
          <View style={s.avatarWrap}>
            <Ionicons name="person" size={44} color={Colors.brand.greenButton} />
          </View>
          <Text style={s.bannerName}>{user.username}</Text>
          <View style={s.balancePill}>
            <Ionicons name="wallet-outline" size={14} color={Colors.brand.gold} />
            <Text style={s.balancePillText}>{formatBalance(user.balance, lang)} {tr.currencyUnit}</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{tr.profileAccountInfo}</Text>

          {infoRows.map((row, i, arr) => (
            <View key={row.label}>
              <View style={s.infoRow}>
                <View style={s.infoIconWrap}>
                  <Ionicons name={row.icon as any} size={18} color={Colors.brand.greenButton} />
                </View>
                <View style={s.infoText}>
                  <Text style={s.infoLabel}>{row.label}</Text>
                  <Text style={s.infoValue}>{row.value}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={s.sep} />}
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{tr.profileQuickActions}</Text>
          {[
            { icon: 'lock-closed-outline', label: tr.accountChangePw, route: '/change-password' },
            { icon: 'arrow-down-circle-outline', label: tr.accountDeposit, route: '/auto-deposit' },
          ].map((item, i, arr) => (
            <View key={item.label}>
              <TouchableOpacity
                style={s.actionRow}
                activeOpacity={0.7}
                onPress={() => router.push(item.route as any)}
              >
                <View style={s.infoIconWrap}>
                  <Ionicons name={item.icon as any} size={18} color={Colors.brand.greenButton} />
                </View>
                <Text style={s.actionLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.light.placeholder} />
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={s.sep} />}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EBF5EE' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  headerBtn:   { padding: 4, minWidth: 36 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },

  scrollContent: { paddingBottom: 40 },

  banner: {
    backgroundColor: Colors.brand.greenButton,
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    overflow: 'hidden',
  },
  bannerCircle1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -80, right: -40,
  },
  bannerCircle2: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -50, left: 10,
  },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  bannerName: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff', marginBottom: Spacing.sm,
  },
  balancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  balancePillText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: 14,
    paddingBottom: 4,
    ...Shadow.sm,
  },
  cardTitle: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold,
    color: Colors.brand.greenButton, letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 10,
  },

  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    backgroundColor: '#E8F5EE', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.text },
  sep: { height: 1, backgroundColor: Colors.light.border, marginLeft: 48 },

  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  actionLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.text, marginLeft: 0 },
});
