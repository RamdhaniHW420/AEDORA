import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View, useWindowDimensions } from 'react-native';
import { FX } from '@/game/assets';
import { C, F, G } from '@/theme';
import { Icon, Portrait } from '@/components/ui';
import { Closeup, CLOSEUP_DATA } from '@/game/ui/Closeup';
import { Sprite } from '@/game/engine/Sprite';
import { sfx, tap } from '@/lib/audio';
import { useT, type Key } from '@/lib/i18n';
import type { AnimKey, Place, Who } from '@/game/data/places';
import type { Finding } from '@/lib/types';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const timing = (v: Animated.Value, to: number, duration: number, easing = Easing.inOut(Easing.quad)) =>
  new Promise<void>((r) => Animated.timing(v, { toValue: to, duration, easing, useNativeDriver: false }).start(() => r()));

interface Props {
  place: Place;
  anim: AnimKey;
  finding: Finding;
  count: number;
  family?: Who;
  onDone: () => void;
}

export function ActionCutscene({ place, anim, finding, count, family, onDone }: Props) {
  const { width } = useWindowDimensions();
  const t = useT();
  const W = Math.min(width - 28, 380);
  const d = CLOSEUP_DATA[place.closeup];
  const s = W / d.w;
  const level = useRef(new Animated.Value(1)).current;
  const prog = useRef(new Animated.Value(0)).current;
  const dim = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const [fd, setFd] = useState<Finding>(finding === 'larvae' ? 'larvae' : finding);
  const [larvae, setLarvae] = useState(finding === 'larvae');
  const [eggs, setEggs] = useState(false);
  const [shownCount, setShownCount] = useState(count);
  const [sparkle, setSparkle] = useState(false);
  const [mosq, setMosq] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const run = async () => {
      await wait(500);
      switch (anim) {
        case 'sikat': {
          sfx('splash');
          void timing(prog, 1, 2000, Easing.linear);
          await wait(900);
          sfx('splash');
          await timing(level, 0, 900);
          setLarvae(false);
          sfx('clean');
          setSparkle(true);
          await wait(900);
          break;
        }
        case 'tutup': {
          await timing(prog, 1, 1000);
          sfx('clean');
          setSparkle(true);
          await wait(1100);
          break;
        }
        case 'abate': {
          await timing(prog, 1, 1500, Easing.linear);
          sfx('splash');
          await wait(600);
          setLarvae(false);
          setFd('safe');
          sfx('clean');
          setSparkle(true);
          await wait(1000);
          break;
        }
        case 'ikan': {
          void timing(prog, 1, 2600, Easing.linear);
          await wait(1200);
          setShownCount(Math.ceil(count / 2));
          await wait(900);
          setLarvae(false);
          sfx('clean');
          setSparkle(true);
          await wait(900);
          break;
        }
        case 'biarkan': {
          setLarvae(true);
          setFd('larvae');
          setShownCount(Math.max(count, 6));
          void timing(dim, 0.55, 1400);
          await wait(1200);
          setMosq(true);
          sfx('buzz');
          void timing(prog, 1, 2200, Easing.linear);
          await wait(2400);
          break;
        }
        case 'buang': {
          sfx('splash');
          await timing(level, 0, 1000);
          setLarvae(false);
          setEggs(true);
          await wait(1500);
          break;
        }
        case 'balik': {
          sfx('splash');
          await timing(level, 0, 900);
          setLarvae(false);
          await timing(flip, 1, 900);
          sfx('clean');
          setSparkle(true);
          await wait(900);
          break;
        }
        case 'daur': {
          sfx('splash');
          await timing(level, 0, 800);
          setLarvae(false);
          await timing(fadeOut, 0, 1000);
          sfx('clean');
          setSparkle(true);
          await wait(900);
          break;
        }
        case 'ganti': {
          sfx('splash');
          await timing(level, 0, 900);
          setLarvae(false);
          setFd('safe');
          await wait(300);
          sfx('splash');
          await timing(level, 1, 900);
          sfx('clean');
          setSparkle(true);
          await wait(700);
          break;
        }
        case 'angkat': {
          await timing(prog, 1, 1700);
          setLarvae(false);
          setFd('safe');
          sfx('clean');
          setSparkle(true);
          await wait(1200);
          break;
        }
      }
      if (alive.current) onDone();
    };
    void run();
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rect = { x: d.water[0] * s, y: d.water[1] * s, w: d.water[2] * s, h: d.water[3] * s };
  const px = (n: number) => n * s;

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#0E2842', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <Animated.View
        style={{
          opacity: fadeOut,
          transform: [
            { rotate: flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
            { scale: fadeOut.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
          ],
        }}
      >
        <Closeup k={place.closeup} width={W} finding={fd} count={shownCount} level={level} showLarvae={larvae} safeWater={place.safeWater}>
          {() => (
            <>
              {anim === 'sikat' ? (
                <Animated.View style={{ position: 'absolute', left: rect.x, top: rect.y - px(4), opacity: prog.interpolate({ inputRange: [0, 0.05, 0.9, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateX: prog.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, rect.w - px(30), 0, rect.w - px(30), 0, rect.w - px(30)] }) }] }}>
                  <Sprite source={FX.brush} cols={1} rows={1} fw={30} fh={20} col={0} row={0} scale={s} />
                </Animated.View>
              ) : null}
              {anim === 'tutup' ? (
                <Animated.View style={{ position: 'absolute', left: rect.x + (rect.w - px(40)) / 2, top: rect.y - px(8), transform: [{ translateY: prog.interpolate({ inputRange: [0, 1], outputRange: [-px(40), px(8)] }) }] }}>
                  <Sprite source={FX.lid} cols={1} rows={1} fw={40} fh={14} col={0} row={0} scale={s} />
                </Animated.View>
              ) : null}
              {anim === 'abate' ? (
                <>
                  <Animated.View style={{ position: 'absolute', left: rect.x + rect.w / 2 - px(9), top: px(1), opacity: prog.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }), transform: [{ rotate: prog.interpolate({ inputRange: [0, 0.3, 1], outputRange: ['0deg', '110deg', '110deg'] }) }] }}>
                    <Sprite source={FX.abate} cols={1} rows={1} fw={18} fh={18} col={0} row={0} scale={s} />
                  </Animated.View>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <Animated.View
                      key={i}
                      style={{
                        position: 'absolute',
                        left: rect.x + rect.w * (0.2 + (i % 4) * 0.2),
                        top: px(8),
                        width: px(1.4),
                        height: px(1.4),
                        backgroundColor: '#fff',
                        opacity: prog.interpolate({ inputRange: [0.25 + i * 0.05, 0.3 + i * 0.05, 0.7 + i * 0.03, 0.75 + i * 0.03], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' }),
                        transform: [{ translateY: prog.interpolate({ inputRange: [0.25 + i * 0.05, 0.75 + i * 0.03], outputRange: [0, rect.y - px(6) + rect.h * 0.4], extrapolate: 'clamp' }) }],
                      }}
                    />
                  ))}
                </>
              ) : null}
              {anim === 'ikan' ? (
                <>
                  {[0, 1].map((i) => (
                    <Animated.View key={i} style={{ position: 'absolute', left: rect.x, top: rect.y + rect.h * (0.25 + i * 0.35), opacity: prog.interpolate({ inputRange: [0, 0.08, 1], outputRange: [0, 1, 1] }), transform: [{ translateX: prog.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: i ? [rect.w - px(12), 0, rect.w - px(12), 0, rect.w - px(12)] : [0, rect.w - px(12), 0, rect.w - px(12), 0] }) }] }}>
                      <Sprite source={FX.fish} cols={1} rows={1} fw={10} fh={6} col={0} row={0} scale={s * 1.2} />
                    </Animated.View>
                  ))}
                </>
              ) : null}
              {anim === 'angkat' ? (
                <Animated.View style={{ position: 'absolute', left: rect.x + rect.w * 0.35, top: rect.y, opacity: prog.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: prog.interpolate({ inputRange: [0, 0.5, 1], outputRange: [px(30), 0, -px(26)] }) }] }}>
                  <Sprite source={FX.hand} cols={1} rows={1} fw={18} fh={18} col={0} row={0} scale={s} />
                  <Animated.View style={{ position: 'absolute', left: px(4), top: px(-3), width: px(9), height: px(5), backgroundColor: '#6B5A3C', opacity: prog.interpolate({ inputRange: [0, 0.4, 0.5], outputRange: [0, 0, 1] }) }} />
                </Animated.View>
              ) : null}
              {eggs
                ? [0, 1, 2, 3, 4, 5].map((i) => <View key={i} style={{ position: 'absolute', left: rect.x + rect.w * (0.1 + i * 0.15), top: rect.y + rect.h - px(2.4), width: px(1.2), height: px(1.2), backgroundColor: '#F2EBD0' }} />)
                : null}
              {mosq
                ? [0, 1, 2].map((i) => (
                    <Animated.View key={i} style={{ position: 'absolute', left: rect.x + rect.w * (0.2 + i * 0.25), top: rect.y, transform: [{ translateY: prog.interpolate({ inputRange: [0, 1], outputRange: [0, -rect.y - px(10)] }) }, { translateX: prog.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, (i - 1) * px(8), (i - 1) * px(18)] }) }] }}>
                      <Sprite source={FX.mosquito} cols={2} rows={1} fw={16} fh={14} col={Math.floor(Date.now() / 120) % 2} row={0} scale={s * 0.9} />
                    </Animated.View>
                  ))
                : null}
              {anim === 'biarkan' ? <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#1A0A0A', opacity: dim }} /> : null}
            </>
          )}
        </Closeup>
      </Animated.View>

      <View style={{ width: W, minHeight: 64, backgroundColor: C.navy, borderRadius: 14, borderWidth: 2, borderColor: anim === 'biarkan' ? C.red : C.sky, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Text style={{ fontFamily: F.pixelB, fontSize: 17, color: '#fff', textAlign: 'center' }}>{t(`cap_${anim}` as Key)}</Text>
        {anim === 'biarkan' ? <Text style={{ fontFamily: F.body, fontSize: 13, color: '#FFB3B3', textAlign: 'center' }}>{t('capBiarkanNote')}</Text> : null}
        {anim === 'buang' ? <Text style={{ fontFamily: F.body, fontSize: 13, color: '#F2EBD0', textAlign: 'center' }}>{t('capBuangNote')}</Text> : null}
      </View>

      {family ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: W }}>
          <Portrait who={family} mood="happy" size={56} />
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 3, borderBottomWidth: 5, borderColor: G.leaf.edge }}>
            <Text style={{ fontFamily: F.bodyB, fontSize: 13.5, color: C.navy }}>{t('familyTogether', { who: t(family === 'ibu' ? 'whoIbu' : family === 'ayah' ? 'whoAyah' : 'whoAdik') })}</Text>
          </View>
        </View>
      ) : null}

      {sparkle ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: '22%', alignItems: 'center' }}>
          <Icon name="check" size={64} />
        </View>
      ) : null}
    </View>
  );
}

export { tap };
