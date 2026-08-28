import { CoinRequestRow } from '@/components/coin-request-row';
import { ScreenHeader } from '@/components/screen-header';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { fetchCoinRequests } from '@/services/coin-requests';
import type { CoinRequest } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/app-text';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'all' | 'deposit' | 'withdraw' | 'pending';

export default function CoinRequestsScreen() {
  useRequireAuth();
  const { tr } = useLanguage();
  const { token } = useAuth();
  const [items, setItems] = useState<CoinRequest[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const loadPage = useCallback(
    async (nextPage: number, mode: 'replace' | 'append' | 'refresh') => {
      if (!token) return;
      if (mode === 'append') setLoadingMore(true);
      else if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await fetchCoinRequests(token, nextPage);
        setPage(data.meta.current_page);
        setLastPage(data.meta.last_page);
        setItems((prev) => (mode === 'append' ? [...prev, ...data.items] : data.items));
      } catch (e) {
        setError(e instanceof Error ? e.message : tr.coinRequestLoadFailed);
        if (mode === 'replace') setItems([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [token, tr.coinRequestLoadFailed],
  );

  useEffect(() => {
    loadPage(1, 'replace');
  }, [loadPage]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'pending') return items.filter((r) => r.status.toLowerCase() === 'pending');
    return items.filter((r) => r.type === filter);
  }, [items, filter]);

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: tr.coinRequestFilterAll },
    { id: 'deposit', label: tr.coinRequestDeposit },
    { id: 'withdraw', label: tr.coinRequestWithdraw },
    { id: 'pending', label: tr.coinRequestStatusPending },
  ];

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScreenHeader
        title={tr.coinRequestTitle}
        subtitle={tr.coinRequestSub}
        onBack={() => router.back()}
        backIcon="arrow-back"
        right={<Ionicons name="swap-horizontal" size={22} color="rgba(255,255,255,0.4)" />}
      />

      <View style={s.filters}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[s.filterChip, filter === f.id && s.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[s.filterText, filter === f.id && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && items.length === 0 ? (
        <View style={s.centered}>
          <ActivityIndicator color={Colors.brand.greenButton} size="large" />
        </View>
      ) : error && items.length === 0 ? (
        <View style={s.centered}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadPage(1, 'replace')} style={s.retryBtn}>
            <Text style={s.retryText}>{tr.coinRequestRetry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <View style={s.card}>
              <CoinRequestRow request={item} showDivider={index < filtered.length - 1} />
            </View>
          )}
          contentContainerStyle={[s.listContent, filtered.length === 0 && s.listEmpty]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPage(1, 'refresh')}
              tintColor={Colors.brand.greenButton}
            />
          }
          onEndReached={() => {
            if (!loadingMore && !loading && page < lastPage) loadPage(page + 1, 'append');
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="swap-horizontal" size={40} color={Colors.light.textSecondary} />
              <Text style={s.emptyTitle}>{tr.coinRequestEmpty}</Text>
              <Text style={s.emptySub}>{tr.coinRequestEmptySub}</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={s.footerLoader} color={Colors.brand.greenButton} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: Colors.brand.greenButton, borderColor: Colors.brand.greenButton },
  filterText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.light.textSecondary },
  filterTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 48 },
  listEmpty: { flexGrow: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  errorText: { fontSize: FontSize.sm, color: Colors.light.error, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton + '22',
  },
  retryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.brand.greenButton },
  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.light.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.light.textSecondary, textAlign: 'center' },
  footerLoader: { paddingVertical: Spacing.md },
});
