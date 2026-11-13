import type { Progress } from '@/lib/types';
import type { Lang } from '@/lib/i18n';

export interface Achievement {
  id: string;
  badge: string; // kunci gambar di BADGES
  title: string;
  desc: string;
  test: (p: Progress) => boolean;
}

const results = (p: Progress) => [...Object.values(p.schoolResults ?? {}), ...Object.values(p.homeResults ?? {})];
const avg = (r: Record<string, { score: number }>, n: number) => Object.values(r).reduce((s, x) => s + x.score, 0) / n;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_login', badge: 'first_login', title: 'Murid Baru', desc: 'Bergabung di AEDORA.', test: () => true },
  { id: 'quiz_ace', badge: 'quiz_ace', title: 'Otak Cemerlang', desc: 'Raih nilai kuis minimal 8 dari 10.', test: (p) => p.quiz.best >= 8 },
  { id: 'quiz_perfect', badge: 'quiz_perfect', title: 'Kuis Sempurna', desc: 'Jawab semua 10 soal kuis dengan benar.', test: (p) => p.quiz.best >= 10 },
  { id: 'detective', badge: 'detective', title: 'Detektif Jentik', desc: 'Lakukan scan pertamamu.', test: (p) => results(p).length >= 1 },
  { id: 'larva_hunter', badge: 'larva_hunter', title: 'Pemburu Jentik', desc: 'Temukan jentik di 5 tempat.', test: (p) => results(p).filter((r) => r.finding === 'larvae').length >= 5 },
  { id: 'cleaner', badge: 'cleaner', title: 'Penguras Sejati', desc: 'Pilih tindakan terbaik (nilai 90+) di 5 tempat.', test: (p) => results(p).filter((r) => r.score >= 90).length >= 5 },
  { id: 'school_clear', badge: 'school_clear', title: 'Sekolah Bebas Jentik', desc: 'Selesaikan Bab 2 dengan rata-rata 80+.', test: (p) => !!p.steps['2']?.done && avg(p.schoolResults, 5) >= 80 },
  { id: 'family_team', badge: 'family_team', title: 'Tim Keluarga Hebat', desc: 'Ajak keluarga membersihkan di 3 tempat.', test: (p) => results(p).filter((r) => r.family).length >= 3 },
  { id: 'home_clear', badge: 'home_clear', title: 'Rumah Bebas Jentik', desc: 'Selesaikan Bab 3 dengan rata-rata 80+.', test: (p) => !!p.steps['3']?.done && avg(p.homeResults, 9) >= 80 },
  { id: 'hero_3m', badge: 'hero_3m', title: 'Pahlawan 3M', desc: 'Tamatkan seluruh petualangan.', test: (p) => !!p.steps['4']?.done },
  { id: 'golden', badge: 'golden', title: 'Nilai Emas', desc: 'Dapatkan nilai akhir 90 atau lebih.', test: (p) => (p.final?.score ?? 0) >= 90 },
  { id: 'perfect_mission', badge: 'top1', title: 'Misi Sempurna', desc: 'Raih nilai 100 pada satu misi.', test: (p) => results(p).some((r) => r.score >= 100) },
];

const ACH_EN: Record<string, { title: string; desc: string }> = {
  first_login: { title: 'New Student', desc: 'Joined AEDORA.' },
  quiz_ace: { title: 'Bright Mind', desc: 'Score at least 8 out of 10 on the quiz.' },
  quiz_perfect: { title: 'Perfect Quiz', desc: 'Answer all 10 quiz questions correctly.' },
  detective: { title: 'Larvae Detective', desc: 'Do your first scan.' },
  larva_hunter: { title: 'Larvae Hunter', desc: 'Find larvae in 5 places.' },
  cleaner: { title: 'True Drainer', desc: 'Pick the best action (score 90+) in 5 places.' },
  school_clear: { title: 'Larvae-Free School', desc: 'Finish Chapter 2 with an average of 80+.' },
  family_team: { title: 'Great Family Team', desc: 'Ask your family to clean together in 3 places.' },
  home_clear: { title: 'Larvae-Free Home', desc: 'Finish Chapter 3 with an average of 80+.' },
  hero_3m: { title: '3M Hero', desc: 'Complete the whole adventure.' },
  golden: { title: 'Golden Score', desc: 'Get a final score of 90 or more.' },
  perfect_mission: { title: 'Perfect Mission', desc: 'Score 100 on a single mission.' },
};

/** Judul dan deskripsi lencana menurut bahasa; data aslinya tetap Indonesia untuk dasbor guru. */
export function achText(a: Achievement, lang: Lang): { title: string; desc: string } {
  return lang === 'en' && ACH_EN[a.id] ? ACH_EN[a.id] : { title: a.title, desc: a.desc };
}
