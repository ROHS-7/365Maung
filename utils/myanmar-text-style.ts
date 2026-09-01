import { Platform, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import type { Lang } from '@/constants/i18n';

/**
 * Myanmar copy is longer and taller than Latin. Scale down a bit so
 * menus, pills, and headers stay balanced when lang === 'my'.
 */
const MYANMAR_FONT_SCALE = 0.88;

/** Enough for stacked Myanmar marks without ballooning every row. */
const MYANMAR_LINE_HEIGHT_RATIO = 1.48;
const MYANMAR_COMPACT_LINE_HEIGHT_RATIO = 1.35;

export function myanmarLineHeight(
  fontSize: number,
  current?: number,
  ratio = MYANMAR_LINE_HEIGHT_RATIO,
): number {
  const min = Math.ceil(fontSize * ratio);
  if (typeof current === 'number') return Math.max(Math.ceil(current * MYANMAR_FONT_SCALE), min);
  return min;
}

export function myanmarTextPadding(
  fontSize: number,
): Pick<TextStyle, 'paddingTop' | 'paddingBottom'> {
  return {
    paddingTop: Math.max(1, Math.ceil(fontSize * 0.06)),
    paddingBottom: Math.max(1, Math.ceil(fontSize * 0.04)),
  };
}

function myanmarCompactPadding(
  fontSize: number,
): Pick<TextStyle, 'paddingTop' | 'paddingBottom'> {
  return {
    paddingTop: Math.max(0, Math.ceil(fontSize * 0.04)),
    paddingBottom: Math.max(0, Math.ceil(fontSize * 0.03)),
  };
}

type TextStyleOptions = {
  compact?: boolean;
};

export function translatedTextStyle(
  lang: Lang,
  style?: StyleProp<TextStyle>,
  options?: TextStyleOptions,
): StyleProp<TextStyle> {
  if (lang !== 'my') return style;
  const flat = StyleSheet.flatten(style) ?? {};
  const baseFontSize = typeof flat.fontSize === 'number' ? flat.fontSize : 14;
  const fontSize = Math.max(10, Math.round(baseFontSize * MYANMAR_FONT_SCALE * 10) / 10);
  const current =
    typeof flat.lineHeight === 'number' ? flat.lineHeight : undefined;
  const compact = options?.compact === true;
  const ratio = compact
    ? MYANMAR_COMPACT_LINE_HEIGHT_RATIO
    : MYANMAR_LINE_HEIGHT_RATIO;
  const pad = compact
    ? myanmarCompactPadding(fontSize)
    : myanmarTextPadding(fontSize);

  return [
    style,
    {
      fontSize,
      lineHeight: myanmarLineHeight(fontSize, current, ratio),
      includeFontPadding: false,
      overflow: 'visible',
      ...pad,
      ...(Platform.OS === 'android'
        ? { textAlignVertical: 'center' as const }
        : {}),
    },
  ];
}
