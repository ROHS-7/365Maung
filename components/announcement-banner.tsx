import { createElement, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '@/constants/theme';

const COPY_STYLE = {
  flexShrink: 0,
  whiteSpace: 'nowrap',
  display: 'inline-block',
  paddingRight: 48,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '18px',
  color: '#1A2E22',
  boxSizing: 'content-box',
} as const;

function WebAnnouncementBanner({ text }: { text: string }) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const loopText = `${text.trim()}   ✦   `;

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const track = el.parentElement;
    const trackW = track?.clientWidth ?? 0;
    for (const child of Array.from(el.children)) {
      const node = child as HTMLElement;
      node.style.minWidth = trackW > 0 ? `${trackW}px` : '';
    }

    let offset = 0;
    let last = performance.now();
    let raf = 0;
    const speed = 55;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const copyW = el.scrollWidth / 2;
      if (copyW > 1) {
        offset += speed * dt;
        if (offset >= copyW) offset -= copyW;
        el.style.transform = `translate3d(${-offset}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <View style={s.announce}>
      <View style={s.announceIcon}>
        <Ionicons name="megaphone" size={14} color={Colors.brand.greenDark} />
      </View>
      <View style={s.announceTrack}>
        {createElement(
          'div',
          {
            ref: rowRef,
            style: {
              display: 'inline-flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              position: 'absolute',
              left: 0,
              top: 0,
              height: 18,
              whiteSpace: 'nowrap',
              willChange: 'transform',
            },
          },
          createElement('span', { style: COPY_STYLE }, loopText),
          createElement('span', { style: COPY_STYLE }, loopText),
        )}
      </View>
    </View>
  );
}

function NativeAnnouncementBanner({ text }: { text: string }) {
  const x = useRef(new Animated.Value(0)).current;
  const [tw, setTw] = useState(0);
  const loopText = `${text.trim()}   ✦   `;

  useEffect(() => {
    if (!tw) return;
    x.setValue(0);
    const anim = Animated.loop(
      Animated.timing(x, {
        toValue: -tw,
        duration: Math.max(tw, 80) * 22,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => {
      anim.stop();
    };
  }, [tw, loopText, x]);

  return (
    <View style={s.announce}>
      <View style={s.announceIcon}>
        <Ionicons name="megaphone" size={14} color={Colors.brand.greenDark} />
      </View>
      <View style={s.announceTrack}>
        <Animated.View style={[s.announceRow, { transform: [{ translateX: x }] }]}>
          <View
            collapsable={false}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0 && Math.abs(w - tw) > 1) setTw(w);
            }}
          >
            <Text style={s.announceText} numberOfLines={1}>
              {loopText}
            </Text>
          </View>
          <Text style={s.announceText} numberOfLines={1}>
            {loopText}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

export function AnnouncementBanner({ text }: { text: string }) {
  if (Platform.OS === 'web') {
    return <WebAnnouncementBanner text={text} />;
  }
  return <NativeAnnouncementBanner text={text} />;
}

const s = StyleSheet.create({
  announce: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadow.sm,
  },
  announceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.gold + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  announceTrack: {
    flex: 1,
    overflow: 'hidden',
    height: 18,
    position: 'relative',
    minWidth: 0,
  },
  announceRow: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  announceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
    flexShrink: 0,
  },
});
