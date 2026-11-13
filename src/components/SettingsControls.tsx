import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Chip, Icon } from '@/components/ui';
import { sfx } from '@/lib/audio';
import { useLang, useT, type Lang } from '@/lib/i18n';
import { C, F, G, R, T, type GTone } from '@/theme';
import type { ICONS } from '@/game/assets';

/** Baris pengaturan nyala/mati. Status ditulis sebagai teks, bukan hanya warna. */
export function SwitchRow({ label, on, onToggle, icon, tone = 'leaf' }: { label: string; on: boolean; onToggle: () => void; icon: keyof typeof ICONS; tone?: GTone }) {
  const t = useT();
  const g = G[tone];
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      aria-checked={on}
      accessibilityLabel={label}
      onPress={() => {
        sfx('tap');
        onToggle();
      }}
      style={({ pressed }) => ({ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: R.lg, borderWidth: 3, borderBottomWidth: pressed ? 3 : 6, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 8, marginTop: pressed ? 3 : 0 })}
    >
      <View style={{ width: 44, height: 44, borderRadius: R.md, backgroundColor: on ? g.bg : '#E3ECF3', borderWidth: 3, borderColor: on ? g.edge : C.edge, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={26} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.pixelB, fontSize: T.lead + 1, color: C.navy }}>{label}</Text>
        <Text style={{ fontFamily: F.bodyB, fontSize: T.cap, color: on ? g.deep : C.muted }}>{on ? t('switchOn') : t('switchOff')}</Text>
      </View>
      <View style={{ width: 62, height: 34, borderRadius: 17, backgroundColor: on ? g.bg : '#fff', borderWidth: 3, borderColor: on ? g.edge : C.edge, padding: 2, justifyContent: 'center', alignItems: on ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: on ? '#fff' : C.edge, borderWidth: on ? 2 : 0, borderColor: g.edge }} />
      </View>
    </Pressable>
  );
}

const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: 'id', label: 'ID', name: 'Indonesia' },
  { id: 'en', label: 'EN', name: 'English' },
];

/** Pilih bahasa. Berlaku langsung untuk menu, dialog, materi, dan soal berikutnya. */
export function LanguagePick() {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 10 }}>
      {LANGS.map((l) => (
        <Chip key={l.id} label={`${l.label}  ${l.name}`} selected={lang === l.id} onPress={() => lang !== l.id && setLang(l.id)} />
      ))}
    </View>
  );
}
