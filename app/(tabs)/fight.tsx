import { FootballBetScreen } from '@/components/football-bet-screen';
import { useAppConfig } from '@/contexts/app-config';
import { useLanguage } from '@/contexts/language';
import { useHideParentTabBar } from '@/hooks/use-hide-parent-tab-bar';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { safeBack } from '@/utils/navigation';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from '@/components/app-text';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FightScreen() {
  const { tr } = useLanguage();
  const { application } = useAppConfig();
  const closed = application?.is_fight_open === false;

  if (closed) {
    return <FightClosedScreen title={tr.fightTitle} message={tr.fightClosed} />;
  }

  return (
    <FootballBetScreen
      title={tr.fightTitle}
      mode="single"
      markets={['to_win']}
      minPicks={1}
      stakePlaceholder="1000"
      hint={tr.footballSinglePickHint}
      minErr={tr.footballSinglePickErr}
      source="fight"
    />
  );
}

function FightClosedScreen({ title, message }: { title: string; message: string }) {
  useRequireAuth();
  useHideParentTabBar();

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => safeBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{title}</Text>
        <View style={s.headerPad} />
      </View>
      <View style={s.body}>
        <Text style={s.message}>{message}</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E9F0EC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  backBtn: { padding: 6, width: 36 },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  headerPad: { width: 36 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  message: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
