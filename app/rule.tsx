import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

export default function RuleScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    setLoading(true);
    setError(false);
    try {
      // Replace this URL with the real API endpoint
      const res = await fetch('https://your-api.com/rules');
      const data = await res.text();
      setText(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

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
        <Ionicons name="book-outline" size={22} color="rgba(255,255,255,0.4)" />
      </View>

      {/* Body */}
      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={Colors.brand.greenButton} />
        </View>
      ) : error ? (
        <View style={s.centered}>
          <Ionicons name="wifi-outline" size={48} color={Colors.light.border} />
          <Text style={s.errorText}>ချိတ်ဆက်မှု မအောင်မြင်ပါ</Text>
          <TouchableOpacity onPress={fetchRules} style={s.retryBtn} activeOpacity={0.8}>
            <Text style={s.retryText}>ထပ်ကြိုးစားပါ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.ruleText}>{text}</Text>
        </ScrollView>
      )}
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
  scrollContent: { padding: Spacing.lg, paddingBottom: 48 },

  ruleText: {
    fontSize: FontSize.md,
    color: Colors.light.text,
    lineHeight: 26,
  },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.md, color: Colors.light.textSecondary },
  retryBtn: {
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  retryText: { fontSize: FontSize.md, color: '#fff', fontWeight: FontWeight.semibold },
});
