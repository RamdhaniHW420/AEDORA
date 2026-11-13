import type { PlaceResult, Progress } from '@/lib/types';
import { ACHIEVEMENTS } from '@/game/data/achievements';

export const SCHOOL_PLACES = ['toilet', 'kolam', 'pot', 'selokan', 'wudhu'] as const;
export const HOME_PLACES = ['h_bak', 'h_wastafel', 'h_vas', 'h_dispenser', 'o_tandon', 'o_selokan', 'o_pot', 'o_hewan', 'o_ban'] as const;

export const QUIZ_TOTAL = 10;

export function avgResults(results: Record<string, PlaceResult>, ids: readonly string[]): number {
  if (!ids.length) return 0;
  const sum = ids.reduce((s, id) => s + (results[id]?.score ?? 0), 0);
  return Math.round(sum / ids.length);
}

export function quizPct(p: Pick<Progress, 'quiz'>): number {
  return Math.round((p.quiz.best / QUIZ_TOTAL) * 100);
}

export function gradeOf(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
}

export function endingOf(score: number): 'a' | 'b' | 'c' {
  if (score >= 85) return 'a';
  if (score >= 65) return 'b';
  return 'c';
}

/** Nilai akhir: kuis 30% + misi sekolah 30% + misi rumah 40% */
export function computeFinal(p: Pick<Progress, 'quiz' | 'schoolResults' | 'homeResults'>) {
  const q = quizPct(p);
  const s = avgResults(p.schoolResults, SCHOOL_PLACES);
  const h = avgResults(p.homeResults, HOME_PLACES);
  const score = Math.round(q * 0.3 + s * 0.3 + h * 0.4);
  return { quiz: q, school: s, home: h, score, grade: gradeOf(score), ending: endingOf(score) };
}

export function levelInfo(xp: number) {
  const per = 200;
  const level = Math.floor(xp / per) + 1;
  const into = xp % per;
  return { level, into, need: per };
}

export function allResults(p: Pick<Progress, 'schoolResults' | 'homeResults'>): PlaceResult[] {
  return [...Object.values(p.schoolResults ?? {}), ...Object.values(p.homeResults ?? {})];
}

/** Hitung ulang semua nilai turunan (poin, xp, level, nilai akhir, lencana) */
export function derive(p: Progress): Progress {
  const res = allResults(p);
  const stepsDone = Object.values(p.steps).filter((s) => s.done).length;
  const poin = p.quiz.best * 10 + res.reduce((s, r) => s + r.score, 0) + (p.final ? p.final.score * 5 : 0);
  const xp = Math.round(poin / 2) + 50 * stepsDone;
  const { level } = levelInfo(xp);
  const next: Progress = { ...p, poin, xp, level, finalScore: p.final?.score ?? 0 };
  next.achievements = ACHIEVEMENTS.filter((a) => a.test(next)).map((a) => a.id);
  return next;
}

export function emptyProgress(base: Pick<Progress, 'uid' | 'classId' | 'name' | 'avatar' | 'school' | 'grade'>): Progress {
  const now = Date.now();
  return derive({
    ...base,
    currentStep: 1,
    steps: {},
    quiz: { best: 0, last: 0, attempts: 0 },
    schoolResults: {},
    homeResults: {},
    poin: 0,
    xp: 0,
    level: 1,
    finalScore: 0,
    achievements: [],
    activity: { step: 0, label: 'Baru bergabung', at: now },
    updatedAt: now,
    lastActiveAt: now,
  });
}

export function tierOf(score: number): 'great' | 'ok' | 'bad' {
  if (score >= 80) return 'great';
  if (score >= 45) return 'ok';
  return 'bad';
}
