import { useState } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { DEFAULT_TEAM_LOGO } from '@/utils/team-logo';

type Props = {
  name: string;
  logo?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function TeamBadge({ name, logo, size = 26, style }: Props) {
  const [failed, setFailed] = useState(false);
  const radius = size / 2;
  const remoteLogo = logo?.trim();
  const useRemote = Boolean(remoteLogo) && !failed;

  return (
    <Image
      source={useRemote ? { uri: remoteLogo } : DEFAULT_TEAM_LOGO}
      style={[
        s.badge,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
      contentFit="contain"
      cachePolicy="memory-disk"
      recyclingKey={useRemote ? remoteLogo : 'team-default-logo'}
      transition={0}
      accessibilityLabel={name}
      onError={() => setFailed(true)}
    />
  );
}

const s = StyleSheet.create({
  badge: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    flexShrink: 0,
  },
});
