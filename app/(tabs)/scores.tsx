import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

export default function ScoresScreen() {
  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Scores</Text>
      </View>
      <View style={s.empty}>
        <Ionicons name="stats-chart-outline" size={56} color={Colors.light.border} />
        <Text style={s.emptyText}>ရလဒ်များ မရှိသေးပါ</Text>
        <Text style={s.emptySubText}>No scores available</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },
  header: {
    backgroundColor: Colors.brand.greenDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: FontSize.md, color: Colors.light.textSecondary },
  emptySubText: { fontSize: FontSize.sm, color: Colors.light.placeholder },
});
