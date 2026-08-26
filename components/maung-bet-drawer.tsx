import { View, TouchableOpacity, StyleSheet, Text as RNText, Platform } from 'react-native';
import { TextInput } from '@/components/app-text';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

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
  return (
    <View style={[s.drawer, { paddingBottom: safeBottom, bottom: tabBarOffset }]}>
      <View style={s.inputRow}>
        <TextInput
          style={s.stakeInput}
          value={stake}
          onChangeText={onStakeChange}
          keyboardType="number-pad"
          placeholder={stakePlaceholder}
          placeholderTextColor={Colors.light.placeholder}
          selectTextOnFocus
        />
        <View style={s.countPill}>
          <RNText style={s.countText} numberOfLines={1}>
            <RNText style={[s.countNum, count <= 0 && s.countNumEmpty]}>
              {count}
            </RNText>
            {' '}
            {copy.picksUnit}
          </RNText>
        </View>
      </View>

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
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingTop: 10,
    paddingHorizontal: Spacing.md,
    gap: 8,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.24,
          shadowRadius: 28,
        }
      : { elevation: 16 }),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stakeInput: {
    flex: 1,
    maxWidth: '50%',
    height: 38,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    color: Colors.light.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  countPill: {
    flex: 1,
    maxWidth: '50%',
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.brand.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  countText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.light.textSecondary,
  },
  countNum: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  countNumEmpty: {
    color: Colors.light.placeholder,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btnBet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    minHeight: 36,
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
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    minHeight: 36,
  },
  btnResetText: {
    color: '#fff',
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm,
  },
  btnDisabled: { opacity: 0.55, backgroundColor: Colors.light.placeholder },
});
