import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { QuizView } from '@/game/ui/QuizView';

export default function PracticeQuiz() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <QuizView onFinish={() => router.back()} onBack={() => router.back()} />
    </View>
  );
}
