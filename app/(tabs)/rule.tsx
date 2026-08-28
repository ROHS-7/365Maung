import { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Text } from '@/components/app-text';
import { ScreenHeader } from '@/components/screen-header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { useAppConfig } from '@/contexts/app-config';

const FALLBACK_RULES = `1. အကောင့်တစ်ခုစီသည် တစ်ဦးတည်းသာ အသုံးပြုခွင့်ရှိသည်။ မိမိ၏ Login နှင့် Password ကို အခြားသူများနှင့် မျှဝေခြင်း မပြုရ။

2. လိမ်လည်မှု သို့မဟုတ် မသင့်လျော်သောလုပ်ဆောင်ချက်များ တွေ့ပါက အကောင့်ကို ပိတ်သိမ်းမည်။

3. အနည်းဆုံး လောင်းကြေး — 500 ကျပ်။ အများဆုံး လောင်းကြေး — 20,000 ကျပ်။

4. Mix Parlay အတွက် အနည်းဆုံး ပွဲ ၂ ပွဲ ပါဝင်ရမည်။

5. ပွဲစဉ်ကျင်းပနေစဉ် လောင်းထားသော ကြေးများကို ပြန်ဖျက်၍ မရပါ။

6. ပွဲပျက်သွားပါက လောင်းကြေးကို အပြည့်အဝ ပြန်အမ်းမည်ဖြစ်သည်။

7. ဘောဒီ (Body) ပွဲများအတွက် ကော်မရှင် 5% ကောက်ခံမည်ဖြစ်သည်။

8. ငွေသွင်းပြီးနောက် Slip ကို Customer Service သို့ ပေးပို့ရမည်။

9. ငွေထုတ်ရာတွင် မှတ်ပုံတင်ထားသော ဘဏ်အကောင့်မှသာ ထုတ်ယူနိုင်သည်။ ငွေထုတ်ချိန် ၁ နာရီမှ ၃ နာရီ အတွင်း ဆောင်ရွက်ပေးမည်ဖြစ်သည်။

10. ပလက်ဖောင်းသည် မည်သည့်အချိန်မဆို စည်းမျဉ်းများကို ပြင်ဆင်ပိုင်ခွင့် ရှိသည်။`;

export default function RuleScreen() {
  const { tr } = useLanguage();
  const { application, refresh } = useAppConfig();
  const [refreshing, setRefreshing] = useState(false);
  const ruleText = application?.football_rules?.trim() || FALLBACK_RULES;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScreenHeader
        title={tr.ruleTitle}
        subtitle={tr.ruleSub}
        onBack={() => router.back()}
        backIcon="arrow-back"
        right={<Ionicons name="book-outline" size={22} color="rgba(255,255,255,0.4)" />}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.brand.greenButton}
            colors={[Colors.brand.greenButton]}
          />
        }
      >
        <Text style={s.ruleText}>{ruleText}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 48 },
  ruleText: { fontSize: FontSize.md, color: Colors.light.text, lineHeight: 26 },
});
