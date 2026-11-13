import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LangSwitch } from '@/components/LangSwitch';
import { useT } from '@/lib/i18n';
import { F, G, T } from '@/theme';

/** Baris atas layar masuk dan daftar: tombol kembali di kiri, pilihan bahasa di kanan. */
export function AuthHeader() {
  const router = useRouter();
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={() => router.back()} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: G.navy.bg, borderRadius: 999, borderWidth: 3, borderBottomWidth: 5, borderColor: '#fff', paddingHorizontal: 16 }}>
        <Text style={{ fontFamily: F.pixelB, color: '#fff', fontSize: T.body }}>{'‹'}</Text>
        <Text style={{ fontFamily: F.pixelB, color: '#fff', fontSize: T.body }}>{t('back')}</Text>
      </Pressable>
      <LangSwitch />
    </View>
  );
}

export const heroText = {
  color: '#fff',
  textShadowColor: 'rgba(8,40,90,0.7)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 6,
} as const;
