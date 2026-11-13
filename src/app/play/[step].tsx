import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GameRunner } from '@/game/GameRunner';
import { useApp } from '@/store/useApp';

export default function Play() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const router = useRouter();
  const n = Math.max(1, Math.min(4, parseInt(step ?? '1', 10) || 1));
  const progress = useApp((s) => s.progress);
  if (!progress || n > progress.currentStep) {
    // langkah terkunci: kembali ke menu
    setTimeout(() => router.replace('/game'), 0);
    return <View style={{ flex: 1, backgroundColor: '#0B1A2B' }} />;
  }
  return <GameRunner step={n} onExit={() => router.replace('/game')} />;
}
