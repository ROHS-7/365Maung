import { View, TouchableOpacity, StyleSheet, Text as RNText } from 'react-native';
import { Text, TextInput } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

const HEADER_H = 72;
const ACTIONS_H = 118;

export type BetSlipCopy = {
  slipTitle: string;
  minPicksHint: string;
  picksUnit: string;
  selectedLabel: string;
  unitsLabel: string;
  placeBet: string;
  reviewBet: string;
  okLabel: string;
  resetLabel: string;
  tapToExpand: string;
  currencyUnit: string;
};

export type BetSlipDrawerProps = {
  count: number;
  canBet: boolean;
  stake: string;
  onStakeChange: (v: string) => void;
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
  onReset,
  onPlaceBet,
  safeBottom,
  tabBarOffset,
  copy,
  stakePlaceholder = '500',
}: BetSlipDrawerProps) {
  const stakeDisplay = Number(stake.replace(/,/g, '') || 0).toLocaleString();
  const drawerHeight =
    HEADER_H + (count > 0 ? ACTIONS_H : 0) + safeBottom;

  return (
    <View style={[s.drawer, { height: drawerHeight, bottom: tabBarOffset }]}>
      <View style={s.headerRow}>
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
        {count > 0 ? (
          <Text style={s.selectedUnits}>
            {copy.selectedLabel}{' '}
            <RNText style={s.selectedUnitsCount}>{count}</RNText>{' '}
            {copy.unitsLabel}
          </Text>
        ) : null}
      </View>

      {count > 0 ? (
        <View style={[s.actionsBody, { paddingBottom: safeBottom }]}>
          <TextInput
            style={s.stakeInput}
            value={stake}
            onChangeText={onStakeChange}
            keyboardType="number-pad"
            placeholder={stakePlaceholder}
            placeholderTextColor={Colors.light.placeholder}
            selectTextOnFocus
          />

          <View style={s.actions}>
            <TouchableOpacity
              style={[s.btnBet, !canBet && s.btnDisabled]}
              onPress={onPlaceBet}
              activeOpacity={canBet ? 0.85 : 1}
              disabled={!canBet}
            >
              <RNText style={s.btnBetText}>{copy.placeBet}</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnReset} onPress={onReset} activeOpacity={0.85}>
              <RNText style={s.btnResetText}>{copy.resetLabel}</RNText>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** @deprecated Use BetSlipDrawer with explicit copy/minPicks */
export const MaungBetDrawer = BetSlipDrawer;

const s = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingTop: 10,
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    minWidth: 0,
  },
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
  summaryText: { flex: 1, minWidth: 0 },
  summaryTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  summarySub: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  selectedUnits: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.textSecondary,
    flexShrink: 0,
  },
  selectedUnitsCount: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.brand.gold,
  },
  actionsBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    gap: 8,
  },
  stakeInput: {
    height: 42,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
    color: Colors.light.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btnBet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.lg,
    paddingVertical: 9,
    minHeight: 40,
    ...Shadow.sm,
  },
  btnBetText: {
    color: '#fff',
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm,
  },
  btnReset: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF8121',
    borderRadius: BorderRadius.lg,
    paddingVertical: 9,
    minHeight: 40,
  },
  btnResetText: {
    color: '#fff',
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm,
  },
  btnDisabled: { opacity: 0.55, backgroundColor: Colors.light.placeholder },
});
