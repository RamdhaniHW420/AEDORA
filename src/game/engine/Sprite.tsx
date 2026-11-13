import React from 'react';
import { Image, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  source: ImageSourcePropType;
  cols: number;
  rows: number;
  fw: number;
  fh: number;
  col: number;
  row: number;
  scale: number;
  style?: StyleProp<ViewStyle>;
}

/** Potong satu frame dari sprite sheet (gambar sudah di-upscale 4x, ditampilkan sesuai skala) */
export function Sprite({ source, cols, rows, fw, fh, col, row, scale, style }: Props) {
  const w = fw * scale;
  const h = fh * scale;
  return (
    <View style={[{ width: w, height: h, overflow: 'hidden' }, style]} pointerEvents="none">
      <Image source={source} resizeMode="stretch" style={{ width: cols * w, height: rows * h, marginLeft: -col * w, marginTop: -row * h }} />
    </View>
  );
}

export const DIR_ROW: Record<string, number> = { down: 0, left: 1, right: 2, up: 3 };

export function CharSprite({ source, dir, frame, scale, style }: { source: ImageSourcePropType; dir: string; frame: number; scale: number; style?: StyleProp<ViewStyle> }) {
  return <Sprite source={source} cols={3} rows={4} fw={16} fh={24} col={frame} row={DIR_ROW[dir] ?? 0} scale={scale} style={style} />;
}
