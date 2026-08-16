import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '@/constants/theme';
import { LoginPromptCard } from '@/components/login-prompt-card';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import {
  fetchLiveMatches,
  formatLiveMatchTime,
} from '@/services/live-matches';
import type { UiLiveMatch } from '@/types/live-matches';

type ListRow =
  | { type: 'header'; key: string; title: string }
  | { type: 'match'; key: string; match: UiLiveMatch };

function CachedLogo({
  uri,
  style,
  fallback,
}: {
  uri?: string;
  style: { width: number; height: number; borderRadius: number };
  fallback: ReactNode;
}) {
  if (!uri) return <>{fallback}</>;
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={uri}
      transition={0}
    />
  );
}

const MatchCard = memo(function MatchCard({ match }: { match: UiLiveMatch }) {
  const { tr } = useLanguage();
  const canWatch = match.hasStream;

  const open = useCallback(() => {
    if (!match.hasStream) return;
    router.push(`/(tabs)/live/${match.id}` as never);
  }, [match.hasStream, match.id]);

  return (
    <Pressable
      onPress={open}
      disabled={!canWatch}
      android_ripple={canWatch ? { color: '#00000014' } : undefined}
      style={[s.card, match.isLive && s.cardLive, !canWatch && s.cardDisabled]}
    >
      <View style={s.cardTop}>
        <View style={s.leagueRow}>
          <CachedLogo
            uri={match.league_logo}
            style={s.leagueLogo}
            fallback={
              <View style={s.leagueLogoPlaceholder}>
                <Ionicons name="trophy-outline" size={12} color={Colors.brand.greenMid} />
              </View>
            }
          />
          <Text style={s.leagueName} numberOfLines={1}>
            {match.league_name}
          </Text>
        </View>
        {match.isLive ? (
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveBadgeText}>{tr.liveNow}</Text>
          </View>
        ) : (
          <View style={s.upcomingBadge}>
            <Text style={s.upcomingBadgeText}>{tr.liveUpcoming}</Text>
          </View>
        )}
      </View>

      <View style={s.teamsRow}>
        <View style={s.teamCol}>
          <CachedLogo
            uri={match.home_team_logo}
            style={s.teamLogo}
            fallback={<View style={s.teamLogo} />}
          />
          <Text style={s.teamName} numberOfLines={2}>
            {match.home_team_name}
          </Text>
        </View>
        <View style={s.vsCol}>
          <Text style={s.vsText}>VS</Text>
          <Text style={s.timeText}>{formatLiveMatchTime(match.match_time)}</Text>
        </View>
        <View style={s.teamCol}>
          <CachedLogo
            uri={match.away_team_logo}
            style={s.teamLogo}
            fallback={<View style={s.teamLogo} />}
          />
          <Text style={[s.teamName, s.teamNameAway]} numberOfLines={2}>
            {match.away_team_name}
          </Text>
        </View>
      </View>

      {canWatch ? (
        <View style={s.watchRow}>
          <Ionicons name="play-circle" size={16} color={Colors.brand.greenButton} />
          <Text style={s.watchText}>{tr.liveWatch}</Text>
          <Text style={s.serverCount}>
            {match.servers?.length ?? 0} {tr.liveServers}
          </Text>
        </View>
      ) : (
        <View style={s.watchRow}>
          <Ionicons name="time-outline" size={14} color={Colors.light.placeholder} />
          <Text style={s.noStreamText}>{tr.liveNoStream}</Text>
        </View>
      )}
    </Pressable>
  );
});

export default function LiveScreen() {
  const { tr } = useLanguage();
  const { isAuthenticated, token } = useAuth();
  const [matches, setMatches] = useState<UiLiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else if (!hasDataRef.current) setLoading(true);
    setError(null);
    try {
      const data = await fetchLiveMatches(token);
      setMatches(data);
      hasDataRef.current = data.length > 0;
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.liveLoadFailed);
      if (!hasDataRef.current) setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, tr.liveLoadFailed]);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  const liveMatches = useMemo(() => matches.filter((m) => m.isLive), [matches]);
  const upcomingMatches = useMemo(() => matches.filter((m) => !m.isLive), [matches]);

  const rows = useMemo<ListRow[]>(() => {
    const out: ListRow[] = [];
    if (liveMatches.length > 0) {
      out.push({
        type: 'header',
        key: 'h-live',
        title: `${tr.liveNow} · ${liveMatches.length}`,
      });
      for (const m of liveMatches) out.push({ type: 'match', key: m.id, match: m });
    }
    if (upcomingMatches.length > 0) {
      out.push({
        type: 'header',
        key: 'h-up',
        title: `${tr.liveUpcoming} · ${upcomingMatches.length}`,
      });
      for (const m of upcomingMatches) out.push({ type: 'match', key: m.id, match: m });
    }
    return out;
  }, [liveMatches, upcomingMatches, tr.liveNow, tr.liveUpcoming]);

  const renderItem = useCallback<ListRenderItem<ListRow>>(({ item }) => {
    if (item.type === 'header') {
      return <Text style={s.sectionTitle}>{item.title}</Text>;
    }
    return <MatchCard match={item.match} />;
  }, []);

  const keyExtractor = useCallback((item: ListRow) => item.key, []);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Ionicons name="radio" size={18} color="#fff" />
        <Text style={s.headerTitle}>{tr.liveTitle}</Text>
        <Pressable onPress={() => load(true)} hitSlop={10} style={s.refreshBtn}>
          <Ionicons name="refresh" size={18} color="#fff" />
        </Pressable>
      </View>

      {!isAuthenticated ? (
        <View style={s.guestWrap}>
          <LoginPromptCard
            title={tr.guestWelcomeTitle}
            subtitle={tr.guestWelcomeSub}
          />
        </View>
      ) : loading ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.brand.greenButton} />
          <Text style={s.centerText}>{tr.liveLoading}</Text>
        </View>
      ) : error && matches.length === 0 ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error}</Text>
          <Pressable onPress={() => load()} style={s.retryBtn}>
            <Text style={s.retryText}>{tr.footballRetry}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={s.scroll}
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemType={(item) => item.type}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={Colors.brand.greenButton}
            />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Ionicons name="radio-outline" size={56} color={Colors.light.border} />
              <Text style={s.centerText}>{tr.liveEmpty}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E9F0EC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.brand.greenDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  refreshBtn: { padding: 4 },
  guestWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 32 },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
    letterSpacing: 0.3,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  centerText: { fontSize: FontSize.md, color: Colors.light.textSecondary, textAlign: 'center' },
  errorText: { fontSize: FontSize.sm, color: Colors.light.error, textAlign: 'center' },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton + '22',
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenButton,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.sm,
  },
  cardLive: {
    borderColor: '#F87171',
    borderWidth: 1.5,
  },
  cardDisabled: { opacity: 0.92 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  leagueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 },
  leagueLogo: { width: 18, height: 18, borderRadius: 4 },
  leagueLogoPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueName: {
    flex: 1,
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
    letterSpacing: 0.4,
  },
  upcomingBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#4F46E5',
    letterSpacing: 0.3,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  teamCol: { flex: 1, alignItems: 'center', gap: 6, minWidth: 0 },
  teamLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6' },
  teamName: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 15,
  },
  teamNameAway: {},
  vsCol: { alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  vsText: {
    fontSize: 11,
    fontWeight: FontWeight.extrabold,
    color: Colors.light.placeholder,
  },
  timeText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenMid,
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
    paddingTop: 8,
  },
  watchText: {
    flex: 1,
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenButton,
  },
  serverCount: { fontSize: 11, color: Colors.light.textSecondary },
  noStreamText: { fontSize: 12, color: Colors.light.placeholder },
});
