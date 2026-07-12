import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
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
import { useAuth } from '@/contexts/auth';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { SourceBadge } from '@/components/news/source-badge';
import { EngagementRow } from '@/components/news/engagement-row';
import { fetchFootballNews } from '@/services/football-news';
import type { FootballNewsArticle } from '@/types/api';
import { newsImageUri, timeAgo, newsBodyParagraphs, estimateReadMinutes } from '@/utils/news-format';

function newsDetailHref(id: number) {
  return `/(tabs)/news/${id}` as const;
}

function FeaturedHero({ article }: { article: FootballNewsArticle }) {
  const { lang, tr } = useLanguage();
  const imageUri = newsImageUri(article);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(newsDetailHref(article.id))}
      style={s.featuredWrap}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={s.featuredImage} contentFit="cover" />
      ) : (
        <View style={[s.featuredImage, s.imagePlaceholder]}>
          <Ionicons name="football-outline" size={40} color={NewsTheme.textMuted} />
        </View>
      )}
      <View style={s.featuredBody}>
        <View style={s.breakingPill}>
          <Text style={s.breakingText}>{tr.newsFeatured}</Text>
        </View>
        <SourceBadge
          name={tr.newsSource}
          timeLabel={timeAgo(article.created_at, lang)}
        />
        <Text style={s.featuredTitle} numberOfLines={3}>
          {article.title}
        </Text>
        <EngagementRow
          views={article.view_count}
          likes={article.love_count}
          liked={article.is_loved}
        />
      </View>
    </TouchableOpacity>
  );
}

function FeedCard({ article }: { article: FootballNewsArticle }) {
  const { lang, tr } = useLanguage();
  const imageUri = newsImageUri(article);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(newsDetailHref(article.id))}
    >
      <View style={s.card}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.cardImage} contentFit="cover" />
        ) : (
          <View style={[s.cardImage, s.imagePlaceholder]}>
            <Ionicons name="football-outline" size={32} color={NewsTheme.textMuted} />
          </View>
        )}
        <View style={s.cardBody}>
          <SourceBadge
            name={tr.newsSource}
            timeLabel={timeAgo(article.created_at, lang)}
          />
          <Text style={s.cardTitle} numberOfLines={3}>
            {article.title}
          </Text>
          <EngagementRow
            views={article.view_count}
            likes={article.love_count}
            liked={article.is_loved}
          />
        </View>
      </View>
      <View style={s.divider} />
    </TouchableOpacity>
  );
}

export default function NewsScreen() {
  useRequireAuth();
  const { tr } = useLanguage();
  const { token } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [articles, setArticles] = useState<FootballNewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featured = articles[0];
  const listData = useMemo(
    () => (featured ? articles.slice(1) : articles),
    [articles, featured],
  );

  const loadPage = useCallback(
    async (nextPage: number, mode: 'replace' | 'append' | 'refresh') => {
      if (!token) return;
      if (mode === 'append') setLoadingMore(true);
      else if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await fetchFootballNews(token, nextPage);
        setPage(data.meta.current_page);
        setLastPage(data.meta.last_page);
        setArticles((prev) =>
          mode === 'append' ? [...prev, ...data.news] : data.news,
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : tr.newsLoadFailed);
        if (mode !== 'append') setArticles([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [token, tr.newsLoadFailed],
  );

  useEffect(() => {
    loadPage(1, 'replace');
  }, [loadPage]);

  const onRefresh = useCallback(() => {
    loadPage(1, 'refresh');
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (loading || loadingMore || refreshing || page >= lastPage) return;
    loadPage(page + 1, 'append');
  }, [loading, loadingMore, refreshing, page, lastPage, loadPage]);

  const renderItem: ListRenderItem<FootballNewsArticle> = useCallback(
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
          <View style={s.headerIcon} />
        </View>
      </SafeAreaView>

      {loading && articles.length === 0 ? (
        <View style={s.center}>
          <ActivityIndicator color={NewsTheme.accent} size="large" />
          <Text style={s.centerText}>{tr.newsLoading}</Text>
        </View>
      ) : error && articles.length === 0 ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadPage(1, 'replace')} style={s.retryBtn}>
            <Text style={s.retryText}>{tr.newsRetry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
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
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={featured ? <FeaturedHero article={featured} /> : null}
          ListFooterComponent={
            loadingMore ? (
              <View style={s.footerLoader}>
                <ActivityIndicator color={NewsTheme.accent} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !featured ? (
              <View style={s.empty}>
                <Ionicons name="football-outline" size={48} color={NewsTheme.textMuted} />
                <Text style={s.emptyText}>{tr.newsEmpty}</Text>
              </View>
            ) : null
          }
        />
      )}
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
    textAlign: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: Spacing.lg },
  centerText: { fontSize: FontSize.sm, color: NewsTheme.textSecondary },
  errorText: { fontSize: FontSize.sm, color: NewsTheme.danger, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: NewsTheme.accentDim,
  },
  retryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: NewsTheme.accentDark },
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
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
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
  footerLoader: { paddingVertical: Spacing.lg },
});
