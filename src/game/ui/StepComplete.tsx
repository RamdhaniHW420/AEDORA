import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { C, CH, F, G, R, T } from '@/theme';
import { Btn, Icon, ShieldRating } from '@/components/ui';
import { Confetti } from '@/game/ui/Confetti';
import { sfx } from '@/lib/audio';
import { useReduceMotion } from '@/lib/motion';
import { useT } from '@/lib/i18n';

/** Angka yang naik pelan sampai nilai akhir. Langsung tampil bila gerak dikurangi. */
function CountUp({ to, reduce, prefix = '', suffix = '' }: { to: number; reduce: boolean; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce || to <= 0) {
      setN(to);
      return;
    }
    let cur = 0;
    const stepBy = Math.max(1, Math.ceil(to / 30));
    const id = setInterval(() => {
      cur = Math.min(to, cur + stepBy);
      setN(cur);
      if (cur >= to) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [to, reduce]);
  return <Text style={{ fontFamily: F.pixelB, fontSize: T.title, color: C.navy }}>{`${prefix}${n}${suffix}`}</Text>;
}

/** Layar "bab selesai": warna bab, tiga perisai dari skor, koin dan XP yang menghitung naik. */
export function StepComplete({ step, title, score, gainedPoin, gainedXp, nextTitle, onDone }: { step: number; title: string; score?: number; gainedPoin: number; gainedXp: number; nextTitle?: string; onDone: () => void }) {
  const t = useT();
  const reduce = useReduceMotion();
  const g = G[CH[step - 1] ?? 'blue'];
  const pop = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    sfx('levelup');
    if (!reduce) Animated.spring(pop, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }).start();
  }, [pop, reduce]);
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 40, backgroundColor: 'rgba(8,24,44,0.88)', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      {reduce ? null : <Confetti count={34} />}
      <Animated.View style={{ alignSelf: 'center', width: '100%', maxWidth: 440, backgroundColor: '#fff', borderRadius: R.xl, borderWidth: 4, borderBottomWidth: 9, borderColor: g.edge, overflow: 'hidden', transform: [{ scale: pop }] }}>
        <View style={{ backgroundColor: g.bg, paddingVertical: 14, alignItems: 'center', gap: 4 }}>
          <Icon name="trophy" size={68} />
          <Text style={{ fontFamily: F.pixelB, fontSize: T.lead, color: g.text }}>{t('stepCompleteTag', { n: step })}</Text>
        </View>
        <View style={{ padding: 18, alignItems: 'center', gap: 12 }}>
          <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, fontSize: T.hero, color: g.deep, textAlign: 'center' }}>{title}</Text>
          {score !== undefined ? (
            <View style={{ alignItems: 'center', gap: 6 }}>
              <ShieldRating score={score} size={40} />
              <Text style={{ fontFamily: F.bodyX, fontSize: T.lead, color: C.navy }}>{t('stepScoreLine', { n: score })}</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: G.lemon.soft, borderWidth: 3, borderColor: G.lemon.edge, padding: 10, borderRadius: R.md }}>
              <Icon name="coin" size={26} />
              <CountUp to={gainedPoin} reduce={reduce} prefix="+" />
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: G.aqua.soft, borderWidth: 3, borderColor: G.aqua.edge, padding: 10, borderRadius: R.md }}>
              <Icon name="bolt" size={26} />
              <CountUp to={gainedXp} reduce={reduce} prefix="+" suffix=" XP" />
            </View>
          </View>
          {nextTitle ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: G.leaf.soft, borderWidth: 3, borderColor: G.leaf.edge, padding: 10, borderRadius: R.md, alignSelf: 'stretch' }}>
              <Icon name="check" size={22} />
              <Text style={{ flex: 1, fontFamily: F.bodyB, fontSize: T.body, color: C.navy }}>{t('unlockedNext', { title: nextTitle })}</Text>
            </View>
          ) : null}
          <Btn label={t('backToGame')} tone="leaf" onPress={onDone} style={{ alignSelf: 'stretch' }} />
        </View>
      </Animated.View>
    </View>
  );
}
