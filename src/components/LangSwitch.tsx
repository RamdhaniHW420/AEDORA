import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLang, type Lang } from '@/lib/i18n';
import { sfx } from '@/lib/audio';
import { C, F, G } from '@/theme';

const OPTIONS: { id: Lang; label: string; name: string }[] = [
  { id: 'id', label: 'ID', name: 'Bahasa Indonesia' },
  { id: 'en', label: 'EN', name: 'English' },
];

/** Pemilih bahasa ID | EN untuk pojok kanan atas. Tiap segmen 44px agar mudah ditekan. */
export function LangSwitch() {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 999, padding: 3, borderWidth: 3, borderBottomWidth: 5, borderColor: G.blue.edge }}>
      {OPTIONS.map((o) => {
        const on = lang === o.id;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityLabel={o.name}
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (!on) {
                sfx('tap');
                setLang(o.id);
              }
            }}
            style={{ minWidth: 44, minHeight: 38, paddingHorizontal: 10, borderRadius: 999, backgroundColor: on ? G.lemon.bg : 'transparent', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: F.pixelB, fontSize: 15, color: C.navy }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
