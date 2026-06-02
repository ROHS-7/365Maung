import { View, Text, StyleSheet } from 'react-native';
import { NewsTheme } from '@/constants/news-theme';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

type Props = {
  name: string;
  timeLabel: string;
  category?: string;
  onDark?: boolean;
};

export function SourceBadge({ name, timeLabel, category, onDark }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || 'N';
  const textColor = onDark ? 'rgba(255,255,255,0.85)' : NewsTheme.textSecondary;
  const nameColor = onDark ? '#fff' : NewsTheme.text;

  return (
    <View style={s.row}>
      <View style={[s.avatar, onDark && s.avatarOnDark]}>
        <Text style={[s.initial, onDark && s.initialOnDark]}>{initial}</Text>
      </View>
      <View style={s.textCol}>
        <Text style={[s.name, { color: nameColor }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[s.meta, { color: textColor }]} numberOfLines={1}>
          {category ? `${category} · ${timeLabel}` : timeLabel}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NewsTheme.accentDim,
    borderWidth: 1,
    borderColor: NewsTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOnDark: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  initial: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenMid,
  },
  initialOnDark: { color: '#fff' },
  textCol: { flex: 1 },
  name: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  meta: { fontSize: 11, marginTop: 1 },
});
