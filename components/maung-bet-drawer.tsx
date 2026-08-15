import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

const QUICK_STAKES = ['500', '1000', '2000', '5000', '10000'];
const HANDLE_H = 82;
const COLLAPSED_CTA = 48;
const EXPANDED_BASE = 248;
const PICK_ROW_H = 36;

export type SlipItem = { key: string; label: string };

export type BetSlipCopy = {
  slipTitle: string;
  minPicksHint: string;
  picksUnit: string;
  selectedLabel: string;
  placeBet: string;
  reviewBet: string;
  betAmount: string;
  clearSlip: string;
  tapToExpand: string;
  currencyUnit: string;
};

export type BetSlipDrawerProps = {
  count: number;
  canBet: boolean;
  stake: string;
  onStakeChange: (v: string) => void;
  slipItems: SlipItem[];
  onRemove: (key: string) => void;
  onReset: () => void;
  onPlaceBet: () => void;
  safeBottom: number;
  tabBarOffset: number;
  copy: BetSlipCopy;
  minPicks: number;
  stakePlaceholder?: string;
  onExpandedChange?: (expanded: boolean) => void;
};

export function BetSlipDrawer({
  count,
  canBet,
  stake,
  onStakeChange,
  slipItems,
  onRemove,
  onReset,
  onPlaceBet,
  safeBottom,
  tabBarOffset,
  copy,
  minPicks,
  stakePlaceholder = '500',
  onExpandedChange,
}: BetSlipDrawerProps) {
  const [expanded, setExpanded] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const collapsedH = HANDLE_H + (count > 0 ? COLLAPSED_CTA : 0);
  const expandedContent =
    EXPANDED_BASE + Math.min(Math.max(slipItems.length, 1), 5) * PICK_ROW_H;
  const drawerHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [collapsedH + safeBottom, HANDLE_H + expandedContent + safeBottom],
  });
  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });
  const chevronRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const bodyOpacity = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0, 1],
  });

  function animate(toExpanded: boolean) {
    setExpanded(toExpanded);
    onExpandedChange?.(toExpanded);
    Animated.timing(progress, {
      toValue: toExpanded ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }

  function open() {
    animate(true);
  }
  function close() {
    animate(false);
  }
  function toggle() {
    animate(!expanded);
  }

  useEffect(() => {
    if (count === 0 && expanded) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const stakeDisplay = Number(stake.replace(/,/g, '') || 0).toLocaleString();

  return (
    <>
      <Animated.View
        pointerEvents={expanded ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, s.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={s.backdropPress} onPress={close} accessibilityRole="button" />
      </Animated.View>

      <Animated.View style={[s.drawer, { height: drawerHeight, bottom: tabBarOffset }]}>
        <TouchableOpacity
          style={s.handleRow}
          onPress={toggle}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={expanded ? copy.slipTitle : copy.tapToExpand}
        >
          <View style={s.handle} />
          <View style={s.summaryRow}>
            <View style={s.summaryLeft}>
              <View style={s.slipIcon}>
                <Ionicons name="receipt" size={18} color={Colors.brand.greenDark} />
                {count > 0 && (
                  <View style={s.slipBadge}>
                    <Text style={s.slipBadgeText}>{count}</Text>
                  </View>
                )}
              </View>
              <View style={s.summaryText}>
                <Text style={s.summaryTitle}>{copy.slipTitle}</Text>
                <Text style={s.summarySub} numberOfLines={1}>
                  {count === 0
                    ? copy.minPicksHint
                    : `${count} ${copy.picksUnit} · ${stakeDisplay} ${copy.currencyUnit}`}
                </Text>
              </View>
            </View>
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <Ionicons name="chevron-up" size={22} color={Colors.light.textSecondary} />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {!expanded && count > 0 && (
          <View style={[s.collapsedActions, { paddingBottom: safeBottom }]}>
            <TouchableOpacity
              style={[s.btnPlaceCompact, !canBet && s.btnPlaceDisabled]}
              onPress={canBet ? onPlaceBet : open}
              activeOpacity={0.85}
              disabled={!canBet && count < minPicks}
            >
              <Text style={s.btnPlaceCompactText}>
                {canBet ? copy.placeBet : copy.reviewBet}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Animated.View
          style={[s.expandedBody, { opacity: bodyOpacity, paddingBottom: safeBottom }]}
          pointerEvents={expanded ? 'auto' : 'none'}
        >
          <Text style={s.sectionLabel}>
            {count} {copy.picksUnit} · {copy.selectedLabel}
          </Text>

          <ScrollView
            style={s.pickList}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {slipItems.length === 0 ? (
              <Text style={s.emptySlip}>{copy.minPicksHint}</Text>
            ) : (
              slipItems.map(({ key, label }) => (
                <View key={key} style={s.pickRow}>
                  <View style={s.pickDot} />
                  <Text style={s.pickRowText} numberOfLines={2}>
                    {label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onRemove(key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.light.placeholder} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          <Text style={s.stakeLabel}>{copy.betAmount}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickRow}>
            {QUICK_STAKES.map(amount => (
              <TouchableOpacity
                key={amount}
                style={[s.quickStake, stake === amount && s.quickStakeActive]}
                onPress={() => onStakeChange(amount)}
                activeOpacity={0.85}
              >
                <Text style={[s.quickStakeText, stake === amount && s.quickStakeTextActive]}>
                  {Number(amount).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.stakeInputRow}>
            <TextInput
              style={s.stakeInput}
              value={stake}
              onChangeText={onStakeChange}
              keyboardType="number-pad"
              placeholder={stakePlaceholder}
              placeholderTextColor={Colors.light.placeholder}
              selectTextOnFocus
            />
            <Text style={s.stakeUnit}>{copy.currencyUnit}</Text>
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={[s.btnPlace, !canBet && s.btnPlaceDisabledFull]}
              onPress={onPlaceBet}
              activeOpacity={canBet ? 0.85 : 1}
              disabled={!canBet}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={s.btnPlaceText}>{copy.placeBet}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnClear} onPress={onReset} activeOpacity={0.85}>
              <Text style={s.btnClearText}>{copy.clearSlip}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </>
  );
}

/** @deprecated Use BetSlipDrawer with explicit copy/minPicks */
export const MaungBetDrawer = BetSlipDrawer;

const s = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
    zIndex: 10,
  },
  backdropPress: { flex: 1 },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  handleRow: {
    paddingTop: 6,
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  slipIcon: { position: 'relative' },
  slipBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  slipBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  summaryText: { flex: 1 },
  summaryTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.light.text },
  summarySub: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 2 },

  collapsedActions: {
    paddingHorizontal: Spacing.md,
    paddingTop: 6,
  },
  btnPlaceCompact: {
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.lg,
    paddingVertical: 11,
    alignItems: 'center',
    ...Shadow.sm,
  },
  btnPlaceCompactText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  btnPlaceDisabled: { backgroundColor: Colors.light.placeholder, opacity: 0.9 },
  btnPlaceDisabledFull: { backgroundColor: Colors.light.placeholder, opacity: 0.85 },

  expandedBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: 6,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
    marginBottom: Spacing.sm,
  },
  pickList: { maxHeight: 160, marginBottom: Spacing.sm },
  emptySlip: { fontSize: FontSize.sm, color: Colors.light.textSecondary, paddingVertical: Spacing.md },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  pickDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.greenButton,
  },
  pickRowText: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.text },
  stakeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  quickRow: { gap: 8, marginBottom: Spacing.sm },
  quickStake: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F2F5F3',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  quickStakeActive: {
    backgroundColor: Colors.brand.greenButton,
    borderColor: Colors.brand.greenButton,
  },
  quickStakeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.textSecondary },
  quickStakeTextActive: { color: '#fff' },
  stakeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stakeInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F2F5F3',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
    color: Colors.light.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  stakeUnit: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.light.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 2 },
  btnPlace: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    ...Shadow.sm,
  },
  btnPlaceText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  btnClear: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingVertical: 12,
  },
  btnClearText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.light.textSecondary },
});
