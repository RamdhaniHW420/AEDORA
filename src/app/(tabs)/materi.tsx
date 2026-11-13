import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SLIDES } from "@/game/assets";
import { slidesFor } from "@/game/data/content";
import { POINT_TONES } from "@/game/ui/SlideBoard";
import { Btn, Card, Portrait, ScreenHeader } from "@/components/ui";
import { useLang, useT } from "@/lib/i18n";
import { C, F, G, R, T } from "@/theme";

export default function Materi() {
  const router = useRouter();
  const tt = useT();
  const lang = useLang((s) => s.lang);
  return (
    <View style={{ flex: 1, backgroundColor: C.ice }}>
      {/* Latar gambar tetap di belakang, kartu materi bergulir di atasnya */}
      <Image
        source={require("../../../assets/bg_materi.png")}
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
        title={tt("materialsTitle")}
        subtitle={tt("materialsSub")}
        icon="book"
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
        {slidesFor(lang).map((s, n) => {
          const g = G[POINT_TONES[n % POINT_TONES.length]];
          return (
            <Card
              key={s.id}
              style={{ padding: 0, overflow: "hidden", borderColor: g.edge }}
            >
              <Image
                accessibilityLabel={s.title}
                source={SLIDES[s.image]}
                resizeMode="stretch"
                style={{ width: "100%", aspectRatio: 96 / 60 }}
              />
              <View style={{ padding: 16, gap: 10 }}>
                <Text
                  accessibilityRole="header"
                  style={{
                    fontFamily: F.pixelB,
                    fontSize: T.title + 2,
                    color: g.deep,
                  }}
                >
                  {s.title}
                </Text>
                {s.points.map((pt, i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 10 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: R.sm + 2,
                        backgroundColor: g.bg,
                        borderWidth: 3,
                        borderBottomWidth: 5,
                        borderColor: g.edge,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: F.pixelB,
                          color: g.text,
                          fontSize: T.body,
                        }}
                      >
                        {i + 1}
                      </Text>
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: F.body,
                        fontSize: T.body + 1,
                        lineHeight: 22,
                        color: C.navy,
                      }}
                    >
                      {pt}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          );
        })}
        <Card
          tone="grape"
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            padding: 12,
          }}
        >
          <Portrait who="teacher" mood="happy" size={56} />
          <Text
            style={{
              flex: 1,
              fontFamily: F.bodyB,
              fontSize: T.body,
              lineHeight: 20,
              color: C.navy,
            }}
          >
            {tt("materialsReady")}
          </Text>
        </Card>
        <Btn
          label={tt("practiceQuiz")}
          icon="quiz"
          onPress={() => router.push("/quiz")}
        />
      </ScrollView>
    </View>
  );
}
