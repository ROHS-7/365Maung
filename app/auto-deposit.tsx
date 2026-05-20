import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';

// ─── Payment methods ──────────────────────────────────────────────────────────

type PaymentMethod = {
  id: string;
  name: string;
  accountNumber: string;
  accountName: string;
  cardBg: string;         // main card background
  cardBg2: string;        // darker shade for circles
  lightText: boolean;     // true = white text, false = dark text (Wave yellow)
  logo: 'kbz' | 'wave';
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'kbz',
    name: 'KBZ Pay',
    accountNumber: '09978654321',
    accountName: 'Mg Mg',
    cardBg: '#1246AC',
    cardBg2: '#0A2F7A',
    lightText: true,
    logo: 'kbz',
  },
  {
    id: 'wave',
    name: 'Wave Money',
    accountNumber: '09765432100',
    accountName: 'Mg Mg',
    cardBg: '#F7D000',
    cardBg2: '#E6B800',
    lightText: false,
    logo: 'wave',
  },
];

function maskNumber(n: string) {
  return `${n.slice(0, 4)}  ••••  ••${n.slice(-2)}`;
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function PaymentLogo({ type, size = 48 }: { type: 'kbz' | 'wave'; size?: number }) {
  const source = type === 'kbz'
    ? require('@/assets/images/kbz-pay.png')
    : require('@/assets/images/wave-money.png');
  return (
    <Image
      source={source}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      resizeMode="cover"
    />
  );
}

// ─── Bank Card ────────────────────────────────────────────────────────────────

function BankCard({ method, onPress }: { method: PaymentMethod; onPress: () => void }) {
  const { tr } = useLanguage();
  const fg      = method.lightText ? '#fff'                 : '#1A1A1A';
  const fgMuted = method.lightText ? 'rgba(255,255,255,0.6)': 'rgba(0,0,0,0.45)';
  const btnBorder = method.lightText ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.25)';
  const chipBorder = method.lightText ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';

  return (
    <View style={[card.root, { backgroundColor: method.cardBg }]}>
      {/* Decorative circles */}
      <View style={[card.circle1, { backgroundColor: method.cardBg2 }]} />
      <View style={[card.circle2, { backgroundColor: method.cardBg2 }]} />

      {/* Row 1 — logo + chip */}
      <View style={card.row1}>
        <PaymentLogo type={method.logo} size={48} />
        <View style={[card.chip, { borderColor: chipBorder }]}>
          <View style={card.chipGrid}>
            {[0,1,2,3,5,6,7,8].map(i => (
              <View key={i} style={[card.chipCell, { backgroundColor: chipBorder }]} />
            ))}
          </View>
        </View>
      </View>

      {/* Row 2 — masked account number */}
      <Text style={[card.number, { color: fg }]} numberOfLines={1}>
        {maskNumber(method.accountNumber)}
      </Text>

      {/* Row 3 — name + button */}
      <View style={card.row3}>
        <View>
          <Text style={[card.holderLabel, { color: fgMuted }]}>{tr.accountName}</Text>
          <Text style={[card.holderName, { color: fg }]}>{method.accountName}</Text>
        </View>
        <TouchableOpacity
          style={[card.viewBtn, { borderColor: btnBorder }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={[card.viewText, { color: fg }]}>{tr.viewAccount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Account Modal ────────────────────────────────────────────────────────────

function AccountModal({
  method, visible, onClose,
}: {
  method: PaymentMethod | null; visible: boolean; onClose: () => void;
}) {
  const { tr } = useLanguage();
  if (!method) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={m.sheet}>
          <View style={m.handle} />

          {/* Header */}
          <View style={m.modalTop}>
            <PaymentLogo type={method.logo} size={52} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={m.modalName}>{method.name}</Text>
              <Text style={m.modalSub}>{tr.bankCard}</Text>
            </View>
          </View>

          <View style={m.divider} />

          {/* Account number */}
          <View style={m.row}>
            <View style={[m.iconWrap, { backgroundColor: method.cardBg + '22' }]}>
              <Ionicons name="call-outline" size={20} color={method.cardBg} />
            </View>
            <View>
              <Text style={m.rowLabel}>{tr.accountNumber}</Text>
              <Text style={m.rowValue}>{method.accountNumber}</Text>
            </View>
          </View>

          <View style={m.divider} />

          {/* Account name */}
          <View style={m.row}>
            <View style={[m.iconWrap, { backgroundColor: method.cardBg + '22' }]}>
              <Ionicons name="person-outline" size={20} color={method.cardBg} />
            </View>
            <View>
              <Text style={m.rowLabel}>{tr.accountName}</Text>
              <Text style={m.rowValue}>{method.accountName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[m.closeBtn, { backgroundColor: method.cardBg }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[m.closeBtnText, { color: method.lightText ? '#fff' : '#1A1A1A' }]}>
              {tr.close}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AutoDepositScreen() {
  const { tr } = useLanguage();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);

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

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {PAYMENT_METHODS.map(method => (
          <BankCard key={method.id} method={method} onPress={() => setSelected(method)} />
        ))}

        <View style={s.noteBox}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.light.textSecondary} style={{ marginTop: 1 }} />
          <Text style={s.noteText}>{tr.autoDepositNote}</Text>
        </View>
      </ScrollView>

      <AccountModal method={selected} visible={selected !== null} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.brand.greenButton, paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: 40 },
  noteBox: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: BorderRadius.xl,
    padding: Spacing.md, ...Shadow.sm,
  },
  noteText: { flex: 1, fontSize: FontSize.sm, color: Colors.light.textSecondary, lineHeight: 22 },
});

// Credit card styles
const card = StyleSheet.create({
  root: {
    borderRadius: 20,
    aspectRatio: 1.586,       // standard credit card ratio
    padding: Spacing.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...Shadow.lg,
  },
  // Decorative background circles
  circle1: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    opacity: 0.55, top: -90, right: -70,
  },
  circle2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    opacity: 0.4, bottom: -60, left: -30,
  },

  // Top row
  row1: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },

  // EMV chip simulation
  chip: {
    width: 38, height: 28, borderRadius: 5,
    borderWidth: 1, overflow: 'hidden', justifyContent: 'center', padding: 3,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  chipCell: { width: 7, height: 7, borderRadius: 1, opacity: 0.5 },

  // Masked number
  number: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    letterSpacing: 2,
    alignSelf: 'flex-start',
  },

  // Bottom row
  row3: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  holderLabel: { fontSize: 10, marginBottom: 2, letterSpacing: 0.5 },
  holderName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },

  viewBtn: {
    borderWidth: 1.5, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
  },
  viewText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});

// Modal styles
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.lg, paddingBottom: 36, ...Shadow.lg,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.light.border,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  modalTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  modalName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.light.text },
  modalSub: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.light.border, marginVertical: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginBottom: 3 },
  rowValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.light.text },
  closeBtn: {
    marginTop: Spacing.xl, borderRadius: BorderRadius.xl,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
