import { createElement, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { myanmarLineHeight } from '@/utils/myanmar-text-style';

const MARQUEE_GAP = 48;
const MARQUEE_SPEED = 50;

function sanitizeAnnounceText(text: string) {
  return text.trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
}

function loopLabel(text: string) {
  return `${sanitizeAnnounceText(text)}   ✦   `;
}

function MarqueeLine({
  children,
  lang,
  onSegmentWidth,
}: {
  children: string;
  lang: 'en' | 'my';
  onSegmentWidth?: (width: number) => void;
}) {
  const lineHeight = myanmarLineHeight(FontSize.sm, lang === 'my' ? undefined : 20);
  return (
    <View style={s.marqueeSegment} collapsable={false}>
      <RNText
        numberOfLines={1}
        ellipsizeMode="clip"
        style={[s.marqueeText, { lineHeight }]}
        onLayout={(e) => {
          const w = Math.ceil(e.nativeEvent.layout.width);
          if (w > 1) onSegmentWidth?.(w);
        }}
      >
        {children}
      </RNText>
    </View>
  );
}

function WebAnnouncementBanner({ text }: { text: string }) {
  const { lang } = useLanguage();
  const rowRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const loopText = loopLabel(text);
  const lineH = myanmarLineHeight(FontSize.sm, lang === 'my' ? undefined : 28);
  const trackH = Math.max(lineH + (lang === 'my' ? 6 : 4), 30);

  const copyStyle = {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    display: 'inline-block',
    paddingRight: MARQUEE_GAP,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: `${lineH}px`,
    color: '#1A2E22',
  } as const;

  useEffect(() => {
    const el = rowRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    let raf = 0;
    let offset = 0;
    let last = performance.now();

    const run = () => {
      const copyW = el.scrollWidth / 2;
      if (copyW <= 1) {
        raf = requestAnimationFrame(run);
        return;
      }

      const dt = Math.min(0.05, (performance.now() - last) / 1000);
      last = performance.now();
      offset += MARQUEE_SPEED * dt;
      if (offset >= copyW) offset -= copyW;
      el.style.transform = `translate3d(${-offset}px,0,0)`;
      raf = requestAnimationFrame(run);
    };

    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <View style={s.announce}>
      <View style={s.announceIcon}>
        <Ionicons name="megaphone" size={14} color={Colors.brand.greenDark} />
      </View>
      <View style={[s.announceTrack, { height: trackH }]}>
        {createElement(
          'div',
          {
            ref: trackRef,
            style: {
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              position: 'relative',
              height: trackH,
            },
          },
          createElement(
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
                height: trackH,
                alignItems: 'center',
                whiteSpace: 'nowrap',
                willChange: 'transform',
              },
            },
            createElement('span', { style: copyStyle }, loopText),
            createElement('span', { style: copyStyle }, loopText),
          ),
        )}
      </View>
    </View>
  );
}

function NativeAnnouncementBanner({ text }: { text: string }) {
  const { lang } = useLanguage();
  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const [segmentW, setSegmentW] = useState(0);
  const loopText = loopLabel(text);
  const lineH = myanmarLineHeight(FontSize.sm, lang === 'my' ? undefined : 20);
  const trackH = Math.max(lineH + (lang === 'my' ? 6 : 4), 30);

  useEffect(() => {
    animRef.current?.stop();
    translateX.stopAnimation();
    translateX.setValue(0);

    if (segmentW <= 0) return;

    const loopDistance = segmentW + MARQUEE_GAP;
    const duration = Math.max((loopDistance / MARQUEE_SPEED) * 1000, 4000);
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -loopDistance,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animRef.current = loop;
    loop.start();
    return () => loop.stop();
  }, [segmentW, loopText, translateX]);

  return (
    <View style={s.announce}>
      <View style={s.announceIcon}>
        <Ionicons name="megaphone" size={14} color={Colors.brand.greenDark} />
      </View>

      {/* Off-screen single-line width measure — must not be inside clipped track. */}
      <View style={s.measureWrap} pointerEvents="none">
        <MarqueeLine lang={lang} onSegmentWidth={setSegmentW}>
          {loopText}
        </MarqueeLine>
      </View>

      <View style={[s.announceTrack, { height: trackH }]}>
        {segmentW > 0 ? (
          <Animated.View
            style={[
              s.announceRow,
              {
                height: trackH,
                width: segmentW * 2 + MARQUEE_GAP,
                transform: [{ translateX }],
              },
            ]}
          >
            <MarqueeLine lang={lang}>{loopText}</MarqueeLine>
            <View style={s.marqueeGap} />
            <MarqueeLine lang={lang}>{loopText}</MarqueeLine>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

export function AnnouncementBanner({ text }: { text: string }) {
  if (!text.trim()) return null;
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
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadow.sm,
  },
  announceIcon: {
    width: 28,
    height: 32,
    borderRadius: 14,
    backgroundColor: Colors.brand.gold + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  measureWrap: {
    position: 'absolute',
    opacity: 0,
    top: -200,
    left: -20000,
    width: 50000,
    flexDirection: 'row',
  },
  announceTrack: {
    flex: 1,
    overflow: 'hidden',
    minWidth: 0,
    justifyContent: 'center',
  },
  announceRow: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  marqueeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
    flexShrink: 0,
    includeFontPadding: false,
  },
  marqueeSegment: {
    flexShrink: 0,
  },
  marqueeGap: {
    width: MARQUEE_GAP,
    flexShrink: 0,
  },
});
