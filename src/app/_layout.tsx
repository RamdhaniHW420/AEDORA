import React, { useEffect } from 'react';
import { Animated, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { PixelifySans_600SemiBold, PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { useApp } from '@/store/useApp';
import { playBgm, sfx } from '@/lib/audio';
import { useInitLang, useT, type Key } from '@/lib/i18n';
import { BADGES } from '@/game/assets';
import { Image } from 'react-native';
import { C, F, G } from '@/theme';

void SplashScreen.preventAutoHideAsync();

function BadgeToast() {
  const t = useT();
  const toast = useApp((s) => s.badgeToast);
  const clear = useApp((s) => s.clearToast);
  const y = React.useRef(new Animated.Value(-120)).current;
  useEffect(() => {
    if (!toast) return;
    sfx('levelup');
    Animated.sequence([Animated.spring(y, { toValue: 0, friction: 6, useNativeDriver: true }), Animated.delay(2800), Animated.timing(y, { toValue: -140, duration: 300, useNativeDriver: true })]).start(() => clear());
  }, [toast, y, clear]);
  if (!toast) return null;
  return (
    <Animated.View accessibilityLiveRegion="polite" pointerEvents="none" style={{ position: 'absolute', top: 44, left: 16, right: 16, transform: [{ translateY: y }], zIndex: 99999 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: G.lemon.bg, borderRadius: 20, borderWidth: 4, borderBottomWidth: 7, borderColor: G.lemon.edge, padding: 10 }}>
        <Image source={BADGES[toast.badge as keyof typeof BADGES] ?? BADGES.locked} style={{ width: 52, height: 52 }} resizeMode="stretch" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.pixelB, color: C.navy, fontSize: 13 }}>{t('achievementNew')}</Text>
          <Text style={{ fontFamily: F.bodyX, color: C.navy, fontSize: 16 }}>{t(`ach_${toast.id}_t` as Key)}</Text>
          <Text style={{ fontFamily: F.body, color: C.navy, fontSize: 12 }}>{t(`ach_${toast.id}_d` as Key)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ PixelifySans_600SemiBold, PixelifySans_700Bold, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  const ready = useApp((s) => s.ready);
  const uid = useApp((s) => s.uid);
  const init = useApp((s) => s.init);
  const segments = useSegments();
  const router = useRouter();
  useInitLang();

  useEffect(() => init(), [init]);

  useEffect(() => {
    if (loaded && ready) void SplashScreen.hideAsync();
  }, [loaded, ready]);

  useEffect(() => {
    if (!loaded || !ready) return;
    const first = (segments[0] as string | undefined) ?? '';
    const publicRoute = first === '' || first === 'index' || first === 'login' || first === 'register';
    if (!uid && !publicRoute) router.replace('/');
    else if (uid && publicRoute) router.replace('/home');
  }, [loaded, ready, uid, segments, router]);

  useEffect(() => {
    if (!loaded) return;
    const first = (segments[0] as string | undefined) ?? '';
    if (first !== 'play') playBgm('menu');
  }, [loaded, segments]);

  if (!loaded || !ready) return null;
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="play/[step]" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack>
      <BadgeToast />
    </View>
  );
}
