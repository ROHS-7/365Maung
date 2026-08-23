import { Text } from '@/components/app-text';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export type LeagueFilterLeague = {
  name: string;
  matches: readonly unknown[];
};

type Props = {
  visible: boolean;
  leagues: LeagueFilterLeague[];
  /** `null` = all leagues. `[]` = none. Otherwise explicit names. */
  selected: string[] | null;
  onClose: () => void;
  onApply: (names: string[] | null) => void;
  title: string;
  allLabel: string;
  applyLabel: string;
};

export function LeagueFilterModal({
  visible,
  leagues,
  selected,
  onClose,
  onApply,
  title,
  allLabel,
  applyLabel,
}: Props) {
  const [draft, setDraft] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setDraft(selected == null ? leagues.map((l) => l.name) : [...selected]);
  }, [visible, selected, leagues]);

  const allNames = useMemo(() => leagues.map((l) => l.name), [leagues]);
  const allSelected = leagues.length > 0 && draft.length === leagues.length;

  function toggleAll() {
    setDraft(allSelected ? [] : allNames);
  }

  function toggleLeague(name: string) {
    setDraft((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  function handleApply() {
    if (draft.length === 0) {
      onApply([]);
      return;
    }
    if (draft.length === leagues.length) {
      onApply(null);
      return;
    }
    onApply(draft);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.sheet}
          onPress={(e) => e.stopPropagation?.()}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons
                name="close"
                size={22}
                color={Colors.light.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable onPress={toggleAll} style={styles.row}>
              <Ionicons
                name={allSelected ? 'checkbox' : 'square-outline'}
                size={22}
                color={
                  allSelected
                    ? Colors.brand.greenButton
                    : Colors.light.placeholder
                }
              />
              <Text style={styles.rowText}>{allLabel}</Text>
            </Pressable>

            {leagues.map((league) => {
              const checked = draft.includes(league.name);
              return (
                <Pressable
                  key={league.name}
                  onPress={() => toggleLeague(league.name)}
                  style={styles.row}
                >
                  <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={
                      checked
                        ? Colors.brand.greenButton
                        : Colors.light.placeholder
                    }
                  />
                  <Text style={styles.rowText} numberOfLines={2}>
                    {league.name}
                  </Text>
                  <Text style={styles.rowCount}>{league.matches.length}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Text style={styles.applyText}>{applyLabel}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 28,
    maxHeight: '75%',
    ...Shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  rowText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
  },
  rowCount: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
  },
  applyBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.xl,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
