import React, { useCallback, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Btn,
  EmptyState,
  Icon,
  Notice,
  Pop,
  ScreenHeader,
} from "@/components/ui";
import { useApp } from "@/store/useApp";
import { fetchEvents } from "@/lib/progressApi";
import { tr, useLang, useT } from "@/lib/i18n";
import { C, F, G, R, T, type GTone } from "@/theme";
import type { ActivityEvent } from "@/lib/types";

const ICON = {
  quiz: "quiz",
  place: "camera",
  step: "gamepad",
  ending: "medal",
  login: "user",
} as const;

// Warna lencana per jenis kejadian, sama seperti warna tombol di bagian game lain.
const TONE: Record<ActivityEvent["type"], GTone> = {
  quiz: "grape",
  place: "aqua",
  step: "leaf",
  ending: "lemon",
  login: "blue",
};

export function timeAgo(at: number) {
  const m = Math.floor((Date.now() - at) / 60000);
  if (m < 1) return tr("agoNow");
  if (m < 60) return tr("agoMin", { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return tr("agoHour", { n: h });
  return tr("agoDay", { n: Math.floor(h / 24) });
}

export default function Histori() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const router = useRouter();
  const uid = useApp((s) => s.uid);
  const [items, setItems] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    if (!uid) return;
    setLoading(true);
    setFailed(false);
    void fetchEvents(uid)
      .then(setItems)
      .catch(() => {
        setItems([]);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, [uid]);

  useFocusEffect(load);

  return (
    <View style={{ flex: 1, backgroundColor: C.ice }}>
      {/* Latar gambar tetap di belakang, daftar bergulir di atasnya */}
      <Image
        source={require("../../../assets/bg_home.png")}
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
        title={t("historyTitle")}
        subtitle={t("historySub")}
        icon="clock"
        tone="aqua"
      />
      <FlatList
        data={items}
        keyExtractor={(e, i) => e.id ?? String(i)}
        contentContainerStyle={{
          padding: 16,
          gap: 10,
          paddingBottom: 28,
          width: "100%",
          maxWidth: 560,
          alignSelf: "center",
        }}
        ListEmptyComponent={
          // Panel putih agar teks keadaan kosong tetap terbaca di atas gambar apa pun
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: R.xl,
              borderWidth: 3,
              borderBottomWidth: 6,
              borderColor: C.line,
              marginTop: 8,
            }}
          >
            {loading ? (
              <EmptyState
                icon="clock"
                title={t("loading")}
                hint={t("historySub")}
              />
            ) : failed ? (
              <View style={{ gap: 12, padding: 16 }}>
                <Notice text={t("historyError")} />
                <Btn small tone="white" label={t("retry")} onPress={load} />
              </View>
            ) : (
              <EmptyState
                icon="gamepad"
                title={t("historyEmptyTitle")}
                hint={t("historyEmptyHint")}
                action={
                  <Btn
                    label={t("goToGame")}
                    onPress={() => router.push("/game")}
                  />
                }
              />
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const g = G[TONE[item.type]];
          const title =
            lang === "en" && item.titleEn ? item.titleEn : item.title;
          const detail =
            lang === "en" && item.detailEn ? item.detailEn : item.detail;
          return (
            <Pop delay={Math.min(index, 6) * 40}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  backgroundColor: "#fff",
                  borderRadius: R.md + 2,
                  padding: 12,
                  borderWidth: 3,
                  borderBottomWidth: 5,
                  borderColor: C.line,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: R.md,
                    backgroundColor: g.bg,
                    borderWidth: 3,
                    borderBottomWidth: 5,
                    borderColor: g.edge,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={ICON[item.type]} size={28} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: F.bodyX,
                      fontSize: T.body + 1,
                      color: C.navy,
                    }}
                  >
                    {title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: F.body,
                      fontSize: T.cap + 1,
                      color: C.muted,
                    }}
                  >
                    {detail}
                  </Text>
                  <Text
                    style={{
                      fontFamily: F.body,
                      fontSize: T.cap,
                      color: C.muted,
                      marginTop: 2,
                    }}
                  >
                    {timeAgo(item.at)}
                  </Text>
                </View>
                {item.points ? (
                  <Text
                    style={{
                      fontFamily: F.pixelB,
                      fontSize: T.lead,
                      color: G.leaf.deep,
                    }}
                  >
                    +{item.points}
                  </Text>
                ) : null}
              </View>
            </Pop>
          );
        }}
      />
    </View>
  );
}
