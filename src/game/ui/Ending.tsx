import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, Text, View } from 'react-native';
import { UI } from '@/game/assets';
import { C, F, G, R, T, type GTone } from '@/theme';
import { Btn } from '@/components/ui';
import { Confetti } from '@/game/ui/Confetti';
import { storyFor } from '@/game/data/story';
import { sfx } from '@/lib/audio';
import { useReduceMotion } from '@/lib/motion';
import { useLang, useT } from '@/lib/i18n';

const ENDING_TONE: Record<'a' | 'b' | 'c', GTone> = { a: 'lemon', b: 'leaf', c: 'berry' };
const IMG = { a: UI.ending_a, b: UI.ending_b, c: UI.ending_c } as const;

export function Ending({ kind, name, score, grade, onDone }: { kind: 'a' | 'b' | 'c'; name: string; score: number; grade: string; onDone: () => void }) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const reduce = useReduceMotion();
  const e = storyFor(lang).ENDINGS[kind];
  const g = G[ENDING_TONE[kind]];
  const lines = e.lines(name.split(/\s+/)[0] || t('you'));
  const [i, setI] = useState(0);
  const [fin, setFin] = useState(false);
  const zoom = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const end = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!reduce) Animated.timing(zoom, { toValue: 1, duration: 22000, easing: Easing.linear, useNativeDriver: true }).start();
  }, [zoom, reduce]);

  useEffect(() => {
    text.setValue(0);
    Animated.timing(text, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [i, text]);

  const next = () => {
    sfx('tap');
    if (i + 1 < lines.length) setI(i + 1);
    else if (!fin) {
      setFin(true);
      sfx(kind === 'c' ? 'wrong' : 'success');
      Animated.timing(end, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    }
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={lines[i]} onPress={fin ? undefined : next} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.navy }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 50, aspectRatio: 360 / 520, overflow: 'hidden' }}>
        <Animated.View style={{ flex: 1, transform: [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }}>
          <Image source={IMG[kind]} resizeMode="stretch" style={{ width: '100%', height: '100%' }} />
        </Animated.View>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: fin ? 'rgba(6,20,38,0.72)' : kind === 'c' ? 'rgba(6,20,38,0.25)' : 'transparent' }} />
      {!fin ? (
        <Animated.View style={{ position: 'absolute', left: 14, right: 14, bottom: 40, opacity: text, transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <View style={{ backgroundColor: '#fff', borderRadius: R.lg, borderWidth: 4, borderBottomWidth: 8, borderColor: g.edge, padding: 16, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
            <Text style={{ fontFamily: F.body, fontSize: T.lead + 1, lineHeight: 26, color: C.navy }}>{lines[i]}</Text>
            <Text style={{ alignSelf: 'flex-end', fontFamily: F.pixelB, fontSize: T.cap + 1, color: g.deep, marginTop: 8 }}>{t('endTapCount', { i: i + 1, n: lines.length })}</Text>
          </View>
        </Animated.View>
      ) : (
        <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: end, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
          {kind !== 'c' ? <Image source={UI.trophy} resizeMode="stretch" style={{ width: 120, height: 120 }} /> : null}
          <Text style={{ fontFamily: F.pixelB, fontSize: T.lead, color: g.bg }}>{t('endTag')}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, fontSize: 32, color: '#fff', textAlign: 'center' }}>{e.title}</Text>
          <Text style={{ fontFamily: F.body, fontSize: T.lead, color: '#D8ECFA', textAlign: 'center', fontStyle: 'italic' }}>{`"${e.quote}"`}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            <View style={{ alignItems: 'center', backgroundColor: g.bg, borderWidth: 3, borderBottomWidth: 6, borderColor: g.edge, borderRadius: R.md, paddingVertical: 8, paddingHorizontal: 20, minWidth: 104 }}>
              <Text style={{ fontFamily: F.pixelB, fontSize: 40, color: g.text }}>{score}</Text>
              <Text style={{ fontFamily: F.bodyB, color: g.text, fontSize: T.cap }}>{t('endScore')}</Text>
            </View>
            <View style={{ alignItems: 'center', backgroundColor: G.blue.bg, borderWidth: 3, borderBottomWidth: 6, borderColor: G.blue.edge, borderRadius: R.md, paddingVertical: 8, paddingHorizontal: 20, minWidth: 104 }}>
              <Text style={{ fontFamily: F.pixelB, fontSize: 40, color: '#fff' }}>{grade}</Text>
              <Text style={{ fontFamily: F.bodyB, color: '#fff', fontSize: T.cap }}>{t('endGrade')}</Text>
            </View>
          </View>
          <Btn label={t('backToMenu')} tone="white" onPress={onDone} style={{ alignSelf: 'stretch', marginTop: 14 }} />
        </Animated.View>
      )}
      {fin && kind === 'a' && !reduce ? <Confetti count={44} /> : null}
    </Pressable>
  );
}
