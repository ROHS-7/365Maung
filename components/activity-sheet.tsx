import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';
import { fetchActivities } from '@/services/activities';
import type { Activity } from '@/types/api';
import { ActivityRow } from '@/components/activity-row';

const SHEET_PREVIEW_COUNT = 10;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ActivitySheet({ visible, onClose }: Props) {
  const { tr } = useLanguage();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActivities(token, { page: 1 });
      setActivities(data.activities.slice(0, SHEET_PREVIEW_COUNT));
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.activitiesLoadFailed);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [token, tr.activitiesLoadFailed]);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  function handleSeeAll() {
    onClose();
    router.push('/(tabs)/activities');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={[s.sheet, { maxHeight: height * 0.62, paddingBottom: insets.bottom + Spacing.md }]}>
          <View style={s.handle} />
          <View style={s.header}>
            <View style={s.headerText}>
              <Text style={s.title}>{tr.activitiesSheetTitle}</Text>
              <Text style={s.subtitle}>{tr.activitiesSheetSub}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.centered}>
              <ActivityIndicator color={Colors.brand.greenButton} />
            </View>
          ) : error ? (
            <View style={s.centered}>
              <Text style={s.errorText}>{error}</Text>
              <TouchableOpacity onPress={load} style={s.retryBtn} activeOpacity={0.8}>
                <Text style={s.retryText}>{tr.activitiesRetry}</Text>
              </TouchableOpacity>
            </View>
          ) : activities.length === 0 ? (
            <View style={s.centered}>
              <Ionicons name="time-outline" size={36} color={Colors.light.textSecondary} />
              <Text style={s.emptyTitle}>{tr.activitiesEmpty}</Text>
              <Text style={s.emptySub}>{tr.activitiesEmptySub}</Text>
            </View>
          ) : (
            <ScrollView
              style={s.list}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
            >
              {activities.map((item, index) => (
                <ActivityRow
                  key={item.id}
                  activity={item}
                  showDivider={index < activities.length - 1}
                />
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={s.seeAllBtn} onPress={handleSeeAll} activeOpacity={0.85}>
            <Text style={s.seeAllText}>{tr.activitiesSeeAll}</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    ...Shadow.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerText: { flex: 1 },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.light.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 2 },
  closeBtn: { padding: 4, marginLeft: Spacing.sm },
  list: { flexGrow: 0 },
  listContent: { paddingBottom: Spacing.sm },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.light.error,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
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
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    marginTop: Spacing.sm,
  },
  seeAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
