import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Btn, Card, Chip, Field, Input, Notice, Portrait } from '@/components/ui';
import { AuthBackdrop } from '@/components/AuthBackdrop';
import { AuthHeader, heroText } from '@/components/AuthHeader';
import { useApp } from '@/store/useApp';
import { useT } from '@/lib/i18n';
import { C, F, T } from '@/theme';
import type { AvatarId, Gender } from '@/lib/types';

const GRADES = ['VII', 'VIII', 'IX'];
const CARD = { gap: 14, padding: 18 } as const;

export default function Register() {
  const router = useRouter();
  const t = useT();
  const signUp = useApp((s) => s.signUp);
  const [f, setF] = useState({ name: '', username: '', password: '', school: '', grade: 'VII', classCode: '' });
  const [gender, setGender] = useState<Gender>('L');
  const [avatar, setAvatar] = useState<AvatarId>('boy1');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((o) => ({ ...o, [k]: v }));

  const avatars: AvatarId[] = gender === 'L' ? ['boy1', 'boy2'] : ['girl1', 'girl2'];
  const pickGender = (g: Gender) => {
    setGender(g);
    setAvatar(g === 'L' ? 'boy1' : 'girl1');
  };

  const go = async () => {
    setErr('');
    if (!f.name.trim() || !f.school.trim() || !f.username.trim() || !f.password || !f.classCode.trim()) {
      setErr(t('fillAll'));
      return;
    }
    setBusy(true);
    try {
      await signUp({ ...f, gender, avatar });
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  const genders: [Gender, string][] = [['L', t('male')], ['P', t('female')]];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#1665D8' }}>
      <AuthBackdrop />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52, gap: 16, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
        <AuthHeader />
        <Text style={[{ fontFamily: F.pixelB, fontSize: 30, marginTop: 6 }, heroText]}>{t('registerTitle')}</Text>

        <Card style={CARD}>
          <Text style={{ fontFamily: F.pixelB, fontSize: 18, color: C.blueDeep }}>{t('secAccount')}</Text>
          <Field label={t('username')}>
            <Input value={f.username} onChangeText={set('username')} autoCapitalize="none" autoCorrect={false} placeholder={t('usernamePhRegister')} />
          </Field>
          <Field label={t('password')}>
            <Input value={f.password} onChangeText={set('password')} secureTextEntry placeholder={t('passwordPh')} />
          </Field>
        </Card>

        <Card style={CARD}>
          <Text style={{ fontFamily: F.pixelB, fontSize: 18, color: C.blueDeep }}>{t('secProfile')}</Text>
          <Field label={t('fullName')}>
            <Input value={f.name} onChangeText={set('name')} placeholder={t('fullNamePh')} />
          </Field>
          <Field label={t('school')}>
            <Input value={f.school} onChangeText={set('school')} placeholder={t('schoolPh')} />
          </Field>
          <Field label={t('grade')}>
            <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 8 }}>
              {GRADES.map((g) => (
                <Chip key={g} label={g} selected={f.grade === g} onPress={() => setF((o) => ({ ...o, grade: g }))} />
              ))}
            </View>
          </Field>
          <Field label={t('gender')}>
            <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 8 }}>
              {genders.map(([g, l]) => (
                <Chip key={g} label={l} selected={gender === g} onPress={() => pickGender(g)} />
              ))}
            </View>
          </Field>
          <Field label={t('pickCharacter')}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {avatars.map((a) => (
                <Pressable key={a} accessibilityRole="radio" accessibilityState={{ selected: avatar === a }} onPress={() => setAvatar(a)} style={{ borderRadius: 16, borderWidth: 4, borderColor: avatar === a ? C.blue : 'transparent', backgroundColor: avatar === a ? C.surface : 'transparent', padding: 2 }}>
                  <Portrait who={a} mood="happy" size={92} />
                </Pressable>
              ))}
            </View>
          </Field>
          <Field label={t('classCodeLabel')}>
            <Input value={f.classCode} onChangeText={set('classCode')} autoCapitalize="characters" autoCorrect={false} placeholder={t('classCodePh')} mono />
          </Field>
        </Card>

        {err ? <Notice text={err} /> : null}
        <Btn label={t('registerBtn')} tone="leaf" onPress={go} loading={busy} />
        <Pressable accessibilityRole="link" onPress={() => router.replace('/login')} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 18 }}>
          <Text style={{ fontFamily: F.bodyB, color: C.navy, textAlign: 'center', fontSize: T.body }}>
            {t('haveAccount')}
            <Text style={{ color: C.blueDeep, textDecorationLine: 'underline' }}>{t('signInLink')}</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
