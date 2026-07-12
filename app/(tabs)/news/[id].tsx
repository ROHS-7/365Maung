import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  NewsDetailBottomBar,
  getNewsDetailBottomBarHeight,
} from '@/components/news-detail-bottom-bar';
import { useHideParentTabBar } from '@/hooks/use-hide-parent-tab-bar';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { NewsTheme } from '@/constants/news-theme';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';
import { SourceBadge } from '@/components/news/source-badge';
import { EngagementRow } from '@/components/news/engagement-row';
import {
  fetchFootballNewsDetail,
  getCachedNewsArticles,
  toggleFootballNewsLove,
} from '@/services/football-news';
import type { FootballNewsArticle } from '@/types/api';
import {
  estimateReadMinutes,
  newsBodyParagraphs,
  newsImageUri,
  timeAgo,
} from '@/utils/news-format';

const HERO_HEIGHT = 280;

function newsDetailHref(id: number) {
  return `/(tabs)/news/${id}` as const;
}

export default function NewsDetailScreen() {
  useRequireAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, tr } = useLanguage();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  useHideParentTabBar();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [article, setArticle] = useState<FootballNewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);

  const newsId = id ? parseInt(id, 10) : NaN;
  const bottomBarHeight = getNewsDetailBottomBarHeight(insets.bottom);
  const scrollBottomPad = bottomBarHeight + Spacing.lg;

  const related = useMemo(() => {
    if (!article) return [];
    return getCachedNewsArticles()
      .filter((item) => item.id !== article.id)
      .slice(0, 4);
  }, [article]);

  useEffect(() => {
    if (!token || !Number.isFinite(newsId)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFootballNewsDetail(token, newsId);
        if (!cancelled) setArticle(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : tr.newsNotFound);
          setArticle(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, newsId, tr.newsNotFound]);

  const handleLike = useCallback(async () => {
    if (!token || !article || liking) return;
    setLiking(true);
    try {
      const result = await toggleFootballNewsLove(token, article.id);
      setArticle((prev) =>
        prev
          ? { ...prev, love_count: result.love_count, is_loved: result.is_loved }
          : prev,
      );
    } catch {
      /* keep current state */
    } finally {
      setLiking(false);
    }
  }, [token, article, liking]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT - 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  async function handleShare() {
    if (!article) return;
    try {
      await Share.share({ message: article.title, title: article.title });
    } catch {
      /* cancelled */
    }
  }

  if (loading) {
    return (
      <View style={[s.missing, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <ActivityIndicator color={NewsTheme.accent} size="large" />
        <Text style={s.missingText}>{tr.newsLoading}</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[s.missing, { paddingTop: insets.top, paddingBottom: scrollBottomPad }]}>
        <StatusBar style="dark" />
        <TouchableOpacity onPress={() => router.back()} style={s.missingBack}>
          <Ionicons name="arrow-back" size={24} color={NewsTheme.text} />
        </TouchableOpacity>
        <Text style={s.missingText}>{error ?? tr.newsNotFound}</Text>
      </View>
    );
  }

  const paragraphs = newsBodyParagraphs(article.content);
  const readMinutes = estimateReadMinutes(article.content);
  const imageUri = newsImageUri(article);

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      <Animated.View
        style={[s.collapsedHeader, { paddingTop: insets.top, opacity: headerOpacity }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity onPress={() => router.back()} style={s.collapsedBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={NewsTheme.text} />
        </TouchableOpacity>
        <Text style={s.collapsedTitle} numberOfLines={1}>
          {article.title}
        </Text>
        <TouchableOpacity onPress={handleShare} style={s.collapsedBtn} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color={NewsTheme.text} />
        </TouchableOpacity>
      </Animated.View>

      <View style={[s.floatBar, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.floatBtn} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={s.floatBtn} activeOpacity={0.85}>
          <Ionicons name="share-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentContainerStyle={{ paddingBottom: scrollBottomPad }}
      >
        <View style={s.hero}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.heroImage} contentFit="cover" />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]}>
              <Ionicons name="football-outline" size={48} color={NewsTheme.textMuted} />
            </View>
          )}
        </View>

        <View style={s.body}>
          <Text style={s.title}>{article.title}</Text>

          <SourceBadge
            name={tr.newsSource}
            timeLabel={`${timeAgo(article.created_at, lang)} · ${readMinutes} ${tr.newsMinRead}`}
          />

          <View style={s.statsStrip}>
            <EngagementRow
              views={article.view_count}
              likes={article.love_count}
              liked={article.is_loved}
            />
          </View>

          {paragraphs.map((p, i) => (
            <Text key={i} style={[s.paragraph, i === 0 && s.paragraphLead]}>
              {p}
            </Text>
          ))}

          {related.length > 0 && (
            <View style={s.relatedBlock}>
              <Text style={s.relatedHeading}>{tr.newsRelated}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.relatedScroll}
              >
                {related.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={s.relatedCard}
                    activeOpacity={0.9}
                    onPress={() => router.push(newsDetailHref(item.id))}
                  >
                    {newsImageUri(item) ? (
                      <Image
                        source={{ uri: newsImageUri(item)! }}
                        style={s.relatedImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[s.relatedImage, s.heroPlaceholder]}>
                        <Ionicons name="football-outline" size={24} color={NewsTheme.textMuted} />
                      </View>
                    )}
                    <View style={s.relatedBody}>
                      <Text style={s.relatedTitle} numberOfLines={3}>
                        {item.title}
                      </Text>
                      <EngagementRow
                        views={item.view_count}
                        likes={item.love_count}
                        liked={item.is_loved}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <NewsDetailBottomBar
        views={article.view_count}
        likes={article.love_count}
        liked={article.is_loved}
        onLike={handleLike}
        onShare={handleShare}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NewsTheme.bg },
  missing: {
    flex: 1,
    backgroundColor: NewsTheme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missingBack: { position: 'absolute', left: Spacing.md, top: 56 },
  missingText: { fontSize: FontSize.md, color: NewsTheme.textSecondary },
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NewsTheme.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: NewsTheme.border,
    paddingBottom: 10,
    paddingHorizontal: Spacing.xs,
    ...Shadow.sm,
  },
  collapsedBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: NewsTheme.text,
  },
  floatBar: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NewsTheme.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: NewsTheme.border,
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  body: {
    backgroundColor: NewsTheme.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    marginTop: -20,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: NewsTheme.text,
    lineHeight: 32,
    letterSpacing: -0.3,
    marginTop: -4,
  },
  statsStrip: {
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: NewsTheme.border,
  },
  paragraph: {
    fontSize: FontSize.md,
    color: NewsTheme.textSecondary,
    lineHeight: 26,
  },
  paragraphLead: {
    fontSize: FontSize.lg,
    color: NewsTheme.text,
    lineHeight: 28,
    fontWeight: FontWeight.medium,
  },
  relatedBlock: { marginTop: Spacing.sm },
  relatedHeading: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: NewsTheme.text,
    marginBottom: Spacing.sm,
  },
  relatedScroll: { gap: Spacing.sm, paddingRight: Spacing.md },
  relatedCard: {
    width: 200,
    backgroundColor: NewsTheme.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NewsTheme.border,
    marginRight: Spacing.sm,
    ...Shadow.sm,
  },
  relatedImage: {
    width: '100%',
    height: 110,
    backgroundColor: NewsTheme.border,
  },
  relatedBody: {
    padding: Spacing.sm,
    gap: 8,
  },
  relatedTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: NewsTheme.text,
    lineHeight: 18,
    minHeight: 54,
  },
});
