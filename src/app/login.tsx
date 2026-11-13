import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Btn, Card, Field, Input, Notice } from '@/components/ui';
import { AuthBackdrop } from '@/components/AuthBackdrop';
import { AuthHeader, heroText } from '@/components/AuthHeader';
import { useApp } from '@/store/useApp';
import { useT } from '@/lib/i18n';
import { C, F, G, T } from '@/theme';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const LOGO = require('../../assets/logo_light.png');

export default function Login() {
  const router = useRouter();
  const t = useT();
  const { width } = useWindowDimensions();
  const signIn = useApp((s) => s.signIn);
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const logoW = Math.min(220, width * 0.58);

  const go = async () => {
    setErr('');
    setBusy(true);
    try {
      await signIn(u, p);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#1665D8' }}>
      <AuthBackdrop />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52, gap: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <AuthHeader />
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Image accessibilityLabel="AEDORA" source={LOGO} resizeMode="contain" style={{ width: logoW, height: logoW * 0.753 }} />
          <Text accessibilityRole="header" style={[{ fontFamily: F.pixelB, fontSize: 32 }, heroText]}>{t('loginTitle')}</Text>
          <Text style={[{ fontFamily: F.bodyB, textAlign: 'center', fontSize: T.body }, heroText]}>{t('loginSub')}</Text>
        </View>
        <Card style={{ gap: 14, padding: 18 }}>
          <Field label={t('username')}>
            <Input value={u} onChangeText={setU} autoCapitalize="none" autoCorrect={false} placeholder={t('usernamePhLogin')} />
          </Field>
          <Field label={t('password')}>
            <Input value={p} onChangeText={setP} secureTextEntry placeholder={t('passwordPh')} onSubmitEditing={go} />
          </Field>
          {err ? <Notice text={err} /> : null}
          <Btn label={t('loginBtn')} tone="leaf" onPress={go} loading={busy} />
        </Card>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/register')} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', backgroundColor: '#fff', borderRadius: 999, borderWidth: 3, borderBottomWidth: 5, borderColor: G.blue.edge, paddingHorizontal: 18 }}>
          <Text style={{ fontFamily: F.bodyB, color: C.navy, textAlign: 'center', fontSize: T.body }}>
            {t('noAccount')}
            <Text style={{ color: C.blueDeep, textDecorationLine: 'underline' }}>{t('signUpHere')}</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
