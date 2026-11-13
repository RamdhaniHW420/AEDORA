import { SLIDES } from '@/game/assets';
import type { Lang } from '@/lib/i18n';

export interface SlideData {
  id: string;
  title: string;
  image: keyof typeof SLIDES;
  teacher: string;
  points: string[];
}

export const SLIDE_DATA: SlideData[] = [
  {
    id: 'dbd',
    title: 'Apa itu DBD?',
    image: 'dbd',
    teacher: 'Pertama, kita kenali dulu musuhnya: Demam Berdarah Dengue.',
    points: [
      'DBD disebabkan oleh virus dengue.',
      'Virus ini menular lewat gigitan nyamuk Aedes, bukan lewat batuk atau bersentuhan.',
      'Gejala awal: demam tinggi mendadak, sakit kepala, nyeri otot, dan bisa muncul bintik merah.',
      'Bila demam tinggi lebih dari 2 hari, segera periksa ke puskesmas atau dokter.',
    ],
  },
  {
    id: 'aedes',
    title: 'Kenali Nyamuk Aedes',
    image: 'aedes',
    teacher: 'Nyamuk Aedes punya ciri khas yang mudah diingat, lho.',
    points: [
      'Tubuh dan kakinya belang hitam-putih seperti zebra.',
      'Paling aktif menggigit pagi hingga siang dan sore hari.',
      'Hanya nyamuk betina yang menggigit karena butuh darah untuk telurnya.',
      'Terbangnya dekat, jadi sarangnya biasanya di sekitar rumah dan sekolah kita sendiri.',
    ],
  },
  {
    id: 'lifecycle',
    title: 'Siklus Hidup Nyamuk',
    image: 'lifecycle',
    teacher: 'Dari telur sampai nyamuk dewasa, semuanya terjadi di dalam air.',
    points: [
      'Telur, jentik, pupa, lalu nyamuk dewasa.',
      'Seluruh siklus hanya sekitar 7 sampai 10 hari.',
      'Telur menempel di dinding wadah dan bisa bertahan kering berbulan-bulan.',
      'Karena itu wadah air harus disikat, bukan hanya dibuang airnya.',
    ],
  },
  {
    id: 'habitat',
    title: 'Tempat Berkembang Biak',
    image: 'habitat',
    teacher: 'Sekarang bayangkan, di mana saja nyamuk senang bertelur?',
    points: [
      'Air bersih yang tergenang dan tidak langsung menyentuh tanah.',
      'Bak mandi, ember, tandon, vas bunga, tatakan pot, dan tatakan dispenser.',
      'Tempat minum hewan, ban bekas, kaleng, dan botol bekas.',
      'Selokan atau talang yang tersumbat sampah juga bisa menahan genangan.',
    ],
  },
  {
    id: 'm3',
    title: 'Cegah dengan 3M Plus',
    image: 'm3',
    teacher: 'Kabar baiknya, DBD bisa dicegah. Ingat 3M Plus!',
    points: [
      'Menguras dan menyikat tempat penampungan air minimal seminggu sekali.',
      'Menutup rapat tempat penampungan air.',
      'Mendaur ulang atau menyingkirkan barang bekas yang bisa menampung air.',
      'Plus: bubuk abate, ikan pemakan jentik, kelambu, dan gotong royong bersama keluarga.',
    ],
  },
];

const SLIDE_DATA_EN: Pick<SlideData, 'id' | 'title' | 'teacher' | 'points'>[] = [
  {
    id: 'dbd',
    title: 'What is DBD?',
    teacher: 'First, let us get to know the enemy: Dengue Hemorrhagic Fever.',
    points: [
      'DBD is caused by the dengue virus.',
      'The virus spreads through the bite of the Aedes mosquito, not through coughing or touching.',
      'Early signs: a sudden high fever, headache, muscle pain, and sometimes red spots.',
      'If a high fever lasts more than 2 days, go to a community health center or a doctor right away.',
    ],
  },
  {
    id: 'aedes',
    title: 'Know the Aedes Mosquito',
    teacher: 'The Aedes mosquito has features that are easy to remember.',
    points: [
      'Its body and legs have black and white stripes, like a zebra.',
      'It bites most in the morning, midday, and late afternoon.',
      'Only the female bites, because she needs blood for her eggs.',
      'It flies short distances, so its nests are usually around our own homes and schools.',
    ],
  },
  {
    id: 'lifecycle',
    title: 'The Mosquito Life Cycle',
    teacher: 'From egg to adult mosquito, it all happens in water.',
    points: [
      'Egg, larva, pupa, then adult mosquito.',
      'The whole cycle takes only about 7 to 10 days.',
      'Eggs stick to the walls of containers and can survive dry for months.',
      'That is why water containers must be scrubbed, not just emptied.',
    ],
  },
  {
    id: 'habitat',
    title: 'Where They Breed',
    teacher: 'Now imagine: where do mosquitoes like to lay eggs?',
    points: [
      'Clean standing water that does not touch the ground.',
      'Bathtubs, buckets, water tanks, flower vases, plant pot saucers, and dispenser trays.',
      'Pet water bowls, old tires, cans, and old bottles.',
      'Drains or gutters blocked by trash can also hold standing water.',
    ],
  },
  {
    id: 'm3',
    title: 'Prevent with 3M Plus',
    teacher: 'The good news: DBD can be prevented. Remember 3M Plus!',
    points: [
      'Menguras (Drain): empty and scrub water containers at least once a week.',
      'Menutup (Cover): close water containers tightly.',
      'Mendaur ulang (Recycle): recycle or remove old items that can hold water.',
      'Plus: abate powder, larvae-eating fish, bed nets, and teamwork with your family.',
    ],
  },
];

export function slidesFor(lang: Lang): SlideData[] {
  if (lang !== 'en') return SLIDE_DATA;
  return SLIDE_DATA.map((s) => ({ ...s, ...(SLIDE_DATA_EN.find((e) => e.id === s.id) ?? {}) }));
}
