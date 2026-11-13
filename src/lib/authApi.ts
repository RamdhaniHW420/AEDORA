import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isFirebaseConfigured, STUDENT_EMAIL_DOMAIN } from '@/config';
import { getJSON, setJSON, removeKey } from '@/lib/storage';
import { tr } from '@/lib/i18n';
import type { AvatarId, Gender, UserProfile } from '@/lib/types';

export interface RegisterInput {
  username: string;
  password: string;
  name: string;
  school: string;
  grade: string;
  classCode: string;
  gender: Gender;
  avatar: AvatarId;
}

export const toEmail = (username: string) => `${username.trim().toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
export const cleanUsername = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

const DEMO_USERS = 'aedora:demo:users';
const DEMO_SESSION = 'aedora:demo:session';

type DemoDb = Record<string, { password: string; profile: UserProfile }>;

export class AuthError extends Error {}

function friendly(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  if (code.includes('email-already-in-use')) return tr('errUsernameTaken');
  if (code.includes('weak-password')) return tr('errWeakPassword');
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-email')) return tr('errWrongCred');
  if (code.includes('network')) return tr('errNetwork');
  if (code.includes('too-many-requests')) return tr('errTooMany');
  if (code.includes('permission-denied')) return tr('errDenied');
  return (e as Error)?.message || tr('errGeneric');
}

/** Cek kode kelas; kembalikan classId atau lempar error */
export async function resolveClassCode(code: string): Promise<string> {
  const c = code.trim().toUpperCase();
  if (!c) throw new AuthError(tr('errClassCodeEmpty'));
  if (!isFirebaseConfigured || !db) return `demo-${c}`;
  try {
    const snap = await getDoc(doc(db, 'classCodes', c));
    if (!snap.exists()) throw new AuthError(tr('errClassCodeNotFound'));
    return (snap.data() as { classId: string }).classId;
  } catch (e) {
    if (e instanceof AuthError) throw e;
    throw new AuthError(friendly(e));
  }
}

export async function register(input: RegisterInput): Promise<UserProfile> {
  const username = cleanUsername(input.username);
  if (username.length < 3) throw new AuthError(tr('errUsernameShort'));
  if (input.password.length < 6) throw new AuthError(tr('errPasswordShort'));
  const classId = await resolveClassCode(input.classCode);
  const base = { role: 'student' as const, name: input.name.trim(), username, school: input.school.trim(), grade: input.grade.trim(), classId, classCode: input.classCode.trim().toUpperCase(), gender: input.gender, avatar: input.avatar, createdAt: Date.now() };

  if (!isFirebaseConfigured || !auth || !db) {
    const users = await getJSON<DemoDb>(DEMO_USERS, {});
    if (users[username]) throw new AuthError(tr('errUsernameTaken'));
    const profile: UserProfile = { uid: `demo-${username}`, ...base };
    users[username] = { password: input.password, profile };
    await setJSON(DEMO_USERS, users);
    await setJSON(DEMO_SESSION, profile.uid);
    return profile;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, toEmail(username), input.password);
    const profile: UserProfile = { uid: cred.user.uid, ...base };
    await setDoc(doc(db, 'users', profile.uid), profile);
    return profile;
  } catch (e) {
    throw new AuthError(friendly(e));
  }
}

export async function login(usernameRaw: string, password: string): Promise<void> {
  const username = cleanUsername(usernameRaw);
  if (!username || !password) throw new AuthError(tr('errFillCreds'));
  if (!isFirebaseConfigured || !auth) {
    const users = await getJSON<DemoDb>(DEMO_USERS, {});
    const u = users[username];
    if (!u || u.password !== password) throw new AuthError(tr('errWrongCred'));
    await setJSON(DEMO_SESSION, u.profile.uid);
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, toEmail(username), password);
  } catch (e) {
    throw new AuthError(friendly(e));
  }
}

export async function logout(): Promise<void> {
  if (!isFirebaseConfigured || !auth) {
    await removeKey(DEMO_SESSION);
    return;
  }
  await signOut(auth);
}

export async function loadProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) {
    const users = await getJSON<DemoDb>(DEMO_USERS, {});
    return Object.values(users).find((u) => u.profile.uid === uid)?.profile ?? null;
  }
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Dengarkan status login. Mengembalikan fungsi unsubscribe. */
export function watchAuth(cb: (uid: string | null) => void): () => void {
  if (!isFirebaseConfigured || !auth) {
    void getJSON<string | null>(DEMO_SESSION, null).then(cb);
    return () => undefined;
  }
  return onAuthStateChanged(auth, (u: User | null) => cb(u?.uid ?? null));
}

export async function setDemoSessionListener(): Promise<string | null> {
  return getJSON<string | null>(DEMO_SESSION, null);
}
