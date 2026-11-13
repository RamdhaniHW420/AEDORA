export type Gender = 'L' | 'P';
export type AvatarId = 'boy1' | 'boy2' | 'girl1' | 'girl2';
export type Finding = 'larvae' | 'risky' | 'safe';
export type Area = 'school' | 'home';

export interface UserProfile {
  uid: string;
  role: 'student';
  name: string;
  username: string;
  school: string;
  grade: string;
  classId: string;
  classCode: string;
  gender: Gender;
  avatar: AvatarId;
  createdAt: number;
}

export interface PlaceResult {
  placeId: string;
  area: Area;
  finding: Finding;
  larvaeCount: number;
  actionId: string;
  actionLabel: string;
  score: number;
  family: boolean;
  at: number;
}

export interface StepState {
  done: boolean;
  score: number;
  attempts: number;
  completedAt?: number;
}

export interface Progress {
  uid: string;
  classId: string;
  name: string;
  avatar: AvatarId;
  school: string;
  grade: string;
  /** langkah tertinggi yang terbuka (1..4) */
  currentStep: number;
  steps: Record<string, StepState>;
  quiz: { best: number; last: number; attempts: number };
  schoolResults: Record<string, PlaceResult>;
  homeResults: Record<string, PlaceResult>;
  final?: { score: number; grade: string; ending: 'a' | 'b' | 'c'; at: number };
  /** nilai turunan (disimpan agar guru & leaderboard mudah membaca) */
  poin: number;
  xp: number;
  level: number;
  finalScore: number;
  achievements: string[];
  activity: { step: number; label: string; at: number };
  updatedAt: number;
  lastActiveAt: number;
}

export interface ActivityEvent {
  id?: string;
  type: 'quiz' | 'place' | 'step' | 'ending' | 'login';
  step: number;
  title: string;
  detail: string;
  /** Versi Inggris untuk siswa. Teks Indonesia tetap menjadi sumber untuk dasbor guru. */
  titleEn?: string;
  detailEn?: string;
  points: number;
  at: number;
}

export interface LeaderEntry {
  uid: string;
  name: string;
  avatar: AvatarId;
  school: string;
  classId: string;
  poin: number;
  level: number;
  finalScore: number;
  updatedAt: number;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}
