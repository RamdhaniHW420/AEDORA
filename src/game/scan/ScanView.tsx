import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Asset } from "expo-asset";
import { UI } from "@/game/assets";
import ui from "@/game/data/generated/ui.json";
import { C, F, G, R, T } from "@/theme";
import { Btn, Icon } from "@/components/ui";
import { useReduceMotion } from "@/lib/motion";
import { useLang, useT } from "@/lib/i18n";
import { Closeup, larvaLayout } from "@/game/ui/Closeup";
import { fetchAnalysis, type AnalysisResult } from "@/lib/ai";
import { sfx, tap } from "@/lib/audio";
import type { Place } from "@/game/data/places";
import type { Finding } from "@/lib/types";

// Ukuran dalam piksel gambar ponsel buatan sendiri (lebar 1792): w/h = gambar yang sudah dipotong, fullH/cropTop = gambar asli
// dengan margin transparan di atas. screen = layar (x, y, lebar, tinggi) pada gambar yang sudah dipotong; notch, thumbTop, thumbBottom
// diukur dari sisi atas layar.
type PhoneArt = {
  w: number;
  h: number;
  fullH: number;
  cropTop: number;
  screen: number[];
  notch: number;
  mk_arror: any;
  thumbTop: number;
  thumbBottom: number;
};
const ART = (ui as unknown as { phone: PhoneArt }).phone;
const PH_W = ART.w;
const PH_H = ART.h;
const [SX, SY, SW, SH] = ART.screen;
const STATUS_Y = ART.notch + 14;
const STATUS_H = 73;
const CLOSE_Y = STATUS_Y + STATUS_H + 20;
const CLOSE_H = SW * 0.75;
const INFO_Y = CLOSE_Y + CLOSE_H + 17;
const INFO_H = ART.thumbTop - INFO_Y;
const SHUTTER_CY = (ART.thumbBottom + SH) / 2;
// File phone_frame.png boleh versi asli (ada margin atas) atau versi yang sudah dipotong; keduanya ditata sama.
const FRAME = Asset.fromModule(UI.phone_frame);
const FRAME_UNCROPPED =
  !!FRAME.width &&
  !!FRAME.height &&
  FRAME.height / FRAME.width > (ART.h + ART.fullH) / (2 * ART.w);
const ICE = "#DCEFFA";
const CAP = "#3A6486";

// Cincin fokus untuk pengguna keyboard di web.
const ring = (on: boolean): ViewStyle =>
  on && Platform.OS === "web"
    ? ({
        outlineStyle: "solid",
        outlineWidth: 3,
        outlineColor: C.navy,
        outlineOffset: 2,
      } as ViewStyle)
    : {};

// Warna penanda di layar kamera: merah untuk jentik, kuning untuk berisiko, hijau untuk aman.
const VERDICT: Record<Finding, { color: string; bg: string }> = {
  larvae: { color: "#FF4D4D", bg: "#4A0F10" },
  risky: { color: "#FFD23F", bg: "#4A3208" },
  safe: { color: "#4CE08A", bg: "#0B3A22" },
};

interface Props {
  place: Place;
  finding: Finding;
  count: number;
  onNext: (analysis: AnalysisResult) => void;
  onCancel?: () => void;
}

export function ScanView({ place, finding, count, onNext, onCancel }: Props) {
  const { width } = useWindowDimensions();
  const tx = useT();
  const lang = useLang((s) => s.lang);
  const reduce = useReduceMotion();
  const insets = useSafeAreaInsets();
  const [focus, setFocus] = useState<"back" | "shutter" | null>(null);
  // Ponsel sedikit lebih lebar dari layar supaya tangan keluar dari tepi kiri, kanan, dan bawah.
  const PW = Math.min(Math.round(width * 1.1), 460);
  const s = PW / PH_W;
  const [phase, setPhase] = useState<"aim" | "scanning" | "result">("aim");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const laser = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const dots = useRef(0);
  const [dotTxt, setDotTxt] = useState("");
  // Gambar closeup selebar layar ponsel (rasio 4:3), diletakkan di bawah notch dan status kamera.
  const closeW = SW * s;
  const closeH = CLOSE_H * s;

  useEffect(() => {
    if (reduce) return;
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    l.start();
    return () => l.stop();
  }, [shake, reduce]);

  useEffect(() => {
    if (phase !== "scanning") return;
    const id = setInterval(() => {
      dots.current = (dots.current + 1) % 4;
      setDotTxt(".".repeat(dots.current));
    }, 300);
    return () => clearInterval(id);
  }, [phase]);

  const startScan = () => {
    if (phase !== "aim") return;
    sfx("scan");
    tap("medium");
    setPhase("scanning");
    const t0 = Date.now();
    const req = fetchAnalysis(place, finding, count, lang);
    Animated.timing(progress, {
      toValue: 1,
      duration: 2800,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(laser, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laser, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 },
    ).start();
    void req.then(async (a) => {
      const wait = Math.max(0, 2800 - (Date.now() - t0));
      await new Promise((r) => setTimeout(r, wait));
      setAnalysis(a);
      laser.stopAnimation();
      setPhase("result");
      sfx(finding === "safe" ? "success" : "alert");
      tap(finding === "safe" ? "success" : "warning");
      Animated.spring(pop, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }).start();
    });
  };

  const v = VERDICT[finding];
  const tag =
    finding === "larvae"
      ? tx("scanTagLarvae", { n: count })
      : finding === "risky"
        ? tx("scanTagRisky")
        : tx("scanTagSafe");
  const { size: lsz, spots } = larvaLayout(
    place.closeup,
    Math.min(count, 9),
    closeW,
  );
  const jitter = shake.interpolate({
    inputRange: [0, 1],
    outputRange: [-1.2, 1.2],
  });

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: C.navy,
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            alignSelf: "stretch",
            paddingTop: 46,
            paddingBottom: 12,
            paddingLeft: 16,
            paddingRight: 70,
            backgroundColor: G.aqua.bg,
            borderBottomWidth: 5,
            borderColor: G.aqua.edge,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          {onCancel ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tx("back")}
              onPress={onCancel}
              onFocus={() => setFocus("back")}
              onBlur={() => setFocus(null)}
              style={[
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(6,40,70,0.38)",
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.55)",
                },
                ring(focus === "back"),
              ]}
            >
              <Text
                style={{
                  fontFamily: F.pixelB,
                  color: "#fff",
                  fontSize: T.title,
                  marginTop: -2,
                }}
              >
                {"‹"}
              </Text>
            </Pressable>
          ) : (
            <Icon name="camera" size={28} />
          )}
          <Text
            accessibilityRole="header"
            numberOfLines={2}
            style={{
              flex: 1,
              fontFamily: F.pixelB,
              fontSize: T.title,
              color: G.aqua.text,
            }}
          >
            {tx("scanTitle", { place: place.name })}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          >
            <Text
              style={{
                fontFamily: F.body,
                fontSize: T.lead,
                color: "#C9E3F5",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {phase === "aim"
                ? tx("scanAim")
                : phase === "scanning"
                  ? tx("scanRunning")
                  : tx("scanDone")}
            </Text>
          </View>

          {/* ponsel menempel di dasar layar, tangannya keluar dari tepi layar */}
          <View
            style={{
              alignSelf: "stretch",
              height: PH_H * s,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: "50%",
                marginLeft: -PW / 2,
                width: PW,
                height: PH_H * s,
                overflow: "hidden",
              }}
            >
              {/* latar layar: biru muda, bukan hitam */}
              <View
                style={{
                  position: "absolute",
                  left: SX * s,
                  top: SY * s,
                  width: SW * s,
                  height: SH * s,
                  backgroundColor: ICE,
                }}
              />

              {/* status kamera */}
              <View
                style={{
                  position: "absolute",
                  left: SX * s,
                  top: (SY + STATUS_Y) * s,
                  width: SW * s,
                  height: STATUS_H * s,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{ fontFamily: F.pixelB, fontSize: 10, color: C.navy }}
                >
                  AEDORA CAM
                </Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor:
                        phase === "scanning" ? "#E02F2F" : "#1E9E5A",
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: F.pixelB,
                      fontSize: 10,
                      color: C.navy,
                    }}
                  >
                    {phase === "scanning" ? tx("scanBusy") : tx("scanReady")}
                  </Text>
                </View>
              </View>

              {/* gambar kamera */}
              <Animated.View
                style={{
                  position: "absolute",
                  left: SX * s,
                  top: (SY + CLOSE_Y) * s,
                  width: closeW,
                  height: closeH,
                  transform: [
                    { translateX: phase === "aim" ? jitter : 0 },
                    {
                      translateY:
                        phase === "aim" ? Animated.multiply(jitter, 0.6) : 0,
                    },
                  ],
                }}
              >
                <Closeup
                  k={place.closeup}
                  width={closeW}
                  finding={finding}
                  count={count}
                  style={{ borderRadius: 0, backgroundColor: "transparent" }}
                >
                  {({ rect }) => (
                    <>
                      {/* bidik sudut */}
                      {[0, 1, 2, 3].map((i) => (
                        <View
                          key={i}
                          style={{
                            position: "absolute",
                            width: 12,
                            height: 12,
                            borderColor: C.navy,
                            opacity: 0.9,
                            ...(i === 0
                              ? {
                                  left: 3,
                                  top: 3,
                                  borderLeftWidth: 2,
                                  borderTopWidth: 2,
                                }
                              : i === 1
                                ? {
                                    right: 3,
                                    top: 3,
                                    borderRightWidth: 2,
                                    borderTopWidth: 2,
                                  }
                                : i === 2
                                  ? {
                                      left: 3,
                                      bottom: 3,
                                      borderLeftWidth: 2,
                                      borderBottomWidth: 2,
                                    }
                                  : {
                                      right: 3,
                                      bottom: 3,
                                      borderRightWidth: 2,
                                      borderBottomWidth: 2,
                                    }),
                          }}
                        />
                      ))}
                      {phase === "scanning" ? (
                        <Animated.View
                          style={{
                            position: "absolute",
                            left: 0,
                            width: closeW,
                            height: 3,
                            backgroundColor: "#FF4D4D",
                            shadowColor: "#FF4D4D",
                            shadowOpacity: 1,
                            shadowRadius: 6,
                            transform: [
                              {
                                translateY: laser.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, closeH - 3],
                                }),
                              },
                            ],
                          }}
                        />
                      ) : null}
                      {phase === "result" ? (
                        <Animated.View
                          pointerEvents="none"
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: closeW,
                            height: closeH,
                            opacity: pop,
                            transform: [
                              {
                                scale: pop.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1.15, 1],
                                }),
                              },
                            ],
                          }}
                        >
                          <View
                            style={{
                              position: "absolute",
                              left: rect.x - 3,
                              top: rect.y - 3,
                              width: rect.w + 6,
                              height: rect.h + 6,
                              borderWidth: 2,
                              borderColor: v.color,
                            }}
                          >
                            <View
                              style={{
                                position: "absolute",
                                left: -2,
                                top: -13,
                                backgroundColor: v.color,
                                paddingHorizontal: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: F.pixelB,
                                  fontSize: 9,
                                  color: "#000",
                                }}
                              >
                                {tag}
                              </Text>
                            </View>
                          </View>
                          {finding === "larvae"
                            ? spots.map((p, i) => (
                                <View
                                  key={i}
                                  style={{
                                    position: "absolute",
                                    left: rect.x + p.x * rect.w - 2,
                                    top: rect.y + p.y * rect.h - 2,
                                    width: lsz.w + 4,
                                    height: lsz.h + 4,
                                    borderWidth: 1.5,
                                    borderColor: "#FF4D4D",
                                  }}
                                />
                              ))
                            : null}
                        </Animated.View>
                      ) : null}
                    </>
                  )}
                </Closeup>
              </Animated.View>

              {/* info di bawah gambar, di atas jempol */}
              <View
                style={{
                  position: "absolute",
                  left: SX * s,
                  top: (SY + INFO_Y) * s,
                  width: SW * s,
                  height: INFO_H * s,
                  paddingHorizontal: 10,
                  justifyContent: "flex-start",
                }}
              >
                {phase === "aim" ? (
                  <>
                    <Text
                      style={{
                        fontFamily: F.body,
                        fontSize: 11,
                        lineHeight: 14,
                        color: CAP,
                      }}
                    >
                      {tx("scanDetected")}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={{
                        fontFamily: F.pixelB,
                        fontSize: 12,
                        lineHeight: 15,
                        color: C.navy,
                      }}
                    >
                      {place.object}
                    </Text>
                  </>
                ) : phase === "scanning" ? (
                  <View style={{ gap: 6 }}>
                    <Text
                      style={{
                        fontFamily: F.pixelB,
                        fontSize: 12,
                        lineHeight: 15,
                        color: C.navy,
                      }}
                    >
                      {tx("scanAnalyzing")}
                      {dotTxt}
                    </Text>
                    <View
                      style={{
                        height: 7,
                        backgroundColor: "#B7D6EA",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Animated.View
                        style={{
                          height: 7,
                          backgroundColor: "#0879BC",
                          width: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <Animated.View
                    style={{ gap: 3, transform: [{ scale: pop }] }}
                  >
                    <View
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: v.bg,
                        borderColor: v.color,
                        borderWidth: 2,
                        borderRadius: 6,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: F.pixelB,
                          color: v.color,
                          fontSize: 11,
                        }}
                      >
                        {analysis?.headline ?? tag}
                      </Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: F.pixelB,
                        color: C.navy,
                        fontSize: 11,
                      }}
                    >
                      {finding === "larvae"
                        ? tx("scanFoundLarvae", { n: count })
                        : finding === "risky"
                          ? tx("scanStagnant")
                          : tx("scanNoLarvae")}
                    </Text>
                  </Animated.View>
                )}
              </View>

              {/* tombol rana kamera: satu-satunya tombol untuk memulai scan */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tx("scanNow")}
                disabled={phase !== "aim"}
                onPress={startScan}
                onFocus={() => setFocus("shutter")}
                onBlur={() => setFocus(null)}
                style={[
                  {
                    position: "absolute",
                    left: SX * s + (SW * s) / 2 - 24,
                    top: (SY + SHUTTER_CY) * s - 24,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 3,
                    borderColor: C.navy,
                    backgroundColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  ring(focus === "shutter"),
                ]}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor:
                      phase === "scanning"
                        ? "#E02F2F"
                        : phase === "result"
                          ? "#1E9E5A"
                          : "#0879BC",
                  }}
                />
              </Pressable>

              {/* bingkai ponsel dengan tangan, di atas semua isi layar */}
              <Image
                source={UI.phone_frame}
                resizeMode="stretch"
                style={{
                  position: "absolute",
                  left: 0,
                  top: FRAME_UNCROPPED ? -ART.cropTop * s : 0,
                  width: PW,
                  height: (FRAME_UNCROPPED ? ART.fullH : PH_H) * s,
                  pointerEvents: "none",
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {phase === "result" && analysis ? (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: "62%",
            opacity: pop,
            transform: [
              {
                translateY: pop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              flexShrink: 1,
              backgroundColor: "#fff",
              borderTopLeftRadius: R.lg,
              borderTopRightRadius: R.lg,
              borderWidth: 3,
              borderBottomWidth: 0,
              borderColor: v.color,
              paddingTop: 14,
              paddingHorizontal: 14,
              paddingBottom: 14 + insets.bottom,
              gap: 12,
            }}
          >
            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ gap: 8 }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Icon name="chat" size={24} />
                <Text
                  style={{
                    fontFamily: F.pixelB,
                    fontSize: T.lead + 1,
                    color: C.navy,
                  }}
                >
                  {tx("scanResultTitle")}
                </Text>
                <View style={{ flex: 1 }} />
                <Text
                  style={{
                    fontFamily: F.bodyB,
                    fontSize: T.cap,
                    color: C.muted,
                  }}
                >
                  {analysis.source === "ai"
                    ? tx("scanSourceAi")
                    : tx("scanSourceLocal")}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: F.body,
                  fontSize: T.body + 1,
                  lineHeight: 22,
                  color: C.navy,
                }}
              >
                {analysis.analysis}
              </Text>
              <View
                style={{
                  backgroundColor: G.lemon.soft,
                  borderWidth: 2,
                  borderColor: G.lemon.edge,
                  borderRadius: R.md,
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: F.bodyB,
                    fontSize: T.body,
                    lineHeight: 20,
                    color: C.navy,
                  }}
                >
                  {tx("scanAdvice", { advice: analysis.advice })}
                </Text>
              </View>
            </ScrollView>
            <Btn
              label={tx("scanChoose")}
              tone="leaf"
              onPress={() => onNext(analysis)}
            />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
