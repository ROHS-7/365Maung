import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { useHideParentTabBar } from '@/hooks/use-hide-parent-tab-bar';
import {
  formatLiveMatchTime,
  getCachedLiveMatch,
  preferPlayableServer,
} from '@/services/live-matches';
import type { LiveStreamServer } from '@/types/live-matches';

const LIVE_BUFFER_OPTIONS = {
  preferredForwardBufferDuration: 8,
  minBufferForPlayback: 1.5,
  prioritizeTimeOverSizeThreshold: true,
};

function toVideoSource(server: LiveStreamServer): VideoSource {
  // Browsers cannot set arbitrary Referer headers on media requests.
  // Native still sends Referer for CDN allowlists.
  if (Platform.OS === 'web') {
    return {
      uri: server.stream_url,
      contentType: 'hls',
      useCaching: false,
    };
  }
  return {
    uri: server.stream_url,
    headers: {
      Referer: server.referer || 'https://socolivev.co/',
    },
    contentType: 'hls',
  };
}

export default function LivePlayerScreen() {
  useHideParentTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tr } = useLanguage();
  const match = id ? getCachedLiveMatch(id) : undefined;
  const servers = match?.servers ?? [];
  const [activeUrl, setActiveUrl] = useState(() =>
    servers.length ? preferPlayableServer(servers).stream_url : '',
  );

  const activeServer =
    servers.find((s) => s.stream_url === activeUrl) ??
    (servers.length ? preferPlayableServer(servers) : null);

  const initialSource = useMemo(
    () => (activeServer ? toVideoSource(activeServer) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed player once; later switches use replace()
    [],
  );

  const player = useVideoPlayer(initialSource, (p) => {
    p.staysActiveInBackground = false;
    p.bufferOptions = { ...LIVE_BUFFER_OPTIONS };
    if (initialSource) p.play();
  });

  const lastUrlRef = useRef(activeServer?.stream_url ?? '');

  useEffect(() => {
    if (!activeServer) return;
    if (lastUrlRef.current === activeServer.stream_url) return;
    lastUrlRef.current = activeServer.stream_url;
    player.replace(toVideoSource(activeServer));
    player.bufferOptions = { ...LIVE_BUFFER_OPTIONS };
    player.play();
  }, [activeServer, player]);

  useFocusEffect(
    useCallback(() => {
      player.play();
      return () => {
        player.pause();
      };
    }, [player]),
  );

  if (!match || !activeServer) {
    return (
      <SafeAreaView style={p.root} edges={['top']}>
        <View style={p.header}>
          <Pressable onPress={() => router.back()} style={p.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={p.headerTitle}>{tr.liveTitle}</Text>
          <View style={p.backBtn} />
        </View>
        <View style={p.missing}>
          <Text style={p.missingText}>{tr.liveMatchNotFound}</Text>
          <Pressable onPress={() => router.back()} style={p.retryBtn}>
            <Text style={p.retryText}>{tr.liveBackToList}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={p.root} edges={['top']}>
      <View style={p.header}>
        <Pressable onPress={() => router.back()} style={p.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={p.headerTitle} numberOfLines={1}>
          {match.home_team_name} vs {match.away_team_name}
        </Text>
        <View style={p.backBtn} />
      </View>

      <View style={p.videoWrap}>
        <VideoView
          style={p.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture={false}
          nativeControls
          contentFit="contain"
          {...(Platform.OS === 'web'
            ? { crossOrigin: 'anonymous' as const }
            : {})}
        />
        {!activeServer && (
          <View style={p.videoLoading}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </View>

      <ScrollView
        style={p.scroll}
        contentContainerStyle={p.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={p.matchCard}>
          <View style={p.metaRow}>
            {match.isLive ? (
              <View style={p.liveBadge}>
                <View style={p.liveDot} />
                <Text style={p.liveBadgeText}>{tr.liveNow}</Text>
              </View>
            ) : (
              <View style={p.upcomingBadge}>
                <Text style={p.upcomingBadgeText}>{tr.liveUpcoming}</Text>
              </View>
            )}
            <Text style={p.timeText}>{formatLiveMatchTime(match.match_time)}</Text>
          </View>

          <View style={p.teamsRow}>
            <View style={p.teamCol}>
              {match.home_team_logo ? (
                <Image
                  source={{ uri: match.home_team_logo }}
                  style={p.teamLogo}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={0}
                />
              ) : (
                <View style={p.teamLogo} />
              )}
              <Text style={p.teamName} numberOfLines={2}>
                {match.home_team_name}
              </Text>
            </View>
            <Text style={p.vs}>VS</Text>
            <View style={p.teamCol}>
              {match.away_team_logo ? (
                <Image
                  source={{ uri: match.away_team_logo }}
                  style={p.teamLogo}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={0}
                />
              ) : (
                <View style={p.teamLogo} />
              )}
              <Text style={p.teamName} numberOfLines={2}>
                {match.away_team_name}
              </Text>
            </View>
          </View>

          <Text style={p.league}>{match.league_name}</Text>
        </View>

        <Text style={p.sectionTitle}>{tr.liveSelectServer}</Text>
        <View style={p.serverList}>
          {servers.map((server, index) => {
            const selected = server.stream_url === activeServer.stream_url;
            return (
              <Pressable
                key={`${server.stream_url}-${index}`}
                onPress={() => setActiveUrl(server.stream_url)}
                style={[p.serverBtn, selected && p.serverBtnActive]}
              >
                <Ionicons
                  name={selected ? 'play-circle' : 'radio-outline'}
                  size={18}
                  color={selected ? '#fff' : Colors.brand.greenMid}
                />
                <Text style={[p.serverText, selected && p.serverTextActive]}>
                  {server.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1410' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.greenDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  backBtn: { padding: 6, width: 36 },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
    textAlign: 'center',
  },
  videoWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: { width: '100%', height: '100%' },
  videoLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scroll: { flex: 1, backgroundColor: '#E9F0EC' },
  scrollContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626' },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
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
  },
  timeText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenMid,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamCol: { flex: 1, alignItems: 'center', gap: 6 },
  teamLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6' },
  teamName: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    textAlign: 'center',
  },
  vs: {
    fontSize: 12,
    fontWeight: FontWeight.extrabold,
    color: Colors.light.placeholder,
  },
  league: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  serverList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  serverBtnActive: {
    backgroundColor: Colors.brand.greenButton,
    borderColor: Colors.brand.greenDark,
  },
  serverText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  serverTextActive: { color: '#fff' },
  missing: {
    flex: 1,
    backgroundColor: '#E9F0EC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  missingText: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
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
});
