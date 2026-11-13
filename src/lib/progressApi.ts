import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isFirebaseConfigured } from '@/config';
import { getJSON, setJSON } from '@/lib/storage';
import type { ActivityEvent, AvatarId, LeaderEntry, Progress } from '@/lib/types';

const localKey = (uid: string) => `aedora:progress:${uid}`;
const eventsKey = (uid: string) => `aedora:events:${uid}`;
const LB_KEY = 'aedora:leaderboard';

export async function loadProgress(uid: string): Promise<Progress | null> {
  const local = await getJSON<Progress | null>(localKey(uid), null);
  if (!isFirebaseConfigured || !db) return local;
  try {
    const snap = await getDoc(doc(db, 'progress', uid));
    const remote = snap.exists() ? (snap.data() as Progress) : null;
    if (remote && local) return remote.updatedAt >= local.updatedAt ? remote : local;
    return remote ?? local;
  } catch {
    return local;
  }
}

export async function saveProgress(p: Progress): Promise<void> {
  await setJSON(localKey(p.uid), p);
  if (!isFirebaseConfigured || !db) {
    await upsertLocalLeader(p);
    return;
  }
  try {
    await setDoc(doc(db, 'progress', p.uid), p);
    const entry: LeaderEntry = { uid: p.uid, name: p.name, avatar: p.avatar, school: p.school, classId: p.classId, poin: p.poin, level: p.level, finalScore: p.finalScore, updatedAt: p.updatedAt };
    await setDoc(doc(db, 'leaderboard', p.uid), entry);
  } catch {
    /* data lokal tetap aman; akan tersinkron saat simpan berikutnya */
  }
}

export async function logEvent(uid: string, ev: ActivityEvent): Promise<void> {
  const list = await getJSON<ActivityEvent[]>(eventsKey(uid), []);
  list.unshift(ev);
  await setJSON(eventsKey(uid), list.slice(0, 80));
  if (!isFirebaseConfigured || !db) return;
  try {
    await addDoc(collection(db, 'progress', uid, 'events'), ev);
  } catch {
    /* abaikan */
  }
}

export async function fetchEvents(uid: string): Promise<ActivityEvent[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(query(collection(db, 'progress', uid, 'events'), orderBy('at', 'desc'), limit(60)));
      return snap.docs.map((d) => ({ ...(d.data() as ActivityEvent), id: d.id }));
    } catch {
      /* jatuh ke lokal */
    }
  }
  return getJSON<ActivityEvent[]>(eventsKey(uid), []);
}

// ---------------- Leaderboard ----------------
const BOTS: { name: string; avatar: AvatarId; poin: number }[] = [
  { name: 'Salsa', avatar: 'girl2', poin: 1420 },
  { name: 'Raka', avatar: 'boy1', poin: 1180 },
  { name: 'Dinda', avatar: 'girl1', poin: 960 },
  { name: 'Bayu', avatar: 'boy2', poin: 640 },
  { name: 'Nia', avatar: 'girl2', poin: 310 },
];

async function upsertLocalLeader(p: Progress) {
  const list = await getJSON<LeaderEntry[]>(LB_KEY, []);
  const entry: LeaderEntry = { uid: p.uid, name: p.name, avatar: p.avatar, school: p.school, classId: p.classId, poin: p.poin, level: p.level, finalScore: p.finalScore, updatedAt: p.updatedAt };
  const i = list.findIndex((x) => x.uid === p.uid);
  if (i >= 0) list[i] = entry;
  else list.push(entry);
  await setJSON(LB_KEY, list);
}

export type LeaderScope = 'class' | 'school' | 'all';

export async function fetchLeaderboard(scope: LeaderScope, me: { classId: string; school: string; uid: string }): Promise<LeaderEntry[]> {
  if (isFirebaseConfigured && db) {
    try {
      const col = collection(db, 'leaderboard');
      const q =
        scope === 'class' ? query(col, where('classId', '==', me.classId), orderBy('poin', 'desc'), limit(50))
        : scope === 'school' ? query(col, where('school', '==', me.school), orderBy('poin', 'desc'), limit(50))
        : query(col, orderBy('poin', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as LeaderEntry);
    } catch {
      throw new Error('leaderboard');
    }
  }
  const list = await getJSON<LeaderEntry[]>(LB_KEY, []);
  const bots: LeaderEntry[] = BOTS.map((b, i) => ({ uid: `bot-${i}`, name: b.name, avatar: b.avatar, school: me.school, classId: me.classId, poin: b.poin, level: Math.floor(b.poin / 400) + 1, finalScore: 0, updatedAt: 0 }));
  return [...list, ...bots].sort((a, b) => b.poin - a.poin);
}
