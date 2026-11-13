import React, { useCallback, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Btn,
  Chip,
  EmptyState,
  Icon,
  Notice,
  Pop,
  Portrait,
  ScreenHeader,
} from "@/components/ui";
import { useApp } from "@/store/useApp";
import { fetchLeaderboard, type LeaderScope } from "@/lib/progressApi";
import { useT, type Key } from "@/lib/i18n";
import { C, F, G, R, T, type GTone } from "@/theme";
import type { LeaderEntry } from "@/lib/types";

const TABS: { k: LeaderScope; label: Key }[] = [
  { k: "class", label: "scopeClass" },
  { k: "school", label: "scopeSchool" },
  { k: "all", label: "scopeAll" },
];
// Podium: emas, perak, perunggu. Teks angka memakai navy di atas ketiganya.
const MEDAL = ["#FFD23F", "#C9D3DC", "#D9954F"];
const MEDAL_EDGE = ["#C99700", "#8FA0AF", "#9A5F22"];

function Podium({ rows, me }: { rows: LeaderEntry[]; me: string }) {
  // Urutan tampil: juara 2, juara 1, juara 3. Tinggi balok mengikuti peringkat.
  const order = [1, 0, 2].filter((i) => rows[i]);
  const height = [96, 128, 76];
  const tone: GTone[] = ["lemon", "blue", "sun"];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        paddingTop: 6,
      }}
    >
      {order.map((i) => {
        const r = rows[i];
        const g = G[tone[i]];
        return (
          <Pop key={r.uid} delay={i === 0 ? 0 : 120} style={{ flex: 1 }}>
            <View
              accessible
              accessibilityLabel={`${i + 1}. ${r.name}, ${r.poin}`}
              style={{ alignItems: "center", gap: 4 }}
            >
              {i === 0 ? <Icon name="trophy" size={34} /> : null}
              <Portrait
                who={r.avatar}
                mood="happy"
                size={i === 0 ? 56 : 46}
                round
                style={{ borderWidth: 3, borderColor: MEDAL_EDGE[i] }}
              />
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: F.bodyX,
                  fontSize: T.cap + 1,
                  color: C.navy,
                  maxWidth: "100%",
                }}
              >
                {r.name.split(/\s+/)[0]}
                {r.uid === me ? " *" : ""}
              </Text>
              <View
                style={{
                  width: "100%",
                  height: height[i],
                  backgroundColor: MEDAL[i],
                  borderWidth: 3,
                  borderBottomWidth: 0,
                  borderColor: MEDAL_EDGE[i],
                  borderTopLeftRadius: R.md,
                  borderTopRightRadius: R.md,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: F.pixelB,
                    fontSize: T.hero,
                    color: C.navy,
                  }}
                >
                  {i + 1}
                </Text>
                <Text
                  style={{
                    fontFamily: F.pixelB,
                    fontSize: T.body,
                    color: C.navy,
                  }}
                >
                  {r.poin}
                </Text>
              </View>
            </View>
          </Pop>
        );
      })}
    </View>
  );
}

export default function Leaderboard() {
  const router = useRouter();
  const tt = useT();
  const profile = useApp((s) => s.profile);
  const [scope, setScope] = useState<LeaderScope>("class");
  const [rows, setRows] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(
    (sc: LeaderScope) => {
      if (!profile) return;
      setLoading(true);
      setFailed(false);
      void fetchLeaderboard(sc, {
        classId: profile.classId,
        school: profile.school,
        uid: profile.uid,
      })
        .then(setRows)
        .catch(() => {
          setRows([]);
          setFailed(true);
        })
        .finally(() => setLoading(false));
    },
    [profile],
  );
  useFocusEffect(
    useCallback(() => {
      load(scope);
    }, [load, scope]),
  );

  if (!profile) return null;
  const myRank = rows.findIndex((r) => r.uid === profile.uid) + 1;
  const hasSample = rows.some((r) => r.uid.startsWith("bot-"));

  return (
    <View style={{ flex: 1, backgroundColor: C.ice }}>
      {/* Latar gambar tetap di belakang, daftar bergulir di atasnya */}
      <Image
        source={require("../../assets/bg_leaderboard.png")}
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
        title={tt("leaderboardTitle")}
        icon="trophy"
        tone="berry"
        onBack={() => router.back()}
      />
      <View
        style={{
          width: "100%",
          maxWidth: 560,
          alignSelf: "center",
          paddingHorizontal: 16,
          paddingTop: 14,
        }}
      >
        {/* Panel putih agar pilihan cakupan dan peringkat tetap terbaca di atas gambar */}
        <View
          style={{
            gap: 10,
            backgroundColor: "#fff",
            borderRadius: R.lg,
            borderWidth: 3,
            borderBottomWidth: 6,
            borderColor: C.line,
            padding: 12,
          }}
        >
          <View
            accessibilityRole="radiogroup"
            style={{ flexDirection: "row", gap: 8 }}
          >
            {TABS.map((x) => (
              <Chip
                key={x.k}
                label={tt(x.label)}
                selected={scope === x.k}
                onPress={() => setScope(x.k)}
              />
            ))}
          </View>
          {myRank ? (
            <Text
              style={{ fontFamily: F.bodyX, color: C.navy, fontSize: T.body }}
            >
              {tt("yourRank", { n: myRank, total: rows.length })}
            </Text>
          ) : null}
          {hasSample ? (
            <Notice tone="info" text={tt("leaderboardSample")} />
          ) : null}
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 8,
          paddingBottom: 28,
          width: "100%",
          maxWidth: 560,
          alignSelf: "center",
        }}
      >
        {failed ? (
          <View
            style={{
              gap: 12,
              backgroundColor: "#fff",
              borderRadius: R.lg,
              borderWidth: 3,
              borderBottomWidth: 6,
              borderColor: C.line,
              padding: 12,
            }}
          >
            <Notice text={tt("leaderboardError")} />
            <Btn
              small
              tone="white"
              label={tt("retry")}
              onPress={() => load(scope)}
            />
          </View>
        ) : rows.length === 0 ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: R.lg,
              borderWidth: 3,
              borderBottomWidth: 6,
              borderColor: C.line,
            }}
          >
            <EmptyState
              icon="trophy"
              title={loading ? tt("loading") : tt("leaderboardEmpty")}
              hint={tt("leaderboardTitle")}
            />
          </View>
        ) : null}
        {rows.length >= 3 ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: R.lg,
              borderWidth: 3,
              borderBottomWidth: 6,
              borderColor: C.line,
              paddingHorizontal: 12,
              paddingTop: 6,
            }}
          >
            <Podium rows={rows} me={profile.uid} />
          </View>
        ) : null}
        {rows.map((r, i) => {
          const me = r.uid === profile.uid;
          const sample = r.uid.startsWith("bot-");
          return (
            <View
              key={r.uid}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: me ? G.blue.soft : "#fff",
                borderRadius: R.md + 2,
                borderWidth: 3,
                borderBottomWidth: 5,
                borderColor: me ? G.blue.edge : C.line,
                padding: 10,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: MEDAL[i] ?? C.ice,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: F.pixelB,
                    fontSize: T.lead,
                    color: C.navy,
                  }}
                >
                  {i + 1}
                </Text>
              </View>
              <Portrait who={r.avatar} mood="happy" size={44} round />
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text
                    style={{
                      flexShrink: 1,
                      fontFamily: F.bodyX,
                      fontSize: T.body + 1,
                      color: C.navy,
                    }}
                    numberOfLines={1}
                  >
                    {r.name}
                    {me ? tt("youSuffix") : ""}
                  </Text>
                  {sample ? (
                    <View
                      style={{
                        borderRadius: R.sm,
                        borderWidth: 1,
                        borderColor: C.edge,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: F.bodyB,
                          fontSize: 11,
                          color: C.muted,
                        }}
                      >
                        {tt("sampleTag")}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  style={{
                    fontFamily: F.body,
                    fontSize: T.cap,
                    color: C.muted,
                  }}
                  numberOfLines={1}
                >
                  LV {r.level} - {r.school}
                </Text>
              </View>
              <Icon name="coin" size={20} />
              <Text
                style={{
                  fontFamily: F.pixelB,
                  fontSize: T.title,
                  color: C.navy,
                }}
              >
                {r.poin}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
