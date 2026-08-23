import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from '@/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { NewsTheme } from '@/constants/news-theme';
import { useLanguage } from '@/contexts/language';
import { formatCount } from '@/utils/news-format';

const TAB_ROW_HEIGHT = 58;
const ACTION_ROW_HEIGHT = 52;

export function getNewsDetailBottomBarHeight(insetsBottom: number) {
  return ACTION_ROW_HEIGHT + TAB_ROW_HEIGHT + insetsBottom;
}

type TabItem = {
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  center?: boolean;
};

type Props = {
  views: number;
  likes: number;
  liked: boolean;
  onLike: () => void;
  onShare: () => void;
};

export function NewsDetailBottomBar({ views, likes, liked, onLike, onShare }: Props) {
  const { tr } = useLanguage();
  const insets = useSafeAreaInsets();

  const tabs: TabItem[] = [
    { route: '/(tabs)', icon: 'home', label: tr.tabHome },
    { route: '/(tabs)/bets', icon: 'document-text-outline', label: tr.tabBet },
    { route: '/(tabs)/live', icon: 'radio', label: tr.tabLive, center: true },
    { route: '/(tabs)/scores', icon: 'stats-chart-outline', label: tr.tabScores },
    { route: '/(tabs)/explore', icon: 'person-circle-outline', label: tr.tabAccount },
  ];

  return (
    <View style={[s.wrap, { paddingBottom: insets.bottom }]}>
      <View style={s.actionRow}>
        <TouchableOpacity
          style={[s.likeBtn, liked && s.likeBtnActive]}
          onPress={onLike}
          activeOpacity={0.8}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? '#fff' : NewsTheme.danger}
          />
          <Text style={[s.likeBtnText, liked && s.likeBtnTextActive]}>{formatCount(likes)}</Text>
        </TouchableOpacity>

        <View style={s.viewsChip}>
          <Ionicons name="eye-outline" size={16} color={NewsTheme.textSecondary} />
          <Text style={s.viewsChipText}>{formatCount(views)}</Text>
        </View>

        <TouchableOpacity style={s.shareBtn} onPress={onShare} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color={NewsTheme.accentDark} />
          <Text style={s.shareBtnText}>{tr.newsShare}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabRow}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.route}
            style={s.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push(tab.route as never)}
          >
            {tab.center ? (
              <View style={s.liveCircle}>
                <Ionicons name={tab.icon} size={20} color="#fff" />
              </View>
            ) : (
              <Ionicons name={tab.icon} size={21} color={Colors.light.tabIconDefault} />
            )}
            <Text style={[s.tabLabel, tab.center && s.tabLabelLive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: NewsTheme.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: NewsTheme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
    }),
  },
  actionRow: {
    height: ACTION_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#F5B7B1',
  },
  likeBtnActive: {
    backgroundColor: NewsTheme.danger,
    borderColor: NewsTheme.danger,
  },
  likeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: NewsTheme.danger,
  },
  likeBtnTextActive: { color: '#fff' },
  viewsChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  viewsChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: NewsTheme.textSecondary,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: NewsTheme.surfaceElevated,
    borderWidth: 1,
    borderColor: NewsTheme.border,
  },
  shareBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: NewsTheme.accentDark,
  },
  tabRow: {
    height: TAB_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: NewsTheme.border,
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  liveCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: NewsTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.light.tabIconDefault,
  },
  tabLabelLive: { color: NewsTheme.accent },
});
