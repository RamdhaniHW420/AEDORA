/**
 * Token desain AEDORA. Sumber: DESIGN.md di akar proyek.
 * Biru AEDORA tetap menjadi identitas dan kerangka. Warna permen (G) memberi tiap bab dan menu warnanya sendiri.
 * Nilai teks sudah dihitung terhadap WCAG AA, jangan diganti tanpa menghitung ulang.
 */
export const C = {
  // identitas
  blue: '#0879BC', // tombol utama, tab aktif (putih di atasnya 4.70:1)
  blueDeep: '#065A8C', // teks biru di atas ice, sisi bawah tombol (6.24:1 di ice)
  sky: '#55B8E8', // panel, bingkai, ilustrasi. Bukan untuk teks.
  navy: '#163B5E', // judul dan teks utama
  red: '#E83435', // penanda DBD, jentik, peringatan. Isi dan ikon saja.
  redDeep: '#C92A2B', // tombol merah dan teks merah (putih di atasnya 5.46:1)
  ice: '#DCEFFA', // latar layar
  white: '#FFFFFF', // permukaan kartu

  // turunan netral
  surface: '#EEF7FC', // permukaan kedua di atas ice
  muted: '#4A6785', // teks sekunder (4.98:1 di ice, 5.88:1 di putih)
  hint: '#56708D', // placeholder (5.12:1 di putih)
  line: '#B7D4E8', // bingkai dekoratif kartu
  edge: '#6B8FAE', // batas kontrol interaktif, minimal 3:1 (3.41:1 di putih)

  // status dan objek bergambar. Bukan warna kerangka UI.
  good: '#1F7A3E', // berhasil (putih di atasnya 5.37:1)
  goodSoft: '#E4F4EA',
  coin: '#FFD23F', // hanya dekat ikon koin dan piala
  coinDeep: '#B98300',

  // nama lama dipertahankan agar kode game yang belum diubah tetap berjalan
  blueDark: '#065A8C',
  ink: '#163B5E',
  green: '#1F7A3E',
  greenDark: '#145A2D',
  gold: '#F4B400',
  paper: '#EEF7FC',
  warn: '#E83435',
};

/**
 * Warna dunia game. Tiap warna punya satu tugas: bab 1 hijau, bab 2 jingga, bab 3 merah muda, bab 4 ungu,
 * koin dan hadiah kuning, pemindai dan histori aqua. Teks di atas isian cerah memakai navy,
 * kecuali grape (putih 5.66:1). `deep` aman sebagai teks di atas putih dan ice (minimal 5.4:1).
 */
export const G = {
  blue: { bg: '#0879BC', edge: '#065A8C', text: '#FFFFFF', deep: '#065A8C', soft: '#DCEFFA' },
  leaf: { bg: '#46D173', edge: '#1E9A47', text: '#163B5E', deep: '#146B33', soft: '#E3F8EA' },
  sun: { bg: '#FF9F2E', edge: '#C46A00', text: '#163B5E', deep: '#8A4A00', soft: '#FFF0DB' },
  berry: { bg: '#FF7DB4', edge: '#C2336F', text: '#163B5E', deep: '#A01F58', soft: '#FFE6F0' },
  grape: { bg: '#6B4BE0', edge: '#4B2DB8', text: '#FFFFFF', deep: '#4B2DB8', soft: '#EDE6FF' },
  lemon: { bg: '#FFD23F', edge: '#C99700', text: '#163B5E', deep: '#7A5A00', soft: '#FFF6CC' },
  aqua: { bg: '#2ED3C6', edge: '#0E9488', text: '#163B5E', deep: '#0B6B63', soft: '#D9F7F4' },
  red: { bg: '#C92A2B', edge: '#8E1C1D', text: '#FFFFFF', deep: '#8E1C1D', soft: '#FDECEC' },
  navy: { bg: '#163B5E', edge: '#0C2540', text: '#FFFFFF', deep: '#163B5E', soft: '#DCEFFA' },
} as const;
export type GTone = keyof typeof G;

/** Warna tiap bab, urut dari bab 1. */
export const CH: GTone[] = ['leaf', 'sun', 'berry', 'grape'];

export const F = {
  pixel: 'PixelifySans_600SemiBold',
  pixelB: 'PixelifySans_700Bold',
  bodyR: 'PlusJakartaSans_400Regular',
  body: 'PlusJakartaSans_500Medium',
  bodyB: 'PlusJakartaSans_700Bold',
  bodyX: 'PlusJakartaSans_800ExtraBold',
};

export const R = { sm: 8, md: 12, lg: 20, xl: 28 };

/** Skala ukuran huruf. */
export const T = { cap: 12, body: 14, lead: 16, title: 20, hero: 28 };

/** Bayangan hanya untuk elemen yang melayang (tombol GAME, toast). Kartu datar. */
export const lift = {
  shadowColor: '#0B2A44',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.22,
  shadowRadius: 8,
  elevation: 6,
} as const;

/** nama lama */
export const shadowSoft = lift;
