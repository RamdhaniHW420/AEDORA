import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, TextInput, View, type ImageSourcePropType, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, CH, F, G, R, T, type GTone } from '@/theme';
import { ICONS, PORTRAITS } from '@/game/assets';
import { sfx, tap } from '@/lib/audio';
import { useReduceMotion } from '@/lib/motion';
import { useT } from '@/lib/i18n';
import type { AvatarId } from '@/lib/types';

/** Cincin fokus untuk pengguna keyboard (web dan perangkat dengan keyboard). */
function useFocus() {
  const [focused, setFocused] = useState(false);
  const style: ViewStyle = focused && Platform.OS === 'web' ? ({ outlineStyle: 'solid', outlineWidth: 3, outlineColor: C.navy, outlineOffset: 2 } as ViewStyle) : {};
  return { style, onFocus: () => setFocused(true), onBlur: () => setFocused(false) };
}

// ---------- Gerak ----------
/** Muncul dengan pantulan kecil saat layar dibuka. Satu kali, tidak berulang. */
export function Pop({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) {
      v.setValue(1);
      return;
    }
    Animated.sequence([Animated.delay(delay), Animated.spring(v, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true })]).start();
  }, [delay, reduce, v]);
  return (
    <Animated.View style={[style, { opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }, { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>{children}</Animated.View>
  );
}

/** Mengambang naik turun pelan. Dipakai hanya untuk maskot dan hadiah. */
export function Float({ children, amp = 4, period = 1700, style }: { children: React.ReactNode; amp?: number; period?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const l = Animated.loop(
      Animated.sequence([Animated.timing(v, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true })]),
    );
    l.start();
    return () => l.stop();
  }, [period, reduce, v]);
  return <Animated.View style={[style, { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amp] }) }] }]}>{children}</Animated.View>;
}

// ---------- Dekor piksel ----------
/** Tepi bawah bergerigi seperti benteng 8-bit. Menggantikan sudut membulat pada pita header. */
export function CastleEdge({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <View pointerEvents="none" style={{ height: size, flexDirection: 'row', overflow: 'hidden', width: '100%' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', width: size * 2 }}>
          <View style={{ width: size, height: size, backgroundColor: color }} />
          <View style={{ width: size, height: size / 2, backgroundColor: color }} />
        </View>
      ))}
    </View>
  );
}

/** Awan piksel dari kotak-kotak. */
export function PixelCloud({ u = 6, color = '#FFFFFF', opacity = 0.9, style }: { u?: number; color?: string; opacity?: number; style?: StyleProp<ViewStyle> }) {
  const rows: [number, number][] = [
    [2, 3],
    [1, 5],
    [0, 7],
  ];
  return (
    <View pointerEvents="none" style={[{ width: u * 7, height: u * 3, opacity }, style]}>
      {rows.map(([x, n], i) => (
        <View key={i} style={{ position: 'absolute', left: x * u, top: i * u, width: n * u, height: u, backgroundColor: color }} />
      ))}
    </View>
  );
}

// ---------- Tombol ----------
// Tombol game: garis tebal, sisi bawah tebal, kilau di atas. Turun saat ditekan.
type Tone = GTone | 'white' | 'gold' | 'green';
const toneOf = (tone: Tone) => {
  if (tone === 'white') return { bg: '#fff', edge: C.line, text: C.navy };
  const k: GTone = tone === 'gold' ? 'lemon' : tone === 'green' ? 'leaf' : tone;
  return { bg: G[k].bg, edge: G[k].edge, text: G[k].text };
};

export function Btn({ label, onPress, tone = 'blue', disabled, small, style, icon, loading }: { label: string; onPress?: () => void; tone?: Tone; disabled?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; icon?: keyof typeof ICONS; loading?: boolean }) {
  const tx = useT();
  const f = useFocus();
  const t = disabled ? { bg: '#E3ECF3', edge: '#C5D6E3', text: C.muted } : toneOf(tone);
  const text = loading ? tx('loading') : label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onFocus={f.onFocus}
      onBlur={f.onBlur}
      onPress={() => {
        sfx('tap');
        tap('light');
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          minHeight: small ? 46 : 56,
          backgroundColor: t.bg,
          borderRadius: R.md + 2,
          borderWidth: 3,
          borderColor: t.edge,
          borderBottomWidth: pressed ? 3 : 7,
          paddingHorizontal: small ? 16 : 22,
          marginTop: pressed ? 4 : 0,
          marginBottom: pressed ? -4 : 0,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          overflow: 'hidden',
        },
        f.style,
        style,
      ]}
    >
      {disabled ? null : <View pointerEvents="none" style={{ position: 'absolute', top: 3, left: 10, right: 10, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.38)' }} />}
      {icon ? <Image source={ICONS[icon]} style={{ width: 24, height: 24 }} resizeMode="stretch" /> : null}
      <Text numberOfLines={2} style={{ color: t.text, fontFamily: F.pixelB, fontSize: small ? T.lead : T.title - 1, textAlign: 'center', flexShrink: 1 }}>
        {text}
      </Text>
    </Pressable>
  );
}

// ---------- Kartu ----------
// Panel putih dengan garis tebal dan sisi bawah lebih tebal supaya terasa timbul. Dengan tone, panel berwarna lembut.
export function Card({ children, style, border, tone }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; border?: string; tone?: GTone }) {
  const col = tone ? G[tone] : null;
  return (
    <View
      style={[
        { backgroundColor: col ? col.soft : '#fff', borderRadius: R.lg, borderWidth: 3, borderBottomWidth: 6, borderColor: border ?? (col ? col.edge : C.line), padding: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- Bar XP bersegmen ----------
export function XPBar({ value, max, segments = 10, onBlue = false, tone = 'leaf' }: { value: number; max: number; segments?: number; onBlue?: boolean; tone?: GTone }) {
  const filled = Math.round((Math.min(value, max) / Math.max(max, 1)) * segments);
  const fill = onBlue ? G.lemon.bg : G[tone].bg;
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max, now: Math.min(value, max) }} style={{ flexDirection: 'row', gap: 3, flex: 1, padding: 3, borderRadius: 8, backgroundColor: onBlue ? 'rgba(6,40,70,0.55)' : '#C5DDEC' }}>
      {Array.from({ length: segments }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 12, borderRadius: 3, backgroundColor: i < filled ? fill : onBlue ? 'rgba(255,255,255,0.18)' : '#EAF4FA' }}>
          {i < filled ? <View style={{ height: 3, margin: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' }} /> : null}
        </View>
      ))}
    </View>
  );
}

/** Kapsul angka berwarna: koin, level, dan sejenisnya. */
export function Pill({ icon, text, tone = 'lemon' }: { icon: keyof typeof ICONS; text: string; tone?: GTone }) {
  const g = G[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: g.bg, borderRadius: 999, paddingVertical: 5, paddingLeft: 8, paddingRight: 12, borderWidth: 3, borderColor: g.edge }}>
      <Image source={ICONS[icon]} style={{ width: 22, height: 22 }} resizeMode="stretch" />
      <Text style={{ fontFamily: F.pixelB, color: g.text, fontSize: T.lead }}>{text}</Text>
    </View>
  );
}

export function Icon({ name, size = 24, style, label }: { name: keyof typeof ICONS; size?: number; style?: StyleProp<ViewStyle>; label?: string }) {
  return <Image accessible={!!label} accessibilityLabel={label} source={ICONS[name]} style={[{ width: size, height: size }, style as object]} resizeMode="stretch" />;
}

/** Potret karakter dari sprite sheet 3 ekspresi (96x32 -> 384x128) */
export function Portrait({ who, mood = 'neutral', size = 72, round = false, style }: { who: keyof typeof PORTRAITS; mood?: 'neutral' | 'happy' | 'worried'; size?: number; round?: boolean; style?: StyleProp<ViewStyle> }) {
  const col = mood === 'neutral' ? 0 : mood === 'happy' ? 1 : 2;
  return (
    <View style={[{ width: size, height: size, overflow: 'hidden', borderRadius: round ? size / 2 : R.md, backgroundColor: '#CFE9F8' }, style]}>
      <Image source={PORTRAITS[who]} style={{ width: size * 3, height: size, marginLeft: -col * size }} resizeMode="stretch" />
    </View>
  );
}

export function Title({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text accessibilityRole="header" style={[{ fontFamily: F.pixelB, fontSize: T.title + 2, color: C.navy }, style]}>{children}</Text>;
}

/** Judul bagian di dalam layar, dengan blok warna kecil sebagai penanda. */
export function SectionTitle({ children, style, tone = 'blue' }: { children: React.ReactNode; style?: StyleProp<TextStyle>; tone?: GTone }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <View style={{ width: 10, height: 18, borderRadius: 2, backgroundColor: G[tone].bg, borderWidth: 2, borderColor: G[tone].edge }} />
      <Text accessibilityRole="header" style={[{ fontFamily: F.pixelB, fontSize: T.title - 2, color: C.navy }, style]}>{children}</Text>
    </View>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: F.bodyB, color: C.navy, fontSize: T.body }}>{label}</Text>
      {children}
    </View>
  );
}

/** Kolom isian dengan batas 3:1 dan keadaan fokus yang jelas. */
export function Input(props: TextInputProps & { mono?: boolean }) {
  const [focused, setFocused] = useState(false);
  const { mono, style, onFocus, onBlur, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={C.hint}
      {...rest}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[inputStyle, focused && { borderColor: C.blue, paddingHorizontal: 13 }, mono && { fontFamily: F.pixelB, letterSpacing: 2 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object), style]}
    />
  );
}

export const inputStyle = {
  minHeight: 52,
  backgroundColor: '#fff',
  borderRadius: R.md + 2,
  borderWidth: 3,
  borderBottomWidth: 5,
  borderColor: C.edge,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontFamily: F.body,
  fontSize: T.lead,
  color: C.navy,
} as const;

// ---------- Pilihan (kelas, jenis kelamin, bahasa) ----------
export function Chip({ label, selected, onPress, style, flex = true, tone = 'blue' }: { label: string; selected: boolean; onPress: () => void; style?: StyleProp<ViewStyle>; flex?: boolean; tone?: GTone }) {
  const f = useFocus();
  const g = G[tone];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onFocus={f.onFocus}
      onBlur={f.onBlur}
      onPress={() => {
        sfx('tap');
        onPress();
      }}
      style={({ pressed }) => [{ flex: flex ? 1 : undefined, minHeight: 50, paddingHorizontal: 14, borderRadius: R.md + 2, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? g.bg : '#fff', borderWidth: 3, borderBottomWidth: selected || pressed ? 3 : 5, borderColor: selected ? g.edge : C.edge, marginTop: selected || pressed ? 2 : 0 }, f.style, style]}
    >
      <Text style={{ fontFamily: F.pixelB, fontSize: T.lead, color: selected ? g.text : C.navy }}>{label}</Text>
    </Pressable>
  );
}

// ---------- Kartu menu (beranda) ----------
type TileTone = GTone | 'sky' | 'white';
export function Tile({ icon, label, tone = 'blue', onPress, index = 0 }: { icon: keyof typeof ICONS; label: string; tone?: TileTone; onPress: () => void; index?: number }) {
  const f = useFocus();
  const k: GTone = tone === 'sky' ? 'aqua' : tone === 'white' ? 'navy' : tone;
  const g = G[k];
  return (
    <Pop delay={index * 55} style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onFocus={f.onFocus}
        onBlur={f.onBlur}
        onPress={() => {
          sfx('tap');
          tap('light');
          onPress();
        }}
        style={({ pressed }) => [{ minHeight: 112, backgroundColor: g.bg, borderRadius: R.lg, borderWidth: 3, borderBottomWidth: pressed ? 3 : 7, borderColor: g.edge, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 0, marginTop: pressed ? 4 : 0, overflow: 'hidden' }, f.style]}
      >
        <View pointerEvents="none" style={{ position: 'absolute', top: 3, left: 10, right: 10, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' }} />
        <View style={{ width: 54, height: 54, borderRadius: R.md + 2, backgroundColor: '#fff', borderWidth: 3, borderColor: g.edge, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={32} />
        </View>
        <Text numberOfLines={2} style={{ fontFamily: F.bodyX, fontSize: T.cap, lineHeight: 15, color: g.text, textAlign: 'center' }}>
          {label}
        </Text>
      </Pressable>
    </Pop>
  );
}

// ---------- Header layar ----------
export function ScreenHeader({ title, subtitle, icon, onBack, right, tone = 'blue' }: { title: string; subtitle?: string; icon?: keyof typeof ICONS; onBack?: () => void; right?: React.ReactNode; tone?: GTone }) {
  const insets = useSafeAreaInsets();
  const tx = useT();
  const f = useFocus();
  const g = G[tone];
  const onLight = g.text !== '#FFFFFF';
  const ink = onLight ? C.navy : '#fff';
  return (
    <View>
      <View style={{ backgroundColor: g.bg, paddingTop: Math.max(insets.top, 10) + 12, paddingHorizontal: 18, paddingBottom: 14, gap: 12, overflow: 'hidden' }}>
        <PixelCloud u={7} opacity={0.22} style={{ position: 'absolute', right: 54, top: 36 }} />
        <PixelCloud u={5} opacity={0.18} style={{ position: 'absolute', right: -6, top: 86 }} />
        {onBack || right ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 46 }}>
            {onBack ? (
              <Pressable accessibilityRole="button" accessibilityLabel={tx('back')} onFocus={f.onFocus} onBlur={f.onBlur} onPress={onBack} style={[{ minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(6,40,70,0.38)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.55)' }, f.style]}>
                <Text style={{ fontFamily: F.pixelB, color: '#fff', fontSize: T.lead }}>{'‹'}</Text>
                <Text style={{ fontFamily: F.pixelB, color: '#fff', fontSize: T.body }}>{tx('back')}</Text>
              </Pressable>
            ) : (
              <View />
            )}
            {right}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {icon ? (
            <View style={{ width: 56, height: 56, borderRadius: R.md + 2, backgroundColor: '#fff', borderWidth: 3, borderBottomWidth: 6, borderColor: g.edge, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={34} />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, color: ink, fontSize: T.hero, textShadowColor: onLight ? 'rgba(255,255,255,0.45)' : 'rgba(6,40,70,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 }}>
              {title}
            </Text>
            {subtitle ? <Text style={{ fontFamily: F.bodyB, color: ink, fontSize: T.body, marginTop: 2 }}>{subtitle}</Text> : null}
          </View>
        </View>
      </View>
      <CastleEdge color={g.bg} />
    </View>
  );
}

// ---------- Lintasan bab ----------
/** Empat simpul bab yang tersambung. Selesai: centang, berjalan: angka berdenyut, terkunci: gembok. */
export function ChapterTrail({ currentStep, done }: { currentStep: number; done: Record<number, boolean> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4].map((n, i) => {
        const g = G[CH[i]];
        const isDone = !!done[n];
        const open = n <= currentStep;
        return (
          <React.Fragment key={n}>
            {i > 0 ? <View style={{ flex: 1, height: 6, backgroundColor: done[n - 1] ? G[CH[i - 1]].bg : '#B7D4E8', borderRadius: 3 }} /> : null}
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: open ? g.bg : '#fff', borderWidth: 3, borderBottomWidth: 5, borderColor: open ? g.edge : C.line, alignItems: 'center', justifyContent: 'center' }}>
              {isDone ? <Icon name="check" size={22} /> : open ? <Text style={{ fontFamily: F.pixelB, fontSize: T.title - 2, color: g.text }}>{n}</Text> : <Icon name="lock" size={20} />}
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

/** Peringkat tiga perisai dari skor bab. Perisai adalah motif identitas AEDORA. */
export function ShieldRating({ score, size = 26 }: { score: number; size?: number }) {
  const n = score >= 90 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0;
  return (
    <View accessible accessibilityLabel={`${n}/3`} style={{ flexDirection: 'row', gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ opacity: i < n ? 1 : 0.25 }}>
          <Icon name="shield" size={size} />
        </View>
      ))}
    </View>
  );
}

// ---------- Keadaan kosong ----------
export function EmptyState({ icon, title, hint, action }: { icon: keyof typeof ICONS; title: string; hint: string; action?: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 36, paddingHorizontal: 24 }}>
      <Float amp={5}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', borderWidth: 3, borderBottomWidth: 6, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={52} />
        </View>
      </Float>
      <Text style={{ fontFamily: F.pixelB, fontSize: T.title, color: C.navy, textAlign: 'center' }}>{title}</Text>
      <Text style={{ fontFamily: F.body, fontSize: T.body, color: C.muted, textAlign: 'center', lineHeight: 21, maxWidth: 280 }}>{hint}</Text>
      {action ? <View style={{ marginTop: 6, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  );
}

export function PxImage({ source, style }: { source: ImageSourcePropType; style?: StyleProp<object> }) {
  return <Image source={source} style={style as object} resizeMode="stretch" />;
}

export const sheet = StyleSheet.create({ fill: { flex: 1 } });

/** Pesan galat atau info: teks plus ikon, tidak hanya warna. */
export function Notice({ text, tone = 'error' }: { text: string; tone?: 'error' | 'info' }) {
  const error = tone === 'error';
  return (
    <View
      accessibilityRole={error ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: R.md, borderWidth: 3, borderColor: error ? C.redDeep : C.sky, backgroundColor: error ? '#FDECEC' : C.surface }}
    >
      <Icon name={error ? 'cross' : 'chat'} size={24} />
      <Text style={{ flex: 1, fontFamily: F.bodyB, fontSize: T.body, lineHeight: 20, color: error ? '#8E1C1D' : C.navy }}>{text}</Text>
    </View>
  );
}
