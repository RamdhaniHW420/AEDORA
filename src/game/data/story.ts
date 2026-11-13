import type { Progress } from '@/lib/types';
import type { Lang } from '@/lib/i18n';
import type { SceneId } from './places';
import { NPC_NAME_ID, type NpcId } from './npcs';
import { ENDINGS_EN, SPEAKER_NAME_EN, STEPS_EN, STEP_META_EN } from './story.en';

export type Speaker = 'teacher' | 'dora' | 'ibu' | 'ayah' | 'adik' | 'player' | 'narrator' | NpcId;
export interface Line {
  who: Speaker;
  text: string;
  mood?: 'neutral' | 'happy' | 'worried';
}

export interface Ctx {
  name: string;
  progress: Progress;
  quizScore: number;
  schoolAvg: number;
  homeAvg: number;
}

export type Lines = Line[] | ((c: Ctx) => Line[]);

export type Phase =
  | { t: 'title'; title: string; sub: string }
  | { t: 'scene'; scene: SceneId; spawn: string }
  | { t: 'dialog'; lines: Lines }
  | { t: 'talk'; npc: string; objective: string; lines: Lines; label?: string }
  | { t: 'exit'; id: string; objective: string }
  | { t: 'slides' }
  | { t: 'quiz' }
  | { t: 'missions'; scene: SceneId; area: 'school' | 'home'; places: string[] }
  | { t: 'cutscene'; lines: Lines }
  | { t: 'report' }
  | { t: 'ending' }
  | { t: 'finish' };

export const SPEAKER_NAME: Record<Speaker, string> = {
  teacher: 'Bu Rani',
  dora: 'Dora',
  ibu: 'Ibu',
  ayah: 'Ayah',
  adik: 'Bima',
  player: '',
  narrator: '',
  ...NPC_NAME_ID,
};

const t = (text: string, mood: Line['mood'] = 'neutral'): Line => ({ who: 'teacher', text, mood });
const d = (text: string, mood: Line['mood'] = 'neutral'): Line => ({ who: 'dora', text, mood });
const p = (text: string, mood: Line['mood'] = 'neutral'): Line => ({ who: 'player', text, mood });

const first = (name: string) => name.trim().split(/\s+/)[0] || 'Kawan';

export const STEP1: Phase[] = [
  { t: 'title', title: 'BAB 1', sub: 'Pelajaran Pagi' },
  { t: 'scene', scene: 'classroom', spawn: 'desk' },
  {
    t: 'dialog',
    lines: (c) => [
      t(`Selamat pagi, anak-anak! Wah, ${first(c.name)} sudah duduk manis. Semangat sekali!`, 'happy'),
      t('Setiap musim hujan, kasus Demam Berdarah Dengue atau DBD sering meningkat.'),
      t('Kabar baiknya, DBD bisa dicegah, dan kalian akan jadi pahlawannya!', 'happy'),
    ],
  },
  {
    t: 'talk',
    npc: 'teacher',
    objective: 'Sapa teman sekelasmu, lalu temui Bu Rani',
    label: 'Bicara dengan Bu Rani',
    lines: [t('Sebelum mulai, sudah sempat menyapa teman-temanmu? Kalau sudah, perhatikan papan tulis ya. Ibu jelaskan materinya dulu.')],
  },
  { t: 'slides' },
  {
    t: 'dialog',
    lines: (c) => [
      t('Nah, sudah paham? Sekarang saatnya menguji ilmu kalian.', 'happy'),
      t('Ada 10 soal kuis, dan soalnya selalu berbeda setiap kali kamu mengerjakannya.'),
      t(`Jawab dengan teliti ya, ${first(c.name)}. Semangat!`, 'happy'),
    ],
  },
  { t: 'quiz' },
  {
    t: 'dialog',
    lines: (c) => {
      const s = c.quizScore;
      const react =
        s >= 9 ? t(`Luar biasa, ${first(c.name)}! Nilaimu ${s} dari 10. Kamu siap jadi jumantik cilik!`, 'happy')
        : s >= 7 ? t(`Bagus sekali! ${s} dari 10. Sedikit lagi sempurna.`, 'happy')
        : s >= 5 ? t(`Lumayan, ${s} dari 10. Baca lagi materinya di menu Materi, ya.`)
        : t(`Tidak apa-apa, ${s} dari 10. Belajar itu proses. Kamu boleh mengulang kuis kapan saja.`, 'worried');
      return [react, t('Besok kita praktik langsung. Sampai jumpa di Bab 2!', 'happy')];
    },
  },
  { t: 'finish' },
];

export const STEP2: Phase[] = [
  { t: 'title', title: 'BAB 2', sub: 'Misi di Sekolah' },
  { t: 'scene', scene: 'classroom', spawn: 'desk' },
  {
    t: 'dialog',
    lines: (c) => [
      t('Selamat pagi lagi! Hari ini kita praktik: memeriksa tempat di sekolah yang berpotensi menampung air.'),
      t('Ada 5 tempat: kamar mandi, kolam ikan, pot tanaman, selokan, dan tempat wudhu.'),
      t('Kalian akan memakai aplikasi AEDORA di ponsel. Kenalkan, ini Dora, asisten AI yang membantu menganalisis.'),
      d(`Halo ${first(c.name)}! Aku Dora. Arahkan kamera ke objek, nanti aku bantu mengenali jentik dan air tergenang.`, 'happy'),
      d('Ingat, aku hanya membantu mengenali. Keputusan dan tindakan tetap ada di tanganmu!'),
      t('Silakan keluar lewat pintu kelas, lalu periksa satu per satu. Hati-hati ya!'),
    ],
  },
  { t: 'exit', id: 'door', objective: 'Keluar kelas lewat pintu' },
  {
    t: 'dialog',
    lines: [
      d('Kita sudah di halaman sekolah! Ikuti panah kuning di layar.', 'happy'),
      d('Kita mulai dari kamar mandi. Berjalanlah dengan joystick, lalu tekan tombol aksi saat dekat.'),
    ],
  },
  { t: 'missions', scene: 'schoolyard', area: 'school', places: ['toilet', 'kolam', 'pot', 'selokan', 'wudhu'] },
  {
    t: 'dialog',
    lines: [d('Semua tempat sudah diperiksa! Hebat!', 'happy'), d('Sekarang kembali ke kelas dan laporkan hasilnya ke Bu Rani.')],
  },
  { t: 'exit', id: 'door', objective: 'Kembali ke kelas' },
  {
    t: 'talk', npc: 'teacher', objective: 'Lapor ke Bu Rani',
    lines: (c) => {
      const s = c.schoolAvg;
      const react =
        s >= 85 ? t(`Hebat sekali, ${first(c.name)}! Sekolah kita jadi lebih aman berkat kamu.`, 'happy')
        : s >= 65 ? t('Bagus. Masih ada tindakan yang bisa lebih tepat, tapi kamu sudah belajar banyak.')
        : t('Terima kasih sudah berusaha. Ingat: jentik harus dibuang, bukan dibiarkan. Kamu boleh mengulang misi ini.', 'worried');
      return [p('Bu, saya sudah memeriksa kelima tempat di sekolah.'), react, t('PR untukmu: periksa juga lingkungan rumahmu. Sampai jumpa di Bab 3!', 'happy')];
    },
  },
  { t: 'finish' },
];

export const STEP3: Phase[] = [
  { t: 'title', title: 'BAB 3', sub: 'Misi di Rumah' },
  { t: 'scene', scene: 'classroom', spawn: 'desk' },
  {
    t: 'dialog',
    lines: [
      t('Sekolah sudah beres. Sekarang tantangan berikutnya: rumahmu sendiri.'),
      t('Ini PR kalian: periksa lingkungan rumah, baik di dalam maupun di luar.'),
      t('Libatkan keluarga, ya! Semakin banyak yang membantu, semakin cepat selesai.', 'happy'),
    ],
  },
  { t: 'cutscene', lines: (c) => [{ who: 'narrator', text: `Sepulang sekolah, ${first(c.name)} bergegas pulang. Matahari mulai turun, dan PR spesial sudah menunggu.` }] },
  { t: 'scene', scene: 'home_inside', spawn: 'default' },
  {
    t: 'dialog',
    lines: (c) => [
      { who: 'ibu', text: `Eh, ${first(c.name)} sudah pulang! Kok semangat sekali?`, mood: 'happy' },
      p('Bu, aku dapat PR dari Bu Rani. Aku mau periksa jentik di seluruh rumah!', 'happy'),
      { who: 'ibu', text: 'Wah, bagus sekali! Ibu bantu ya kalau perlu. Mulai dari mana?', mood: 'happy' },
      d('Kita periksa di dalam rumah dulu: bak mandi, wastafel dapur, vas bunga, dan dispenser.'),
    ],
  },
  { t: 'missions', scene: 'home_inside', area: 'home', places: ['h_bak', 'h_wastafel', 'h_vas', 'h_dispenser'] },
  { t: 'dialog', lines: [d('Bagian dalam rumah sudah selesai!', 'happy'), d('Sekarang keluar ke halaman. Ada tandon, selokan, pot, wadah hewan, dan barang bekas.')] },
  { t: 'exit', id: 'frontdoor', objective: 'Keluar lewat pintu depan' },
  {
    t: 'dialog',
    lines: (c) => [
      { who: 'ayah', text: `Nah, ${first(c.name)}! Ayah dengar kamu mau memeriksa jentik. Ayah dan Bima siap membantu.`, mood: 'happy' },
      { who: 'adik', text: 'Aku juga mau bantu, Kak! Aku bawa sikat!', mood: 'happy' },
    ],
  },
  { t: 'missions', scene: 'home_outside', area: 'home', places: ['o_tandon', 'o_selokan', 'o_pot', 'o_hewan', 'o_ban'] },
  {
    t: 'talk', npc: 'ayah', objective: 'Lapor ke Ayah',
    lines: [
      p('Ayah, semua sudut rumah sudah selesai kuperiksa!', 'happy'),
      { who: 'ayah', text: 'Kerja bagus! Kalau tiap minggu kita lakukan 3M bersama, DBD tidak akan sempat mampir.', mood: 'happy' },
      { who: 'adik', text: 'Minggu depan kita kuras lagi ya, Kak!', mood: 'happy' },
      p('Siap! Sekarang aku laporan ke Bu Rani.', 'happy'),
    ],
  },
  { t: 'finish' },
];

export const STEP4: Phase[] = [
  { t: 'title', title: 'BAB 4', sub: 'Laporan dan Penghargaan' },
  { t: 'scene', scene: 'classroom', spawn: 'desk' },
  {
    t: 'dialog',
    lines: (c) => [
      t(`Selamat pagi, ${first(c.name)}. Ibu sudah menunggu laporanmu.`),
      d('Aku sudah merangkum semua hasil kerjamu. Yuk serahkan ke Bu Rani!', 'happy'),
    ],
  },
  {
    t: 'talk', npc: 'teacher', objective: 'Serahkan laporan ke Bu Rani',
    lines: [p('Bu Rani, ini laporan lengkapku.'), t('Terima kasih. Mari kita lihat hasil usahamu selama ini.', 'happy')],
  },
  { t: 'report' },
  { t: 'ending' },
  { t: 'finish' },
];

export const STEPS: Record<number, Phase[]> = { 1: STEP1, 2: STEP2, 3: STEP3, 4: STEP4 };

export const STEP_META = [
  { n: 1, title: 'Pelajaran Pagi', sub: 'Materi DBD dan kuis 10 soal', reward: 100, mins: 10 },
  { n: 2, title: 'Misi di Sekolah', sub: 'Periksa 5 tempat di sekolah', reward: 250, mins: 15 },
  { n: 3, title: 'Misi di Rumah', sub: 'Periksa rumah bersama keluarga', reward: 400, mins: 20 },
  { n: 4, title: 'Laporan dan Penghargaan', sub: 'Nilai akhir dan ending', reward: 500, mins: 8 },
];

export const ENDINGS = {
  a: {
    title: 'Sekolah dan Rumah Bebas Jentik',
    lines: (n: string) => [
      `Beberapa minggu berlalu. Kebiasaan 3M yang ${n} bawa menyebar ke seluruh sekolah dan rumah.`,
      'Tidak ada lagi jentik di bak, kolam, maupun selokan. Teman-temanmu ikut menguras setiap hari Jumat.',
      'Hari ini sekolah menerima penghargaan Sekolah Bebas Jentik, dan semuanya bermula dari satu langkah kecilmu.',
    ],
    quote: 'Cegah DBD dimulai dari kita.',
  },
  b: {
    title: 'Kebiasaan Baru Mulai Tumbuh',
    lines: (n: string) => [
      `Perubahan kecil mulai terlihat berkat ${n}. Bak lebih sering dikuras dan selokan lebih bersih.`,
      'Masih ada sudut yang perlu diperiksa, tetapi kamu sudah memulai dan teman-temanmu mulai mengikuti.',
      'Terus jaga semangatnya, dan penghargaan Sekolah Bebas Jentik tinggal selangkah lagi.',
    ],
    quote: 'Sedikit demi sedikit, lama-lama menjadi bukit.',
  },
  c: {
    title: 'Perjuangan Belum Selesai',
    lines: (n: string) => [
      'Beberapa jentik masih tersisa di sudut yang terlewat. Nyamuk belum benar-benar pergi.',
      `Tapi ${n} sudah tahu caranya. Menguras, menutup, dan mendaur ulang bisa mengubah segalanya.`,
      'Coba lagi dari Bab 2 dan 3, pilih tindakan yang tepat, lalu raih ending terbaik!',
    ],
    quote: 'Jatuh sekali, belajar seribu kali.',
  },
} as const;

/** Seluruh teks cerita menurut bahasa pilihan. Struktur fase kedua bahasa sama persis. */
export function storyFor(lang: Lang) {
  return lang === 'en'
    ? { STEPS: STEPS_EN, STEP_META: STEP_META_EN, ENDINGS: ENDINGS_EN, SPEAKER_NAME: SPEAKER_NAME_EN }
    : { STEPS, STEP_META, ENDINGS, SPEAKER_NAME };
}
