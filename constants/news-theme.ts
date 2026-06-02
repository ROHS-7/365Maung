import { Colors } from '@/constants/theme';

/** Light palette for news screens — layout follows OneFootball, colors match 365Maung */
export const NewsTheme = {
  bg: '#F2F5F3',
  surface: Colors.brand.white,
  surfaceElevated: Colors.brand.offWhite,
  border: Colors.light.border,
  text: Colors.light.text,
  textSecondary: Colors.light.textSecondary,
  textMuted: Colors.light.placeholder,
  accent: Colors.brand.greenButton,
  accentDark: Colors.brand.greenDark,
  accentDim: 'rgba(39, 160, 96, 0.12)',
  danger: '#E74C3C',
  overlay: 'rgba(0,0,0,0.45)',
  headerBg: Colors.brand.greenDark,
  onHeader: Colors.brand.white,
} as const;
