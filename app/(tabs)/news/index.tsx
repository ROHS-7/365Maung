import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  type ListRenderItem,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { NewsTheme } from '@/constants/news-theme';
import { useLanguage } from '@/contexts/language';
import { useNewsEngagement } from '@/contexts/news-engagement';
import { SourceBadge } from '@/components/news/source-badge';
import { EngagementRow } from '@/components/news/engagement-row';
import {
  NEWS_ARTICLES,
  NEWS_CATEGORY_LABELS,
  type NewsArticle,
  type NewsCategory,
} from '@/constants/news';
import {
  articleAuthor,
  articleTitle,
  categoryLabel,
  timeAgo,
} from '@/utils/news-format';

type FilterKey = 'all' | NewsCategory;

const ALL_CATEGORIES = Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[];

function newsDetailHref(id: string) {
  return `/(tabs)/news/${id}` as const;
}

function FeaturedHero({ article }: { article: NewsArticle }) {
  const { lang, tr } = useLanguage();
  const { getEngagement } = useNewsEngagement();
  const eng = getEngagement(article.id);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(newsDetailHref(article.id))}
      style={s.featuredWrap}
    >
      <Image source={{ uri: article.imageUrl }} style={s.featuredImage} contentFit="cover" />
      <View style={s.featuredBody}>
        <View style={s.breakingPill}>
          <Text style={s.breakingText}>{tr.newsFeatured}</Text>
        </View>
        <SourceBadge
          name={articleAuthor(article, lang)}
          category={categoryLabel(article.category, lang)}
          timeLabel={timeAgo(article.publishedAt, lang)}
        />
        <Text style={s.featuredTitle} numberOfLines={3}>
          {articleTitle(article, lang)}
        </Text>
        <EngagementRow views={eng.views} likes={eng.likes} liked={eng.liked} />
      </View>
    </TouchableOpacity>
  );
}

function FeedCard({ article }: { article: NewsArticle }) {
  const { lang } = useLanguage();
  const { getEngagement } = useNewsEngagement();
  const eng = getEngagement(article.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(newsDetailHref(article.id))}
    >
      <View style={s.card}>
        <Image source={{ uri: article.imageUrl }} style={s.cardImage} contentFit="cover" />
        <View style={s.cardBody}>
          <SourceBadge
            name={articleAuthor(article, lang)}
            category={categoryLabel(article.category, lang)}
            timeLabel={timeAgo(article.publishedAt, lang)}
          />
          <Text style={s.cardTitle} numberOfLines={3}>
            {articleTitle(article, lang)}
          </Text>
          <EngagementRow views={eng.views} likes={eng.likes} liked={eng.liked} />
        </View>
      </View>
      <View style={s.divider} />
    </TouchableOpacity>
  );
}

export default function NewsScreen() {
  const { tr, lang } = useLanguage();
  const tabBarHeight = useBottomTabBarHeight();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const featured = useMemo(
    () => NEWS_ARTICLES.find(a => a.featured) ?? NEWS_ARTICLES[0],
    [],
  );

  const listData = useMemo(() => {
    const rest = NEWS_ARTICLES.filter(a => a.id !== featured.id);
    return filter === 'all' ? rest : rest.filter(a => a.category === filter);
  }, [filter, featured.id]);

  const chips: { key: FilterKey; label: string }[] = useMemo(
    () => [
      { key: 'all', label: tr.newsForYou },
      ...ALL_CATEGORIES.map(c => ({
        key: c as FilterKey,
        label: lang === 'my' ? NEWS_CATEGORY_LABELS[c].my : NEWS_CATEGORY_LABELS[c].en,
      })),
    ],
    [tr.newsForYou, lang],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const renderItem: ListRenderItem<NewsArticle> = useCallback(
    ({ item }) => <FeedCard article={item} />,
    [],
  );

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={s.headerSafe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.headerIcon} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={NewsTheme.onHeader} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{tr.newsTitle}</Text>
          <TouchableOpacity style={s.headerIcon} activeOpacity={0.7}>
            <Ionicons name="search" size={22} color={NewsTheme.onHeader} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chips}
          style={s.chipsScroll}
        >
          {chips.map(item => {
            const active = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[s.chip, active && s.chipActive]}
                activeOpacity={0.85}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        style={s.list}
        contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={NewsTheme.accent}
            colors={[NewsTheme.accent]}
          />
        }
        ListHeaderComponent={<FeaturedHero article={featured} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="football-outline" size={48} color={NewsTheme.textMuted} />
            <Text style={s.emptyText}>{tr.newsEmpty}</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NewsTheme.bg },
  headerSafe: { backgroundColor: NewsTheme.headerBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: NewsTheme.onHeader,
  },
  chipsScroll: { flexGrow: 0, paddingBottom: Spacing.sm },
  chips: { paddingHorizontal: Spacing.md, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: NewsTheme.surface,
    borderColor: NewsTheme.surface,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255,255,255,0.85)',
  },
  chipTextActive: { color: NewsTheme.accentDark },
  list: { flex: 1, backgroundColor: NewsTheme.bg },
  featuredWrap: {
    marginBottom: Spacing.sm,
    backgroundColor: NewsTheme.surface,
    ...Shadow.sm,
  },
  featuredImage: {
    width: '100%',
    height: 220,
    backgroundColor: NewsTheme.border,
  },
  featuredBody: {
    padding: Spacing.md,
    gap: 10,
  },
  breakingPill: {
    alignSelf: 'flex-start',
    backgroundColor: NewsTheme.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  breakingText: {
    fontSize: 11,
    fontWeight: FontWeight.extrabold,
    color: NewsTheme.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featuredTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: NewsTheme.text,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  card: { backgroundColor: NewsTheme.surface },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: NewsTheme.border,
  },
  cardBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 10,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: NewsTheme.text,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  divider: {
    height: Spacing.sm,
    backgroundColor: NewsTheme.bg,
  },
  empty: { alignItems: 'center', paddingVertical: 56, gap: 12 },
  emptyText: { fontSize: FontSize.md, color: NewsTheme.textSecondary },
});
