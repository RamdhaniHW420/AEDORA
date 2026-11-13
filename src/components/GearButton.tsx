import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui';
import { sfx } from '@/lib/audio';
import { useT } from '@/lib/i18n';
import { C } from '@/theme';

/** Membuka halaman Pengaturan. Target sentuh 44px. */
export function GearButton({ size = 44 }: { size?: number }) {
  const router = useRouter();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('settingsTitle')}
      onPress={() => {
        sfx('tap');
        router.push('/settings');
      }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff', borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name="gear" size={28} />
    </Pressable>
  );
}
