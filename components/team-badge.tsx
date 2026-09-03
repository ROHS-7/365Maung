import { useState } from 'react';
import {
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import {
  DEFAULT_ESPORTS_LOGO,
  DEFAULT_FIGHT_LOGO,
  DEFAULT_TEAM_LOGO,
} from '@/utils/team-logo';

type Props = {
  name: string;
  logo?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** When false, hide badge if no remote logo. */
  useDefaultLogo?: boolean;
  /** Fallback image when no remote logo (defaults to football team logo). */
  defaultLogo?: ImageSourcePropType;
};

export function TeamBadge({
  name,
  logo,
  size = 26,
  style,
  useDefaultLogo = true,
  defaultLogo = DEFAULT_TEAM_LOGO,
}: Props) {
  const [failed, setFailed] = useState(false);
  const remoteLogo = logo?.trim();
  const useRemote = Boolean(remoteLogo) && !failed;
  const isFightBadge = defaultLogo === DEFAULT_FIGHT_LOGO;

  const renderImage = (
    source: ImageSourcePropType | { uri: string },
    recyclingKey: string,
    onError?: () => void,
  ) => {
    const image = (
      <Image
        source={source}
        style={isFightBadge ? s.fightImage : [s.badge, { width: size, height: size }]}
        contentFit="contain"
        cachePolicy="memory-disk"
        recyclingKey={recyclingKey}
        transition={0}
        accessibilityLabel={name}
        onError={onError}
      />
    );

    if (!isFightBadge) {
      return (
        <Image
          source={source}
          style={[s.badge, { width: size, height: size }, style]}
          contentFit="contain"
          cachePolicy="memory-disk"
          recyclingKey={recyclingKey}
          transition={0}
          accessibilityLabel={name}
          onError={onError}
        />
      );
    }

    return (
      <View style={[s.fightFrame, { width: size, height: size, borderRadius: size / 2 }, style]}>
        {image}
      </View>
    );
  };

  if (useRemote) {
    return renderImage({ uri: remoteLogo! }, remoteLogo!, () => setFailed(true));
  }

  if (!useDefaultLogo) {
    return null;
  }

  const recyclingKey =
    defaultLogo === DEFAULT_FIGHT_LOGO
      ? 'fight-default-logo-v13'
      : defaultLogo === DEFAULT_ESPORTS_LOGO
        ? 'esports-default-logo-v1'
        : 'team-default-logo';

  return renderImage(defaultLogo, recyclingKey);
}

const s = StyleSheet.create({
  badge: {
    flexShrink: 0,
  },
  fightFrame: {
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fightImage: {
    width: '100%',
    height: '100%',
  },
});
