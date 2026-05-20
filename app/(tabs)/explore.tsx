import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

const USER = {
  username: 'မောင်မောင်',
  balance: '၃၆၇',
  cashCode: '114947',
};

const ACCOUNT_ITEMS = [
  { id: 'deposit',  label: 'Auto Deposit',    sublabel: 'ငွေသွင်းရန်',     icon: 'arrow-down-circle', color: '#E67E22' },
  { id: 'withdraw', label: 'Withdraw',        sublabel: 'ငွေထုတ်ရန်',      icon: 'wallet',            color: '#F39C12' },
  { id: 'pw',       label: 'Change Password', sublabel: 'စကားဝှက်ပြောင်း', icon: 'lock-closed',       color: '#9B59B6' },
  { id: 'rule',     label: 'Rule',            sublabel: 'စည်းမျဉ်းများ',    icon: 'book-outline',      color: '#1ABC9C' },
  { id: 'ucenter',  label: 'Ucenter',         sublabel: 'ဆက်တင်များ',       icon: 'settings-outline',  color: '#7F8C8D' },
] as const;

const ROW_ROUTES: Partial<Record<typeof ACCOUNT_ITEMS[number]['id'], string>> = {
  rule: '/rule',
};

function AccountRow({ item }: { item: typeof ACCOUNT_ITEMS[number] }) {
  const route = ROW_ROUTES[item.id];
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={route ? () => router.push(route as any) : undefined}>
      <View style={[s.rowIcon, { backgroundColor: item.color + '18' }]}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={s.rowText}>
        <Text style={s.rowLabel}>{item.label}</Text>
        <Text style={s.rowSublabel}>{item.sublabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.light.placeholder} />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  function handleLogout() {
    Alert.alert('Logout', 'ထွက်မည်မှာ သေချာပါသလား?', [
      { text: 'မထွက်ဘူး', style: 'cancel' },
      { text: 'ထွက်မည်', style: 'destructive', onPress: () => router.replace('/login') },
    ]);
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Profile Banner */}
        <View style={s.profileBanner}>
          <View style={s.bannerCircle1} />
          <View style={s.bannerCircle2} />
          <View style={s.avatar}>
            <Ionicons name="person" size={32} color={Colors.brand.greenMid} />
          </View>
          <Text style={s.bannerName}>{USER.username}</Text>
          <View style={s.bannerRow}>
            <View style={s.bannerChip}>
              <Text style={s.bannerChipLabel}>Balance</Text>
              <Text style={s.bannerChipValue}>{USER.balance} ကျပ်</Text>
            </View>
            <View style={[s.bannerChip, { marginLeft: 10 }]}>
              <Text style={s.bannerChipLabel}>Cash Code</Text>
              <Text style={s.bannerChipValue}>{USER.cashCode}</Text>
            </View>
          </View>
        </View>

        {/* Account items */}
        <View style={s.section}>
          {ACCOUNT_ITEMS.map((item, i) => (
            <View key={item.id}>
              <AccountRow item={item} />
              {i < ACCOUNT_ITEMS.length - 1 && <View style={s.separator} />}
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },

  header: {
    backgroundColor: Colors.brand.greenDark,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },

  scrollContent: { paddingBottom: 40 },

  // Profile banner
  profileBanner: {
    backgroundColor: Colors.brand.greenMid,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -40,
  },
  bannerCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -50, left: 10,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  bannerName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff', marginBottom: Spacing.md },
  bannerRow: { flexDirection: 'row' },
  bannerChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 8,
    alignItems: 'center',
  },
  bannerChipLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  bannerChipValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },

  // Account rows
  section: {
    backgroundColor: '#fff',
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  rowIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.light.text },
  rowSublabel: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 1 },
  separator: { height: 1, backgroundColor: Colors.light.border, marginLeft: 68 },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#C0392B',
    marginHorizontal: Spacing.lg, marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.md, gap: Spacing.sm,
    ...Shadow.sm,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
});
