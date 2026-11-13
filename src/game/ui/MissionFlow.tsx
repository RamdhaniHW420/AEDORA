import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { C, F, G, R, T, type GTone } from '@/theme';
import { Btn, Card, Icon, Portrait, Pop, ShieldRating } from '@/components/ui';
import { useReduceMotion } from '@/lib/motion';
import { useT } from '@/lib/i18n';
import { ScanView } from '@/game/scan/ScanView';
import { ActionCutscene } from '@/game/ui/ActionCutscene';
import { Closeup } from '@/game/ui/Closeup';
import { Confetti } from '@/game/ui/Confetti';
import { sfx, tap } from '@/lib/audio';
import { tierOf } from '@/game/logic/scoring';
import type { Choice, Place } from '@/game/data/places';
import type { Finding, PlaceResult } from '@/lib/types';
import type { AnalysisResult } from '@/lib/ai';

export const HOME_SOLO_CAP = 90;

// Sekolah memakai warna bab 2 (jingga), rumah memakai warna bab 3 (merah muda).
const areaTone = (a: 'school' | 'home'): GTone => (a === 'school' ? 'sun' : 'berry');
const CHOICE_TONES: GTone[] = ['aqua', 'sun', 'grape', 'lemon', 'blue'];

function MissionBar({ tone, title }: { tone: GTone; title: string }) {
  const g = G[tone];
  return (
    <View style={{ backgroundColor: g.bg, paddingTop: 46, paddingBottom: 12, paddingLeft: 16, paddingRight: 70, borderBottomWidth: 5, borderColor: g.edge }}>
      <Text accessibilityRole="header" numberOfLines={1} style={{ fontFamily: F.pixelB, fontSize: T.title, color: g.text }}>{title}</Text>
    </View>
  );
}

interface Props {
  place: Place;
  finding: Finding;
  count: number;
  onComplete: (r: PlaceResult) => void;
  onCancel: () => void;
}

export function MissionFlow({ place, finding, count, onComplete, onCancel }: Props) {
  const { width } = useWindowDimensions();
  const t = useT();
  const [stage, setStage] = useState<'scan' | 'choose' | 'action' | 'feedback'>('scan');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [capped, setCapped] = useState(false);
  const [score, setScore] = useState(0);

  const pick = (c: Choice) => {
    let sc = c.scores[finding];
    let cap = false;
    if (place.area === 'home' && !c.family && sc > HOME_SOLO_CAP) {
      sc = HOME_SOLO_CAP;
      cap = true;
    }
    setChoice(c);
    setScore(sc);
    setCapped(cap);
    setStage('action');
    sfx('select');
    tap('medium');
  };

  if (stage === 'scan') {
    return (
      <ScanView
        place={place}
        finding={finding}
        count={count}
        onCancel={onCancel}
        onNext={(a) => {
          setAnalysis(a);
          setStage('choose');
        }}
      />
    );
  }

  if (stage === 'choose') {
    const W = Math.min(width - 32, 360);
    return (
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.ice }}>
        <MissionBar tone={areaTone(place.area)} title={place.name} />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 12, alignItems: 'center' }}>
          <Closeup k={place.closeup} width={W} finding={finding} count={count} safeWater={place.safeWater} style={{ borderWidth: 4, borderColor: G[areaTone(place.area)].edge, borderRadius: R.md }} />
          <Card tone="aqua" style={{ alignSelf: 'stretch', flexDirection: 'row', gap: 10, padding: 10 }}>
            <Portrait who="dora" mood={finding === 'safe' ? 'happy' : 'worried'} size={52} />
            <Text style={{ flex: 1, fontFamily: F.bodyB, fontSize: T.body, lineHeight: 20, color: C.navy }}>
              {t('chooseQ', { headline: analysis?.headline ?? '', place: place.name.toLowerCase() })}
            </Text>
          </Card>
          {place.area === 'home' ? <Text style={{ alignSelf: 'stretch', fontFamily: F.body, fontSize: T.cap + 1, color: C.muted }}>{t('chooseTip')}</Text> : null}
          {place.choices.map((c, n) => {
            const g = G[c.family ? 'leaf' : CHOICE_TONES[n % CHOICE_TONES.length]];
            return (
              <Pop key={c.id} delay={n * 60} style={{ alignSelf: 'stretch' }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${c.label}. ${c.sub}`}
                  onPress={() => pick(c)}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68, backgroundColor: g.soft, borderRadius: R.md + 2, borderWidth: 3, borderBottomWidth: pressed ? 3 : 6, borderColor: g.edge, padding: 12, marginTop: pressed ? 3 : 0 })}
                >
                  <View style={{ width: 48, height: 48, borderRadius: R.md, backgroundColor: g.bg, borderWidth: 3, borderBottomWidth: 5, borderColor: g.edge, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={c.icon as never} size={30} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.bodyX, fontSize: T.lead, color: C.navy }}>{c.label}</Text>
                    <Text style={{ fontFamily: F.body, fontSize: T.cap + 1, color: C.muted }}>{c.sub}</Text>
                  </View>
                </Pressable>
              </Pop>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  if (stage === 'action' && choice) {
    return <ActionCutscene place={place} anim={choice.anim} finding={finding} count={count} family={choice.family} onDone={() => setStage('feedback')} />;
  }

  if (stage === 'feedback' && choice) {
    return (
      <Feedback
        place={place}
        choice={choice}
        score={score}
        capped={capped}
        finding={finding}
        onNext={() =>
          onComplete({
            placeId: place.id,
            area: place.area,
            finding,
            larvaeCount: finding === 'larvae' ? count : 0,
            actionId: choice.id,
            actionLabel: choice.label,
            score,
            family: !!choice.family,
            at: Date.now(),
          })
        }
      />
    );
  }
  return null;
}

function Feedback({ place, choice, score, capped, finding, onNext }: { place: Place; choice: Choice; score: number; capped: boolean; finding: Finding; onNext: () => void }) {
  const t = useT();
  const reduce = useReduceMotion();
  const tier = tierOf(score);
  const shown = useRef(new Animated.Value(0)).current;
  const [n, setN] = useState(0);
  const pop = useRef(new Animated.Value(reduce ? 1 : 0)).current;

  useEffect(() => {
    sfx(tier === 'bad' ? 'wrong' : tier === 'ok' ? 'coin' : 'levelup');
    const id = shown.addListener(({ value }) => setN(Math.round(value)));
    Animated.timing(shown, { toValue: score, duration: 1100, useNativeDriver: false }).start();
    if (!reduce) Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    return () => shown.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tg = G[tier === 'great' ? 'leaf' : tier === 'ok' ? 'sun' : 'red'];
  const color = tg.deep;
  const title = tier === 'great' ? t('fbGreat') : tier === 'ok' ? t('fbOk') : t('fbBad');
  const dora = tier === 'great' ? 'happy' : tier === 'ok' ? 'neutral' : 'worried';
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.ice }}>
      {tier === 'great' && !reduce ? <Confetti count={30} /> : null}
      <MissionBar tone={tier === 'great' ? 'leaf' : tier === 'ok' ? 'sun' : 'red'} title={title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28, gap: 14, alignItems: 'center' }}>
        <Animated.View accessible accessibilityLabel={`${score} ${t('outOf100')}`} style={{ transform: [{ scale: pop }], alignItems: 'center', justifyContent: 'center', width: 150, height: 150, borderRadius: 75, backgroundColor: '#fff', borderWidth: 8, borderBottomWidth: 12, borderColor: tg.edge }}>
          <Text style={{ fontFamily: F.pixelB, fontSize: 52, color }}>{n}</Text>
          <Text style={{ fontFamily: F.bodyB, fontSize: T.cap, color: C.muted, marginTop: -4 }}>{t('outOf100')}</Text>
        </Animated.View>
        <ShieldRating score={score} size={34} />
        <Text style={{ fontFamily: F.bodyX, fontSize: T.lead, color: C.navy, textAlign: 'center' }}>{choice.label}</Text>
        <Card tone="aqua" style={{ alignSelf: 'stretch', flexDirection: 'row', gap: 10, padding: 12 }}>
          <Portrait who="dora" mood={dora} size={56} />
          <Text style={{ flex: 1, fontFamily: F.body, fontSize: T.body + 1, lineHeight: 22, color: C.navy }}>{choice.why}</Text>
        </Card>
        {finding === 'larvae' && choice.id.startsWith('biarkan') ? (
          <View style={{ alignSelf: 'stretch', flexDirection: 'row', gap: 10, backgroundColor: G.red.soft, borderRadius: R.md, padding: 12, borderWidth: 3, borderColor: G.red.edge }}>
            <Icon name="mosq" size={28} />
            <Text style={{ flex: 1, fontFamily: F.bodyB, fontSize: T.body, lineHeight: 20, color: '#8E1C1D' }}>{t('fbLarvaeWarn')}</Text>
          </View>
        ) : null}
        {capped ? (
          <View style={{ alignSelf: 'stretch', flexDirection: 'row', gap: 10, backgroundColor: G.blue.soft, borderRadius: R.md, padding: 12, borderWidth: 3, borderColor: G.blue.edge }}>
            <Icon name="family" size={28} />
            <Text style={{ flex: 1, fontFamily: F.bodyB, fontSize: T.body, lineHeight: 20, color: C.navy }}>{t('fbCapped', { n: score })}</Text>
          </View>
        ) : null}
        {choice.family ? (
          <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: G.leaf.soft, borderRadius: R.md, padding: 12, borderWidth: 3, borderColor: G.leaf.edge }}>
            <Icon name="family" size={28} />
            <Text style={{ flex: 1, fontFamily: F.bodyB, fontSize: T.body, color: C.navy }}>{t('fbFamily')}</Text>
          </View>
        ) : null}
        <Card style={{ alignSelf: 'stretch', flexDirection: 'row', gap: 10, padding: 12 }}>
          <Icon name="book" size={28} />
          <Text style={{ flex: 1, fontFamily: F.body, fontSize: T.body, lineHeight: 20, color: C.navy }}>{t('fbFact', { edu: place.edu })}</Text>
        </Card>
        <Btn label={t('fbNext')} tone="leaf" onPress={onNext} style={{ alignSelf: 'stretch' }} />
      </ScrollView>
    </View>
  );
}
