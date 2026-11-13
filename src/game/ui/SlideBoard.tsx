import React, { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { C, F, G, R, T, type GTone } from '@/theme';
import { SLIDES } from '@/game/assets';
import { slidesFor } from '@/game/data/content';
import { Btn, Card, Portrait, Pop } from '@/components/ui';
import { useLang, useT } from '@/lib/i18n';

/** Warna butir poin bergilir supaya tiap poin mudah dibedakan. */
export const POINT_TONES: GTone[] = ['leaf', 'sun', 'berry', 'aqua', 'grape'];

export function SlideBoard({ onDone, doneLabel, showTeacher = true }: { onDone: () => void; doneLabel?: string; showTeacher?: boolean }) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const data = slidesFor(lang);
  const [i, setI] = useState(0);
  const s = data[i];
  const last = i === data.length - 1;
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.ice }}>
      <View style={{ backgroundColor: G.leaf.bg, paddingTop: 46, paddingBottom: 12, paddingLeft: 16, paddingRight: 70, borderBottomWidth: 5, borderColor: G.leaf.edge }}>
        <Text accessibilityLiveRegion="polite" style={{ fontFamily: F.pixelB, fontSize: T.cap + 1, color: G.leaf.text, marginBottom: 6 }}>{t('slideCounter', { i: i + 1, n: data.length })}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {data.map((d, k) => (
            <View key={d.id} style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: k <= i ? '#fff' : 'rgba(22,59,94,0.22)', borderWidth: 2, borderColor: k <= i ? G.leaf.edge : 'transparent' }} />
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <Pop key={s.id}>
          <Card style={{ padding: 0, overflow: 'hidden', borderColor: G.leaf.edge }}>
            <Image accessibilityLabel={s.title} source={SLIDES[s.image]} resizeMode="stretch" style={{ width: '100%', aspectRatio: 96 / 60 }} />
          </Card>
        </Pop>
        <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, fontSize: T.hero, color: G.leaf.deep }}>{s.title}</Text>
        {showTeacher ? (
          <Card tone="grape" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 }}>
            <Portrait who="teacher" mood="happy" size={56} />
            <Text style={{ flex: 1, fontFamily: F.bodyB, fontSize: T.body, lineHeight: 20, color: C.navy }}>{s.teacher}</Text>
          </Card>
        ) : null}
        <View style={{ gap: 10 }}>
          {s.points.map((pt, k) => {
            const g = G[POINT_TONES[k % POINT_TONES.length]];
            return (
              <View key={k} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <View style={{ width: 30, height: 30, borderRadius: R.sm + 2, backgroundColor: g.bg, borderWidth: 3, borderBottomWidth: 5, borderColor: g.edge, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: g.text, fontFamily: F.pixelB, fontSize: T.body }}>{k + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: F.body, fontSize: T.lead, lineHeight: 23, color: C.navy }}>{pt}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={{ padding: 14, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 3, borderColor: C.line }}>
        <View style={{ flexDirection: 'row', gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <Btn label={t('back')} tone="white" disabled={i === 0} onPress={() => setI(i - 1)} style={{ flex: 1 }} />
          <Btn label={last ? (doneLabel ?? t('slideToQuiz')) : t('slideNext')} tone={last ? 'sun' : 'leaf'} onPress={() => (last ? onDone() : setI(i + 1))} style={{ flex: 2 }} />
        </View>
      </View>
    </View>
  );
}
