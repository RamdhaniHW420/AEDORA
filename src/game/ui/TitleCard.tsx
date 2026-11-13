import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import { UI } from '@/game/assets';
import { Float, PixelCloud } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { C, CH, F, G, R, T } from '@/theme';

/** Kartu pembuka bab. Warna mengikuti warna bab supaya pemain langsung tahu sedang di bab mana. */
export function TitleCard({ title, sub, step = 1, onDone }: { title: string; sub: string; step?: number; onDone: () => void }) {
  const t = useT();
  const g = G[CH[step - 1] ?? 'blue'];
  const a = useRef(new Animated.Value(0)).current;
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(a, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onDone());
  };
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const timer = setTimeout(finish, 3200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${sub}. ${t('titleTapStart')}`} onPress={finish} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.navy }}>
      <Animated.View style={{ flex: 1, opacity: a }}>
        <Image source={UI.bg_sky} resizeMode="cover" style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <PixelCloud style={{ position: 'absolute', top: 90, left: 16 }} />
        <PixelCloud u={4} style={{ position: 'absolute', top: 150, right: 20 }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: g.bg, borderRadius: R.xl, borderWidth: 4, borderBottomWidth: 10, borderColor: g.edge, paddingVertical: 26, paddingHorizontal: 26, alignItems: 'center', gap: 12, maxWidth: 420 }}>
            <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, fontSize: 44, color: g.text, textAlign: 'center' }}>{title}</Text>
            <View style={{ height: 5, width: 96, borderRadius: 3, backgroundColor: g.text, opacity: 0.55 }} />
            <Text style={{ fontFamily: F.pixelB, fontSize: T.title + 2, color: g.text, textAlign: 'center' }}>{sub}</Text>
          </View>
          <Float style={{ marginTop: 30 }}>
            <Text style={{ fontFamily: F.pixelB, color: G.navy.text, fontSize: T.lead, backgroundColor: G.navy.bg, borderWidth: 3, borderColor: '#fff', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9, overflow: 'hidden' }}>{t('titleTapStart')}</Text>
          </Float>
        </View>
      </Animated.View>
    </Pressable>
  );
}
