import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { C, F, G, R, T, type GTone } from '@/theme';
import { Icon, Portrait } from '@/components/ui';
import { storyFor, type Line, type Speaker } from '@/game/data/story';
import { sfx } from '@/lib/audio';
import { useReduceMotion } from '@/lib/motion';
import { useLang, useT } from '@/lib/i18n';
import type { AvatarId } from '@/lib/types';

// Tiap pembicara punya warna sendiri supaya pemain mengenali siapa yang bicara tanpa membaca nama.
const SPEAKER_TONE: Record<Speaker, GTone> = {
  teacher: 'grape', dora: 'aqua', ibu: 'berry', ayah: 'sun', adik: 'leaf', player: 'blue', narrator: 'navy',
  raka: 'lemon', dimas: 'red', tika: 'leaf', nadia: 'aqua', sari: 'grape', bayu: 'sun', wulan: 'berry', joko: 'navy', tini: 'sun', nenek: 'berry',
};

interface Props {
  lines: Line[];
  playerName: string;
  avatar: AvatarId;
  onDone: () => void;
  dim?: boolean;
}

export function DialogBox({ lines, playerName, avatar, onDone, dim }: Props) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const reduce = useReduceMotion();
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const line = lines[i];
  const full = line?.text ?? '';
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduce) {
      setShown(full.length);
      return;
    }
    setShown(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setShown((s) => {
        if (s >= full.length) {
          if (timer.current) clearInterval(timer.current);
          return s;
        }
        return s + 1;
      });
    }, 20);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [i, full, reduce]);

  if (!line) return null;
  const typing = shown < full.length;
  const last = i + 1 >= lines.length;
  const speakerName = line.who === 'player' ? playerName.split(/\s+/)[0] : storyFor(lang).SPEAKER_NAME[line.who];
  const tone = G[SPEAKER_TONE[line.who]];
  const portraitKey = line.who === 'player' ? avatar : line.who === 'narrator' ? null : line.who;

  const next = () => {
    if (typing) {
      setShown(full.length);
      return;
    }
    sfx('tap');
    if (last) onDone();
    else setI(i + 1);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${speakerName ? `${speakerName}: ` : ''}${full}`}
      accessibilityHint={last ? t('dialogEnd') : t('dialogNext')}
      onPress={next}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'flex-end', backgroundColor: dim ? 'rgba(8,24,44,0.4)' : 'transparent' }}
    >
      <View style={{ margin: 12, marginBottom: 22, flexDirection: 'row', gap: 10, alignItems: 'flex-end', width: '100%', maxWidth: 560, alignSelf: 'center', paddingRight: 24 }}>
        {portraitKey ? <Portrait who={portraitKey} mood={line.mood ?? 'neutral'} size={84} style={{ borderWidth: 4, borderColor: tone.edge, borderRadius: R.md }} /> : null}
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: R.lg, borderWidth: 4, borderBottomWidth: 8, borderColor: tone.edge, padding: 14, paddingTop: 20, minHeight: 104 }}>
          {speakerName ? (
            <View style={{ position: 'absolute', top: -17, left: 12, backgroundColor: tone.bg, borderWidth: 3, borderColor: tone.edge, borderRadius: R.sm + 2, paddingHorizontal: 12, paddingVertical: 2 }}>
              <Text style={{ fontFamily: F.pixelB, fontSize: T.body + 1, color: tone.text }}>{speakerName}</Text>
            </View>
          ) : null}
          <Text style={{ fontFamily: F.body, fontSize: T.lead, lineHeight: 24, color: C.navy, fontStyle: line.who === 'narrator' ? 'italic' : 'normal', paddingBottom: 14 }}>{full.slice(0, shown)}</Text>
          <View style={{ position: 'absolute', right: 10, bottom: 6, opacity: typing ? 0.3 : 1 }}>
            {last ? <Icon name="check" size={20} /> : <Text style={{ fontFamily: F.bodyX, color: tone.deep, fontSize: T.title + 2, lineHeight: 22 }}>{'›'}</Text>}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
