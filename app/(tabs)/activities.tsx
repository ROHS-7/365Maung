import { ActivityRow } from "@/components/activity-row";
import {
  ActivityDateFilterModal,
  formatFilterDate,
} from "@/components/activity-date-filter-modal";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/language";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { fetchActivities } from "@/services/activities";
import type { Activity } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from '@/components/app-text';
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivitiesScreen() {
  useRequireAuth();
  const { tr } = useLanguage();
  const { token } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const inflightRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (nextPage: number, mode: "replace" | "append" | "refresh") => {
      if (!token) return;
      if (mode === "append" && inflightRef.current) return;
      const requestId = ++requestIdRef.current;
      inflightRef.current = true;
      if (mode === "append") setLoadingMore(true);
      else if (mode === "refresh") setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await fetchActivities(token, {
          page: nextPage,
          startDate,
          endDate,
        });
        if (requestId !== requestIdRef.current) return;
        const current = data.meta?.current_page ?? nextPage;
        const last = data.meta?.last_page ?? 1;
        setPage(current);
        setLastPage(last);
        setItems((prev) => {
          const incoming = data.activities ?? [];
          if (mode !== "append") return incoming;
          const seen = new Set(prev.map((item) => item.id));
          return [...prev, ...incoming.filter((item) => !seen.has(item.id))];
        });
      } catch (e) {
        if (requestId !== requestIdRef.current) return;
        setError(e instanceof Error ? e.message : tr.activitiesLoadFailed);
        if (mode === "replace") setItems([]);
      } finally {
        if (requestId === requestIdRef.current) {
          inflightRef.current = false;
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [token, startDate, endDate, tr.activitiesLoadFailed],
  );

  useEffect(() => {
    loadPage(1, "replace");
  }, [loadPage]);

  function handleRefresh() {
    loadPage(1, "refresh");
  }

  function handleLoadMore() {
    if (loadingMore || loading || refreshing || page >= lastPage) return;
    loadPage(page + 1, "append");
  }

  const showEmpty = !loading && !refreshing && items.length === 0;
  const hasMorePages = lastPage > 1 && page < lastPage;
  const hasDateFilter = Boolean(startDate || endDate);

  function filterSummary(): string {
    if (startDate && endDate) {
      return `${formatFilterDate(startDate)} – ${formatFilterDate(endDate)}`;
    }
    if (startDate) return `${tr.activitiesStartDate}: ${formatFilterDate(startDate)}`;
    if (endDate) return `${tr.activitiesEndDate}: ${formatFilterDate(endDate)}`;
    return "";
  }

  function handleApplyFilter(nextStart: string | null, nextEnd: string | null) {
    setFilterOpen(false);
    setStartDate(nextStart);
    setEndDate(nextEnd);
  }

  function handleClearFilter() {
    setStartDate(null);
    setEndDate(null);
  }

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{tr.activitiesTitle}</Text>
          <Text style={s.headerSub}>{tr.activitiesSub}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setFilterOpen(true)}
          hitSlop={10}
          style={s.filterIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="time-outline"
            size={22}
            color={hasDateFilter ? Colors.brand.gold : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {hasDateFilter ? (
        <View style={s.filterBar}>
          <Ionicons name="calendar-outline" size={14} color={Colors.brand.greenDark} />
          <Text style={s.filterBarText} numberOfLines={1}>
            {filterSummary()}
          </Text>
          <TouchableOpacity onPress={handleClearFilter} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : null}

      {loading && items.length === 0 ? (
        <View style={s.centered}>
          <ActivityIndicator color={Colors.brand.greenButton} size="large" />
        </View>
      ) : error && items.length === 0 ? (
        <View style={s.centered}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadPage(1, "replace")}
            style={s.retryBtn}
            activeOpacity={0.8}
          >
            <Text style={s.retryText}>{tr.activitiesRetry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <View style={s.card}>
              <ActivityRow
                activity={item}
                showDivider={index < items.length - 1}
              />
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
          onEndReached={hasMorePages ? handleLoadMore : undefined}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            showEmpty ? (
              <View style={s.emptyWrap}>
                <Ionicons
                  name="time-outline"
                  size={40}
                  color={Colors.light.textSecondary}
                />
                <Text style={s.emptyTitle}>{tr.activitiesEmpty}</Text>
                <Text style={s.emptySub}>{tr.activitiesEmptySub}</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={s.footerLoader}
                color={Colors.brand.greenButton}
              />
            ) : null
          }
        />
      )}

      <ActivityDateFilterModal
        visible={filterOpen}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F5F3" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.brand.greenButton,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
  },
  filterIconBtn: { padding: 4 },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5EE",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterBarText: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenDark,
  },
  listContent: { padding: Spacing.md, paddingBottom: 48 },
  listEmpty: { flexGrow: 1 },
  card: {
    backgroundColor: "#fff",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.light.error,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton + "22",
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.brand.greenButton,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  footerLoader: { paddingVertical: Spacing.md },
});
