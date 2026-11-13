import { create } from 'zustand';
import { watchAuth, loadProfile, register, login, logout, type RegisterInput } from '@/lib/authApi';
import { loadProgress, saveProgress, logEvent } from '@/lib/progressApi';
import { derive, emptyProgress } from '@/game/logic/scoring';
import { ACHIEVEMENTS, type Achievement } from '@/game/data/achievements';
import { setAudioPrefs } from '@/lib/audio';
import { getJSON, setJSON } from '@/lib/storage';
import type { ActivityEvent, Progress, UserProfile } from '@/lib/types';

interface AppState {
  ready: boolean;
  uid: string | null;
  profile: UserProfile | null;
  progress: Progress | null;
  music: boolean;
  sfxOn: boolean;
  badgeToast: Achievement | null;
  init: () => () => void;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  update: (mutator: (p: Progress) => Progress, ev?: Omit<ActivityEvent, 'at'>) => Promise<void>;
  setActivity: (step: number, label: string) => void;
  toggleMusic: () => void;
  toggleSfx: () => void;
  clearToast: () => void;
}

async function loadProfileRetry(uid: string): Promise<UserProfile | null> {
  for (let i = 0; i < 6; i++) {
    try {
      const p = await loadProfile(uid);
      if (p) return p;
    } catch {
      /* coba lagi */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

async function hydrate(uid: string, set: (s: Partial<AppState>) => void) {
  const profile = await loadProfileRetry(uid);
  if (!profile) {
    set({ uid: null, profile: null, progress: null, ready: true });
    return;
  }
  let progress = await loadProgress(uid);
  if (!progress) {
    progress = emptyProgress({ uid, classId: profile.classId, name: profile.name, avatar: profile.avatar, school: profile.school, grade: profile.grade });
    await saveProgress(progress);
    void logEvent(uid, { type: 'login', step: 0, title: 'Bergabung di AEDORA', detail: `Kelas ${profile.grade}, ${profile.school}`, points: 0, at: Date.now() });
  } else {
    progress = derive({ ...progress, name: profile.name, avatar: profile.avatar });
  }
  set({ uid, profile, progress, ready: true });
}

export const useApp = create<AppState>((set, get) => ({
  ready: false,
  uid: null,
  profile: null,
  progress: null,
  music: true,
  sfxOn: true,
  badgeToast: null,

  init: () => {
    void Promise.all([getJSON<boolean | null>('aedora:music', null), getJSON<boolean | null>('aedora:sfx', null), getJSON<boolean>('aedora:muted', false)]).then(([m, s, legacy]) => {
      const music = m ?? !legacy;
      const sfxOn = s ?? !legacy;
      setAudioPrefs({ music, sfx: sfxOn });
      set({ music, sfxOn });
    });
    return watchAuth((uid) => {
      if (!uid) {
        set({ uid: null, profile: null, progress: null, ready: true });
        return;
      }
      if (get().uid === uid && get().profile) {
        set({ ready: true });
        return;
      }
      void hydrate(uid, set);
    });
  },

  signIn: async (username, password) => {
    await login(username, password);
    // Mode demo tidak punya listener realtime
    const { setDemoSessionListener } = await import('@/lib/authApi');
    const demoUid = await setDemoSessionListener();
    if (demoUid) await hydrate(demoUid, set);
  },

  signUp: async (input) => {
    const profile = await register(input);
    await hydrate(profile.uid, set);
  },

  signOut: async () => {
    await logout();
    set({ uid: null, profile: null, progress: null });
  },

  update: async (mutator, ev) => {
    const cur = get().progress;
    if (!cur) return;
    const now = Date.now();
    const before = new Set(cur.achievements);
    const next = derive(mutator({ ...cur, updatedAt: now, lastActiveAt: now }));
    const unlocked = next.achievements.filter((a) => !before.has(a));
    set({ progress: next, badgeToast: unlocked.length ? (ACHIEVEMENTS.find((a) => a.id === unlocked[0]) ?? null) : get().badgeToast });
    if (ev) void logEvent(next.uid, { ...ev, at: now });
    await saveProgress(next);
  },

  setActivity: (step, label) => {
    const cur = get().progress;
    if (!cur) return;
    void get().update((p) => ({ ...p, activity: { step, label, at: Date.now() } }));
  },

  toggleMusic: () => {
    const v = !get().music;
    setAudioPrefs({ music: v });
    set({ music: v });
    void setJSON('aedora:music', v);
  },

  toggleSfx: () => {
    const v = !get().sfxOn;
    setAudioPrefs({ sfx: v });
    set({ sfxOn: v });
    void setJSON('aedora:sfx', v);
  },

  clearToast: () => set({ badgeToast: null }),
}));
