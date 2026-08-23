import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Pressable,
  Modal,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  type ListRenderItem,
} from 'react-native';
import { Text } from '@/components/app-text';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow, Colors } from '@/constants/theme';
import { NewsTheme } from '@/constants/news-theme';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { EngagementRow } from '@/components/news/engagement-row';
import { fetchFootballNews, type NewsCategoryFilter } from '@/services/football-news';
import type { FootballNewsArticle, NewsCategory } from '@/types/api';
import { newsCategoryLabel, newsImageUri, timeAgo } from '@/utils/news-format';

function newsDetailHref(id: number) {
  return `/(tabs)/news/${id}` as const;
}

function categoryIcon(category: NewsCategory): keyof typeof Ionicons.glyphMap {
  if (category === 'esports') return 'game-controller-outline';
  if (category === 'fight') return 'flash-outline';
  return 'football-outline';
}

function filterIcon(key: NewsCategoryFilter): keyof typeof Ionicons.glyphMap {
  if (key === 'esports') return 'game-controller-outline';
  if (key === 'fight') return 'flash-outline';
  if (key === 'football') return 'football-outline';
  return 'newspaper-outline';
}

function NewsCategoryDropdown({
  visible,
  filters,
  category,
  topInset,
  onSelect,
  onClose,
}: {
  visible: boolean;
  filters: { key: NewsCategoryFilter; label: string }[];
  category: NewsCategoryFilter;
  topInset: number;
  onSelect: (key: NewsCategoryFilter) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.dropdownOverlay} onPress={onClose}>
        <Pressable
          style={[s.dropdownMenu, { top: topInset + 48 }]}
          onPress={() => {}}
        >
          {filters.map((f) => {
            const active = category === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => {
                  onSelect(f.key);
                  onClose();
                }}
                style={[s.dropdownItem, active && s.dropdownItemActive]}
              >
                <Ionicons
                  name={filterIcon(f.key)}
                  size={18}
                  color={active ? NewsTheme.accentDark : NewsTheme.textSecondary}
                />
                <Text style={[s.dropdownLabel, active && s.dropdownLabelActive]}>
                  {f.label}
                </Text>
                {active ? (
                  <Ionicons name="checkmark" size={18} color={NewsTheme.accentDark} />
                ) : (
                  <View style={s.dropdownCheckSpacer} />
                )}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FeaturedHero({ article }: { article: FootballNewsArticle }) {
  const { lang, tr } = useLanguage();
  const imageUri = newsImageUri(article);
  const meta = `${newsCategoryLabel(article.category, tr)} · ${timeAgo(article.created_at, lang)}`;

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
          <Ionicons name={categoryIcon(article.category)} size={28} color={NewsTheme.textMuted} />
        </View>
      )}
      <View style={s.featuredBody}>
        <View style={s.breakingPill}>
          <Text style={s.breakingText}>{tr.newsFeatured}</Text>
        </View>
        <Text style={s.featuredMeta} numberOfLines={1}>
          {meta}
        </Text>
        <Text style={s.featuredTitle} numberOfLines={2}>
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
  const meta = `${newsCategoryLabel(article.category, tr)} · ${timeAgo(article.created_at, lang)}`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(newsDetailHref(article.id))}
      style={s.card}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={s.cardThumb} contentFit="cover" />
      ) : (
        <View style={[s.cardThumb, s.imagePlaceholder]}>
          <Ionicons name={categoryIcon(article.category)} size={22} color={NewsTheme.textMuted} />
        </View>
      )}
      <View style={s.cardBody}>
        <Text style={s.cardMeta} numberOfLines={1}>
          {meta}
        </Text>
        <Text style={s.cardTitle} numberOfLines={2}>
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

export default function NewsScreen() {
  useRequireAuth();
  const { tr } = useLanguage();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [category, setCategory] = useState<NewsCategoryFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [articles, setArticles] = useState<FootballNewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () =>
      [
        { key: 'all' as const, label: tr.newsFilterAll },
        { key: 'football' as const, label: tr.newsCategoryFootball },
        { key: 'esports' as const, label: tr.newsCategoryEsports },
        { key: 'fight' as const, label: tr.newsCategoryFight },
      ],
    [tr],
  );

  const visible = useMemo(
    () =>
      category === 'all'
        ? articles
        : articles.filter((item) => item.category === category),
    [articles, category],
  );
  const featured = visible[0];
  const listData = useMemo(
    () => (featured ? visible.slice(1) : visible),
    [visible, featured],
  );

  const loadPage = useCallback(
    async (nextPage: number, mode: 'replace' | 'append' | 'refresh') => {
      if (!token) return;
      if (mode === 'append') setLoadingMore(true);
      else if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await fetchFootballNews(token, nextPage, category);
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
    [token, category, tr.newsLoadFailed],
  );

  useEffect(() => {
    setArticles([]);
    loadPage(1, 'replace');
  }, [loadPage]);

  const onRefresh = useCallback(() => {
    loadPage(1, 'refresh');
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (loading || loadingMore || refreshing || page >= lastPage) return;
    loadPage(page + 1, 'append');
  }, [loading, loadingMore, refreshing, page, lastPage, loadPage]);

  const selectCategory = useCallback((next: NewsCategoryFilter) => {
    if (next === category) return;
    setCategory(next);
  }, [category]);

  const renderItem: ListRenderItem<FootballNewsArticle> = useCallback(
    ({ item }) => <FeedCard article={item} />,
    [],
  );

  const emptyIcon =
    category === 'esports'
      ? 'game-controller-outline'
      : category === 'fight'
        ? 'flash-outline'
        : 'football-outline';

  const filterActive = category !== 'all';
  const activeFilterLabel =
    filters.find((f) => f.key === category)?.label ?? tr.newsFilterAll;

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={s.headerSafe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.headerIcon} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={NewsTheme.onHeader} />
          </TouchableOpacity>
          <View style={s.headerTitleWrap}>
            <Text style={s.headerTitle}>{tr.newsTitle}</Text>
            {filterActive ? (
              <Text style={s.headerSubtitle} numberOfLines={1}>
                {activeFilterLabel}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            style={s.headerIcon}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={filterActive ? Colors.brand.gold : NewsTheme.onHeader}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <NewsCategoryDropdown
        visible={filterOpen}
        filters={filters}
        category={category}
        topInset={insets.top}
        onSelect={selectCategory}
        onClose={() => setFilterOpen(false)}
      />

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
          contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.lg, paddingTop: Spacing.sm }}
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
                <Ionicons name={emptyIcon} size={48} color={NewsTheme.textMuted} />
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
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: NewsTheme.onHeader,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.gold,
    textAlign: 'center',
    marginTop: 2,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: NewsTheme.overlay,
  },
  dropdownMenu: {
    position: 'absolute',
    right: Spacing.sm,
    minWidth: 200,
    backgroundColor: NewsTheme.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: NewsTheme.border,
    paddingVertical: 6,
    ...Shadow.sm,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: NewsTheme.accentDim,
  },
  dropdownLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: NewsTheme.text,
  },
  dropdownLabelActive: {
    fontWeight: FontWeight.bold,
    color: NewsTheme.accentDark,
  },
  dropdownCheckSpacer: {
    width: 18,
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
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: NewsTheme.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NewsTheme.border,
    ...Shadow.sm,
  },
  featuredImage: {
    width: '100%',
    height: 148,
    backgroundColor: NewsTheme.border,
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  featuredBody: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: 6,
  },
  breakingPill: {
    alignSelf: 'flex-start',
    backgroundColor: NewsTheme.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  breakingText: {
    fontSize: 10,
    fontWeight: FontWeight.extrabold,
    color: NewsTheme.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  featuredMeta: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: NewsTheme.textMuted,
  },
  featuredTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: NewsTheme.text,
    letterSpacing: -0.2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: NewsTheme.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: NewsTheme.border,
    ...Shadow.sm,
  },
  cardThumb: {
    width: 88,
    height: 72,
    borderRadius: BorderRadius.sm,
    backgroundColor: NewsTheme.border,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardMeta: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: NewsTheme.textMuted,
  },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: NewsTheme.text,
    letterSpacing: -0.1,
  },
  empty: { alignItems: 'center', paddingVertical: 56, gap: 12 },
  emptyText: { fontSize: FontSize.md, color: NewsTheme.textSecondary },
  footerLoader: { paddingVertical: Spacing.lg },
});
