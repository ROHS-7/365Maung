import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

const RULES = [
  {
    id: 'general',
    title: 'ယေဘုယျ စည်းမျဉ်းများ',
    subtitle: 'General Rules',
    icon: 'information-circle-outline',
    color: '#2980B9',
    items: [
      'အကောင့်တစ်ခုစီသည် တစ်ဦးတည်းသာ အသုံးပြုခွင့်ရှိသည်။',
      'မိမိ၏ Login နှင့် Password ကို အခြားသူများနှင့် မျှဝေခြင်း မပြုရ။',
      'အသုံးပြုသူများသည် ကိုယ်တိုင် တာဝန်ယူ၍ ကစားရမည်ဖြစ်သည်။',
      'လိမ်လည်မှု သို့မဟုတ် မသင့်လျော်သောလုပ်ဆောင်ချက်များ တွေ့ပါက အကောင့်ကို ပိတ်သိမ်းမည်။',
      'ပလက်ဖောင်းသည် မည်သည့်အချိန်မဆို စည်းမျဉ်းများကို ပြင်ဆင်ပိုင်ခွင့် ရှိသည်။',
    ],
  },
  {
    id: 'betting',
    title: 'လောင်းကစား စည်းမျဉ်းများ',
    subtitle: 'Betting Rules',
    icon: 'football-outline',
    color: '#27AE60',
    items: [
      'အနည်းဆုံး လောင်းကြေး — 500 ကျပ်',
      'အများဆုံး လောင်းကြေး — 20,000 ကျပ်',
      'Mix Parlay အတွက် အနည်းဆုံး ပွဲ ၂ ပွဲ ပါဝင်ရမည်။',
      'ပွဲစဉ်ကျင်းပနေစဉ် လောင်းထားသော ကြေးများကို ပြန်ဖျက်၍ မရပါ။',
      'ပွဲပျက်သွားပါက လောင်းကြေးကို အပြည့်အဝ ပြန်အမ်းမည်ဖြစ်သည်။',
      'ဘောဒီ (Body) ပွဲများအတွက် ကော်မရှင် 5% ကောက်ခံမည်ဖြစ်သည်။',
      'ရလဒ်ကြေညာပြီးနောက် ၂၄ နာရီအတွင်း ပျောက်ဆုံးမှုမရှိပါက အတည်ပြုသည်ဟု မှတ်ယူမည်။',
    ],
  },
  {
    id: 'deposit',
    title: 'ငွေသွင်း / ငွေထုတ် စည်းမျဉ်းများ',
    subtitle: 'Deposit & Withdrawal Rules',
    icon: 'wallet-outline',
    color: '#E67E22',
    items: [
      'ငွေသွင်းရာတွင် မှန်ကန်သောနည်းလမ်းဖြင့် သာ ငွေလွှဲပေးရမည်။',
      'ငွေသွင်းပြီးနောက် Slip ကို Customer Service သို့ ပေးပို့ရမည်။',
      'ငွေထုတ်ရာတွင် မှတ်ပုံတင်ထားသော ဘဏ်အကောင့်မှသာ ထုတ်ယူနိုင်သည်။',
      'ငွေထုတ်ချိန် — ၁ နာရီမှ ၃ နာရီ အတွင်း ဆောင်ရွက်ပေးမည်ဖြစ်သည်။',
      'တစ်ရက်လျှင် ငွေထုတ်ရာတွင် အကန့်အသတ်ရှိနိုင်သည်။',
    ],
  },
  {
    id: 'account',
    title: 'အကောင့် စီမံခန့်ခွဲမှု',
    subtitle: 'Account Management',
    icon: 'person-outline',
    color: '#9B59B6',
    items: [
      'Password ကို ပုံမှန် ၃ လတစ်ကြိမ် ပြောင်းလဲရန် အကြံပြုသည်။',
      'Login မအောင်မြင်မှုများ ကြိမ်ဖန်မြောက်မြားစွာ ဖြစ်ပါက အကောင့်ကို ယာယီ ပိတ်မည်။',
      'မှတ်ပုံတင်ထားသော ဖုန်းနံပါတ်ကို မပြောင်းမလဲ ထားရှိပေးပါ။',
      'အကောင့်နှင့် ပတ်သက်သော ပြဿနာများအတွက် Customer Service ထံ ဆက်သွယ်ပါ။',
    ],
  },
];

function RuleSection({ section }: { section: typeof RULES[number] }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={[s.sectionIcon, { backgroundColor: section.color + '20' }]}>
          <Ionicons name={section.icon as any} size={18} color={section.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.sectionTitle}>{section.title}</Text>
          <Text style={s.sectionSubtitle}>{section.subtitle}</Text>
        </View>
      </View>
      <View style={s.sectionBody}>
        {section.items.map((item, i) => (
          <View key={i} style={s.ruleRow}>
            <View style={[s.ruleDot, { backgroundColor: section.color }]} />
            <Text style={s.ruleText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function RuleScreen() {
  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Rule</Text>
          <Text style={s.headerSub}>စည်းမျဉ်းများ</Text>
        </View>
        <Ionicons name="book-outline" size={22} color="rgba(255,255,255,0.5)" />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Notice banner */}
        <View style={s.notice}>
          <Ionicons name="alert-circle" size={16} color={Colors.brand.gold} style={{ marginTop: 1 }} />
          <Text style={s.noticeText}>
            ကျွနု်ပ်တို့၏ ဝန်ဆောင်မှုကို အသုံးပြုခြင်းဖြင့် အောက်ပါ စည်းမျဉ်းများကို သဘောတူညီသည်ဟု မှတ်ယူပါသည်။
          </Text>
        </View>

        {RULES.map(section => (
          <RuleSection key={section.id} section={section} />
        ))}

        <Text style={s.footer}>
          နောက်ဆုံးပြင်ဆင်သည့်ရက် — 2026 ခုနှစ်၊ ဇန်နဝါရီ ၁ ရက်
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.brand.greenDark,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },

  notice: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.brand.greenDark,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderLeftWidth: 3, borderLeftColor: Colors.brand.gold,
  },
  noticeText: { flex: 1, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },

  section: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.light.border,
  },
  sectionIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.light.text },
  sectionSubtitle: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 1 },

  sectionBody: { padding: Spacing.md, gap: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  ruleText: { flex: 1, fontSize: FontSize.sm, color: Colors.light.text, lineHeight: 22 },

  footer: {
    fontSize: FontSize.xs, color: Colors.light.placeholder,
    textAlign: 'center', paddingVertical: Spacing.sm,
  },
});
