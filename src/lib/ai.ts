import { API_BASE, GEMINI_API_KEY } from '@/config';
import { geminiAnalysis, geminiChat, geminiQuiz } from '@/lib/gemini';
import { QUIZ_BANK } from '@/game/data/quizBank';
import { QUIZ_BANK_EN } from '@/game/data/quizBank.en';
import { localAnalysis, type Place } from '@/game/data/places';
import type { Finding, QuizQuestion } from '@/lib/types';
import { auth } from '@/lib/firebase';
import type { Lang } from '@/lib/i18n';

async function authHeader(): Promise<Record<string, string>> {
  try {
    const token = await auth?.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function post<T>(path: string, body: unknown, timeoutMs = 20000): Promise<T> {
  if (!API_BASE) throw new Error('API_BASE kosong');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Prioritas: Gemini langsung (kunci di .env) -> server dashboard (API_BASE) -> gagal (pemanggil memakai fallback lokal). */
async function remote<T>(direct: () => Promise<T>, path: string, body: unknown, ms: number): Promise<T> {
  if (GEMINI_API_KEY) {
    try {
      return await direct();
    } catch (e) {
      if (!API_BASE) throw e;
    }
  }
  return post<T>(path, body, ms);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Acak urutan opsi sambil menjaga kunci jawaban */
export function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const idx = shuffle(q.options.map((_, i) => i));
  return { ...q, options: idx.map((i) => q.options[i]), answerIndex: idx.indexOf(q.answerIndex) };
}

function validQuestion(q: unknown): q is QuizQuestion {
  const x = q as QuizQuestion;
  return !!x && typeof x.q === 'string' && Array.isArray(x.options) && x.options.length === 4 && x.options.every((o) => typeof o === 'string') && Number.isInteger(x.answerIndex) && x.answerIndex >= 0 && x.answerIndex < 4 && typeof x.explanation === 'string';
}

export interface QuizResult {
  questions: QuizQuestion[];
  source: 'ai' | 'bank';
}

export async function fetchQuiz(count = 10, lang: Lang = 'id'): Promise<QuizResult> {
  const bank = lang === 'en' ? QUIZ_BANK_EN : QUIZ_BANK;
  try {
    const seed = Math.random().toString(36).slice(2, 10);
    const data = await remote<{ questions: unknown[] }>(() => geminiQuiz(count, seed, lang), '/api/quiz', { count, seed, lang }, 25000);
    const qs = (data.questions ?? []).filter(validQuestion);
    if (qs.length >= count) return { questions: qs.slice(0, count).map(shuffleOptions), source: 'ai' };
    // lengkapi dari bank bila kurang
    const need = count - qs.length;
    return { questions: [...qs, ...shuffle(bank).slice(0, need)].map(shuffleOptions), source: 'ai' };
  } catch {
    return { questions: shuffle(bank).slice(0, count).map(shuffleOptions), source: 'bank' };
  }
}

export interface AnalysisResult {
  headline: string;
  analysis: string;
  advice: string;
  source: 'ai' | 'local';
}

export async function fetchAnalysis(place: Place, finding: Finding, count: number, lang: Lang = 'id'): Promise<AnalysisResult> {
  const fb = localAnalysis(place, finding, count, lang);
  try {
    const data = await remote<{ analysis: string; advice: string }>(() => geminiAnalysis(place.name, place.object, finding, count, lang), '/api/analyze', { placeName: place.name, object: place.object, finding, count, lang }, 9000);
    if (data.analysis && data.advice) return { headline: fb.headline, analysis: data.analysis, advice: data.advice, source: 'ai' };
  } catch {
    /* gunakan fallback lokal */
  }
  return { ...fb, source: 'local' };
}

const FAQ: { k: string[]; a: string; en: string }[] = [
  { k: ['3m', 'cegah', 'mencegah', 'prevent'], en: '3M Plus: Drain and scrub water containers at least once a week, Cover water containers tightly, and Recycle used items. Plus: abate powder, larvae-eating fish, mosquito nets, and teamwork.',
    a: '3M Plus: Menguras dan menyikat tempat air minimal seminggu sekali, Menutup rapat tempat penampungan air, dan Mendaur ulang barang bekas. Plus: bubuk abate, ikan pemakan jentik, kelambu, dan gotong royong.' },
  { k: ['abate'], en: 'Abate is a larvicide powder for water containers that are hard to drain, like water tanks. Follow the dosage on the package. Do not use it in pet water bowls or kitchen utensils.',
    a: 'Abate adalah bubuk pembunuh jentik untuk wadah air yang sulit dikuras, seperti tandon. Gunakan sesuai takaran di kemasan. Jangan dipakai di wadah minum hewan atau peralatan dapur.' },
  { k: ['jentik', 'larva'], en: 'Larvae are baby mosquitoes that live in water. They wriggle up and down to the surface to breathe, and in about 7-10 days they can become adult mosquitoes.',
    a: 'Jentik adalah anak nyamuk yang hidup di air. Ia menggeliat naik turun ke permukaan untuk bernapas, dan dalam sekitar 7-10 hari bisa menjadi nyamuk dewasa.' },
  { k: ['gejala', 'demam', 'sakit', 'symptom', 'fever'], en: 'Early dengue symptoms include sudden high fever, headache, muscle pain, and sometimes red spots. If a high fever lasts more than 2 days, see a clinic or doctor right away. I am not a replacement for a doctor.',
    a: 'Gejala awal DBD antara lain demam tinggi mendadak, sakit kepala, nyeri otot, dan kadang bintik merah. Bila demam tinggi lebih dari 2 hari, segera periksa ke puskesmas atau dokter. Aku bukan pengganti dokter ya.' },
  { k: ['aedes', 'nyamuk', 'mosquito'], en: 'The Aedes mosquito has black-and-white stripes and bites mostly from morning to afternoon. It likes to lay eggs in clean standing water around the home.',
    a: 'Nyamuk Aedes berbelang hitam-putih dan paling aktif menggigit pagi hingga sore. Ia suka bertelur di air bersih yang tergenang di sekitar rumah.' },
  { k: ['fogging', 'asap', 'smoke'], en: 'Fogging only kills adult mosquitoes. To fully solve the problem, larvae nests must still be eliminated with the 3M.',
    a: 'Fogging hanya membunuh nyamuk dewasa. Agar tuntas, sarang jentik tetap harus diberantas dengan 3M.' },
];

export async function askDora(history: { role: 'user' | 'model'; text: string }[], lang: Lang = 'id'): Promise<string> {
  try {
    const data = await remote<{ reply: string }>(() => geminiChat(history, lang), '/api/chat', { messages: history, lang }, 20000);
    if (data.reply) return data.reply;
  } catch {
    /* fallback lokal */
  }
  const last = (history[history.length - 1]?.text ?? '').toLowerCase();
  const hit = FAQ.find((f) => f.k.some((k) => last.includes(k)));
  if (lang === 'en') return hit?.en ?? 'I am not connected to the AI service yet, but I can help with 3M, larvae, abate, dengue symptoms, and the Aedes mosquito. Try asking one of those!';
  return hit?.a ?? 'Aku belum tersambung ke layanan AI, tetapi aku bisa bantu soal 3M, jentik, abate, gejala DBD, dan nyamuk Aedes. Coba tanyakan salah satunya!';
}
