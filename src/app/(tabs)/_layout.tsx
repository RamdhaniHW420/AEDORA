import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Icon } from '@/components/ui';
import { C, F, G, T, lift, type GTone } from '@/theme';
import { sfx } from '@/lib/audio';
import { useT, type Key } from '@/lib/i18n';

const ITEMS: { name: string; label: Key; icon: 'home' | 'clock' | 'gamepad' | 'book' | 'user'; tone: GTone }[] = [
  { name: 'home', label: 'tabHome', icon: 'home', tone: 'blue' },
  { name: 'histori', label: 'tabHistory', icon: 'clock', tone: 'aqua' },
  { name: 'game', label: 'tabGame', icon: 'gamepad', tone: 'leaf' },
  { name: 'materi', label: 'tabMaterials', icon: 'book', tone: 'sun' },
  { name: 'profil', label: 'tabProfile', icon: 'user', tone: 'grape' },
];

function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const current = state.routes[state.index]?.name;
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', borderTopWidth: 4, borderColor: G.blue.edge, paddingBottom: Math.max(10, insets.bottom), paddingTop: 6, paddingHorizontal: 6 }}>
      {ITEMS.map((it) => {
        const active = current === it.name;
        const center = it.name === 'game';
        const label = t(it.label);
        const g = G[it.tone];
        return (
          <Pressable
            key={it.name}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              sfx('tap');
              const r = state.routes.find((x) => x.name === it.name);
              if (r) navigateToTab(r.key);
            }}
            style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}
          >
            {center ? (
              <View style={[{ marginTop: -30, width: 66, height: 66, borderRadius: 33, backgroundColor: g.bg, borderWidth: 4, borderBottomWidth: 7, borderColor: g.edge, alignItems: 'center', justifyContent: 'center' }, lift]}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="gamepad" size={32} />
                </View>
              </View>
            ) : (
              <View style={{ width: 54, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? g.bg : 'transparent', borderWidth: active ? 3 : 0, borderBottomWidth: active ? 5 : 0, borderColor: g.edge }}>
                <View style={{ opacity: active ? 1 : 0.65 }}>
                  <Icon name={it.icon} size={26} />
                </View>
              </View>
            )}
            <Text style={{ fontFamily: center ? F.pixelB : F.bodyX, fontSize: center ? 14 : T.cap, color: active ? g.deep : C.muted }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      {ITEMS.map((i) => (
        <Tabs.Screen key={i.name} name={i.name} />
      ))}
    </Tabs>
  );
}
