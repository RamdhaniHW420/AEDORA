import React from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { BADGES } from "@/game/assets";
import { ACHIEVEMENTS } from "@/game/data/achievements";
import { Icon, Pop, ScreenHeader, XPBar } from "@/components/ui";
import { useApp } from "@/store/useApp";
import { useT, type Key } from "@/lib/i18n";
import { C, F, G, R, T, type GTone } from "@/theme";

const TONES: GTone[] = ["lemon", "leaf", "berry", "aqua", "sun", "grape"];

export default function Achievements() {
  const router = useRouter();
  const t = useT();
  const { width } = useWindowDimensions();
  const progress = useApp((s) => s.progress);
  if (!progress) return null;
  const got = new Set(progress.achievements);
  const list = [...ACHIEVEMENTS].sort(
    (a, b) => Number(got.has(b.id)) - Number(got.has(a.id)),
  );
  const inner = Math.min(width, 560) - 32;
  const w = (inner - 12) / 2;
  return (
    <View style={{ flex: 1, backgroundColor: C.ice }}>
      {/* Latar gambar tetap di belakang, daftar lencana bergulir di atasnya */}
      <Image
        source={require("../../assets/bg_achievements.png")}
        resizeMode="cover"
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <ScreenHeader
        title={t("achievementsTitle")}
        icon="medal"
        tone="grape"
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 14,
          paddingBottom: 28,
          width: "100%",
          maxWidth: 560,
          alignSelf: "center",
        }}
      >
        {/* Panel putih agar hitungan dan bilah progres tetap terbaca di atas gambar */}
        <View
          style={{
            gap: 8,
            backgroundColor: "#fff",
            borderRadius: R.lg,
            borderWidth: 3,
            borderBottomWidth: 6,
            borderColor: C.line,
            padding: 12,
          }}
        >
          <Text
            style={{ fontFamily: F.bodyX, color: C.navy, fontSize: T.lead }}
          >
            {t("achievementsCount", { a: got.size, b: ACHIEVEMENTS.length })}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <XPBar
              value={got.size}
              max={ACHIEVEMENTS.length}
              segments={ACHIEVEMENTS.length}
              tone="lemon"
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {list.map((a, n) => {
            const ok = got.has(a.id);
            const g = G[TONES[n % TONES.length]];
            return (
              <Pop key={a.id} delay={Math.min(n, 8) * 40} style={{ width: w }}>
                <View
                  style={{
                    width: "100%",
                    backgroundColor: ok ? g.soft : C.surface,
                    borderRadius: R.lg,
                    borderWidth: 3,
                    borderBottomWidth: 6,
                    borderColor: ok ? g.edge : C.line,
                    padding: 12,
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Image
                    source={
                      ok
                        ? BADGES[a.badge as keyof typeof BADGES]
                        : BADGES.locked
                    }
                    style={{ width: 64, height: 64 }}
                    resizeMode="stretch"
                  />
                  <Text
                    style={{
                      fontFamily: F.bodyX,
                      fontSize: T.body,
                      color: C.navy,
                      textAlign: "center",
                    }}
                  >
                    {t(`ach_${a.id}_t` as Key)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: F.body,
                      fontSize: T.cap,
                      color: C.muted,
                      textAlign: "center",
                      lineHeight: 16,
                    }}
                  >
                    {t(`ach_${a.id}_d` as Key)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    <Icon name={ok ? "check" : "lock"} size={16} />
                    <Text
                      style={{
                        fontFamily: F.bodyB,
                        fontSize: T.cap,
                        color: ok ? G.leaf.deep : C.muted,
                      }}
                    >
                      {ok ? t("achEarned") : t("achLocked")}
                    </Text>
                  </View>
                </View>
              </Pop>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
