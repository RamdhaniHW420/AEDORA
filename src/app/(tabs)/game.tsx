import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Btn, Icon, Pop, ScreenHeader, ShieldRating } from "@/components/ui";
import { useApp } from "@/store/useApp";
import { STEP_META } from "@/game/data/story";
import { C, CH, F, G, R, T, lift } from "@/theme";
import { sfx } from "@/lib/audio";
import { useReduceMotion } from "@/lib/motion";
import { useT, type Key } from "@/lib/i18n";

const PETA = require("../../../assets/game/ui/bg_map.png");
const PETA_W = 941;
const PETA_H = 1672;

/** Posisi titik misi di jalan setapak pada gambar peta, dalam pecahan lebar dan tinggi. */
const NODES: [number, number][] = [
  [0.56, 0.245],
  [0.52, 0.38],
  [0.5, 0.535],
  [0.48, 0.72],
];

const NODE = 64;
const OUTER = 76;
const GAP = 10;
const EDGE = 8;

/** Satu denyut cincin di bab yang sedang dikerjakan. Tidak berulang. */
function Ring({ size, color }: { size: number; color: string }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    Animated.timing(v, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [reduce, v]);
  if (reduce) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: color,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
        transform: [
          {
            scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }),
          },
        ],
      }}
    />
  );
}

export default function GameMap() {
  const router = useRouter();
  const t = useT();
  const { width } = useWindowDimensions();
  const progress = useApp((s) => s.progress);
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  if (!progress) return null;

  const mapW = Math.min(width, 560);
  const mapH = Math.round((mapW * PETA_H) / PETA_W);
  const open = (n: number) => {
    sfx("select");
    router.push(`/play/${n}`);
  };

  const focusCurrent = (mapTop: number) => {
    const idx = STEP_META.findIndex(
      (m) => m.n <= progress.currentStep && !progress.steps[m.n]?.done,
    );
    if (idx < 1) return;
    scroller.current?.scrollTo({
      y: Math.max(0, mapTop + NODES[idx][1] * mapH - 220),
      animated: false,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.ice }}>
      <ScrollView
        ref={scroller}
        contentContainerStyle={{ paddingBottom: 24, alignItems: "center" }}
      >
        <View style={{ alignSelf: "stretch" }}>
          <ScreenHeader
            title={t("mapTitle")}
            subtitle={t("mapSub")}
            icon="gamepad"
          />
        </View>

        <View
          onLayout={(e) => focusCurrent(e.nativeEvent.layout.y)}
          style={{
            width: mapW,
            height: mapH,
            overflow: "hidden",
            borderBottomWidth: 6,
            borderColor: G.leaf.edge,
          }}
        >
          <Image
            source={PETA}
            resizeMode="cover"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
            }}
          />

          {STEP_META.map((m, i) => {
            const cx = NODES[i][0] * mapW;
            const cy = NODES[i][1] * mapH;
            const unlocked = m.n <= progress.currentStep;
            const done = !!progress.steps[m.n]?.done;
            const current = unlocked && !done;
            const g = G[CH[i]];
            const right = i % 2 === 1;

            const reach = NODE / 2 + GAP;
            const cardW = right
              ? Math.min(220, mapW - (cx + reach) - EDGE)
              : Math.min(220, cx - reach - EDGE);
            const cardLeft = right ? cx + reach : cx - reach - cardW;
            const cardTop = cy - 40;

            const body = (
              <View
                style={{
                  width: cardW,
                  padding: 10,
                  gap: 3,
                  borderRadius: R.md + 2,
                  backgroundColor: unlocked ? g.soft : "#FFFFFF",
                  borderWidth: 3,
                  borderBottomWidth: 6,
                  borderColor: unlocked ? g.edge : C.line,
                }}
              >
                <Text
                  style={{
                    fontFamily: F.bodyB,
                    fontSize: T.cap,
                    color: unlocked ? g.deep : C.muted,
                  }}
                >
                  {t("chapter")} {m.n}
                  {done ? `  ${t("chapterDone")}` : ""}
                </Text>
                <Text
                  style={{
                    fontFamily: F.bodyX,
                    fontSize: T.body,
                    lineHeight: 18,
                    color: C.navy,
                  }}
                >
                  {t(`step${m.n}Title` as Key)}
                </Text>
                <Text
                  numberOfLines={current ? 3 : 2}
                  style={{
                    fontFamily: F.body,
                    fontSize: T.cap,
                    lineHeight: 16,
                    color: C.muted,
                  }}
                >
                  {unlocked ? t(`step${m.n}Sub` as Key) : t("finishPrev")}
                </Text>
                {unlocked ? (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignItems: "center",
                      columnGap: 10,
                      rowGap: 2,
                      marginTop: 2,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Icon name="coin" size={16} />
                      <Text
                        style={{
                          fontFamily: F.bodyX,
                          fontSize: T.cap,
                          color: C.navy,
                        }}
                      >
                        +{m.reward}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Icon name="clock" size={16} />
                      <Text
                        style={{
                          fontFamily: F.bodyX,
                          fontSize: T.cap,
                          color: C.navy,
                        }}
                      >
                        {m.mins} {t("minutes")}
                      </Text>
                    </View>
                  </View>
                ) : null}
                {done ? (
                  <View style={{ marginTop: 2 }}>
                    <ShieldRating score={progress.steps[m.n].score} size={20} />
                  </View>
                ) : null}
                {current ? (
                  <View style={{ marginTop: 6 }}>
                    <Btn
                      small
                      tone={CH[i]}
                      label={t("startBtn")}
                      onPress={() => open(m.n)}
                    />
                  </View>
                ) : null}
              </View>
            );

            return (
              <React.Fragment key={m.n}>
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: cy - 5,
                    left: right ? cx : cx - reach - 2,
                    width: reach + 2,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: unlocked ? g.edge : C.line,
                  }}
                />

                <Pop
                  style={{ position: "absolute", left: cardLeft, top: cardTop }}
                  delay={i * 80}
                >
                  {unlocked && !current ? (
                    <Pressable accessible={false} onPress={() => open(m.n)}>
                      {body}
                    </Pressable>
                  ) : (
                    body
                  )}
                </Pop>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t("chapter")} ${m.n}, ${t(`step${m.n}Title` as Key)}`}
                  accessibilityState={{ disabled: !unlocked }}
                  disabled={!unlocked}
                  onPress={() => open(m.n)}
                  style={{
                    position: "absolute",
                    left: cx - OUTER / 2,
                    top: cy - OUTER / 2,
                    width: OUTER,
                    height: OUTER,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {current ? <Ring size={OUTER} color={g.bg} /> : null}
                  <View
                    style={[
                      {
                        width: OUTER,
                        height: OUTER,
                        borderRadius: OUTER / 2,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#FFFFFF",
                        borderWidth: current ? 4 : 0,
                        borderColor: g.bg,
                      },
                      lift,
                    ]}
                  >
                    <View
                      style={{
                        width: NODE,
                        height: NODE,
                        borderRadius: NODE / 2,
                        backgroundColor: unlocked ? g.bg : "#E3ECF3",
                        borderWidth: 4,
                        borderBottomWidth: 9,
                        borderColor: unlocked ? g.edge : "#B9CAD8",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <View
                        pointerEvents="none"
                        style={{
                          position: "absolute",
                          top: 5,
                          left: 12,
                          right: 12,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "rgba(255,255,255,0.4)",
                        }}
                      />
                      {done ? (
                        <Icon name="check" size={30} />
                      ) : unlocked ? (
                        <Text
                          style={{
                            fontFamily: F.pixelB,
                            fontSize: 28,
                            color: g.text,
                          }}
                        >
                          {m.n}
                        </Text>
                      ) : (
                        <Icon name="lock" size={26} />
                      )}
                    </View>
                  </View>
                </Pressable>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
