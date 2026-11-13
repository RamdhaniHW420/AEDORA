import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { C, F, G, R, T, type GTone } from '@/theme';
import { Btn, Card, Icon, Portrait, ShieldRating } from '@/components/ui';
import { sfx } from '@/lib/audio';
import { useReduceMotion } from '@/lib/motion';
import { useLang, useT } from '@/lib/i18n';
import { computeFinal } from '@/game/logic/scoring';
import { placeFor } from '@/game/data/places';
import type { Progress } from '@/lib/types';

const GRADE_TONE: Record<string, GTone> = { A: 'leaf', B: 'blue', C: 'sun', D: 'red' };

function Row({ label, value, weight, tone, reduce }: { label: string; value: number; weight: string; tone: GTone; reduce: boolean }) {
  const w = useRef(new Animated.Value(reduce ? value : 0)).current;
  useEffect(() => {
    if (!reduce) Animated.timing(w, { toValue: value, duration: 900, useNativeDriver: false }).start();
  }, [value, w, reduce]);
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: F.bodyB, color: C.navy, fontSize: T.body }}>
          {label} <Text style={{ color: C.muted, fontSize: T.cap }}>({weight})</Text>
        </Text>
        <Text style={{ fontFamily: F.bodyX, color: C.navy, fontSize: T.lead }}>{value}</Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: value }} style={{ height: 16, borderRadius: 8, backgroundColor: C.ice, borderWidth: 2, borderColor: C.line, overflow: 'hidden' }}>
        <Animated.View style={{ height: 12, backgroundColor: G[tone].bg, width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
      </View>
    </View>
  );
}

export function ReportCard({ progress, onNext }: { progress: Progress; onNext: () => void }) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const reduce = useReduceMotion();
  const f = computeFinal(progress);
  const stamp = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    sfx('levelup');
    if (!reduce) Animated.sequence([Animated.delay(900), Animated.spring(stamp, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true })]).start();
  }, [stamp, reduce]);

  const all = [...Object.values(progress.schoolResults), ...Object.values(progress.homeResults)];
  const best = [...all].sort((a, b) => b.score - a.score)[0];
  const worst = [...all].sort((a, b) => a.score - b.score)[0];
  const larvae = all.filter((r) => r.finding === 'larvae').reduce((s, r) => s + r.larvaeCount, 0);
  const family = all.filter((r) => r.family).length;
  const gt = G[GRADE_TONE[f.grade] ?? 'blue'];
  const gc = gt.deep;
  const bestName = best ? placeFor(best.placeId, lang)?.name.toLowerCase() ?? '' : '';
  const worstName = worst ? placeFor(worst.placeId, lang)?.name.toLowerCase() ?? '' : '';

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.ice }}>
      <View style={{ backgroundColor: G.grape.bg, paddingTop: 46, paddingBottom: 14, paddingLeft: 18, paddingRight: 70, borderBottomWidth: 5, borderColor: G.grape.edge, gap: 2 }}>
        <Text style={{ fontFamily: F.pixelB, fontSize: T.body, color: '#fff' }}>{t('reportTitle')}</Text>
        <Text accessibilityRole="header" numberOfLines={1} style={{ fontFamily: F.pixelB, fontSize: T.hero, color: '#fff' }}>{progress.name}</Text>
        <Text style={{ fontFamily: F.body, fontSize: T.body, color: '#fff' }}>{t('reportClass', { school: progress.school, grade: progress.grade })}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 28, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' }}>

        <Card border={G.grape.edge} style={{ gap: 14, padding: 16 }}>
          <Row reduce={reduce} label={t('rowQuiz')} value={f.quiz} weight="30%" tone="blue" />
          <Row reduce={reduce} label={t('rowSchool')} value={f.school} weight="30%" tone="sun" />
          <Row reduce={reduce} label={t('rowHome')} value={f.home} weight="40%" tone="berry" />
          <View style={{ height: 2, backgroundColor: C.line }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontFamily: F.bodyB, color: C.muted, fontSize: T.body }}>{t('finalLabel')}</Text>
              <Text style={{ fontFamily: F.pixelB, fontSize: 60, color: gc }}>{f.score}</Text>
            </View>
            <Animated.View accessible accessibilityLabel={f.grade} style={{ width: 104, height: 104, borderRadius: 52, borderWidth: 8, borderColor: gt.edge, backgroundColor: gt.soft, alignItems: 'center', justifyContent: 'center', transform: [{ scale: stamp.interpolate({ inputRange: [0, 1], outputRange: [2.4, 1] }) }, { rotate: '-10deg' }], opacity: stamp }}>
              <Text style={{ fontFamily: F.pixelB, fontSize: 60, color: gc }}>{f.grade}</Text>
            </Animated.View>
          </View>
        </Card>

        <ShieldRating score={f.score} size={40} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([
            { icon: 'mosq', label: t('statLarvae'), v: String(larvae), tone: 'red' },
            { icon: 'family', label: t('statFamily'), v: String(family), tone: 'leaf' },
            { icon: 'quiz', label: t('statBestQuiz'), v: `${progress.quiz.best}/10`, tone: 'grape' },
          ] as { icon: string; label: string; v: string; tone: GTone }[]).map((x) => (
            <View key={x.label} accessible accessibilityLabel={`${x.label}: ${x.v}`} style={{ flex: 1, backgroundColor: G[x.tone].soft, borderRadius: R.md, padding: 10, alignItems: 'center', gap: 4, borderWidth: 3, borderBottomWidth: 5, borderColor: G[x.tone].edge }}>
              <Icon name={x.icon as never} size={30} />
              <Text style={{ fontFamily: F.pixelB, fontSize: T.title + 2, color: C.navy }}>{x.v}</Text>
              <Text style={{ fontFamily: F.body, fontSize: T.cap, color: C.muted, textAlign: 'center' }}>{x.label}</Text>
            </View>
          ))}
        </View>

        <Card tone="grape" style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 12 }}>
          <Portrait who="teacher" mood={f.score >= 65 ? 'happy' : 'worried'} size={56} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontFamily: F.bodyX, fontSize: T.body, color: C.navy }}>{t('noteTitle')}</Text>
            <Text style={{ fontFamily: F.body, fontSize: T.body, lineHeight: 21, color: C.navy }}>
              {best ? t('noteBest', { place: bestName, score: best.score }) : ''}
              {worst && best && worst.placeId !== best.placeId ? ` ${t('noteWorst', { place: worstName, score: worst.score, tip: worst.score < 50 ? t('noteTipLow') : t('noteTipMid') })}` : ''}
            </Text>
          </View>
        </Card>
        <Btn label={t('seeEnding')} tone="leaf" onPress={onNext} />
      </ScrollView>
    </View>
  );
}
