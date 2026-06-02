import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
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
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { NewsTheme } from '@/constants/news-theme';
import { useLanguage } from '@/contexts/language';
import { useNewsEngagement } from '@/contexts/news-engagement';
import { SourceBadge } from '@/components/news/source-badge';
import { EngagementRow } from '@/components/news/engagement-row';
import { getNewsArticle, getRelatedArticles } from '@/constants/news';
import {
  articleAuthor,
  articleBody,
  articleTitle,
  categoryLabel,
  timeAgo,
} from '@/utils/news-format';

const HERO_HEIGHT = 280;

function newsDetailHref(id: string) {
  return `/(tabs)/news/${id}` as const;
}

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, tr } = useLanguage();
  const insets = useSafeAreaInsets();
  useHideParentTabBar();
  const { getEngagement, recordView, toggleLike } = useNewsEngagement();
  const scrollY = useRef(new Animated.Value(0)).current;

  const article = id ? getNewsArticle(id) : undefined;
  const eng = article ? getEngagement(article.id) : null;
  const bottomBarHeight = getNewsDetailBottomBarHeight(insets.bottom);
  const scrollBottomPad = bottomBarHeight + Spacing.lg;

  useEffect(() => {
    if (article) recordView(article.id);
  }, [article?.id, recordView]);

  if (!article || !eng) {
    return (
      <View style={[s.missing, { paddingTop: insets.top, paddingBottom: scrollBottomPad }]}>
        <StatusBar style="dark" />
        <TouchableOpacity onPress={() => router.back()} style={s.missingBack}>
          <Ionicons name="arrow-back" size={24} color={NewsTheme.text} />
        </TouchableOpacity>
        <Text style={s.missingText}>{tr.newsNotFound}</Text>
      </View>
    );
  }

  const related = getRelatedArticles(article.id, 4);
  const title = articleTitle(article, lang);
  const paragraphs = articleBody(article, lang);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT - 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  async function handleShare() {
    try {
      await Share.share({ message: title, title });
    } catch {
      /* cancelled */
    }
  }

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
          {title}
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
          <Image source={{ uri: article.imageUrl }} style={s.heroImage} contentFit="cover" />
        </View>

        <View style={s.body}>
          <View style={s.categoryTag}>
            <Text style={s.categoryTagText}>{categoryLabel(article.category, lang)}</Text>
          </View>

          <Text style={s.title}>{title}</Text>

          <SourceBadge
            name={articleAuthor(article, lang)}
            timeLabel={`${timeAgo(article.publishedAt, lang)} · ${article.readMinutes} ${tr.newsMinRead}`}
          />

          <View style={s.statsStrip}>
            <EngagementRow views={eng.views} likes={eng.likes} liked={eng.liked} />
          </View>

          {paragraphs.map((p, i) => (
            <Text key={i} style={[s.paragraph, i === 0 && s.paragraphLead]}>
              {p}
            </Text>
          ))}

          <View style={s.relatedBlock}>
            <Text style={s.relatedHeading}>{tr.newsRelated}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.relatedScroll}
            >
              {related.map(item => {
                const relEng = getEngagement(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={s.relatedCard}
                    activeOpacity={0.9}
                    onPress={() => router.push(newsDetailHref(item.id))}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={s.relatedImage}
                      contentFit="cover"
                    />
                    <View style={s.relatedBody}>
                      <Text style={s.relatedTitle} numberOfLines={3}>
                        {articleTitle(item, lang)}
                      </Text>
                      <EngagementRow
                        views={relEng.views}
                        likes={relEng.likes}
                        liked={relEng.liked}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>

      <NewsDetailBottomBar
        views={eng.views}
        likes={eng.likes}
        liked={eng.liked}
        onLike={() => toggleLike(article.id)}
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
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: NewsTheme.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: FontWeight.extrabold,
    color: NewsTheme.accentDark,
    textTransform: 'uppercase',
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
