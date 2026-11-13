import React from "react";
import { Image, ScrollView, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Btn } from "@/components/ui";
import { AuthBackdrop } from "@/components/AuthBackdrop";
import { LangSwitch } from "@/components/LangSwitch";
import { useT } from "@/lib/i18n";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const LOGO = require("../../assets/logo_light.png");

export default function Welcome() {
  const router = useRouter();
  const t = useT();
  const { width } = useWindowDimensions();
  const logoW = Math.min(300, width * 0.78);
  return (
    <View style={{ flex: 1, backgroundColor: "#1665D8" }}>
      <AuthBackdrop />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          paddingTop: 56,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "flex-end" }}>
          <LangSwitch />
        </View>
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <Image
            accessibilityLabel="AEDORA, Digital Innovation, Dengue Prevention"
            source={LOGO}
            resizeMode="contain"
            style={{ width: logoW, height: logoW * 1 }}
          />
        </View>
        <View style={{ flex: 1, minHeight: 120 }} />
        <View style={{ gap: 12 }}>
          <Btn
            label={t("welcomeStart")}
            tone="leaf"
            onPress={() => router.push("/login")}
          />
          <Btn
            label={t("welcomeRegister")}
            tone="white"
            onPress={() => router.push("/register")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
