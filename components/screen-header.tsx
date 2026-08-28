import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { Text } from '@/components/app-text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

type BackIcon = 'chevron-back' | 'arrow-back';

const MIN_TITLE_INSET = 40;
const SIDE_GAP = 10;

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: BackIcon;
  left?: ReactNode;
  right?: ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  titleColor?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backIcon = 'chevron-back',
  left,
  right,
  style,
  backgroundColor = Colors.brand.greenButton,
  titleColor = '#fff',
}: Props) {
  const [titleInset, setTitleInset] = useState(MIN_TITLE_INSET);

  const leftNode =
    left ??
    (onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.7}>
        <Ionicons name={backIcon} size={22} color={titleColor} />
      </TouchableOpacity>
    ) : null);

  function updateInset(width: number) {
    const next = Math.max(MIN_TITLE_INSET, Math.ceil(width) + SIDE_GAP);
    setTitleInset((prev) => (next > prev ? next : prev));
  }

  return (
    <View style={[styles.header, { backgroundColor }, style]}>
      <View style={styles.sideLeft} onLayout={(e) => updateInset(e.nativeEvent.layout.width)}>
        {leftNode}
      </View>
      <View
        style={styles.sideRight}
        onLayout={(e) => updateInset(e.nativeEvent.layout.width)}
      >
        {right}
      </View>
      <View
        style={[styles.titleLayer, { paddingHorizontal: titleInset }]}
        pointerEvents="none"
      >
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    minHeight: 44,
  },
  sideLeft: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  sideRight: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
    gap: 6,
    marginLeft: 'auto',
  },
  iconBtn: {
    padding: 6,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    width: '100%',
    fontSize: 15,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    width: '100%',
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 1,
  },
});
