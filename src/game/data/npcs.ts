import type { Dir } from "@/game/engine/sceneData";
import type { SceneId } from "./places";

export type NpcId =
  | "raka"
  | "dimas"
  | "tika"
  | "nadia"
  | "sari"
  | "bayu"
  | "wulan"
  | "joko"
  | "tini"
  | "nenek";

export interface SceneNpcDef {
  id: NpcId;
  x: number;
  y: number;
  dir: Dir;
  /** Arah pandang yang bergantian saat NPC diam, supaya kelas terasa hidup. */
  look: Dir[];
}

/** NPC tambahan di tiap scene. Posisi dalam piksel sumber, kaki karakter di (x, y). */
export const SCENE_NPCS: Record<SceneId, SceneNpcDef[]> = {
  classroom: [
    { id: "raka", x: 52, y: 131, dir: "up", look: ["up", "right"] },
    { id: "nadia", x: 269, y: 131, dir: "up", look: ["up", "left"] },
    { id: "dimas", x: 197, y: 170, dir: "up", look: ["up", "down"] },
    { id: "tika", x: 330, y: 128, dir: "up", look: ["up", "left"] },
  ],
  schoolyard: [
    { id: "sari", x: 385, y: 238, dir: "right", look: ["right", "down"] },
    { id: "bayu", x: 425, y: 240, dir: "left", look: ["left", "down"] },
    { id: "wulan", x: 500, y: 288, dir: "left", look: ["left", "up"] },
    { id: "joko", x: 215, y: 340, dir: "right", look: ["right", "down"] },
  ],
  home_inside: [
    { id: "nenek", x: 60, y: 162, dir: "right", look: ["right", "down"] },
  ],
  home_outside: [
    { id: "tini", x: 330, y: 168, dir: "left", look: ["left", "down"] },
  ],
};

export const NPC_NAME_ID: Record<NpcId, string> = {
  raka: "Raka",
  dimas: "Dimas",
  tika: "Tika",
  nadia: "Nadia",
  sari: "Sari",
  bayu: "Bayu",
  wulan: "Wulan",
  joko: "Pak Joko",
  tini: "Bu Tini",
  nenek: "Nenek",
};

export const NPC_NAME_EN: Record<NpcId, string> = {
  raka: "Raka",
  dimas: "Dimas",
  tika: "Tika",
  nadia: "Nadia",
  sari: "Sari",
  bayu: "Bayu",
  wulan: "Wulan",
  joko: "Mr. Joko",
  tini: "Mrs. Tini",
  nenek: "Grandma",
};

/**
 * Obrolan tiap NPC, bergiliran setiap kali diajak bicara.
 * Baris berawalan "> " diucapkan pemain, {name} diganti nama depan pemain.
 * Isinya mengikuti materi game (3M, jentik, abate, tindakan nyata dihitung dalam nilai).
 */
type Talks = string[][];

const ID: Record<NpcId, Talks> = {
  raka: [
    [
      "Hei {name}! Tadi Bu Rani bilang DBD ditularkan nyamuk Aedes aegypti, kan?",
      "> Iya, nyamuknya bertelur di air bersih yang menggenang.",
      "Wah, berarti genangan di pot bunga rumahku harus dicek nih!",
    ],
    [
      "Aku rajin ikut kerja bakti kuras bak sekarang. Seminggu sekali, tidak boleh lupa!",
      "> Kenapa harus seminggu sekali?",
      "Katanya jentik butuh sekitar seminggu untuk jadi nyamuk. Jadi kita kuras sebelum itu.",
    ],
    [
      "3M itu Menguras, Menutup, dan Mendaur ulang. Aku sudah hafal!",
      "> Hebat! Nanti kita praktikkan di lapangan.",
    ],
  ],
  nadia: [
    [
      "Kamu mau lihat catatanku? Aku tulis tiga langkah 3M di halaman depan.",
      "> Boleh, terima kasih!",
      "Menguras, Menutup, Mendaur ulang. Plus-nya, jangan biarkan air menggenang.",
    ],
    [
      "Baju yang digantung lama itu juga disukai nyamuk lho. Tempatnya gelap dan lembap.",
      "> Jadi jangan menumpuk baju kotor ya.",
      "Iya, cuci dan lipat supaya tidak jadi tempat sembunyi nyamuk.",
    ],
    [
      "Kalau ada yang demam tinggi, jangan malu bilang ke guru ya. Makin cepat ditangani makin baik.",
    ],
  ],
  dimas: [
    [
      "Tahu tidak, nyamuk Aedes itu menggigit pagi dan sore, bukan malam hari.",
      "> Oh, jadi waspadanya bukan cuma malam.",
      "Betul. Pakai baju panjang atau lotion anti nyamuk kalau main di luar.",
    ],
    [
      "Telur nyamuk bisa menempel di dinding bak, jadi menguras saja tidak cukup.",
      "> Lalu bagaimana?",
      "Dindingnya disikat. Aku sudah catat di buku harianku.",
    ],
    [
      "Jentik itu kecil, menggantung di permukaan air, dan bergerak naik turun kalau air terganggu.",
      "> Siap, nanti kucari sampai ketemu.",
    ],
  ],
  tika: [
    [
      "Aku baca buku perpustakaan tentang DBD. Gejalanya demam tinggi mendadak, sakit kepala, dan lemas.",
      "> Kalau begitu harus segera ke dokter, ya?",
      "Iya, jangan ditunda. Banyak minum dan periksa ke puskesmas atau dokter.",
    ],
    [
      "Di rak ini ada poster 3M Plus. Plus-nya macam-macam, misalnya abate atau ikan pemakan jentik.",
      "> Banyak cara ya.",
      "Betul, pilih yang cocok dengan tempatnya.",
    ],
    [
      "Kata Bu Rani, nilai akhir bukan cuma dari kuis. Tindakan nyata di sekolah dan rumah juga dihitung.",
      "> Berarti kita harus teliti ya.",
    ],
  ],
  sari: [
    [
      "Aku dan Bayu lagi menghitung genangan di halaman. Kamu juga cari jentik?",
      "> Iya, ini tugas dari Bu Rani.",
      "Semangat! Coba cek tempat teduh yang jarang dilihat orang.",
    ],
    [
      "Tadi aku lihat tutup bak penampungan agak terbuka.",
      "> Kalau begitu harus ditutup rapat.",
      "Betul, nyamuk sekecil itu bisa lewat celah.",
    ],
    [
      "Aku suka kerja bakti sekolah. Ramai-ramai jadi cepat selesai.",
      "> Setuju, jadi tidak terasa capek.",
    ],
  ],
  bayu: [
    [
      "Sari bilang kamu lagi periksa jentik. Boleh aku ikut lihat nanti?",
      "> Boleh, makin banyak mata makin baik.",
      "Oke, aku awasi bagian pojok halaman.",
    ],
    [
      "Ban bekas dan kaleng sering jadi tempat nyamuk bertelur kalau kena hujan.",
      "> Lalu diapakan?",
      "Dibalik atau dibuang. Kalau bisa didaur ulang, lebih bagus lagi.",
    ],
    ["Aku tidak takut nyamuk, tapi aku takut kita lupa menguras bak. Hehe."],
  ],
  wulan: [
    [
      "Di sini adem, makanya aku sering duduk di sini. Tapi tempat teduh juga disukai nyamuk.",
      "> Jadi tetap harus waspada.",
      "Iya, selalu lihat ke dalam wadah yang berisi air.",
    ],
    [
      "Kata kakakku, tiap musim hujan puskesmas ramai pasien DBD.",
      "> Berarti pencegahan itu penting sekali.",
      "Betul, lebih baik mencegah daripada mengobati.",
    ],
    [
      "Kalau sudah selesai memeriksa, ceritakan ke Bu Rani ya. Beliau senang melihat hasil kerja kita.",
    ],
  ],
  joko: [
    [
      "Selamat siang, {name}. Bapak yang biasa menyapu dan merawat halaman sekolah ini.",
      "> Halamannya rapi sekali, Pak.",
      "Terima kasih. Kalau ada air menggenang sehabis hujan, Bapak langsung buang.",
    ],
    [
      "Bak dan tandon sekolah Bapak kuras tiap minggu. Dindingnya disikat, bukan cuma airnya dibuang.",
      "> Betul, telur nyamuk bisa menempel di dinding.",
      "Pintar! Itu kuncinya.",
    ],
    [
      "Bapak simpan abate untuk wadah yang sulit dikuras. Takarannya harus sesuai aturan.",
      "> Boleh dipakai di semua wadah, Pak?",
      "Jangan di wadah air yang dipakai untuk mencuci alat makan atau memasak.",
    ],
  ],
  tini: [
    [
      "Halo {name}. Hati-hati di halaman ya, sehabis hujan banyak genangan.",
      "> Iya Bu, saya mau memeriksa wadah di sekitar rumah.",
      "Bagus! Rumah Ibu juga baru kerja bakti kemarin.",
    ],
    [
      "Ibu pelihara ikan di kolam kecil depan rumah. Ikannya memakan jentik.",
      "> Wah, cara yang bagus.",
      "Itu salah satu 3M Plus. Tapi kolamnya tetap harus dijaga bersih.",
    ],
    [
      "Kalau tetangga kompak, nyamuk jadi susah berkembang. Ajak keluargamu juga ya.",
    ],
  ],
  nenek: [
    [
      "Cucuku {name}, sini duduk dulu. Nenek lagi menunggu teh hangat.",
      "> Nek, aku mau memeriksa vas dan dispenser dulu.",
      "Silakan, Nak. Air vas biasanya Nenek ganti dan vasnya dicuci.",
    ],
    [
      "Dulu kalau musim hujan, kampung kita sering ada yang kena demam berdarah. Sekarang kita lebih paham.",
      "> Iya Nek, kuncinya 3M.",
      "Nenek bangga kamu belajar ini.",
    ],
    [
      "Kalau badan terasa panas tinggi, jangan tunggu lama. Segera ke dokter ya, Nak.",
      "> Baik, Nek.",
    ],
  ],
};

const EN: Record<NpcId, Talks> = {
  raka: [
    [
      "Hey {name}! Ms. Rani said dengue is spread by the Aedes aegypti mosquito, right?",
      "> Yes, it lays eggs in clean standing water.",
      "Then I need to check the flower pots at my house!",
    ],
    [
      "I join the weekly bin scrub now. Once a week, no skipping!",
      "> Why once a week?",
      "Larvae need about a week to become mosquitoes. So we scrub before that.",
    ],
    [
      "3M means drain, cover, and recycle. I already memorized it!",
      "> Nice! We will put it into practice later.",
    ],
  ],
  nadia: [
    [
      "Want to see my notes? I wrote the three 3M steps on the first page.",
      "> Sure, thanks!",
      "Drain, cover, recycle. The plus part is to never leave water standing.",
    ],
    [
      "Clothes left hanging for days attract mosquitoes too. It is dark and damp there.",
      "> So do not pile up dirty clothes.",
      "Right, wash and fold them so mosquitoes have nowhere to hide.",
    ],
    [
      "If someone has a high fever, do not be shy about telling a teacher. The sooner it is treated, the better.",
    ],
  ],
  dimas: [
    [
      "Did you know Aedes mosquitoes bite in the morning and late afternoon, not at night?",
      "> Oh, so we should stay careful beyond nighttime.",
      "Exactly. Wear long sleeves or repellent when you play outside.",
    ],
    [
      "Mosquito eggs can stick to the walls of a tub, so draining alone is not enough.",
      "> Then what do we do?",
      "Scrub the walls. I already wrote it in my journal.",
    ],
    [
      "Larvae are tiny, hang from the water surface, and wriggle up and down when the water is disturbed.",
      "> Got it, I will look until I find some.",
    ],
  ],
  tika: [
    [
      "I read a library book about dengue. Symptoms are a sudden high fever, headache, and feeling weak.",
      "> Then we should see a doctor right away?",
      "Yes, do not wait. Drink plenty of water and visit a clinic or doctor.",
    ],
    [
      "There is a 3M Plus poster on this shelf. The plus can be many things, like abate or larvae-eating fish.",
      "> So many options.",
      "Right, pick the one that suits the place.",
    ],
    [
      "Ms. Rani said the final score is not only from the quiz. Real actions at school and at home count too.",
      "> So we need to be careful.",
    ],
  ],
  sari: [
    [
      "Bayu and I are counting puddles in the yard. Are you hunting for larvae too?",
      "> Yes, it is Ms. Rani's assignment.",
      "Good luck! Check shady spots that people rarely look at.",
    ],
    [
      "I saw that the cover on the water tank was a bit open earlier.",
      "> Then it has to be closed tight.",
      "Right, even a gap that small lets mosquitoes through.",
    ],
    [
      "I like school clean-up days. Doing it together makes it quick.",
      "> Agreed, it hardly feels tiring.",
    ],
  ],
  bayu: [
    [
      "Sari said you are checking for larvae. Can I come and watch later?",
      "> Sure, more eyes are better.",
      "Okay, I will keep watch over the corner of the yard.",
    ],
    [
      "Old tires and cans often become mosquito nurseries when it rains.",
      "> What do we do with them?",
      "Turn them over or throw them away. Recycling is even better.",
    ],
    [
      "I am not afraid of mosquitoes, but I am afraid we forget to scrub the tub. Haha.",
    ],
  ],
  wulan: [
    [
      "It is cool here, that is why I sit here a lot. But mosquitoes like shade too.",
      "> So we still need to stay alert.",
      "Yes, always look inside containers that hold water.",
    ],
    [
      "My older sibling says the clinic is packed with dengue patients every rainy season.",
      "> So prevention matters a lot.",
      "Right, prevention is better than cure.",
    ],
    ["When you finish checking, tell Ms. Rani. She loves seeing our work."],
  ],
  joko: [
    [
      "Good afternoon, {name}. I am the one who sweeps and looks after this schoolyard.",
      "> The yard looks so tidy, sir.",
      "Thank you. If water collects after rain, I pour it out right away.",
    ],
    [
      "I scrub the school tubs and tanks every week. The walls get brushed, not only drained.",
      "> Right, mosquito eggs can stick to the walls.",
      "Smart! That is the key.",
    ],
    [
      "I keep abate for containers that are hard to drain. The dose must follow the instructions.",
      "> Can it go into every container, sir?",
      "Not in water used to wash dishes or to cook.",
    ],
  ],
  tini: [
    [
      "Hello {name}. Be careful in the yard, there are puddles after the rain.",
      "> I will, ma'am. I want to check containers around the house.",
      "Good! We held a clean-up at my house yesterday too.",
    ],
    [
      "I keep fish in the small pond in front of my house. They eat the larvae.",
      "> That is a great idea.",
      "It is one of the 3M Plus ways. The pond still has to be kept clean.",
    ],
    [
      "When neighbors work together, mosquitoes have a hard time breeding. Invite your family too.",
    ],
  ],
  nenek: [
    [
      "My dear {name}, come sit for a while. Grandma is waiting for some warm tea.",
      "> Grandma, I want to check the vase and the dispenser first.",
      "Go ahead, dear. Grandma changes the vase water and washes the vase.",
    ],
    [
      "In the old days, someone in our village often got dengue every rainy season. Now we understand it better.",
      "> Yes, Grandma, the key is 3M.",
      "Grandma is proud that you are learning this.",
    ],
    [
      "If you feel a high fever, do not wait long. See a doctor quickly, dear.",
      "> Okay, Grandma.",
    ],
  ],
};

export const NPC_TALKS: Record<"id" | "en", Record<NpcId, Talks>> = {
  id: ID,
  en: EN,
};
