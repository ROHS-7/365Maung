import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '@/constants/theme';
import type { SlipDetailItem } from '@/utils/football-ui';

type Copy = {
  title: string;
  typeLabel: string;
  typeValue: string;
  benefitMaxLabel: string;
  amountLabel: string;
  okLabel: string;
  cancelLabel: string;
  currencyUnit: string;
};

type Props = {
  visible: boolean;
  items: SlipDetailItem[];
  benefitMax: number;
  amount: number;
  submitting?: boolean;
  copy: Copy;
  onConfirm: () => void;
  onCancel: () => void;
};

export function BetSlipConfirmModal({
  visible,
  items,
  benefitMax,
  amount,
  submitting = false,
  copy,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onCancel} />
        <View style={s.card}>
          <Text style={s.title}>{copy.title}</Text>

          <ScrollView
            style={s.list}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View key={item.key} style={s.item}>
                <Text compact style={s.matchTitle} numberOfLines={2}>
                  {item.matchTitle}
                  {item.matchTime ? (
                    <Text compact style={s.matchTime}>
                      {' '}({item.matchTime})
                    </Text>
                  ) : null}
                </Text>
                <View style={s.pickRow}>
                  <Ionicons
                    name="information-circle"
                    size={11}
                    color="#D64545"
                    style={s.infoIcon}
                  />
                  <Text compact style={s.marketLabel} numberOfLines={1}>
                    {item.marketLabel}
                  </Text>
                  <Text compact style={s.pickLabel} numberOfLines={1}>
                    {item.pickLabel}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={s.summary}>
            <SummaryRow label={copy.typeLabel} value={copy.typeValue} />
            <SummaryRow
              label={copy.benefitMaxLabel}
              value={benefitMax.toLocaleString()}
            />
            <SummaryRow
              label={copy.amountLabel}
              value={`${amount.toLocaleString()} ${copy.currencyUnit}`}
              highlight
            />
          </View>

          <View style={s.actions}>
            <Pressable
              style={[s.btnOk, submitting && s.btnDisabled]}
              onPress={onConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <RNText style={s.btnOkText}>{copy.okLabel}</RNText>
              )}
            </Pressable>
            <Pressable
              style={[s.btnCancel, submitting && s.btnDisabled]}
              onPress={onCancel}
              disabled={submitting}
            >
              <RNText style={s.btnCancelText}>{copy.cancelLabel}</RNText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={s.summaryRow}>
      <Text style={s.summaryLabel}>{label}</Text>
      <RNText style={[s.summaryValue, highlight && s.summaryValueHighlight]}>
        {value}
      </RNText>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    height: '88%',
    maxHeight: 640,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  list: { flex: 1, minHeight: 280 },
  listContent: { paddingHorizontal: 12, paddingBottom: 4 },
  item: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  matchTitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  matchTime: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: FontWeight.regular,
    color: Colors.light.textSecondary,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 3,
  },
  infoIcon: { marginTop: 0 },
  marketLabel: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 13,
    color: Colors.light.textSecondary,
  },
  pickLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: FontWeight.bold,
    color: '#2E6BFF',
  },
  summary: {
    marginTop: 2,
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  summaryValueHighlight: {
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btnOk: {
    flex: 1,
    minHeight: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brand.greenButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOkText: {
    color: '#fff',
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  btnCancel: {
    flex: 1,
    minHeight: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EF8121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    color: '#fff',
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  btnDisabled: { opacity: 0.7 },
});
