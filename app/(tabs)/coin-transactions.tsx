import { TransactionRow } from '@/components/transaction-row';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { fetchCoinTransactions } from '@/services/coin-transactions';
import type { CoinTransaction } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/app-text';
import { ScreenHeader } from '@/components/screen-header';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CoinTransactionsScreen() {
  useRequireAuth();
  const { tr } = useLanguage();
  const { token } = useAuth();
  const [items, setItems] = useState<CoinTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (nextPage: number, mode: 'replace' | 'append' | 'refresh') => {
      if (!token) return;
      if (mode === 'append') setLoadingMore(true);
      else if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await fetchCoinTransactions(token, nextPage);
        setPage(data.meta.current_page);
        setLastPage(data.meta.last_page);
        setItems((prev) =>
          mode === 'append' ? [...prev, ...data.transactions] : data.transactions,
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : tr.coinTxLoadFailed);
        if (mode === 'replace') setItems([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [token, tr.coinTxLoadFailed],
  );

  useEffect(() => {
    loadPage(1, 'replace');
  }, [loadPage]);

  function handleRefresh() {
    loadPage(1, 'refresh');
  }

  function handleLoadMore() {
    if (loadingMore || loading || refreshing || page >= lastPage) return;
    loadPage(page + 1, 'append');
  }

  const showEmpty = !loading && !refreshing && items.length === 0;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScreenHeader
        title={tr.coinTxTitle}
        subtitle={tr.coinTxSub}
        onBack={() => router.back()}
        backIcon="arrow-back"
        right={<Ionicons name="wallet-outline" size={22} color="rgba(255,255,255,0.4)" />}
      />

      {loading && items.length === 0 ? (
        <View style={s.centered}>
          <ActivityIndicator color={Colors.brand.greenButton} size="large" />
        </View>
      ) : error && items.length === 0 ? (
        <View style={s.centered}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadPage(1, 'replace')} style={s.retryBtn} activeOpacity={0.8}>
            <Text style={s.retryText}>{tr.coinTxRetry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <View style={s.card}>
              <TransactionRow transaction={item} showDivider={index < items.length - 1} />
            </View>
          )}
          contentContainerStyle={[s.listContent, showEmpty && s.listEmpty]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.brand.greenButton}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            showEmpty ? (
              <View style={s.emptyWrap}>
                <Ionicons name="wallet-outline" size={40} color={Colors.light.textSecondary} />
                <Text style={s.emptyTitle}>{tr.coinTxEmpty}</Text>
                <Text style={s.emptySub}>{tr.coinTxEmptySub}</Text>
              </View>
            ) : null
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
  listContent: { padding: Spacing.md, paddingBottom: 48 },
  listEmpty: { flexGrow: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.light.error,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton + '22',
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenButton,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  emptySub: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  footerLoader: { paddingVertical: Spacing.md },
});
