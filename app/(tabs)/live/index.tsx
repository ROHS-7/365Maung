import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import {
  fetchLiveMatches,
  formatLiveMatchTime,
} from '@/services/live-matches';
import type { UiLiveMatch } from '@/types/live-matches';

function MatchCard({ match }: { match: UiLiveMatch }) {
  const { tr } = useLanguage();
  const canWatch = match.hasStream;

  function open() {
    if (!canWatch) return;
    router.push(`/(tabs)/live/${match.id}` as never);
  }

  return (
    <Pressable
      onPress={open}
      disabled={!canWatch}
      style={({ pressed }) => [
        s.card,
        match.isLive && s.cardLive,
        pressed && canWatch && s.cardPressed,
        !canWatch && s.cardDisabled,
      ]}
    >
      <View style={s.cardTop}>
        <View style={s.leagueRow}>
          {match.league_logo ? (
            <Image source={{ uri: match.league_logo }} style={s.leagueLogo} />
          ) : (
            <View style={s.leagueLogoPlaceholder}>
              <Ionicons name="trophy-outline" size={12} color={Colors.brand.greenMid} />
            </View>
          )}
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
          <Image source={{ uri: match.home_team_logo }} style={s.teamLogo} />
          <Text style={s.teamName} numberOfLines={2}>
            {match.home_team_name}
          </Text>
        </View>
        <View style={s.vsCol}>
          <Text style={s.vsText}>VS</Text>
          <Text style={s.timeText}>{formatLiveMatchTime(match.match_time)}</Text>
        </View>
        <View style={[s.teamCol, s.teamColAway]}>
          <Image source={{ uri: match.away_team_logo }} style={s.teamLogo} />
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
}

export default function LiveScreen() {
  const { tr } = useLanguage();
  const [matches, setMatches] = useState<UiLiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchLiveMatches();
      setMatches(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.liveLoadFailed);
      if (!isRefresh) setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tr.liveLoadFailed]);

  useEffect(() => {
    load();
  }, [load]);

  const liveMatches = useMemo(() => matches.filter((m) => m.isLive), [matches]);
  const upcomingMatches = useMemo(() => matches.filter((m) => !m.isLive), [matches]);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Ionicons name="radio" size={18} color="#fff" />
        <Text style={s.headerTitle}>{tr.liveTitle}</Text>
        <Pressable onPress={() => load(true)} hitSlop={10} style={s.refreshBtn}>
          <Ionicons name="refresh" size={18} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.brand.greenButton} />
          <Text style={s.centerText}>{tr.liveLoading}</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error}</Text>
          <Pressable onPress={() => load()} style={s.retryBtn}>
            <Text style={s.retryText}>{tr.footballRetry}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={Colors.brand.greenButton}
            />
          }
        >
          {matches.length === 0 ? (
            <View style={s.center}>
              <Ionicons name="radio-outline" size={56} color={Colors.light.border} />
              <Text style={s.centerText}>{tr.liveEmpty}</Text>
            </View>
          ) : (
            <>
              {liveMatches.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>
                    {tr.liveNow} · {liveMatches.length}
                  </Text>
                  {liveMatches.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </View>
              )}
              {upcomingMatches.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>
                    {tr.liveUpcoming} · {upcomingMatches.length}
                  </Text>
                  {upcomingMatches.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
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
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: 32 },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
    letterSpacing: 0.3,
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
    ...Shadow.sm,
  },
  cardLive: {
    borderColor: '#F87171',
    borderWidth: 1.5,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
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
  teamColAway: {},
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
