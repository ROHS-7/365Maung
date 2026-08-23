import { Platform, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import type { Lang } from '@/constants/i18n';

/** Myanmar glyphs stack above/below the line and clip at Latin-tight line heights. */
const MYANMAR_LINE_HEIGHT_RATIO = 2.15;

export function myanmarLineHeight(fontSize: number, current?: number): number {
  const min = Math.ceil(fontSize * MYANMAR_LINE_HEIGHT_RATIO);
  if (typeof current === 'number') return Math.max(Math.ceil(current), min);
  return min;
}

export function myanmarTextPadding(fontSize: number): Pick<TextStyle, 'paddingTop' | 'paddingBottom'> {
  return {
    paddingTop: Math.max(2, Math.ceil(fontSize * 0.14)),
    paddingBottom: Math.max(1, Math.ceil(fontSize * 0.1)),
  };
}

export function translatedTextStyle(
  lang: Lang,
  style?: StyleProp<TextStyle>,
): StyleProp<TextStyle> {
  if (lang !== 'my') return style;
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = typeof flat.fontSize === 'number' ? flat.fontSize : 14;
  const current =
    typeof flat.lineHeight === 'number' ? flat.lineHeight : undefined;
  const pad = myanmarTextPadding(fontSize);
  return [
    style,
    {
      lineHeight: myanmarLineHeight(fontSize, current),
      includeFontPadding: true,
      overflow: 'visible',
      ...pad,
      ...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : {}),
    },
  ];
}
