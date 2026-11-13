import { GEMINI_API_KEY, GEMINI_MODEL } from '@/config';
import type { Finding } from '@/lib/types';
import type { Lang } from '@/lib/i18n';

/**
 * Pemanggilan Gemini langsung dari aplikasi memakai kunci di .env
 * (EXPO_PUBLIC_GEMINI_API_KEY). Bentuk hasilnya sama dengan API di dashboard web,
 * jadi lib/ai.ts bisa memakai salah satunya.
 */

type Content = { role: 'user' | 'model'; parts: { text: string }[] };

interface GenOpts {
  system?: string;
  contents: Content[];
  schema?: unknown;
  timeoutMs?: number;
}

export const hasGemini = () => Boolean(GEMINI_API_KEY);

async function generate(opts: GenOpts): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('EXPO_PUBLIC_GEMINI_API_KEY kosong');
  const body: Record<string, unknown> = { contents: opts.contents };
  if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
  if (opts.schema) body.generationConfig = { responseMimeType: 'application/json', responseSchema: opts.schema };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 25000);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (!text) throw new Error('Respons AI kosong');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function parseJson<T>(text: string): T {
  const t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(t) as T;
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n]+/g, ' ').slice(0, max);

// ---------------- Kuis ----------------
const TOPICS = [
  'penyebab DBD dan virus dengue',
  'ciri-ciri nyamuk Aedes aegypti',
  'siklus hidup nyamuk (telur, jentik, kepompong, dewasa)',
  'tempat nyamuk Aedes berkembang biak',
  'gejala DBD dan kapan harus ke puskesmas',
  'makna 3M Plus (menguras, menutup, mendaur ulang)',
  'bubuk abate dan ikan pemakan jentik',
  'juru pemantau jentik (jumantik) dan PSN',
  'kebiasaan menggigit nyamuk Aedes (pagi dan sore)',
  'perbedaan fogging dan pemberantasan sarang nyamuk',
  'menjaga kebersihan rumah dan sekolah agar bebas jentik',
  'gotong royong keluarga mencegah DBD',
];

const QUIZ_SCHEMA = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          q: { type: 'STRING' },
          options: { type: 'ARRAY', items: { type: 'STRING' } },
          answerIndex: { type: 'INTEGER' },
          explanation: { type: 'STRING' },
        },
        required: ['q', 'options', 'answerIndex', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

export async function geminiQuiz(count: number, seed: string, lang: Lang = 'id'): Promise<{ questions: unknown[] }> {
  const en = lang === 'en';
  const picked = [...TOPICS].sort(() => Math.random() - 0.5).slice(0, 8).join('; ');
  const text = await generate({
    system: en
      ? 'You are a junior high science teacher who writes multiple-choice quiz questions about Dengue Hemorrhagic Fever (DBD) in clear, friendly English for students aged 12-15.'
      : 'Kamu guru IPA SMP yang membuat soal kuis pilihan ganda tentang Demam Berdarah Dengue (DBD) dalam bahasa Indonesia yang jelas dan ramah untuk siswa usia 12-15 tahun.',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: en
              ? `Write ${count} different multiple-choice questions in English. Focus on these topics (mix them randomly): ${picked}. Rules: exactly 4 options per question, exactly 1 correct answer, vary the position of the correct answer, plausible distractors, mixed difficulty (easy, medium, hard), and a short 1-2 sentence explanation for each question. Do not copy common textbook questions exactly; vary the form (definition, everyday case, cause and effect). Variation code: ${seed}.`
              : `Buat ${count} soal pilihan ganda yang berbeda-beda. Fokus pada topik berikut (campur secara acak): ${picked}. Aturan: tepat 4 pilihan per soal, tepat 1 jawaban benar, posisi jawaban benar bervariasi, pilihan pengecoh masuk akal, tingkat kesulitan campuran (mudah, sedang, sulit), tiap soal punya penjelasan singkat 1-2 kalimat. Jangan membuat soal yang sama persis dengan soal umum; variasikan bentuk (definisi, kasus sehari-hari, sebab-akibat). Kode variasi: ${seed}.`,
          },
        ],
      },
    ],
    schema: QUIZ_SCHEMA,
    timeoutMs: 28000,
  });
  return parseJson<{ questions: unknown[] }>(text);
}

// ---------------- Analisis jentik ----------------
const ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: { analysis: { type: 'STRING' }, advice: { type: 'STRING' } },
  required: ['analysis', 'advice'],
};

export async function geminiAnalysis(placeName: string, object: string, finding: Finding, count: number, lang: Lang = 'id'): Promise<{ analysis: string; advice: string }> {
  const en = lang === 'en';
  const n = Math.max(0, Math.min(12, count));
  const kondisi = en
    ? finding === 'larvae'
      ? `${n} mosquito larvae are detected moving in the water.`
      : finding === 'risky'
        ? 'The water is standing and cloudy, no larvae are visible yet, but it could become a mosquito nest.'
        : 'It is clean, with no larvae and no harmful standing water.'
    : finding === 'larvae'
      ? `Terdeteksi ${n} jentik nyamuk yang bergerak di air.`
      : finding === 'risky'
        ? 'Air tergenang dan keruh, belum terlihat jentik, tetapi berpotensi menjadi sarang nyamuk.'
        : 'Kondisi bersih, tidak ada jentik dan tidak ada genangan berbahaya.';
  const text = await generate({
    system: en
      ? 'You are Dora, an AI larvae-scanning assistant in an educational dengue game for junior high students. Write in short, clear, friendly, factual English. Do not give medical advice. Do not call yourself a language model.'
      : 'Kamu Dora, asisten AI pemindai jentik pada aplikasi game edukasi DBD untuk siswa SMP. Tulis dalam bahasa Indonesia yang singkat, jelas, ramah, dan sesuai fakta. Jangan memberi saran medis. Jangan menyebut dirimu model bahasa.',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: en
              ? `Camera scan result at the location "${clean(placeName, 60)}" (object: ${clean(object, 60)}). Actual condition: ${kondisi}\nWrite JSON with two fields. "analysis": 2 sentences describing what the scanner sees according to the condition above (do not change the condition, the larvae count must stay the same). "advice": 1 sentence of the right prevention advice for that condition, referring to 3M Plus.`
              : `Hasil pemindaian kamera pada lokasi "${clean(placeName, 60)}" (objek: ${clean(object, 60)}). Kondisi sebenarnya: ${kondisi}\nTulis JSON dengan dua isian. "analysis": 2 kalimat yang mendeskripsikan apa yang terlihat oleh pemindai sesuai kondisi di atas (jangan mengubah kondisi, jumlah jentik harus sama). "advice": 1 kalimat saran tindakan pencegahan yang tepat untuk kondisi itu, merujuk pada 3M Plus.`,
          },
        ],
      },
    ],
    schema: ANALYSIS_SCHEMA,
    timeoutMs: 12000,
  });
  const d = parseJson<{ analysis: string; advice: string }>(text);
  if (!d.analysis || !d.advice) throw new Error('Respons AI tidak valid');
  return { analysis: clean(d.analysis, 400), advice: clean(d.advice, 300) };
}

// ---------------- Chat Dora ----------------
const SYSTEM_ID =
  'Kamu Dora, asisten AI ramah di aplikasi AEDORA, game edukasi pencegahan Demam Berdarah Dengue (DBD) untuk siswa SMP (12-15 tahun). Jawab dalam bahasa Indonesia sederhana, maksimal 4 kalimat. Topikmu: DBD, nyamuk Aedes, jentik, 3M Plus, abate, kebersihan lingkungan, dan cara bermain AEDORA. Untuk gejala atau sakit, ingatkan untuk ke puskesmas atau dokter dan jangan mendiagnosis atau memberi dosis obat. Bila ditanya hal di luar topik, tolak dengan sopan dan arahkan kembali ke topik DBD.';

const SYSTEM_EN =
  'You are Dora, a friendly AI assistant in AEDORA, an educational game about preventing Dengue Hemorrhagic Fever (dengue) for junior high school students (12-15 years old). Answer in simple English, at most 4 sentences. Your topics: dengue, the Aedes mosquito, larvae, 3M Plus (Menguras/drain, Menutup/cover, Mendaur ulang/recycle), abate, environmental cleanliness, and how to play AEDORA. For symptoms or illness, remind the student to see a clinic or doctor and never diagnose or give medicine doses. If asked about something off-topic, politely decline and steer back to dengue.';

export async function geminiChat(history: { role: 'user' | 'model'; text: string }[], lang: Lang): Promise<{ reply: string }> {
  const contents: Content[] = history
    .slice(-8)
    .filter((m) => m.text.trim())
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, 500) }] }));
  // Gemini mensyaratkan percakapan diawali oleh pengguna
  while (contents.length && contents[0].role !== 'user') contents.shift();
  if (!contents.length) throw new Error('Pesan kosong');
  const reply = await generate({ system: lang === 'en' ? SYSTEM_EN : SYSTEM_ID, contents, timeoutMs: 15000 });
  return { reply: reply.trim().slice(0, 900) };
}
