import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { AUDIO } from '@/game/assets';

type SfxName = 'tap' | 'select' | 'correct' | 'wrong' | 'coin' | 'scan' | 'alert' | 'clean' | 'splash' | 'success' | 'levelup' | 'step' | 'buzz';
type BgmName = 'menu' | 'game' | 'end';

let musicOn = true;
let sfxOn = true;
let inited = false;
const sfxCache: Partial<Record<SfxName, AudioPlayer>> = {};
let bgm: AudioPlayer | null = null;
let bgmName: BgmName | null = null;

async function init() {
  if (inited) return;
  inited = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  } catch {
    /* abaikan */
  }
}

/** Musik latar dan efek suara dinyalakan terpisah. */
export function setAudioPrefs(p: { music?: boolean; sfx?: boolean }) {
  if (p.sfx !== undefined) sfxOn = p.sfx;
  if (p.music !== undefined) {
    musicOn = p.music;
    try {
      if (bgm) {
        if (musicOn) {
          bgm.volume = 0.35;
          bgm.play();
        } else {
          bgm.pause();
        }
      }
    } catch {
      /* abaikan */
    }
  }
}

export function sfx(name: SfxName) {
  if (!sfxOn) return;
  void init();
  try {
    let p = sfxCache[name];
    if (!p) {
      p = createAudioPlayer(AUDIO[`sfx_${name}` as keyof typeof AUDIO]);
      p.volume = 0.7;
      sfxCache[name] = p;
    }
    p.seekTo(0);
    p.play();
  } catch {
    /* efek suara bersifat opsional */
  }
}

export function playBgm(name: BgmName) {
  void init();
  if (bgmName === name && bgm) return;
  stopBgm();
  try {
    bgm = createAudioPlayer(AUDIO[`bgm_${name}` as keyof typeof AUDIO]);
    bgm.loop = true;
    bgm.volume = 0.35;
    if (musicOn) bgm.play();
    bgmName = name;
  } catch {
    bgm = null;
    bgmName = null;
  }
}

export function stopBgm() {
  try {
    bgm?.pause();
    bgm?.remove();
  } catch {
    /* abaikan */
  }
  bgm = null;
  bgmName = null;
}

export function tap(kind: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  try {
    if (kind === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warning') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else void Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* abaikan */
  }
}
