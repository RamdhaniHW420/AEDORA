import React from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { UI } from "@/game/assets";
import {
  Btn,
  Card,
  ChapterTrail,
  Float,
  Pill,
  Pop,
  Portrait,
  Tile,
  XPBar,
} from "@/components/ui";
import { useApp } from "@/store/useApp";
import { levelInfo } from "@/game/logic/scoring";
import { C, CH, F, G, R, T, type GTone } from "@/theme";
import { sfx } from "@/lib/audio";
import { GearButton } from "@/components/GearButton";
import { useT, type Key } from "@/lib/i18n";

type TileDef = {
  icon:
    | "gamepad"
    | "book"
    | "quiz"
    | "medal"
    | "trophy"
    | "clock"
    | "chat"
    | "user";
  label: Key;
  to: string;
  tone: GTone;
};

// Tiap menu punya warna sendiri supaya mudah dikenali tanpa membaca. Petak 1-4 baris atas, 5-8 baris bawah.
const TILES: TileDef[] = [
  { icon: "gamepad", label: "tileAdventure", to: "/game", tone: "leaf" },
  { icon: "book", label: "tileMaterials", to: "/materi", tone: "sun" },
  { icon: "quiz", label: "tileQuiz", to: "/quiz", tone: "grape" },
  {
    icon: "medal",
    label: "tileAchievements",
    to: "/achievements",
    tone: "lemon",
  },
  {
    icon: "trophy",
    label: "tileLeaderboard",
    to: "/leaderboard",
    tone: "berry",
  },
  { icon: "clock", label: "tileHistory", to: "/histori", tone: "aqua" },
  { icon: "chat", label: "tileAskDora", to: "/ai-chat", tone: "blue" },
  { icon: "user", label: "tileProfile", to: "/profil", tone: "navy" },
];

export default function Home() {
  const router = useRouter();
  const t = useT();
  const { width } = useWindowDimensions();
  const profile = useApp((s) => s.profile);
  const progress = useApp((s) => s.progress);
  if (!profile || !progress) return null;
  const lv = levelInfo(progress.xp);
  const stepNo = Math.min(4, progress.currentStep);
  const allDone = !!progress.steps["4"]?.done;
  const heroW = Math.min(width, 560) - 32;
  const rows = [TILES.slice(0, 4), TILES.slice(4)];
  const quest = G[CH[stepNo - 1] ?? "leaf"];
  const doneMap = Object.fromEntries(
    [1, 2, 3, 4].map((n) => [n, !!progress.steps[n]?.done]),
  ) as Record<number, boolean>;
  const play = () => {
    sfx("tap");
    router.push("/game");
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.ice }}>
      {/* Latar gambar tetap di belakang, isi halaman bergulir di atasnya */}
      <Image
        source={require("../../../assets/bg_histori.png")}
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
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Kartu pemain berlatar biru penuh agar teks putih tetap terbaca di atas langit */}
        <View style={{ paddingTop: 52, paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: G.blue.bg,
              borderWidth: 4,
              borderBottomWidth: 8,
              borderColor: G.blue.edge,
              borderRadius: R.xl,
              padding: 14,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View>
                <Portrait
                  who={profile.avatar}
                  mood="happy"
                  size={60}
                  round
                  style={{ borderWidth: 4, borderColor: "#fff" }}
                />
                <View
                  style={{
                    position: "absolute",
                    right: -8,
                    bottom: -6,
                    backgroundColor: G.lemon.bg,
                    borderWidth: 3,
                    borderColor: G.lemon.edge,
                    borderRadius: 10,
                    paddingHorizontal: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: F.pixelB,
                      color: C.navy,
                      fontSize: T.cap,
                    }}
                  >
                    {lv.level}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: F.bodyB,
                    color: "#fff",
                    fontSize: T.body,
                  }}
                >
                  {t("homeHello")}
                </Text>
                <Text
                  accessibilityRole="header"
                  style={{ fontFamily: F.pixelB, color: "#fff", fontSize: 24 }}
                  numberOfLines={1}
                >
                  {profile.name.split(/\s+/)[0]}
                </Text>
              </View>
              <Pill icon="coin" text={String(progress.poin)} />
              <GearButton />
            </View>
            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: G.lemon.bg,
                  borderWidth: 3,
                  borderColor: G.lemon.edge,
                  borderRadius: R.sm,
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{ fontFamily: F.pixelB, color: C.navy, fontSize: 16 }}
                >
                  LV {lv.level}
                </Text>
              </View>
              <XPBar value={lv.into} max={lv.need} onBlue />
              <Text
                style={{ fontFamily: F.bodyB, color: "#fff", fontSize: T.cap }}
              >
                {lv.into}/{lv.need}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 16,
            paddingHorizontal: 16,
            gap: 16,
            alignItems: "center",
          }}
        >
          <Pop style={{ width: heroW }}>
            <View
              style={{
                borderRadius: R.xl,
                overflow: "hidden",
                borderWidth: 4,
                borderBottomWidth: 9,
                borderColor: quest.edge,
                backgroundColor: quest.bg,
              }}
            >
              <Image
                accessibilityLabel={
                  allDone ? t("homePlayAgain") : t(`step${stepNo}Title` as Key)
                }
                source={UI.hero}
                resizeMode="stretch"
                style={{ width: heroW - 8, height: (heroW - 8) * 0.52 }}
              />
              <View style={{ padding: 12, gap: 12, backgroundColor: quest.bg }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: F.pixelB,
                        color: quest.text,
                        fontSize: 13,
                      }}
                    >
                      {allDone
                        ? t("homeFinished")
                        : t("homeContinue", { n: stepNo })}
                    </Text>
                    <Text
                      style={{
                        fontFamily: F.pixelB,
                        color: quest.text,
                        fontSize: T.title,
                      }}
                      numberOfLines={2}
                    >
                      {allDone
                        ? t("homePlayAgain")
                        : t(`step${stepNo}Title` as Key)}
                    </Text>
                  </View>
                  <Btn
                    small
                    label={t("homePlay")}
                    tone="white"
                    icon="play"
                    onPress={play}
                  />
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.88)",
                    borderRadius: R.md,
                    padding: 8,
                  }}
                >
                  <ChapterTrail
                    currentStep={progress.currentStep}
                    done={doneMap}
                  />
                </View>
              </View>
            </View>
          </Pop>

          <View style={{ width: heroW, gap: 10 }}>
            {rows.map((row, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                {row.map((tile, k) => (
                  <Tile
                    key={tile.label}
                    icon={tile.icon}
                    label={t(tile.label)}
                    tone={tile.tone}
                    index={i * 4 + k}
                    onPress={() => router.push(tile.to as never)}
                  />
                ))}
              </View>
            ))}
          </View>

          <Pop delay={450} style={{ width: heroW }}>
            <Card
              tone="aqua"
              style={{
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
                padding: 14,
              }}
            >
              <Float>
                <Portrait who="dora" mood="happy" size={60} />
              </Float>
              <Text
                style={{
                  flex: 1,
                  fontFamily: F.body,
                  fontSize: T.body,
                  lineHeight: 21,
                  color: C.navy,
                }}
              >
                {t("tipPre")}
                <Text style={{ fontFamily: F.bodyX }}>{t("tipBold")}</Text>
                {t("tipPost")}
              </Text>
            </Card>
          </Pop>
        </View>
      </ScrollView>
    </View>
  );
}
