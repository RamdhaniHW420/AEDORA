import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';

const COLORS = ['#FFD23F', '#E83435', '#55B8E8', '#0879BC', '#FFFFFF'];

export function Confetti({ count = 36 }: { count?: number }) {
  const { width, height } = Dimensions.get('window');
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        x: Math.random() * width,
        size: 6 + Math.floor(Math.random() * 6),
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 2500,
        dur: 2600 + Math.random() * 2400,
        sway: (Math.random() - 0.5) * 80,
      })),
    [count, width],
  );
  const vals = useRef(pieces.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const loops = vals.map((v, i) => {
      const l = Animated.loop(Animated.sequence([Animated.delay(pieces[i].delay), Animated.timing(v, { toValue: 1, duration: pieces[i].dur, useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true })]));
      l.start();
      return l;
    });
    return () => loops.forEach((l) => l.stop());
  }, [vals, pieces]);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: vals[i].interpolate({ inputRange: [0, 0.05, 0.9, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: vals[i].interpolate({ inputRange: [0, 1], outputRange: [0, height + 40] }) },
              { translateX: vals[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.sway, -p.sway / 2] }) },
              { rotate: vals[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}
