import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Input, Portrait, ScreenHeader } from '@/components/ui';
import { askDora } from '@/lib/ai';
import { sfx } from '@/lib/audio';
import { useLang, useT, type Key } from '@/lib/i18n';
import { C, F, G, R, T } from '@/theme';

type Msg = { role: 'user' | 'model'; text: string };
const SUGGEST: Key[] = ['chatSuggest1', 'chatSuggest2', 'chatSuggest3', 'chatSuggest4'];

export default function AiChat() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const lang = useLang((s) => s.lang);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef<FlatList<Msg>>(null);

  // Sapaan mengikuti bahasa terpilih dan tidak dikirim ke server.
  const convo: Msg[] = [{ role: 'model', text: t('chatGreeting') }, ...msgs];

  const send = async (text0: string) => {
    const q = text0.trim();
    if (!q || busy) return;
    sfx('tap');
    const hist: Msg[] = [...convo, { role: 'user', text: q }];
    setMsgs(hist.slice(1));
    setText('');
    setBusy(true);
    const a = await askDora(hist.slice(-8), lang);
    setMsgs(hist.slice(1).concat({ role: 'model', text: a }));
    setBusy(false);
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.ice }}>
      <ScreenHeader title={t('chatTitle')} icon="chat" tone="aqua" onBack={() => router.back()} />
      <FlatList
        ref={list}
        data={convo}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 14, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.role === 'user';
          return (
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
              {!mine ? <Portrait who="dora" mood="happy" size={40} /> : null}
              <View style={{ maxWidth: '80%', backgroundColor: mine ? G.blue.bg : G.aqua.soft, borderRadius: R.lg, borderBottomRightRadius: mine ? R.sm : R.lg, borderBottomLeftRadius: mine ? R.lg : R.sm, padding: 12, borderWidth: 3, borderBottomWidth: 5, borderColor: mine ? G.blue.edge : G.aqua.edge }}>
                <Text selectable style={{ fontFamily: F.body, fontSize: T.body + 1, lineHeight: 22, color: mine ? '#fff' : C.navy }}>{item.text}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View accessibilityLiveRegion="polite" style={{ marginLeft: 48, minHeight: 20 }}>
            {busy ? <Text style={{ fontFamily: F.bodyB, color: C.muted, fontSize: T.body }}>{t('chatTyping')}</Text> : null}
          </View>
        }
      />
      {msgs.length === 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 8, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          {SUGGEST.map((k) => (
            <Pressable key={k} accessibilityRole="button" onPress={() => void send(t(k))} style={{ minHeight: 44, justifyContent: 'center', backgroundColor: G.lemon.soft, borderRadius: R.md, borderWidth: 3, borderBottomWidth: 5, borderColor: G.lemon.edge, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: F.bodyB, fontSize: T.body, color: C.navy }}>{t(k)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={{ backgroundColor: '#fff', borderTopWidth: 2, borderColor: C.line }}>
        <View style={{ flexDirection: 'row', gap: 8, padding: 12, paddingBottom: Math.max(insets.bottom, 12), width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <Input accessibilityLabel={t('chatPlaceholder')} style={{ flex: 1, minWidth: 0 }} value={text} onChangeText={setText} placeholder={t('chatPlaceholder')} onSubmitEditing={() => void send(text)} returnKeyType="send" />
          <Btn label={t('chatSend')} tone="leaf" loading={busy} disabled={!text.trim()} onPress={() => void send(text)} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
