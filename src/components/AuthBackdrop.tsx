import React from "react";
import { Image, View, useWindowDimensions } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const WALLPAPER = require("../../assets/welcome_bg.png");
const RATIO = 1280 / 720;
const SKY = "22,101,216";
const BANDS = 24;

/** Latar bergambar untuk layar masuk dan daftar. Letakkan sebagai anak pertama. */
export function AuthBackdrop() {
  const { width, height } = useWindowDimensions();
  const imgH = Math.max(height, width * RATIO);
  // Bagian atas dilarutkan ke biru langit agar judul tetap terbaca (logo wallpaper samar tidak mengganggu)
  const solid = 15;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: `rgb(${SKY})`,
        overflow: "hidden",
      }}
    >
      <Image
        source={WALLPAPER}
        resizeMode="cover"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width,
          height: imgH,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "64%",
        }}
      >
        {Array.from({ length: BANDS }).map((_, i) => {
          const a =
            i < solid
              ? 0.96
              : 0.96 * (1 - (i - solid + 1) / (BANDS - solid + 1));
          return (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: `rgba(${SKY},${a.toFixed(3)})`,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
