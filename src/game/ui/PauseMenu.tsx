import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Icon, Pop } from '@/components/ui';
import { LanguagePick, SwitchRow } from '@/components/SettingsControls';
import { useApp } from '@/store/useApp';
import { sfx } from '@/lib/audio';
import { useT } from '@/lib/i18n';
import { C, F, G, R, T } from '@/theme';

/** Tombol jeda melayang. Selalu ada di pojok kanan atas selama bab berjalan. */
export function PauseButton({ onPress }: { onPress: () => void }) {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('pauseOpen')}
      hitSlop={6}
      onPress={() => {
        sfx('tap');
        onPress();
      }}
      style={({ pressed }) => ({ position: 'absolute', right: 10, top: Math.max(insets.top, 10) + 4, zIndex: 30, width: 48, height: 48, borderRadius: 24, backgroundColor: G.navy.bg, borderWidth: 3, borderBottomWidth: pressed ? 3 : 5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' })}
    >
      <Icon name="gear" size={28} />
    </Pressable>
  );
}

/** Menu jeda: musik, efek suara, bahasa, lanjut, keluar. Bahasa berubah langsung tanpa memulai ulang bab. */
export function PauseMenu({ onResume, onLeave }: { onResume: () => void; onLeave: () => void }) {
  const t = useT();
  const music = useApp((s) => s.music);
  const sfxOn = useApp((s) => s.sfxOn);
  const toggleMusic = useApp((s) => s.toggleMusic);
  const toggleSfx = useApp((s) => s.toggleSfx);
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 50, backgroundColor: 'rgba(8,28,48,0.72)', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
      <Pop style={{ width: '100%', maxWidth: 440 }}>
        <View accessibilityViewIsModal style={{ backgroundColor: C.ice, borderRadius: R.xl, borderWidth: 4, borderBottomWidth: 8, borderColor: G.blue.edge, overflow: 'hidden' }}>
          <View style={{ backgroundColor: G.blue.bg, paddingVertical: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="gear" size={30} />
            <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, fontSize: T.hero - 4, color: '#fff' }}>{t('pauseTitle')}</Text>
          </View>
          <View style={{ padding: 16, gap: 12 }}>
            <SwitchRow label={t('musicTitle')} on={music} onToggle={toggleMusic} icon="music" tone="grape" />
            <SwitchRow label={t('sfxTitle')} on={sfxOn} onToggle={toggleSfx} icon="speaker" tone="sun" />
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: F.pixelB, fontSize: T.lead + 1, color: C.navy }}>{t('langTitle')}</Text>
              <LanguagePick />
              <Text style={{ fontFamily: F.body, fontSize: T.cap + 1, lineHeight: 18, color: C.muted }}>{t('pauseLangNote')}</Text>
            </View>
            <Btn label={t('pauseResume')} tone="leaf" onPress={onResume} />
            <Btn label={t('pauseLeave')} tone="white" onPress={onLeave} />
          </View>
        </View>
      </Pop>
    </View>
  );
}
