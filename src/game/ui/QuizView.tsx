import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, G, R, T, type GTone } from '@/theme';
import { Btn, Card, Icon, Pill, Portrait, Pop, ShieldRating, XPBar } from '@/components/ui';
import { fetchQuiz } from '@/lib/ai';
import { sfx, tap } from '@/lib/audio';
import { useReduceMotion } from '@/lib/motion';
import { useLang, useT } from '@/lib/i18n';
import type { QuizQuestion } from '@/lib/types';
import { QUIZ_TOTAL } from '@/game/logic/scoring';

interface Props {
  onFinish: (score: number, source: 'ai' | 'bank') => void;
  onBack?: () => void;
}

// Tombol jawaban A sampai D tiap huruf punya warna sendiri.
const OPT_TONES: GTone[] = ['blue', 'sun', 'berry', 'grape'];

const fill = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.ice } as const;

export function QuizView({ onFinish, onBack }: Props) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [qs, setQs] = useState<QuizQuestion[] | null>(null);
  const [source, setSource] = useState<'ai' | 'bank'>('bank');
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;

  const load = () => {
    setQs(null);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setDone(false);
    void fetchQuiz(QUIZ_TOTAL, lang).then((r) => {
      setQs(r.questions);
      setSource(r.source);
    });
  };
  useEffect(load, []);

  useEffect(() => {
    if (reduce) return;
    const l = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, [spin, reduce]);

  const top = Math.max(insets.top, 10) + 12;
  const back = onBack ? (
    <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={onBack} style={{ minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#fff', borderWidth: 3, borderBottomWidth: 5, borderColor: G.blue.edge }}>
      <Text style={{ fontFamily: F.bodyX, color: C.navy, fontSize: T.body }}>{'‹'}</Text>
      <Text style={{ fontFamily: F.bodyX, color: C.navy, fontSize: T.body }}>{t('back')}</Text>
    </Pressable>
  ) : null;

  if (!qs) {
    return (
      <View style={fill}>
        <View style={{ paddingTop: top, paddingHorizontal: 16 }}>{back}</View>
        <View accessibilityLiveRegion="polite" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 30 }}>
          <Portrait who="teacher" mood="happy" size={104} />
          <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
            <Icon name="clock" size={40} />
          </Animated.View>
          <Text style={{ fontFamily: F.pixelB, fontSize: T.title, color: C.navy, textAlign: 'center' }}>{t('quizPreparing')}</Text>
          <Text style={{ fontFamily: F.body, color: C.muted, fontSize: T.body, textAlign: 'center', lineHeight: 20 }}>{t('quizPreparingSub')}</Text>
        </View>
      </View>
    );
  }

  if (done) {
    const pct = Math.round((score / Math.max(qs.length, 1)) * 100);
    return (
      <View style={fill}>
        <View style={{ paddingTop: top, paddingHorizontal: 16 }}>{back}</View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
          <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, fontSize: T.hero + 4, color: C.navy }}>{t('quizDone')}</Text>
          <Pop><ShieldRating score={pct} size={52} /></Pop>
          <Text style={{ fontFamily: F.pixelB, fontSize: 64, color: G.blue.deep }}>
            {score}
            <Text style={{ fontSize: 30, color: C.muted }}> / {qs.length}</Text>
          </Text>
          <Text style={{ fontFamily: F.body, fontSize: T.body, color: C.muted, textAlign: 'center' }}>{source === 'ai' ? t('quizSourceAi') : t('quizSourceBank')}</Text>
          <View style={{ width: '100%', maxWidth: 420, gap: 10, marginTop: 10 }}>
            <Btn label={t('quizContinue')} tone="leaf" onPress={() => onFinish(score, source)} />
            <Btn label={t('quizRetry')} tone="white" onPress={load} />
          </View>
        </View>
      </View>
    );
  }

  const q = qs[idx];
  const answered = picked !== null;
  const right = picked === q.answerIndex;
  const choose = (k: number) => {
    if (answered) return;
    setPicked(k);
    const ok = k === q.answerIndex;
    setStreak((s) => (ok ? s + 1 : 0));
    if (ok) setScore((s) => s + 1);
    sfx(ok ? 'correct' : 'wrong');
    tap(ok ? 'success' : 'warning');
  };
  const next = () => {
    if (idx + 1 >= qs.length) setDone(true);
    else {
      setIdx(idx + 1);
      setPicked(null);
    }
  };

  return (
    <View style={fill}>
      <View style={{ paddingTop: top, paddingLeft: 16, paddingRight: onBack ? 16 : 70, paddingBottom: 10, gap: 10 }}>
        {back}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, fontSize: T.title, color: C.navy }}>{t('quizCounter', { n: idx + 1, total: qs.length })}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {streak >= 2 ? <Pill icon="flag" tone="sun" text={t('quizStreak', { n: streak })} /> : null}
            <Pill icon="shield" tone="leaf" text={String(score)} />
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <XPBar value={idx + (answered ? 1 : 0)} max={qs.length} segments={qs.length} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <Card tone="blue">
          <Text style={{ fontFamily: F.bodyB, fontSize: T.lead + 2, lineHeight: 26, color: C.navy }}>{q.q}</Text>
        </Card>
        {q.options.map((o, k) => {
          const isAns = k === q.answerIndex;
          const isPick = k === picked;
          const showRight = answered && isAns;
          const showWrong = answered && isPick && !isAns;
          const g = G[OPT_TONES[k % 4]];
          return (
            <Pop key={`${idx}-${k}`} delay={k * 50}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: answered, selected: isPick }}
                accessibilityLabel={`${String.fromCharCode(65 + k)}. ${o}${showRight ? `. ${t('quizRight')}` : showWrong ? `. ${t('quizYours')}` : ''}`}
                onPress={() => choose(k)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, backgroundColor: showRight ? G.leaf.soft : showWrong ? G.red.soft : '#fff', borderRadius: R.md + 2, borderWidth: 3, borderBottomWidth: pressed && !answered ? 3 : 6, borderColor: showRight ? G.leaf.edge : showWrong ? G.red.edge : C.edge, padding: 12, opacity: answered && !isAns && !isPick ? 0.75 : 1, marginTop: pressed && !answered ? 3 : 0 })}
              >
                <View style={{ width: 34, height: 34, borderRadius: R.sm + 2, backgroundColor: showRight ? G.leaf.bg : showWrong ? G.red.bg : g.bg, borderWidth: 3, borderColor: showRight ? G.leaf.edge : showWrong ? G.red.edge : g.edge, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: showWrong ? '#fff' : showRight ? G.leaf.text : g.text, fontFamily: F.pixelB, fontSize: T.lead }}>{String.fromCharCode(65 + k)}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: F.bodyB, fontSize: T.lead, color: C.navy }}>{o}</Text>
                {showRight ? <Icon name="check" size={26} /> : null}
                {showWrong ? <Icon name="cross" size={26} /> : null}
              </Pressable>
            </Pop>
          );
        })}
        {answered ? (
          <View accessibilityLiveRegion="polite" style={{ backgroundColor: right ? G.leaf.soft : G.sun.soft, borderRadius: R.md, borderWidth: 3, borderBottomWidth: 5, borderColor: right ? G.leaf.edge : G.sun.edge, padding: 14, gap: 4 }}>
            <Text style={{ fontFamily: F.pixelB, fontSize: T.lead, color: right ? G.leaf.deep : G.sun.deep }}>{right ? t('quizCorrect') : t('quizWrong')}</Text>
            <Text style={{ fontFamily: F.body, fontSize: T.body + 1, lineHeight: 22, color: C.navy }}>{q.explanation}</Text>
          </View>
        ) : null}
      </ScrollView>
      {answered ? (
        <View style={{ padding: 14, paddingBottom: Math.max(insets.bottom, 14), backgroundColor: '#fff', borderTopWidth: 3, borderColor: C.line }}>
          <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
            <Btn label={idx + 1 >= qs.length ? t('quizSeeResult') : t('quizNext')} tone={right ? 'leaf' : 'sun'} onPress={next} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
