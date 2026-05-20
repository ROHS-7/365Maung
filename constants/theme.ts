import { Platform } from 'react-native';

export const Colors = {
  brand: {
    greenDark: '#0D3B24',
    greenMid: '#155C38',
    greenLight: '#1E7A4C',
    greenButton: '#27A060',
    gold: '#F5C518',
    white: '#FFFFFF',
    offWhite: '#F4F8F5',
  },
  light: {
    text: '#1A2E22',
    textSecondary: '#4A6355',
    background: '#F4F8F5',
    tint: '#155C38',
    icon: '#4A6355',
    tabIconDefault: '#8AA898',
    tabIconSelected: '#155C38',
    card: '#FFFFFF',
    border: '#D9EAE2',
    inputBg: '#FFFFFF',
    placeholder: '#8AA898',
    error: '#C62828',
    success: '#2E7D32',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#A8C2B5',
    background: '#0D3B24',
    tint: '#F5C518',
    icon: '#A8C2B5',
    tabIconDefault: '#8AA898',
    tabIconSelected: '#F5C518',
    card: '#155C38',
    border: '#1E7A4C',
    inputBg: '#1E7A4C',
    placeholder: '#8AA898',
    error: '#EF9A9A',
    success: '#A5D6A7',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 44,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const Shadow = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
    android: { elevation: 6 },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24 },
    android: { elevation: 12 },
    default: {},
  }),
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
