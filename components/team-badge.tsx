import {
  DEFAULT_ESPORTS_LOGO,
  DEFAULT_FIGHT_LOGO,
  DEFAULT_TEAM_LOGO,
} from "@/utils/team-logo";
import { Image } from "expo-image";
import { useState } from "react";
import {
  StyleSheet,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";

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
  style: _style,
  useDefaultLogo = true,
  defaultLogo = DEFAULT_TEAM_LOGO,
}: Props) {
  const [failed, setFailed] = useState(false);
  const remoteLogo = logo?.trim();
  const useRemote = Boolean(remoteLogo) && !failed;

  const recyclingKey = useRemote
    ? remoteLogo!
    : defaultLogo === DEFAULT_FIGHT_LOGO
      ? "fight-default-logo-v17"
      : defaultLogo === DEFAULT_ESPORTS_LOGO
        ? "esports-default-logo-v2"
        : "team-default-logo";

  if (!useRemote && !useDefaultLogo) {
    return null;
  }

  return (
    <Image
      source={useRemote ? { uri: remoteLogo } : defaultLogo}
      style={[s.badge, { width: size, height: size }]}
      contentFit="contain"
      cachePolicy="memory-disk"
      recyclingKey={recyclingKey}
      transition={0}
      accessibilityLabel={name}
      onError={useRemote ? () => setFailed(true) : undefined}
    />
  );
}

const s = StyleSheet.create({
  badge: {
    flexShrink: 0,
  },
});
