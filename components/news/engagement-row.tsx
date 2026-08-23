import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import { NewsTheme } from '@/constants/news-theme';
import { formatCount } from '@/utils/news-format';

type Props = {
  views: number;
  likes: number;
  liked?: boolean;
  onDark?: boolean;
};

export function EngagementRow({ views, likes, liked, onDark }: Props) {
  const color = onDark ? 'rgba(255,255,255,0.75)' : NewsTheme.textMuted;
  const likeColor = liked ? NewsTheme.danger : color;

  return (
    <View style={s.row}>
      <View style={s.item}>
        <Ionicons name="eye-outline" size={14} color={color} />
        <Text style={[s.text, { color }]}>{formatCount(views)}</Text>
      </View>
      <View style={s.item}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={14} color={likeColor} />
        <Text style={[s.text, { color: likeColor }]}>{formatCount(likes)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontSize: 12, fontWeight: '500' },
});
