import React, { useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { C } from '@/theme';

const SIZE = 124;
const R = SIZE / 2;

export function Joystick({ onChange }: { onChange: (x: number, y: number) => void }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const cb = useRef(onChange);
  cb.current = onChange;

  const update = (lx: number, ly: number) => {
    let dx = (lx - R) / R;
    let dy = (ly - R) / R;
    const m = Math.hypot(dx, dy);
    if (m > 1) {
      dx /= m;
      dy /= m;
    }
    setKnob({ x: dx * (R - 22), y: dy * (R - 22) });
    cb.current(dx, dy);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => update(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) => update(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderRelease: () => {
        setKnob({ x: 0, y: 0 });
        cb.current(0, 0);
      },
      onPanResponderTerminate: () => {
        setKnob({ x: 0, y: 0 });
        cb.current(0, 0);
      },
    }),
  ).current;

  return (
    <View {...pan.panHandlers} style={{ width: SIZE, height: SIZE, borderRadius: R, backgroundColor: 'rgba(22,59,94,0.35)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' }}>
      <View pointerEvents="none" style={{ position: 'absolute', width: SIZE - 40, height: SIZE - 40, borderRadius: R, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' }} />
      <View pointerEvents="none" style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.blue, borderWidth: 3, borderColor: '#fff', transform: [{ translateX: knob.x }, { translateY: knob.y }] }} />
    </View>
  );
}
