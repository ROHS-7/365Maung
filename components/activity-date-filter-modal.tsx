import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { formatDrawDate } from '@/utils/football-ui';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Picking = 'start' | 'end';

type Props = {
  visible: boolean;
  startDate: string | null;
  endDate: string | null;
  onClose: () => void;
  onApply: (startDate: string | null, endDate: string | null) => void;
};

function monthCells(year: number, month: number): (number | null)[] {
  const pad = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: pad }, () => null),
    ...Array.from({ length: count }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatFilterDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ActivityDateFilterModal({
  visible,
  startDate,
  endDate,
  onClose,
  onApply,
}: Props) {
  const { tr } = useLanguage();
  const today = formatDrawDate(new Date());
  const [cursor, setCursor] = useState(() => new Date());
  const [draftStart, setDraftStart] = useState<string | null>(startDate);
  const [draftEnd, setDraftEnd] = useState<string | null>(endDate);
  const [picking, setPicking] = useState<Picking>('start');

  useEffect(() => {
    if (!visible) return;
    setDraftStart(startDate);
    setDraftEnd(endDate);
    setPicking(startDate && !endDate ? 'end' : 'start');
    const seed = startDate ?? endDate;
    setCursor(seed ? new Date(`${seed}T00:00:00`) : new Date());
  }, [visible, startDate, endDate]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthCells(year, month), [year, month]);

  function shiftMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  function pickDay(day: number) {
    const value = formatDrawDate(new Date(year, month, day));
    if (picking === 'start') {
      setDraftStart(value);
      if (draftEnd && value > draftEnd) setDraftEnd(null);
      setPicking('end');
      return;
    }
    setDraftEnd(value);
    if (draftStart && value < draftStart) {
      setDraftStart(value);
      setDraftEnd(draftStart);
    }
  }

  function handleApply() {
    let start = draftStart;
    let end = draftEnd;
    if (start && end && start > end) {
      const swap = start;
      start = end;
      end = swap;
    }
    onApply(start, end);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>{tr.activitiesDateFilter}</Text>
          <Text style={s.hint}>{tr.activitiesDateFilterHint}</Text>

          <View style={s.fields}>
            <TouchableOpacity
              style={[s.field, picking === 'start' && s.fieldActive]}
              onPress={() => setPicking('start')}
              activeOpacity={0.8}
            >
              <Text style={s.fieldLabel}>{tr.activitiesStartDate}</Text>
              <Text style={[s.fieldValue, !draftStart && s.fieldPlaceholder]}>
                {draftStart ? formatFilterDate(draftStart) : tr.activitiesAnyDate}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.field, picking === 'end' && s.fieldActive]}
              onPress={() => setPicking('end')}
              activeOpacity={0.8}
            >
              <Text style={s.fieldLabel}>{tr.activitiesEndDate}</Text>
              <Text style={[s.fieldValue, !draftEnd && s.fieldPlaceholder]}>
                {draftEnd ? formatFilterDate(draftEnd) : tr.activitiesAnyDate}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.monthRow}>
            <TouchableOpacity onPress={() => shiftMonth(-1)} hitSlop={10} style={s.monthBtn}>
              <Ionicons name="chevron-back" size={20} color={Colors.brand.greenDark} />
            </TouchableOpacity>
            <Text style={s.monthTitle}>
              {MONTHS[month]} {year}
            </Text>
            <TouchableOpacity onPress={() => shiftMonth(1)} hitSlop={10} style={s.monthBtn}>
              <Ionicons name="chevron-forward" size={20} color={Colors.brand.greenDark} />
            </TouchableOpacity>
          </View>

          <View style={s.weekRow}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={s.weekDay}>
                {d}
              </Text>
            ))}
          </View>

          <View style={s.grid}>
            {cells.map((day, i) => {
              if (day == null) {
                return <View key={`e-${i}`} style={s.cell} />;
              }
              const value = formatDrawDate(new Date(year, month, day));
              const isStart = draftStart === value;
              const isEnd = draftEnd === value;
              const hasRange = Boolean(draftStart && draftEnd && draftStart !== draftEnd);
              const inRange =
                hasRange &&
                draftStart != null &&
                draftEnd != null &&
                value >= draftStart &&
                value <= draftEnd;
              const isEdge = isStart || isEnd;
              const isToday = value === today && !isEdge;
              return (
                <Pressable key={value} onPress={() => pickDay(day)} style={s.cell}>
                  {inRange ? (
                    <View
                      style={[
                        s.rangeBar,
                        isStart && !isEnd && s.rangeBarStart,
                        isEnd && !isStart && s.rangeBarEnd,
                      ]}
                    />
                  ) : null}
                  <View style={[s.dayInner, isEdge && s.daySelected]}>
                    <Text
                      style={[
                        s.cellText,
                        isToday && s.cellToday,
                        isEdge && s.cellSelectedText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={s.clearBtn}
              onPress={() => {
                setDraftStart(null);
                setDraftEnd(null);
                setPicking('start');
              }}
              activeOpacity={0.8}
            >
              <Text style={s.clearText}>{tr.activitiesFilterClear}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyBtn} onPress={handleApply} activeOpacity={0.85}>
              <Text style={s.applyText}>{tr.activitiesFilterApply}</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: Spacing.lg,
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
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  fields: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  field: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    backgroundColor: Colors.light.background,
  },
  fieldActive: {
    borderColor: Colors.brand.greenButton,
    backgroundColor: '#E8F5EE',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  fieldPlaceholder: { color: Colors.light.placeholder, fontWeight: FontWeight.medium },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  monthBtn: { padding: 6 },
  monthTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: '#CDEDDD',
  },
  rangeBarStart: {
    left: '50%',
  },
  rangeBarEnd: {
    right: '50%',
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  daySelected: {
    backgroundColor: Colors.brand.greenButton,
  },
  cellText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
  },
  cellToday: { color: Colors.brand.greenButton, fontWeight: FontWeight.bold },
  cellSelectedText: { color: '#fff', fontWeight: FontWeight.bold },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  clearBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.light.textSecondary,
  },
  applyBtn: {
    flex: 1.2,
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
