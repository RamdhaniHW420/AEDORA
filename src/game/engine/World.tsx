import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { CHARS, SCENE_IMAGES, UI } from "@/game/assets";
import { SCENES, type Dir, type Hotspot } from "./sceneData";
import { CharSprite, Sprite } from "./Sprite";
import { Joystick } from "./Joystick";
import { C, F } from "@/theme";
import { sfx, tap } from "@/lib/audio";
import type { AvatarId } from "@/lib/types";
import type { SceneId } from "@/game/data/places";
import { storyFor, type Speaker } from "@/game/data/story";
import { useLang, useT } from "@/lib/i18n";
import { useReduceMotion } from "@/lib/motion";
import { SCENE_NPCS } from "@/game/data/npcs";

export interface Interactable {
  label: string;
  marker?: "arrow" | "exclaim";
}

export interface WorldProps {
  sceneId: SceneId;
  spawn: string;
  avatar: AvatarId;
  interactables: Record<string, Interactable>;
  targetId?: string | null;
  frozen?: boolean;
  showDora?: boolean;
  onInteract: (id: string) => void;
}

const SPEED = 62; // px sumber per detik
const CHAT_RANGE = 20; // jarak (px sumber) agar NPC bisa diajak bicara
export const NPC_PREFIX = "npc:";
const WALK_SEQ = [0, 1, 0, 2];

export function World(props: WorldProps) {
  const names = storyFor(useLang((s) => s.lang)).SPEAKER_NAME as Record<
    string,
    string
  >;
  const t = useT();
  const reduce = useReduceMotion();
  const { sceneId, spawn, avatar } = props;
  const scene = SCENES[sceneId];
  const extras = SCENE_NPCS[sceneId] ?? [];
  const imgs = SCENE_IMAGES[sceneId];
  const [size, setSize] = useState({ w: 0, h: 0 });
  const S = size.w
    ? Math.max(
        1.9,
        Math.min(4.2, size.w / 176),
        Math.min(4.2, (size.h / scene.h) * 1.001),
      )
    : 2.2;

  const propsRef = useRef(props);
  propsRef.current = props;

  const playerXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const doraXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const cam = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const fade = useRef(new Animated.Value(1)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const input = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const dora = useRef({ x: 0, y: 0 });
  const camPx = useRef({ x: 0, y: 0, init: false });
  const walkT = useRef(0);
  const doraT = useRef(0);
  const facing = useRef<Dir>("down");

  const [anim, setAnim] = useState({
    dir: "down" as Dir,
    frame: 0,
    z: 0,
    doraFrame: 0,
  });
  const [near, setNear] = useState<string | null>(null);
  const [compass, setCompass] = useState<{ ang: number; dist: number } | null>(
    null,
  );
  const [idleTick, setIdleTick] = useState(0);

  // NPC diam bergantian menoleh; dimatikan bila pengguna meminta gerakan dikurangi
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIdleTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [reduce]);

  // loop bounce untuk penanda
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 450,
          useNativeDriver: false,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 450,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  // keyboard (web)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const keys = new Set<string>();
    const sync = () => {
      input.current = {
        x:
          (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) -
          (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0),
        y:
          (keys.has("ArrowDown") || keys.has("s") ? 1 : 0) -
          (keys.has("ArrowUp") || keys.has("w") ? 1 : 0),
      };
    };
    const down = (e: KeyboardEvent) => {
      keys.add(e.key);
      sync();
      if (e.key === "Enter" || e.key === " ") doAction();
    };
    const up = (e: KeyboardEvent) => {
      keys.delete(e.key);
      sync();
    };
    // eslint-disable-next-line no-undef
    window.addEventListener("keydown", down);
    // eslint-disable-next-line no-undef
    window.addEventListener("keyup", up);
    return () => {
      // eslint-disable-next-line no-undef
      window.removeEventListener("keydown", down);
      // eslint-disable-next-line no-undef
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hot = useMemo(
    () =>
      Object.fromEntries(scene.hotspots.map((h) => [h.id, h])) as Record<
        string,
        Hotspot
      >,
    [scene],
  );

  // inisialisasi posisi saat scene/spawn berubah
  useEffect(() => {
    const sp = scene.spawns[spawn] ??
      scene.spawns.default ?? {
        x: scene.w / 2,
        y: scene.h / 2,
        dir: "down" as Dir,
      };
    pos.current = { x: sp.x, y: sp.y };
    dora.current = { x: sp.x - 12, y: sp.y - 14 };
    facing.current = sp.dir;
    camPx.current.init = false;
    input.current = { x: 0, y: 0 };
    setAnim({ dir: sp.dir, frame: 0, z: Math.floor(sp.y), doraFrame: 0 });
    fade.setValue(1);
    Animated.timing(fade, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [sceneId, spawn, scene, fade]);

  const blocked = (x: number, y: number) => {
    if (x < 6 || x > scene.w - 6 || y < 8 || y > scene.h - 2) return true;
    const x0 = x - 4,
      x1 = x + 4,
      y0 = y - 3,
      y1 = y;
    for (const s of scene.solids) {
      if (x1 > s[0] && x0 < s[0] + s[2] && y1 > s[1] && y0 < s[1] + s[3])
        return true;
    }
    for (const n of scene.npcs) {
      if (x1 > n.x - 6 && x0 < n.x + 6 && y1 > n.y - 4 && y0 < n.y + 1)
        return true;
    }
    for (const n of extras) {
      if (x1 > n.x - 6 && x0 < n.x + 6 && y1 > n.y - 4 && y0 < n.y + 1)
        return true;
    }
    return false;
  };

  const nearestId = () => {
    const p = pos.current;
    let best: string | null = null;
    let bd = 1e9;
    for (const id of Object.keys(propsRef.current.interactables)) {
      const h = hot[id];
      if (!h) continue;
      const m = 8;
      if (
        p.x >= h.x - m &&
        p.x <= h.x + h.w + m &&
        p.y >= h.y - m &&
        p.y <= h.y + h.h + m
      ) {
        const d = Math.hypot(p.x - h.cx, p.y - h.cy);
        if (d < bd) {
          bd = d;
          best = id;
        }
      }
    }
    if (best) return best;
    let nd = CHAT_RANGE;
    for (const n of extras) {
      const d = Math.hypot(p.x - n.x, p.y - n.y);
      if (d < nd) {
        nd = d;
        best = NPC_PREFIX + n.id;
      }
    }
    return best;
  };

  if (__DEV__) {
    // alat uji: pindahkan pemain langsung (hanya build dev)
    (
      globalThis as unknown as { __aedoraWarp?: (x: number, y: number) => void }
    ).__aedoraWarp = (x, y) => {
      pos.current = { x, y };
    };
  }

  const nearRef = useRef<string | null>(null);
  nearRef.current = near;
  const doAction = () => {
    const id = nearRef.current;
    if (id && !propsRef.current.frozen) {
      sfx("select");
      tap("medium");
      propsRef.current.onInteract(id);
    }
  };

  // game loop
  useEffect(() => {
    if (!size.w) return;
    let raf = 0;
    let last = Date.now();
    let lastKey = "";
    let lastNear: string | null = null;
    let lastComp = { ang: 999, dist: -1 };
    let stepSfx = 0;

    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = propsRef.current;
      const inp = input.current;
      const mag = Math.hypot(inp.x, inp.y);
      const moving = !p.frozen && mag > 0.18;
      if (moving) {
        const sp = SPEED * Math.min(1, mag);
        const ux = inp.x / mag,
          uy = inp.y / mag;
        const nx = pos.current.x + ux * sp * dt;
        const ny = pos.current.y + uy * sp * dt;
        if (!blocked(nx, pos.current.y)) pos.current.x = nx;
        if (!blocked(pos.current.x, ny)) pos.current.y = ny;
        facing.current =
          Math.abs(ux) > Math.abs(uy)
            ? ux < 0
              ? "left"
              : "right"
            : uy < 0
              ? "up"
              : "down";
        walkT.current += dt;
        stepSfx += dt;
        if (stepSfx > 0.32) {
          stepSfx = 0;
          sfx("step");
        }
      } else {
        walkT.current = 0;
      }
      const frame = moving ? WALK_SEQ[Math.floor(walkT.current / 0.13) % 4] : 0;
      doraT.current += dt;
      const doraFrame = Math.floor(doraT.current / 0.45) % 2;
      const z = Math.floor(pos.current.y);
      const key = `${facing.current}|${frame}|${doraFrame}|${Math.floor(z / 4)}`;
      if (key !== lastKey) {
        lastKey = key;
        setAnim({ dir: facing.current, frame, z, doraFrame });
      }

      playerXY.setValue({
        x: (pos.current.x - 8) * S,
        y: (pos.current.y - 23) * S,
      });

      // Dora mengikuti
      const side =
        facing.current === "left" ? 16 : facing.current === "right" ? -16 : -14;
      const tx = pos.current.x + side,
        ty = pos.current.y - 18 - Math.sin(doraT.current * 4) * 1.2;
      dora.current.x += (tx - dora.current.x) * Math.min(1, dt * 5);
      dora.current.y += (ty - dora.current.y) * Math.min(1, dt * 5);
      doraXY.setValue({
        x: (dora.current.x - 8) * S,
        y: (dora.current.y - 8) * S,
      });

      // kamera
      const vw = size.w,
        vh = size.h;
      const ww = scene.w * S,
        wh = scene.h * S;
      let tcx = pos.current.x * S - vw / 2;
      let tcy = pos.current.y * S - vh / 2 - 20;
      tcx = ww <= vw ? (ww - vw) / 2 : Math.max(0, Math.min(ww - vw, tcx));
      tcy = wh <= vh ? (wh - vh) / 2 : Math.max(0, Math.min(wh - vh, tcy));
      if (!camPx.current.init) {
        camPx.current = { x: tcx, y: tcy, init: true };
      } else {
        camPx.current.x += (tcx - camPx.current.x) * Math.min(1, dt * 8);
        camPx.current.y += (tcy - camPx.current.y) * Math.min(1, dt * 8);
      }
      cam.setValue({ x: -camPx.current.x, y: -camPx.current.y });

      // objek interaksi terdekat
      const nid = nearestId();
      if (nid !== lastNear) {
        lastNear = nid;
        setNear(nid);
      }
      // kompas ke target
      const tid = p.targetId;
      const th = tid ? hot[tid] : undefined;
      if (th && nid !== tid) {
        const dx = th.cx - pos.current.x,
          dy = th.cy - pos.current.y;
        const ang = Math.round((Math.atan2(dy, dx) * 180) / Math.PI / 6) * 6;
        const dist = Math.round(Math.hypot(dx, dy) / 8);
        if (ang !== lastComp.ang || dist !== lastComp.dist) {
          lastComp = { ang, dist };
          setCompass({ ang, dist });
        }
      } else if (lastComp.dist !== -1) {
        lastComp = { ang: 999, dist: -1 };
        setCompass(null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, S, scene]);

  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const nearNpc =
    near && near.startsWith(NPC_PREFIX) ? near.slice(NPC_PREFIX.length) : null;
  const nearItem: Interactable | undefined = nearNpc
    ? { label: t("interactChat", { name: names[nearNpc] ?? "" }) }
    : near
      ? props.interactables[near]
      : undefined;
  const markers = Object.entries(props.interactables).filter(
    ([id, v]) => v.marker && hot[id],
  );
  const bounceY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4 * S],
  });

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0B1A2B", overflow: "hidden" }}
      onLayout={onLayout}
    >
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: scene.w * S,
          height: scene.h * S,
          transform: cam.getTranslateTransform(),
        }}
      >
        <Image
          source={imgs.bg}
          resizeMode="stretch"
          style={{
            position: "absolute",
            width: scene.w * S,
            height: scene.h * S,
          }}
        />

        {markers.map(([id, v]) => {
          const h = hot[id];
          return (
            <Animated.View
              key={id}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: (h.cx - 6) * S,
                top: (h.cy - 34) * S,
                zIndex: 9000,
                transform: [{ translateY: bounceY }],
              }}
            >
              <Image
                source={v.marker === "exclaim" ? UI.mk_exclaim : UI.mk_arrow}
                resizeMode="stretch"
                style={{
                  width: (v.marker === "exclaim" ? 10 : 12) * S,
                  height: (v.marker === "exclaim" ? 14 : 16) * S,
                }}
              />
            </Animated.View>
          );
        })}

        {scene.npcs.map((n) => (
          <View
            key={n.id}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: (n.x - 8) * S,
              top: (n.y - 23) * S,
              zIndex: n.y,
            }}
          >
            <CharSprite
              source={CHARS[n.sprite as keyof typeof CHARS]}
              dir={n.dir}
              frame={0}
              scale={S}
            />
            {names[n.id] ? <NameTag text={names[n.id]} S={S} /> : null}
          </View>
        ))}

        {extras.map((n, i) => {
          const talking = nearNpc === n.id;
          let dir: Dir = reduce
            ? n.dir
            : n.look[
                Math.floor((idleTick + i * 3) / (3 + (i % 3))) % n.look.length
              ];
          if (talking) {
            const dx = pos.current.x - n.x,
              dy = pos.current.y - n.y;
            dir =
              Math.abs(dx) > Math.abs(dy)
                ? dx < 0
                  ? "left"
                  : "right"
                : dy < 0
                  ? "up"
                  : "down";
          }
          return (
            <View
              key={n.id}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: (n.x - 8) * S,
                top: (n.y - 23) * S,
                zIndex: n.y,
              }}
            >
              <Image
                source={UI.shadow}
                resizeMode="stretch"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 19 * S,
                  width: 16 * S,
                  height: 6 * S,
                }}
              />
              <CharSprite source={CHARS[n.id]} dir={dir} frame={0} scale={S} />
              <NameTag text={names[n.id]} S={S} />
              {talking && !props.frozen ? (
                <Animated.View
                  style={{
                    position: "absolute",
                    left: 1 * S,
                    top: -26 * S,
                    width: 14 * S,
                    height: 9 * S,
                    borderRadius: 3 * S,
                    backgroundColor: "#fff",
                    borderWidth: Math.max(2, 0.8 * S),
                    borderColor: C.navy,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 1.4 * S,
                    transform: [{ translateY: bounceY }],
                  }}
                >
                  {[0, 1, 2].map((k) => (
                    <View
                      key={k}
                      style={{
                        width: 1.8 * S,
                        height: 1.8 * S,
                        borderRadius: S,
                        backgroundColor: C.navy,
                      }}
                    />
                  ))}
                </Animated.View>
              ) : null}
            </View>
          );
        })}

        {/* bayangan + pemain */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: anim.z,
            transform: playerXY.getTranslateTransform(),
          }}
        >
          <Image
            source={UI.shadow}
            resizeMode="stretch"
            style={{
              position: "absolute",
              left: 0,
              top: 19 * S,
              width: 16 * S,
              height: 6 * S,
            }}
          />
          <CharSprite
            source={CHARS[avatar]}
            dir={anim.dir}
            frame={anim.frame}
            scale={S}
          />
        </Animated.View>

        {props.showDora ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: anim.z + 1,
              transform: doraXY.getTranslateTransform(),
            }}
          >
            <Sprite
              source={CHARS.dora}
              cols={2}
              rows={1}
              fw={16}
              fh={16}
              col={anim.doraFrame}
              row={0}
              scale={S}
            />
          </Animated.View>
        ) : null}

        {imgs.fg ? (
          <Image
            source={imgs.fg}
            resizeMode="stretch"
            pointerEvents="none"
            style={{
              position: "absolute",
              width: scene.w * S,
              height: scene.h * S,
              zIndex: 8000,
            }}
          />
        ) : null}
      </Animated.View>

      {/* kompas menuju target */}
      {compass && !props.frozen ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 214,
            right: 12,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: C.navy,
              borderWidth: 2,
              borderColor: C.sky,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ transform: [{ rotate: `${compass.ang}deg` }] }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontFamily: F.pixelB,
                  lineHeight: 26,
                }}
              >
                {">"}
              </Text>
            </View>
          </View>
          <Text
            style={{
              marginTop: 2,
              fontFamily: F.pixelB,
              color: "#fff",
              fontSize: 11,
              textShadowColor: "#000",
              textShadowRadius: 3,
            }}
          >
            {compass.dist * 1} m
          </Text>
        </View>
      ) : null}

      {/* kontrol */}
      {!props.frozen ? (
        <>
          <View style={{ position: "absolute", left: 16, bottom: 22 }}>
            <Joystick onChange={(x, y) => (input.current = { x, y })} />
          </View>
          <View
            style={{
              position: "absolute",
              right: 18,
              bottom: 28,
              alignItems: "center",
              gap: 6,
            }}
          >
            {nearItem ? (
              <View
                style={{
                  backgroundColor: C.navy,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: C.sky,
                }}
              >
                <Text
                  style={{ color: "#fff", fontFamily: F.bodyX, fontSize: 13 }}
                >
                  {nearItem.label}
                </Text>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={nearItem?.label ?? "A"}
              onPress={doAction}
              style={({ pressed }) => ({
                width: 84,
                height: 84,
                borderRadius: 42,
                backgroundColor: nearItem ? "#fff" : "rgba(255,255,255,0.45)",
                borderWidth: 4,
                borderColor: nearItem ? C.blue : "rgba(255,255,255,0.7)",
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.94 : nearItem ? 1.04 : 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: F.pixelB,
                  fontSize: 26,
                  color: nearItem ? C.blueDeep : "rgba(22,59,94,0.5)",
                }}
              >
                A
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: C.navy,
          opacity: fade,
        }}
      />
    </View>
  );
}

function NameTag({ text, S }: { text: string; S: number }) {
  return (
    <View
      style={{
        position: "absolute",
        top: -11 * S * 0.9,
        left: -10 * S,
        width: 36 * S,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontFamily: F.pixelB,
          fontSize: Math.max(9, 4.4 * S),
          color: "#fff",
          backgroundColor: "rgba(22,59,94,0.85)",
          paddingHorizontal: 5,
          paddingVertical: 1,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export type { Speaker };
