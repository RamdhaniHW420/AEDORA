import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { CLOSEUPS, FX } from "@/game/assets";
import closeups from "@/game/data/generated/closeups.json";
import { Sprite } from "@/game/engine/Sprite";
import type { CloseupKey } from "@/game/data/places";
import type { Finding } from "@/lib/types";

type Box = [number, number, number, number];
/** ls = skala larva (default 0.9), front = bagian gambar yang digambar ulang di atas air (mis. pot) */
type CU = {
  w: number;
  h: number;
  water: Box;
  shape: "rect" | "ellipse";
  ls?: number;
  front?: Box;
};
const DATA = closeups as unknown as Record<string, CU>;

export const WATER_COLOR: Record<Finding, string> = {
  larvae: "#4A9AA8",
  risky: "#5BA3C0",
  safe: "#6CC6F0",
};

export interface CloseupHandle {
  /** tinggi air 0..1 (1 = penuh) */
  level: Animated.Value;
}

interface Props {
  k: CloseupKey;
  width: number;
  finding: Finding;
  count: number;
  /** air tetap ada (kolam, tandon, wudhu) bila aman */
  safeWater?: boolean;
  level?: Animated.Value;
  showLarvae?: boolean;
  /** 0..1 untuk menyorot (kotak deteksi) – digunakan oleh ScanView */
  style?: StyleProp<ViewStyle>;
  children?: (g: {
    s: number;
    rect: { x: number; y: number; w: number; h: number };
  }) => React.ReactNode;
}

const useTick = (ms: number) => {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
};

/**
 * Posisi larva deterministik per render (tidak loncat tiap frame), sebagai pecahan lebar dan tinggi area air.
 * sw/sh = ukuran sprite larva; jangkauan dipersempit hanya bila larva tidak muat. avoid = rentang x yang tertutup.
 */
export function larvaSpots(
  n: number,
  w: number,
  h: number,
  sw = 0,
  sh = 0,
  avoid?: [number, number],
) {
  const out: { x: number; y: number; ph: number }[] = [];
  const fx = w > 0 ? sw / w : 0;
  const fy = h > 0 ? sh / h : 0;
  const kx = Math.min(1, Math.max(0, (0.89 - fx) / 0.64));
  const ky = Math.min(1, Math.max(0, (0.85 - fy) / 0.36));
  const lo = 0.02;
  const hi = 0.98 - fx;
  const l1 = avoid ? Math.max(0, avoid[0] - fx - lo) : 0;
  const l2 = avoid ? Math.max(0, hi - avoid[1]) : 0;
  for (let i = 0; i < n; i++) {
    const a = (i * 2654435761) % 997;
    let x = 0.08 + ((a % 83) / 100) * 0.78 * kx;
    if (avoid && l1 + l2 > 0) {
      const pos = ((a % 83) / 82) * (l1 + l2);
      x = pos < l1 ? lo + pos : avoid[1] + (pos - l1);
    }
    out.push({ x, y: 0.12 + (((a * 7) % 61) / 100) * 0.6 * ky, ph: i % 2 });
  }
  return out;
}

/** ukuran sprite larva dan posisinya untuk satu closeup; dipakai bersama oleh Closeup dan ScanView */
export function larvaLayout(k: CloseupKey, n: number, width: number) {
  const d = DATA[k];
  const s = width / d.w;
  const scale = (d.ls ?? 0.9) * s;
  const size = { w: 9 * scale, h: 7 * scale, scale };
  const [wx, , ww, wh] = d.water;
  const avoid: [number, number] | undefined = d.front
    ? [(d.front[0] - wx) / ww, (d.front[0] + d.front[2] - wx) / ww]
    : undefined;
  return { size, spots: larvaSpots(n, ww * s, wh * s, size.w, size.h, avoid) };
}

export function Closeup({
  k,
  width,
  finding,
  count,
  safeWater,
  level,
  showLarvae = true,
  style,
  children,
}: Props) {
  const d = DATA[k];
  const s = width / d.w;
  const height = d.h * s;
  const [wx, wy, ww, wh] = d.water;
  const rect = { x: wx * s, y: wy * s, w: ww * s, h: wh * s };
  const tick = useTick(450);
  const wave = useRef(new Animated.Value(0)).current;
  const fallbackLevel = useRef(new Animated.Value(1)).current;
  const lv = level ?? fallbackLevel;

  useEffect(() => {
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(wave, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    l.start();
    return () => l.stop();
  }, [wave]);

  const { size: lsz, spots } = useMemo(
    () => larvaLayout(k, Math.min(count, 9), width),
    [k, count, width],
  );
  // dibulatkan keluar satu piksel supaya tepi air di piksel pecahan tidak menyisakan garis di atas pot
  const fx0 = d.front ? Math.floor(d.front[0] * s) : 0;
  const fy0 = d.front ? Math.floor(d.front[1] * s) - 1 : 0;
  const fr = d.front
    ? {
        x: fx0,
        y: fy0,
        w: Math.ceil((d.front[0] + d.front[2]) * s) - fx0,
        h: Math.ceil((d.front[1] + d.front[3]) * s) + 1 - fy0,
      }
    : null;
  const radius = d.shape === "ellipse" ? Math.max(rect.w, rect.h) : 0;
  const color = WATER_COLOR[finding];

  return (
    <View
      style={[
        {
          width,
          height,
          overflow: "hidden",
          borderRadius: 14,
          backgroundColor: "#000",
        },
        style,
      ]}
    >
      <Image
        source={CLOSEUPS[k]}
        resizeMode="stretch"
        style={{ width, height }}
      />
      {/* air */}
      <View
        style={{
          position: "absolute",
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          overflow: "hidden",
          borderRadius: radius,
          justifyContent: "flex-end",
        }}
      >
        <Animated.View
          style={{
            width: rect.w,
            height: lv.interpolate({
              inputRange: [0, 1],
              outputRange: [0, rect.h],
            }),
            backgroundColor: color,
            opacity: finding === "safe" ? 0.78 : 0.88,
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              top: 2 * s,
              left: 3 * s,
              width: rect.w * 0.45,
              height: Math.max(2, s * 0.9),
              backgroundColor: "rgba(255,255,255,0.55)",
              transform: [
                {
                  translateX: wave.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, rect.w * 0.25],
                  }),
                },
              ],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              top: 5 * s,
              right: 3 * s,
              width: rect.w * 0.3,
              height: Math.max(2, s * 0.9),
              backgroundColor: "rgba(255,255,255,0.35)",
              transform: [
                {
                  translateX: wave.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -rect.w * 0.2],
                  }),
                },
              ],
            }}
          />
          {finding !== "safe" ? (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor:
                  finding === "larvae"
                    ? "rgba(60,70,40,0.25)"
                    : "rgba(80,70,40,0.18)",
              }}
            />
          ) : null}
        </Animated.View>
        {finding === "larvae" && showLarvae
          ? spots.map((p, i) => {
              const frame = (tick + p.ph) % 2;
              const dy = (tick + i) % 3 === 0 ? -1.3 * lsz.scale : 0;
              return (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left: p.x * rect.w,
                    top: p.y * rect.h + dy,
                  }}
                >
                  <Sprite
                    source={FX.larva}
                    cols={2}
                    rows={1}
                    fw={9}
                    fh={7}
                    col={frame}
                    row={0}
                    scale={lsz.scale}
                  />
                </View>
              );
            })
          : null}
      </View>
      {fr ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: fr.x,
            top: fr.y,
            width: fr.w,
            height: fr.h,
            overflow: "hidden",
          }}
        >
          <Image
            source={CLOSEUPS[k]}
            resizeMode="stretch"
            style={{
              position: "absolute",
              left: -fr.x,
              top: -fr.y,
              width,
              height,
            }}
          />
        </View>
      ) : null}
      {children ? (
        <View style={{ position: "absolute", left: 0, top: 0, width, height }}>
          {children({ s, rect })}
        </View>
      ) : null}
    </View>
  );
}

export { DATA as CLOSEUP_DATA };
