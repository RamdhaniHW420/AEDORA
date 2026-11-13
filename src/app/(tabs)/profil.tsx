import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, Card, Icon, Pop, Portrait, SectionTitle } from "@/components/ui";
import { useApp } from "@/store/useApp";
import { levelInfo } from "@/game/logic/scoring";
import { ACHIEVEMENTS } from "@/game/data/achievements";
import { useT } from "@/lib/i18n";
import { C, F, G, R, T, type GTone } from "@/theme";

type IconName = "coin" | "bolt" | "medal" | "quiz" | "trophy" | "check";

function Stat({
  icon,
  label,
  value,
  tone,
  index,
}: {
  icon: IconName;
  label: string;
  value: string;
  tone: GTone;
  index: number;
}) {
  const g = G[tone];
  return (
    <Pop delay={index * 60} style={{ flex: 1 }}>
      <View
        accessible
        accessibilityLabel={`${label}: ${value}`}
        style={{
          backgroundColor: g.soft,
          borderRadius: R.md + 2,
          paddingVertical: 12,
          paddingHorizontal: 6,
          alignItems: "center",
          gap: 4,
          borderWidth: 3,
          borderBottomWidth: 6,
          borderColor: g.edge,
        }}
      >
        <Icon name={icon} size={28} />
        <Text
          style={{ fontFamily: F.pixelB, fontSize: T.title, color: C.navy }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontFamily: F.body,
            fontSize: T.cap,
            color: C.muted,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </View>
    </Pop>
  );
}

export default function Profil() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const profile = useApp((s) => s.profile);
  const progress = useApp((s) => s.progress);
  const signOut = useApp((s) => s.signOut);
  if (!profile || !progress) return null;
  const lv = levelInfo(progress.xp);
  const stepsDone = Object.values(progress.steps).filter((s) => s.done).length;
  const rows: [string, string][] = [
    [t("school"), profile.school],
    [t("grade"), profile.grade],
    [t("gender"), profile.gender === "L" ? t("male") : t("female")],
    [t("classCodeShort"), profile.classCode],
  ];
  return (
    <View style={{ flex: 1, backgroundColor: C.ice }}>
      {/* Latar gambar tetap di belakang, isi profil bergulir di atasnya */}
      <Image
        source={require("../../../assets/bg_profil.png")}
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {/* Kartu identitas berlatar biru penuh agar teks putih tetap terbaca di atas gambar */}
        <View
          style={{
            paddingTop: Math.max(insets.top, 10) + 16,
            paddingHorizontal: 16,
            width: "100%",
            maxWidth: 560,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              backgroundColor: G.blue.bg,
              borderWidth: 4,
              borderBottomWidth: 8,
              borderColor: G.blue.edge,
              borderRadius: R.xl,
              paddingVertical: 20,
              paddingHorizontal: 14,
              alignItems: "center",
              gap: 6,
            }}
          >
            <Portrait
              who={profile.avatar}
              mood="happy"
              size={96}
              round
              style={{ borderWidth: 5, borderColor: "#fff" }}
            />
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: F.pixelB,
                fontSize: T.hero,
                color: "#fff",
                textAlign: "center",
              }}
            >
              {profile.name}
            </Text>
            <Text
              style={{ fontFamily: F.body, color: "#fff", fontSize: T.body }}
            >
              @{profile.username}
            </Text>
            <View
              style={{
                backgroundColor: G.lemon.bg,
                borderWidth: 3,
                borderBottomWidth: 5,
                borderColor: G.lemon.edge,
                borderRadius: R.sm + 2,
                paddingHorizontal: 14,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: F.pixelB,
                  color: C.navy,
                  fontSize: T.lead,
                }}
              >
                {t("levelWord")} {lv.level}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 16,
            gap: 14,
            width: "100%",
            maxWidth: 560,
            alignSelf: "center",
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Stat
              index={0}
              tone="lemon"
              icon="coin"
              label={t("statPoints")}
              value={String(progress.poin)}
            />
            <Stat
              index={1}
              tone="aqua"
              icon="bolt"
              label={t("statXp")}
              value={String(progress.xp)}
            />
            <Stat
              index={2}
              tone="berry"
              icon="medal"
              label={t("statAchievements")}
              value={`${progress.achievements.length}/${ACHIEVEMENTS.length}`}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Stat
              index={3}
              tone="leaf"
              icon="check"
              label={t("statSteps")}
              value={`${stepsDone}/4`}
            />
            <Stat
              index={4}
              tone="grape"
              icon="quiz"
              label={t("statBestQuiz")}
              value={`${progress.quiz.best}/10`}
            />
            <Stat
              index={5}
              tone="sun"
              icon="trophy"
              label={t("statFinal")}
              value={
                progress.final
                  ? `${progress.final.score} (${progress.final.grade})`
                  : "-"
              }
            />
          </View>
          <Card style={{ gap: 10 }}>
            <SectionTitle tone="blue" style={{ marginBottom: 0 }}>
              {t("personalData")}
            </SectionTitle>
            {rows.map(([k, v]) => (
              <View
                key={k}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: F.body,
                    color: C.muted,
                    fontSize: T.body,
                  }}
                >
                  {k}
                </Text>
                <Text
                  style={{
                    flexShrink: 1,
                    textAlign: "right",
                    fontFamily: F.bodyX,
                    color: C.navy,
                    fontSize: T.body,
                  }}
                >
                  {v}
                </Text>
              </View>
            ))}
          </Card>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/achievements")}
          >
            <Card
              tone="lemon"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                minHeight: 64,
              }}
            >
              <Icon name="medal" size={32} />
              <Text
                style={{
                  flex: 1,
                  fontFamily: F.bodyX,
                  color: C.navy,
                  fontSize: T.lead,
                }}
              >
                {t("viewAchievements")}
              </Text>
              <Text
                style={{
                  fontFamily: F.bodyX,
                  color: G.lemon.deep,
                  fontSize: T.title,
                }}
              >
                {"›"}
              </Text>
            </Card>
          </Pressable>
          <Btn
            label={t("settings")}
            tone="grape"
            icon="gear"
            onPress={() => router.push("/settings")}
          />
          <Btn label={t("logout")} tone="red" onPress={() => void signOut()} />
        </View>
      </ScrollView>
    </View>
  );
}
