import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Btn, Card, Pop, ScreenHeader, SectionTitle } from '@/components/ui';
import { LanguagePick, SwitchRow } from '@/components/SettingsControls';
import { useApp } from '@/store/useApp';
import { useT } from '@/lib/i18n';
import { C, F, G, T, type GTone } from '@/theme';

function Section({ title, tone, delay, children }: { title: string; tone: GTone; delay: number; children: React.ReactNode }) {
  return (
    <Pop delay={delay}>
      <SectionTitle tone={tone}>{title}</SectionTitle>
      {children}
    </Pop>
  );
}

export default function Settings() {
  const router = useRouter();
  const t = useT();
  const music = useApp((s) => s.music);
  const sfxOn = useApp((s) => s.sfxOn);
  const toggleMusic = useApp((s) => s.toggleMusic);
  const toggleSfx = useApp((s) => s.toggleSfx);
  const signOut = useApp((s) => s.signOut);
  const profile = useApp((s) => s.profile);

  return (
    <View style={{ flex: 1, backgroundColor: C.ice }}>
      <ScreenHeader title={t('settingsTitle')} icon="gear" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 28, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <Section title={t('settingsLanguage')} tone="blue" delay={0}>
          <Card tone="blue" style={{ gap: 12 }}>
            <Text style={{ fontFamily: F.body, color: C.navy, fontSize: T.body, lineHeight: 20 }}>{t('settingsLanguageDesc')}</Text>
            <LanguagePick />
            <Text style={{ fontFamily: F.body, color: C.muted, fontSize: T.cap + 1, lineHeight: 18 }}>{t('settingsNote')}</Text>
          </Card>
        </Section>

        <Section title={t('settingsSound')} tone="grape" delay={70}>
          <View style={{ gap: 10 }}>
            <SwitchRow label={t('musicTitle')} on={music} onToggle={toggleMusic} icon="music" tone="grape" />
            <SwitchRow label={t('sfxTitle')} on={sfxOn} onToggle={toggleSfx} icon="speaker" tone="sun" />
          </View>
        </Section>

        <Section title={t('settingsAccount')} tone="berry" delay={140}>
          <Card style={{ gap: 12 }}>
            {profile ? (
              <View>
                <Text style={{ fontFamily: F.bodyX, fontSize: T.lead, color: C.navy }}>{profile.name}</Text>
                <Text style={{ fontFamily: F.body, fontSize: T.body, color: C.muted }}>@{profile.username}</Text>
              </View>
            ) : null}
            <Btn label={t('logout')} tone="red" onPress={() => void signOut()} />
          </Card>
        </Section>

        <Section title={t('settingsAbout')} tone="aqua" delay={210}>
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: F.bodyX, fontSize: T.lead, color: G.blue.deep }}>AEDORA</Text>
            <Text style={{ fontFamily: F.body, fontSize: T.body, color: C.muted }}>
              {t('settingsVersion')} 1.0.0
            </Text>
          </Card>
        </Section>
      </ScrollView>
    </View>
  );
}
