import type { Finding } from '@/lib/types';
import type { Lang } from '@/lib/i18n';
import { localAnalysisEn, localizePlaceEn } from './places.en';

export type SceneId = 'classroom' | 'schoolyard' | 'home_inside' | 'home_outside';
export type CloseupKey = 'bak' | 'kolam' | 'pot' | 'selokan' | 'wudhu' | 'wastafel' | 'vas' | 'dispenser' | 'tandon' | 'hewan' | 'ban';
export type AnimKey = 'sikat' | 'tutup' | 'abate' | 'ikan' | 'biarkan' | 'buang' | 'balik' | 'daur' | 'ganti' | 'angkat';
export type Who = 'ibu' | 'ayah' | 'adik';

export interface Choice {
  id: string;
  label: string;
  sub: string;
  anim: AnimKey;
  icon: string; // kunci ICONS
  scores: Record<Finding, number>;
  why: string;
  family?: Who;
}

export interface Place {
  id: string;
  area: 'school' | 'home';
  scene: SceneId;
  name: string;
  closeup: CloseupKey;
  object: string;
  hint: string;
  edu: string;
  /** bila aman, air tetap ada dan jernih (mis. kolam berikan ikan) */
  safeWater?: boolean;
  family?: Who;
  choices: Choice[];
}

type Base = Omit<Choice, 'id'>;

const ACT: Record<string, Base> = {
  sikat: { label: 'Kuras dan sikat dinding', sub: 'Buang air, lalu sikat semua sisi', anim: 'sikat', icon: 'droplet', scores: { larvae: 100, risky: 95, safe: 65 }, why: 'Menguras lalu menyikat dinding membuang jentik sekaligus telur yang menempel.' },
  tutup: { label: 'Tutup rapat', sub: 'Pasang penutup di atasnya', anim: 'tutup', icon: 'shield', scores: { larvae: 35, risky: 85, safe: 95 }, why: 'Penutup rapat mencegah nyamuk bertelur, tetapi jentik yang sudah ada harus dibuang dulu.' },
  abate: { label: 'Taburkan bubuk abate', sub: 'Pembasmi jentik sesuai takaran', anim: 'abate', icon: 'mosq', scores: { larvae: 70, risky: 80, safe: 50 }, why: 'Abate membunuh jentik di wadah yang sulit dikuras, tetapi menguras dan menyikat tetap lebih utama.' },
  ikan: { label: 'Tebar ikan pemakan jentik', sub: 'Ikan cupang atau kepala timah', anim: 'ikan', icon: 'fish', scores: { larvae: 90, risky: 92, safe: 75 }, why: 'Ikan pemakan jentik adalah pengendali alami yang aman dan mudah dirawat.' },
  biarkan: { label: 'Biarkan saja', sub: 'Nanti juga hilang sendiri', anim: 'biarkan', icon: 'cross', scores: { larvae: 0, risky: 10, safe: 55 }, why: 'Jentik berubah menjadi nyamuk dewasa dalam 7-10 hari. Membiarkan berarti memberi nyamuk tempat tinggal.' },
  buang: { label: 'Buang airnya saja', sub: 'Tanpa disikat', anim: 'buang', icon: 'droplet', scores: { larvae: 55, risky: 70, safe: 45 }, why: 'Membuang air saja tidak cukup. Telur menempel di dinding dan menetas lagi saat terisi air.' },
  balik: { label: 'Tengkurapkan wadah', sub: 'Keringkan, lalu balik', anim: 'balik', icon: 'shield', scores: { larvae: 85, risky: 92, safe: 85 }, why: 'Wadah yang ditengkurapkan tidak lagi menampung air hujan.' },
  daur: { label: 'Singkirkan atau daur ulang', sub: 'Manfaatkan atau buang pada tempatnya', anim: 'daur', icon: 'bin', scores: { larvae: 100, risky: 100, safe: 90 }, why: 'Barang bekas yang disingkirkan atau didaur ulang tidak lagi menjadi tempat genangan.' },
  ganti: { label: 'Buang air dan cuci wadah', sub: 'Isi ulang dengan air bersih', anim: 'ganti', icon: 'droplet', scores: { larvae: 100, risky: 92, safe: 75 }, why: 'Mengganti air dan mencuci wadah secara rutin memutus siklus jentik.' },
  angkat: { label: 'Angkat sampah dan alirkan air', sub: 'Bersihkan sumbatan', anim: 'angkat', icon: 'droplet', scores: { larvae: 100, risky: 95, safe: 70 }, why: 'Sampah yang menyumbat membuat air tergenang. Setelah dibersihkan, air mengalir lancar.' },
};

function c(key: keyof typeof ACT, o: Partial<Base> & { id?: string } = {}): Choice {
  const b = ACT[key];
  return { ...b, ...o, id: o.id ?? key } as Choice;
}

/** Tambahkan pilihan "ajak keluarga" berdasarkan pilihan terbaik */
function withFamily(choices: Choice[], who: Who, verb: string): Choice[] {
  const best = [...choices].sort((a, b) => b.scores.larvae - a.scores.larvae)[0];
  const name = who === 'ibu' ? 'Ibu' : who === 'ayah' ? 'Ayah' : 'Adik';
  const fam: Choice = {
    ...best,
    id: `${best.id}_${who}`,
    label: `Ajak ${name} ${verb} bersama`,
    sub: 'Kerja sama keluarga lebih cepat dan seru',
    icon: 'family',
    family: who,
    scores: { larvae: 100, risky: 100, safe: 90 },
    why: `${best.why} Dikerjakan bersama ${name}, hasilnya lebih rapi dan kebiasaan baik menular ke keluarga.`,
  };
  return [...choices, fam];
}

export const PLACES: Place[] = [
  // ----------------------- SEKOLAH -----------------------
  {
    id: 'toilet', area: 'school', scene: 'schoolyard', name: 'Bak kamar mandi', closeup: 'bak', object: 'bak mandi',
    hint: 'Mulai dari kamar mandi sekolah. Bak yang jarang dikuras adalah sarang jentik favorit.',
    edu: 'Bak mandi dikuras dan disikat minimal seminggu sekali.',
    choices: [c('sikat'), c('abate'), c('buang'), c('biarkan')],
  },
  {
    id: 'kolam', area: 'school', scene: 'schoolyard', name: 'Kolam ikan', closeup: 'kolam', object: 'kolam taman', safeWater: true,
    hint: 'Sekarang ke kolam ikan di tengah halaman. Air yang diam bisa jadi tempat jentik bila tidak ada ikannya.',
    edu: 'Kolam yang terawat dan berisi ikan pemakan jentik relatif aman.',
    choices: [c('ikan'), c('sikat', { label: 'Kuras seluruh kolam', sub: 'Mengganggu ikan dan butuh waktu', scores: { larvae: 80, risky: 80, safe: 40 }, why: 'Menguras bisa efektif, tetapi ikan pemakan jentik justru membantu menjaga kolam terus bersih.' }), c('tutup', { label: 'Tutup kolam dengan terpal', sub: 'Menutup seluruh permukaan', scores: { larvae: 20, risky: 45, safe: 30 }, why: 'Kolam ikan tidak praktis ditutup, dan jentik yang sudah ada tetap hidup di bawahnya.' }), c('biarkan')],
  },
  {
    id: 'pot', area: 'school', scene: 'schoolyard', name: 'Pot tanaman', closeup: 'pot', object: 'tatakan pot tanaman',
    hint: 'Di depan gedung ada deretan pot tanaman. Periksa piring penampung airnya.',
    edu: 'Tatakan pot perlu dibuang airnya dan disikat seminggu sekali.',
    choices: [c('ganti', { label: 'Buang air dan sikat tatakan', sub: 'Lalu keringkan' }), c('abate', { label: 'Taburkan abate di tatakan', scores: { larvae: 55, risky: 65, safe: 45 } }), c('buang', { label: 'Buang sedikit airnya' }), c('biarkan')],
  },
  {
    id: 'selokan', area: 'school', scene: 'schoolyard', name: 'Selokan', closeup: 'selokan', object: 'selokan',
    hint: 'Lanjut ke selokan di dekat pagar bawah. Sampah yang menyumbat membuat air menggenang.',
    edu: 'Selokan perlu dibersihkan dari sampah agar air selalu mengalir.',
    choices: [c('angkat'), c('abate', { scores: { larvae: 55, risky: 60, safe: 45 } }), c('buang', { label: 'Siram saja dengan air', sub: 'Sampah tetap menyumbat', scores: { larvae: 40, risky: 50, safe: 40 }, why: 'Disiram saja tidak cukup. Sampah penyumbat harus diangkat supaya air mengalir.' }), c('biarkan')],
  },
  {
    id: 'wudhu', area: 'school', scene: 'schoolyard', name: 'Tempat wudhu', closeup: 'wudhu', object: 'bak tempat wudhu', safeWater: true,
    hint: 'Terakhir, tempat wudhu di sisi kanan halaman. Ember dan bak di sana sering menampung air lama.',
    edu: 'Bak dan ember tempat wudhu dikuras berkala dan dijaga tetap kering saat tidak dipakai.',
    choices: [c('sikat'), c('tutup', { label: 'Tutup ember wudhu', scores: { larvae: 30, risky: 75, safe: 90 } }), c('abate', { scores: { larvae: 65, risky: 75, safe: 50 } }), c('biarkan')],
  },
  // ----------------------- RUMAH (DALAM) -----------------------
  {
    id: 'h_bak', area: 'home', scene: 'home_inside', name: 'Bak kamar mandi', closeup: 'bak', object: 'bak mandi rumah', family: 'ibu',
    hint: 'Mulai dari kamar mandi di sebelah kanan rumah. Bak mandi adalah tempat paling umum.',
    edu: 'Kuras dan sikat bak mandi rumah minimal seminggu sekali, lebih baik bersama keluarga.',
    choices: withFamily([c('sikat'), c('abate'), c('buang'), c('biarkan')], 'ibu', 'menguras'),
  },
  {
    id: 'h_wastafel', area: 'home', scene: 'home_inside', name: 'Wastafel dapur', closeup: 'wastafel', object: 'wastafel dan ember cucian dapur', family: 'ibu',
    hint: 'Sekarang dapur. Periksa wastafel dan ember cucian piringnya.',
    edu: 'Ember dan wastafel dapur tidak boleh menyimpan air berhari-hari.',
    choices: withFamily([c('sikat', { label: 'Kuras ember dan sikat wastafel' }), c('abate', { scores: { larvae: 20, risky: 25, safe: 20 }, why: 'Abate tidak cocok untuk wadah yang airnya dipakai mencuci alat makan dan memasak.' }), c('buang', { label: 'Buang airnya saja' }), c('biarkan')], 'ibu', 'membersihkan'),
  },
  {
    id: 'h_vas', area: 'home', scene: 'home_inside', name: 'Vas bunga', closeup: 'vas', object: 'vas bunga di ruang tamu', family: 'ibu',
    hint: 'Di ruang tamu ada vas bunga di atas meja. Air vas yang jarang diganti disukai nyamuk.',
    edu: 'Ganti air vas bunga dan cuci wadahnya minimal seminggu sekali.',
    choices: withFamily([c('ganti', { label: 'Ganti air dan cuci vas' }), c('buang', { label: 'Buang air, isi baru tanpa dicuci', scores: { larvae: 55, risky: 65, safe: 60 }, why: 'Telur menempel di dinding vas. Wadah perlu dicuci, bukan hanya diganti airnya.' }), c('abate', { scores: { larvae: 30, risky: 35, safe: 30 }, why: 'Abate kurang cocok untuk vas. Lebih baik ganti air dan cuci wadahnya rutin.' }), c('biarkan')], 'ibu', 'mengganti air vas'),
  },
  {
    id: 'h_dispenser', area: 'home', scene: 'home_inside', name: 'Tatakan dispenser', closeup: 'dispenser', object: 'baki tetesan dispenser', family: 'ibu',
    hint: 'Terakhir di dalam rumah: baki tetesan dispenser di dapur. Genangan kecil pun cukup untuk telur.',
    edu: 'Baki dispenser dan tatakan kulkas perlu dikeringkan dan dilap rutin.',
    choices: withFamily([c('ganti', { label: 'Kosongkan baki, cuci dan keringkan', sub: 'Pasang kembali dalam keadaan kering' }), c('buang', { label: 'Lap sekilas saja', scores: { larvae: 50, risky: 60, safe: 55 } }), c('abate', { scores: { larvae: 15, risky: 20, safe: 15 }, why: 'Abate tidak dipakai di peralatan rumah tangga seperti dispenser.' }), c('biarkan')], 'ibu', 'membersihkan baki'),
  },
  // ----------------------- RUMAH (LUAR) -----------------------
  {
    id: 'o_tandon', area: 'home', scene: 'home_outside', name: 'Tandon air', closeup: 'tandon', object: 'tandon air', safeWater: true, family: 'ayah',
    hint: 'Di sisi kiri halaman ada tandon air. Periksa apakah tutupnya rapat.',
    edu: 'Tandon dikuras berkala dan selalu ditutup rapat.',
    choices: withFamily([c('sikat', { label: 'Kuras tandon dan tutup rapat', sub: 'Sikat dinding lalu pasang tutup', scores: { larvae: 100, risky: 98, safe: 90 } }), c('tutup', { scores: { larvae: 35, risky: 80, safe: 95 } }), c('abate', { scores: { larvae: 75, risky: 85, safe: 60 }, why: 'Abate aman untuk air tandon sesuai takaran, tetapi kuras berkala dan tutup rapat tetap yang utama.' }), c('biarkan')], 'ayah', 'menguras tandon'),
  },
  {
    id: 'o_selokan', area: 'home', scene: 'home_outside', name: 'Selokan depan rumah', closeup: 'selokan', object: 'selokan depan rumah', family: 'ayah',
    hint: 'Sekarang selokan di depan pagar rumah. Lihat apakah airnya mengalir.',
    edu: 'Kerja bakti membersihkan selokan menjaga air tetap mengalir.',
    choices: withFamily([c('angkat'), c('abate', { scores: { larvae: 55, risky: 60, safe: 45 } }), c('buang', { label: 'Siram saja dengan air', sub: 'Sampah tetap menyumbat', scores: { larvae: 40, risky: 50, safe: 40 }, why: 'Disiram saja tidak cukup. Sampah penyumbat harus diangkat.' }), c('biarkan')], 'ayah', 'kerja bakti'),
  },
  {
    id: 'o_pot', area: 'home', scene: 'home_outside', name: 'Pot di teras', closeup: 'pot', object: 'tatakan pot di teras', family: 'adik',
    hint: 'Di teras ada beberapa pot dengan tatakan. Ajak adik membantu!',
    edu: 'Tatakan pot dibuang airnya dan disikat seminggu sekali.',
    choices: withFamily([c('ganti', { label: 'Buang air dan sikat tatakan', sub: 'Lalu keringkan' }), c('abate', { label: 'Taburkan abate di tatakan', scores: { larvae: 55, risky: 65, safe: 45 } }), c('buang', { label: 'Buang sedikit airnya' }), c('biarkan')], 'adik', 'membersihkan pot'),
  },
  {
    id: 'o_hewan', area: 'home', scene: 'home_outside', name: 'Wadah minum hewan', closeup: 'hewan', object: 'wadah minum hewan peliharaan', family: 'adik',
    hint: 'Dekat rumah-rumahan anjing ada wadah minum hewan peliharaan.',
    edu: 'Ganti air minum hewan dan cuci wadahnya setiap hari.',
    choices: withFamily([c('ganti', { label: 'Ganti air dan cuci wadah', sub: 'Lakukan setiap hari' }), c('buang', { label: 'Tuang air baru saja', scores: { larvae: 50, risky: 65, safe: 60 } }), c('abate', { scores: { larvae: 10, risky: 10, safe: 10 }, why: 'Jangan menaburkan abate di wadah minum hewan. Cukup ganti air dan cuci wadah setiap hari.' }), c('biarkan')], 'adik', 'merawat wadah'),
  },
  {
    id: 'o_ban', area: 'home', scene: 'home_outside', name: 'Ban bekas', closeup: 'ban', object: 'ban bekas berisi air', family: 'ayah',
    hint: 'Terakhir, tumpukan barang bekas di sisi kanan halaman: ban bekas dan kardus.',
    edu: 'Ban bekas disingkirkan, didaur ulang, atau ditengkurapkan agar tidak menampung air.',
    choices: withFamily([c('daur'), c('balik'), c('tutup', { label: 'Tutup dengan terpal', scores: { larvae: 30, risky: 75, safe: 85 } }), c('biarkan')], 'ayah', 'menyingkirkan ban'),
  },
];

export const PLACE_MAP: Record<string, Place> = Object.fromEntries(PLACES.map((p) => [p.id, p]));

/** Tempat menurut bahasa pilihan. Id, skor, dan temuan sama di kedua bahasa. */
export function placeFor(id: string, lang: Lang): Place | undefined {
  const p = PLACE_MAP[id];
  return p && lang === 'en' ? localizePlaceEn(p) : p;
}

/** Pilih temuan acak tiap tempat; pastikan minimal 2 'larvae' dan 1 'safe/risky' */
export function rollFindings(ids: string[]): Record<string, { finding: Finding; count: number }> {
  const out: Record<string, { finding: Finding; count: number }> = {};
  const pool: Finding[] = ['larvae', 'larvae', 'larvae', 'risky', 'risky', 'safe'];
  ids.forEach((id) => {
    const f = pool[Math.floor(Math.random() * pool.length)];
    out[id] = { finding: f, count: f === 'larvae' ? 3 + Math.floor(Math.random() * 5) : 0 };
  });
  const list = Object.keys(out);
  const larvae = list.filter((k) => out[k].finding === 'larvae');
  const need = Math.min(2, list.length) - larvae.length;
  for (let i = 0; i < need; i++) {
    const cand = list.filter((k) => out[k].finding !== 'larvae');
    const k = cand[Math.floor(Math.random() * cand.length)];
    out[k] = { finding: 'larvae', count: 3 + Math.floor(Math.random() * 5) };
  }
  if (list.length >= 4 && !list.some((k) => out[k].finding === 'safe')) {
    const cand = list.filter((k) => out[k].finding === 'risky');
    if (cand.length) out[cand[0]] = { finding: 'safe', count: 0 };
  }
  return out;
}

export function localAnalysis(place: Place, finding: Finding, count: number, lang: Lang = 'id') {
  if (lang === 'en') return localAnalysisEn(place.object, finding, count);
  if (finding === 'larvae') {
    return {
      headline: 'JENTIK TERDETEKSI',
      analysis: `Objek dikenali sebagai ${place.object}. Terdeteksi sekitar ${count} jentik yang menggeliat di permukaan air. Tempat ini sudah menjadi sarang nyamuk.`,
      advice: 'Segera buang jentiknya. Pilih tindakan yang benar-benar memutus siklus, bukan sekadar menutupi.',
    };
  }
  if (finding === 'risky') {
    return {
      headline: 'BERISIKO',
      analysis: `Objek dikenali sebagai ${place.object}. Airnya tergenang dan keruh. Belum terlihat jentik, tetapi tempat ini sangat berpotensi menjadi tempat nyamuk bertelur.`,
      advice: 'Cegah sebelum terlambat: bersihkan atau tutup agar tidak menjadi sarang.',
    };
  }
  return {
    headline: 'AMAN',
    analysis: `Objek dikenali sebagai ${place.object}. Kondisinya bersih dan tidak ditemukan jentik maupun genangan yang berbahaya saat ini.`,
    advice: 'Pertahankan dengan memeriksa dan menerapkan 3M secara rutin setiap minggu.',
  };
}
