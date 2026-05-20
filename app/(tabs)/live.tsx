import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';

export default function LiveScreen() {
  const { tr } = useLanguage();
  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Ionicons name="radio" size={18} color="#fff" />
        <Text style={s.headerTitle}>{tr.liveTitle}</Text>
      </View>
      <View style={s.empty}>
        <Ionicons name="radio-outline" size={56} color={Colors.light.border} />
        <Text style={s.emptyText}>{tr.liveEmpty}</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.brand.greenDark, paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: FontSize.md, color: Colors.light.textSecondary },
});
