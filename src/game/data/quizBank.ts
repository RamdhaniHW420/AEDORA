import type { QuizQuestion } from '@/lib/types';

/** Bank soal cadangan. Dipakai bila API AI tidak tersedia. Diacak setiap kali kuis dimulai. */
export const QUIZ_BANK: QuizQuestion[] = [
  {
    "q": "DBD disebabkan oleh ...",
    "options": [
      "Virus dengue",
      "Bakteri tifus",
      "Jamur kulit",
      "Cacing pita"
    ],
    "answerIndex": 0,
    "explanation": "DBD disebabkan oleh virus dengue yang ditularkan nyamuk Aedes."
  },
  {
    "q": "Nyamuk yang menularkan DBD adalah ...",
    "options": [
      "Anopheles",
      "Aedes aegypti",
      "Culex",
      "Mansonia"
    ],
    "answerIndex": 1,
    "explanation": "Aedes aegypti (dan Aedes albopictus) adalah penular utama virus dengue."
  },
  {
    "q": "Ciri khas nyamuk Aedes adalah ...",
    "options": [
      "Tubuh belang hitam-putih",
      "Seluruh tubuh merah",
      "Bersayap lebar berwarna hijau",
      "Berukuran sebesar lalat"
    ],
    "answerIndex": 0,
    "explanation": "Aedes memiliki belang hitam-putih di tubuh dan kakinya."
  },
  {
    "q": "Kapan nyamuk Aedes paling aktif menggigit?",
    "options": [
      "Tengah malam saja",
      "Pagi hingga siang dan sore hari",
      "Hanya saat hujan deras",
      "Hanya saat gelap gulita"
    ],
    "answerIndex": 1,
    "explanation": "Aedes aktif menggigit pada siang hari, terutama pagi dan sore."
  },
  {
    "q": "Urutan siklus hidup nyamuk yang benar adalah ...",
    "options": [
      "Telur, pupa, jentik, dewasa",
      "Jentik, telur, dewasa, pupa",
      "Telur, jentik, pupa, dewasa",
      "Pupa, telur, jentik, dewasa"
    ],
    "answerIndex": 2,
    "explanation": "Siklusnya: telur, jentik, pupa, lalu nyamuk dewasa."
  },
  {
    "q": "Dari telur hingga menjadi nyamuk dewasa membutuhkan waktu sekitar ...",
    "options": [
      "1 hari",
      "7 sampai 10 hari",
      "2 bulan",
      "1 tahun"
    ],
    "answerIndex": 1,
    "explanation": "Siklus hidup nyamuk Aedes sekitar 7-10 hari. Karena itu menguras dilakukan seminggu sekali."
  },
  {
    "q": "Apa kepanjangan 3M dalam pencegahan DBD?",
    "options": [
      "Mencuci, Menyapu, Mengepel",
      "Menguras, Menutup, Mendaur ulang",
      "Membakar, Membuang, Menimbun",
      "Menyemprot, Menutup, Menjemur"
    ],
    "answerIndex": 1,
    "explanation": "3M: Menguras, Menutup, dan Mendaur ulang barang bekas."
  },
  {
    "q": "Bak mandi sebaiknya dikuras minimal ...",
    "options": [
      "Seminggu sekali",
      "Sebulan sekali",
      "Setahun sekali",
      "Menunggu penuh lumut"
    ],
    "answerIndex": 0,
    "explanation": "Menguras seminggu sekali memutus siklus jentik sebelum menjadi nyamuk."
  },
  {
    "q": "Nyamuk Aedes lebih suka bertelur di ...",
    "options": [
      "Air bersih yang tergenang",
      "Air laut",
      "Tanah kering",
      "Api unggun"
    ],
    "answerIndex": 0,
    "explanation": "Aedes suka air bersih yang tergenang dan tidak langsung menyentuh tanah."
  },
  {
    "q": "Bubuk abate berfungsi untuk ...",
    "options": [
      "Membunuh jentik nyamuk",
      "Mengharumkan air",
      "Mewarnai air",
      "Mendinginkan air"
    ],
    "answerIndex": 0,
    "explanation": "Abate adalah larvasida yang membunuh jentik di tempat air yang sulit dikuras."
  },
  {
    "q": "Ikan yang cocok untuk memakan jentik adalah ...",
    "options": [
      "Ikan cupang atau ikan kepala timah",
      "Ikan paus",
      "Ikan hiu",
      "Ikan pari"
    ],
    "answerIndex": 0,
    "explanation": "Ikan cupang, kepala timah, atau guppy suka memakan jentik."
  },
  {
    "q": "Contoh barang bekas yang bisa menjadi sarang nyamuk adalah ...",
    "options": [
      "Ban bekas yang berisi air",
      "Batu kali",
      "Pasir kering",
      "Kayu bakar kering"
    ],
    "answerIndex": 0,
    "explanation": "Ban, kaleng, dan botol bekas dapat menampung air hujan."
  },
  {
    "q": "Telur nyamuk Aedes dapat bertahan pada dinding wadah kering selama ...",
    "options": [
      "Beberapa menit",
      "Beberapa jam",
      "Berbulan-bulan",
      "Tidak bisa bertahan"
    ],
    "answerIndex": 2,
    "explanation": "Telur Aedes tahan kering berbulan-bulan, sehingga dinding wadah harus disikat."
  },
  {
    "q": "Gejala awal DBD yang umum adalah ...",
    "options": [
      "Demam tinggi mendadak",
      "Batuk berdahak selama sebulan",
      "Gigi berlubang",
      "Kaki keseleo"
    ],
    "answerIndex": 0,
    "explanation": "Gejala awal DBD antara lain demam tinggi mendadak, sakit kepala, dan nyeri otot."
  },
  {
    "q": "Jika demam tinggi berlangsung lebih dari 2 hari, sebaiknya ...",
    "options": [
      "Menunggu sembuh sendiri",
      "Segera periksa ke puskesmas atau dokter",
      "Minum es sebanyak mungkin",
      "Tidak usah dipedulikan"
    ],
    "answerIndex": 1,
    "explanation": "Demam tinggi lebih dari 2 hari perlu pemeriksaan tenaga kesehatan."
  },
  {
    "q": "PSN dalam program kesehatan berarti ...",
    "options": [
      "Pemberantasan Sarang Nyamuk",
      "Pembuatan Sabun Nasional",
      "Penyiraman Sawah Negara",
      "Pelatihan Senam Nasional"
    ],
    "answerIndex": 0,
    "explanation": "PSN adalah Pemberantasan Sarang Nyamuk."
  },
  {
    "q": "Jumantik adalah ...",
    "options": [
      "Juru pemantau jentik",
      "Jenis makanan bergizi",
      "Jadwal kuras tandon",
      "Jaket anti nyamuk"
    ],
    "answerIndex": 0,
    "explanation": "Jumantik adalah juru pemantau jentik yang memeriksa tempat penampungan air."
  },
  {
    "q": "Air pada vas bunga sebaiknya ...",
    "options": [
      "Diganti seminggu sekali atau lebih sering",
      "Dibiarkan sampai kering sendiri",
      "Ditambah air tanpa dicuci",
      "Ditutup dengan kain basah"
    ],
    "answerIndex": 0,
    "explanation": "Ganti air vas dan cuci wadahnya agar telur tidak menumpuk."
  },
  {
    "q": "Tatakan pot atau dispenser yang tergenang air sebaiknya ...",
    "options": [
      "Dikeringkan dan dibersihkan rutin",
      "Dibiarkan penuh",
      "Diisi air lagi",
      "Ditutup tanpa dibersihkan"
    ],
    "answerIndex": 0,
    "explanation": "Genangan kecil pun dapat menjadi tempat bertelur nyamuk."
  },
  {
    "q": "Mengapa tempat penampungan air perlu ditutup rapat?",
    "options": [
      "Agar nyamuk tidak bisa bertelur di dalamnya",
      "Agar airnya lebih dingin",
      "Agar airnya berwarna biru",
      "Agar tidak ada yang mengambil airnya"
    ],
    "answerIndex": 0,
    "explanation": "Penutup rapat menghalangi nyamuk betina masuk dan bertelur."
  },
  {
    "q": "Jentik nyamuk sering terlihat ...",
    "options": [
      "Menggeliat naik turun di permukaan air",
      "Diam di dasar tanah",
      "Terbang di udara",
      "Menempel di dinding rumah"
    ],
    "answerIndex": 0,
    "explanation": "Jentik menggeliat dan naik ke permukaan untuk bernapas."
  },
  {
    "q": "Mengapa jentik naik ke permukaan air?",
    "options": [
      "Untuk bernapas",
      "Untuk berjemur",
      "Untuk minum",
      "Untuk tidur"
    ],
    "answerIndex": 0,
    "explanation": "Jentik bernapas lewat saluran udara di dekat permukaan air."
  },
  {
    "q": "Nyamuk yang menggigit manusia adalah nyamuk ...",
    "options": [
      "Betina",
      "Jantan",
      "Anak nyamuk",
      "Semua jentik"
    ],
    "answerIndex": 0,
    "explanation": "Nyamuk betina butuh darah untuk mematangkan telurnya."
  },
  {
    "q": "DBD menular melalui ...",
    "options": [
      "Gigitan nyamuk Aedes yang membawa virus dengue",
      "Berjabat tangan",
      "Berbagi alat makan",
      "Batuk dan bersin"
    ],
    "answerIndex": 0,
    "explanation": "DBD tidak menular langsung dari orang ke orang, melainkan lewat gigitan nyamuk."
  },
  {
    "q": "Fogging (pengasapan) saja ...",
    "options": [
      "Tidak cukup, karena sarang jentik tetap harus diberantas",
      "Sudah cukup selamanya",
      "Membuat nyamuk tidak pernah datang lagi",
      "Membersihkan bak mandi"
    ],
    "answerIndex": 0,
    "explanation": "Fogging hanya membunuh nyamuk dewasa. Sumbernya (jentik) harus dikendalikan dengan 3M."
  },
  {
    "q": "Mendaur ulang barang bekas membantu mencegah DBD karena ...",
    "options": [
      "Barang bekas tidak lagi menampung air",
      "Barang bekas jadi berwarna",
      "Nyamuk jadi takut suara",
      "Air jadi lebih bersih"
    ],
    "answerIndex": 0,
    "explanation": "Barang bekas yang dimanfaatkan atau disingkirkan tidak lagi menampung genangan."
  },
  {
    "q": "Siapa yang bertanggung jawab mencegah DBD?",
    "options": [
      "Semua orang, termasuk siswa dan keluarga",
      "Hanya dokter",
      "Hanya guru",
      "Hanya petugas kebersihan"
    ],
    "answerIndex": 0,
    "explanation": "Pencegahan DBD butuh gotong royong seluruh warga."
  },
  {
    "q": "Cara melindungi diri dari gigitan nyamuk di pagi dan sore hari adalah ...",
    "options": [
      "Memakai pakaian panjang dan lotion anti nyamuk",
      "Memakai baju tipis tanpa pelindung",
      "Bermain di dekat selokan",
      "Membiarkan jendela terbuka tanpa kasa"
    ],
    "answerIndex": 0,
    "explanation": "Pakaian panjang dan lotion anti nyamuk mengurangi risiko gigitan."
  },
  {
    "q": "Tempat yang paling berisiko di rumah adalah ...",
    "options": [
      "Bak mandi yang jarang dikuras",
      "Lemari pakaian",
      "Rak sepatu",
      "Tempat tidur"
    ],
    "answerIndex": 0,
    "explanation": "Bak mandi yang jarang dikuras menyimpan air tergenang cukup lama."
  },
  {
    "q": "Langkah pertama saat menemukan jentik di bak mandi adalah ...",
    "options": [
      "Menguras dan menyikat dindingnya",
      "Menambah air baru",
      "Menutup tanpa dikuras",
      "Membiarkan saja"
    ],
    "answerIndex": 0,
    "explanation": "Jentik dibuang dengan menguras, lalu dinding disikat untuk menghilangkan telur."
  },
  {
    "q": "Tanda bahaya DBD yang harus segera dibawa ke IGD adalah ...",
    "options": [
      "Nyeri perut hebat, muntah terus, atau perdarahan",
      "Hidung sedikit gatal",
      "Mengantuk setelah makan",
      "Bersin satu kali"
    ],
    "answerIndex": 0,
    "explanation": "Tanda-tanda tersebut menandakan kondisi gawat. Segera cari pertolongan medis."
  },
  {
    "q": "Penutup tandon air sebaiknya ...",
    "options": [
      "Dipasang rapat dan tandon dikuras berkala",
      "Dilepas supaya segar",
      "Diganti dengan jaring bolong",
      "Dibuka saat hujan"
    ],
    "answerIndex": 0,
    "explanation": "Tandon harus tertutup rapat agar nyamuk tidak bertelur."
  },
  {
    "q": "Kegiatan 3M lebih efektif dibandingkan hanya mengandalkan fogging karena ...",
    "options": [
      "Memutus siklus nyamuk di sumbernya",
      "Menghilangkan hujan",
      "Membuat air berwarna",
      "Membuat nyamuk tidak bisa terbang"
    ],
    "answerIndex": 0,
    "explanation": "3M menghilangkan tempat berkembang biak sehingga nyamuk tidak sempat tumbuh."
  },
  {
    "q": "Piring penampung pot tanaman yang selalu berisi air sebaiknya ...",
    "options": [
      "Dibuang airnya dan disikat seminggu sekali",
      "Diisi air lebih banyak",
      "Dibiarkan sampai berlumut",
      "Ditutup plastik tanpa dibersihkan"
    ],
    "answerIndex": 0,
    "explanation": "Telur menempel di dinding piring, jadi perlu disikat saat air dibuang."
  },
  {
    "q": "Mengapa menguras cukup seminggu sekali?",
    "options": [
      "Karena jentik butuh sekitar 7-10 hari untuk menjadi nyamuk",
      "Karena air cepat basi",
      "Karena bak gampang bocor",
      "Karena ember berubah warna"
    ],
    "answerIndex": 0,
    "explanation": "Menguras sebelum 7 hari memutus siklus sebelum jentik menjadi nyamuk dewasa."
  },
  {
    "q": "Air minum hewan peliharaan sebaiknya ...",
    "options": [
      "Diganti dan wadahnya dicuci setiap hari",
      "Diganti sebulan sekali",
      "Tidak perlu diganti",
      "Ditambah saja"
    ],
    "answerIndex": 0,
    "explanation": "Wadah kecil pun cukup untuk perkembangbiakan jentik bila airnya lama tergenang."
  },
  {
    "q": "Selokan yang tersumbat sampah berbahaya karena ...",
    "options": [
      "Menimbulkan genangan yang bisa jadi sarang nyamuk",
      "Membuat air terlalu bersih",
      "Membuat nyamuk jadi lapar",
      "Membuat tanah keras"
    ],
    "answerIndex": 0,
    "explanation": "Genangan di selokan tersumbat bisa menjadi tempat bertelur."
  },
  {
    "q": "Kelambu atau kasa jendela membantu ...",
    "options": [
      "Mencegah nyamuk masuk dan menggigit",
      "Menghangatkan ruangan",
      "Menghilangkan jentik",
      "Membuat ruangan gelap"
    ],
    "answerIndex": 0,
    "explanation": "Kelambu dan kasa menjadi penghalang fisik bagi nyamuk."
  },
  {
    "q": "Setelah menguras bak, hal terbaik berikutnya adalah ...",
    "options": [
      "Menyikat dinding lalu menutup atau mengisi ulang",
      "Membiarkannya terbuka tanpa air selamanya",
      "Memasukkan ban bekas",
      "Menaburkan garam"
    ],
    "answerIndex": 0,
    "explanation": "Sikat dinding agar telur hilang, lalu tutup atau isi ulang air bersih."
  }
];
