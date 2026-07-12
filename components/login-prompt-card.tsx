import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';

type Props = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

export function LoginPromptCard({ title, subtitle, compact }: Props) {
  const { tr } = useLanguage();

  return (
    <View style={[s.root, compact && s.rootCompact]}>
      <View style={s.orb1} />
      <View style={s.orb2} />

      <View style={s.iconWrap}>
        <Ionicons name="person-circle-outline" size={compact ? 32 : 40} color="#fff" />
      </View>

      <Text style={[s.title, compact && s.titleCompact]}>
        {title ?? tr.guestWelcomeTitle}
      </Text>
      <Text style={[s.subtitle, compact && s.subtitleCompact]}>
        {subtitle ?? tr.guestWelcomeSub}
      </Text>

      <View style={[s.actions, compact && s.actionsCompact]}>
        <TouchableOpacity
          style={s.btn}
          activeOpacity={0.85}
          onPress={() => router.push('/login')}
        >
          <Ionicons name="log-in-outline" size={18} color={Colors.brand.greenDark} />
          <Text style={s.btnText}>{tr.guestLoginBtn}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.btnGhost}
          activeOpacity={0.85}
          onPress={() => router.push('/register')}
        >
          <Text style={s.btnGhostText}>{tr.guestRegisterBtn}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    backgroundColor: Colors.brand.greenDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.md,
  },
  rootCompact: {
    paddingVertical: Spacing.lg,
    marginBottom: 0,
  },
  orb1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -25,
  },
  orb2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 10,
    left: -15,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  titleCompact: { fontSize: FontSize.sm },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  subtitleCompact: { fontSize: FontSize.xs, marginBottom: Spacing.sm },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionsCompact: {
    flexDirection: 'column',
    alignSelf: 'stretch',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.brand.gold,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  btnGhostText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
    textAlign: 'center',
  },
});
