import { FootballBetScreen } from '@/components/football-bet-screen';
import { useAppConfig } from '@/contexts/app-config';
import { useLanguage } from '@/contexts/language';
import { useHideParentTabBar } from '@/hooks/use-hide-parent-tab-bar';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ScreenHeader } from '@/components/screen-header';
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
      <ScreenHeader title={title} onBack={() => safeBack()} />
      <View style={s.body}>
        <Text style={s.message}>{message}</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E9F0EC' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  message: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
