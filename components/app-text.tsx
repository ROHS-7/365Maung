import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native';
import { useLanguage } from '@/contexts/language';
import { translatedTextStyle } from '@/utils/myanmar-text-style';

type AppTextProps = TextProps & {
  /** Tighter Myanmar metrics for dense rows (betting cards, chips). */
  compact?: boolean;
};

/** Drop-in `Text` that extra-spaces Myanmar so translated copy is not cropped. */
export function Text({ style, compact, ...rest }: AppTextProps) {
  const { lang } = useLanguage();
  return (
    <RNText
      style={translatedTextStyle(lang, style, { compact })}
      {...rest}
    />
  );
}

export function TextInput({ style, ...rest }: TextInputProps) {
  const { lang } = useLanguage();
  return <RNTextInput style={translatedTextStyle(lang, style)} {...rest} />;
}
