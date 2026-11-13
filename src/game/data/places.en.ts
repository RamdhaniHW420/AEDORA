import type { Finding } from '@/lib/types';
import type { Choice, Place, Who } from './places';

interface Txt { label?: string; sub?: string; why?: string }

const ACT_EN: Record<string, Required<Txt>> = {
  sikat: { label: 'Drain and scrub the walls', sub: 'Empty the water, then scrub every side', why: 'Draining and scrubbing removes the larvae and the eggs stuck to the walls.' },
  tutup: { label: 'Cover it tightly', sub: 'Put a lid on top', why: 'A tight lid stops mosquitoes from laying eggs, but any larvae already inside must be removed first.' },
  abate: { label: 'Sprinkle abate powder', sub: 'Larvicide in the right dose', why: 'Abate kills larvae in containers that are hard to drain, but draining and scrubbing is still the first choice.' },
  ikan: { label: 'Add larvae-eating fish', sub: 'Betta or panchax fish', why: 'Larvae-eating fish are a natural control that is safe and easy to keep.' },
  biarkan: { label: 'Just leave it', sub: 'It will go away by itself', why: 'Larvae become adult mosquitoes in 7-10 days. Leaving it means giving mosquitoes a home.' },
  buang: { label: 'Only pour out the water', sub: 'No scrubbing', why: 'Pouring out the water is not enough. Eggs stick to the walls and hatch again when water returns.' },
  balik: { label: 'Turn the container upside down', sub: 'Dry it, then flip it', why: 'A container turned upside down no longer collects rainwater.' },
  daur: { label: 'Remove or recycle it', sub: 'Reuse it or throw it away properly', why: 'Old items that are removed or recycled no longer become puddle spots.' },
  ganti: { label: 'Pour out the water and wash the container', sub: 'Refill with clean water', why: 'Changing the water and washing the container regularly breaks the larvae cycle.' },
  angkat: { label: 'Lift the trash and let the water flow', sub: 'Clear the blockage', why: 'Trash that blocks the flow makes water pool. Once cleared, the water runs freely.' },
};

interface PlaceEn { name: string; object: string; hint: string; edu: string; verb?: string; choices?: Record<string, Txt> }

const RINSE: Txt = { label: 'Just rinse with water', sub: 'Trash still blocks it', why: 'Rinsing alone is not enough. The blocking trash must be lifted so the water flows.' };
const POT: Record<string, Txt> = {
  ganti: { label: 'Pour out the water and scrub the saucer', sub: 'Then dry it' },
  abate: { label: 'Sprinkle abate in the saucer' },
  buang: { label: 'Pour out a little water' },
};

const PLACES_EN: Record<string, PlaceEn> = {
  toilet: { name: 'Bathroom tub', object: 'bathroom tub', hint: 'Start at the school bathroom. A tub that is rarely drained is a favorite larvae nest.', edu: 'Drain and scrub the bathroom tub at least once a week.' },
  kolam: {
    name: 'Fish pond', object: 'garden pond',
    hint: 'Now to the fish pond in the middle of the yard. Still water can breed larvae if there are no fish.',
    edu: 'A well-kept pond with larvae-eating fish is relatively safe.',
    choices: {
      sikat: { label: 'Drain the whole pond', sub: 'Disturbs the fish and takes time', why: 'Draining can work, but larvae-eating fish actually help keep the pond clean.' },
      tutup: { label: 'Cover the pond with a tarp', sub: 'Cover the whole surface', why: 'A fish pond is impractical to cover, and larvae already inside stay alive underneath.' },
    },
  },
  pot: { name: 'Plant pots', object: 'plant pot saucer', hint: 'In front of the building there is a row of plant pots. Check the saucers that collect water.', edu: 'Pot saucers need to be emptied and scrubbed once a week.', choices: POT },
  selokan: { name: 'Drain', object: 'drain', hint: 'Next is the drain by the lower fence. Trash that blocks it makes water pool.', edu: 'Drains need to be cleared of trash so the water always flows.', choices: { buang: RINSE } },
  wudhu: {
    name: 'Prayer washing area', object: 'prayer washing tub',
    hint: 'Last, the prayer washing area on the right side of the yard. Buckets and tubs there often hold old water.',
    edu: 'Prayer washing tubs and buckets are drained regularly and kept dry when not used.',
    choices: { tutup: { label: 'Cover the washing bucket' } },
  },
  h_bak: { name: 'Bathroom tub', object: 'home bathtub', verb: 'drain', hint: 'Start at the bathroom on the right side of the house. A bathtub is the most common spot.', edu: 'Drain and scrub the home bathtub at least once a week, ideally with family.' },
  h_wastafel: {
    name: 'Kitchen sink', object: 'kitchen sink and dishwashing bucket', verb: 'clean',
    hint: 'Now the kitchen. Check the sink and the dishwashing bucket.',
    edu: 'Kitchen buckets and sinks must not keep water for days.',
    choices: {
      sikat: { label: 'Empty the bucket and scrub the sink' },
      abate: { why: 'Abate is not suitable for containers whose water is used to wash dishes and cook.' },
      buang: { label: 'Only pour out the water' },
    },
  },
  h_vas: {
    name: 'Flower vase', object: 'flower vase in the living room', verb: 'change the vase water',
    hint: 'In the living room there is a flower vase on the table. Mosquitoes love vase water that is rarely changed.',
    edu: 'Change the vase water and wash the vase at least once a week.',
    choices: {
      ganti: { label: 'Change the water and wash the vase' },
      buang: { label: 'Pour out the water, refill without washing', why: 'Eggs stick to the walls of the vase. The container needs washing, not just a water change.' },
      abate: { why: 'Abate does not suit vases. It is better to change the water and wash the vase regularly.' },
    },
  },
  h_dispenser: {
    name: 'Dispenser tray', object: 'dispenser drip tray', verb: 'clean the tray',
    hint: 'Last inside the house: the dispenser drip tray in the kitchen. Even a small puddle is enough for eggs.',
    edu: 'Dispenser trays and fridge trays should be dried and wiped regularly.',
    choices: {
      ganti: { label: 'Empty the tray, wash it and dry it', sub: 'Put it back completely dry' },
      buang: { label: 'Just a quick wipe' },
      abate: { why: 'Abate is not used in household appliances like dispensers.' },
    },
  },
  o_tandon: {
    name: 'Water tank', object: 'water tank', verb: 'drain the tank',
    hint: 'On the left side of the yard there is a water tank. Check whether the lid is tight.',
    edu: 'Tanks are drained regularly and always covered tightly.',
    choices: {
      sikat: { label: 'Drain the tank and cover it tightly', sub: 'Scrub the walls, then put the lid on' },
      abate: { why: 'Abate is safe for tank water in the right dose, but regular draining and a tight cover still come first.' },
    },
  },
  o_selokan: {
    name: 'Drain in front of the house', object: 'drain in front of the house', verb: 'do the cleanup',
    hint: 'Now the drain in front of the house fence. See whether the water flows.',
    edu: 'Community cleanups keep drain water flowing.',
    choices: { buang: { ...RINSE, why: 'Rinsing alone is not enough. The blocking trash must be lifted.' } },
  },
  o_pot: { name: 'Porch pots', object: 'pot saucer on the porch', verb: 'clean the pots', hint: 'On the porch there are a few pots with saucers. Ask your little brother to help!', edu: 'Pot saucers are emptied and scrubbed once a week.', choices: POT },
  o_hewan: {
    name: 'Pet water bowl', object: 'pet water bowl', verb: 'care for the bowl',
    hint: 'Near the doghouse there is a pet water bowl.',
    edu: 'Change pet drinking water and wash the bowl every day.',
    choices: {
      ganti: { label: 'Change the water and wash the bowl', sub: 'Do it every day' },
      buang: { label: 'Just pour in fresh water' },
      abate: { why: 'Never sprinkle abate in a pet water bowl. Just change the water and wash the bowl every day.' },
    },
  },
  o_ban: {
    name: 'Old tire', object: 'old tire holding water', verb: 'remove the tire',
    hint: 'Last, the pile of old items on the right side of the yard: old tires and cardboard.',
    edu: 'Old tires are removed, recycled, or turned upside down so they do not hold water.',
    choices: { tutup: { label: 'Cover with a tarp' } },
  },
};

const WHO_EN: Record<Who, string> = { ibu: 'Mom', ayah: 'Dad', adik: 'your little brother' };

/** Versi Inggris sebuah tempat. Skor dan id pilihan tidak berubah, hanya teksnya. */
export function localizePlaceEn(p: Place): Place {
  const en = PLACES_EN[p.id];
  if (!en) return p;
  const base = (c: Choice) => ({ ...ACT_EN[c.id] });
  const choices = p.choices.map((c): Choice => {
    if (c.family) {
      const baseId = c.id.slice(0, -(c.family.length + 1));
      const best = { ...ACT_EN[baseId], ...(en.choices?.[baseId] ?? {}) };
      const who = WHO_EN[c.family];
      return {
        ...c,
        label: `Ask ${who} to ${en.verb ?? 'clean'} together`,
        sub: 'Teamwork with family is faster and more fun',
        why: `${best.why} Done together with ${who}, the result is tidier and good habits spread to the family.`,
      };
    }
    return { ...c, ...base(c), ...(en.choices?.[c.id] ?? {}) };
  });
  return { ...p, name: en.name, object: en.object, hint: en.hint, edu: en.edu, choices };
}

export function localAnalysisEn(object: string, finding: Finding, count: number) {
  if (finding === 'larvae') {
    return {
      headline: 'LARVAE DETECTED',
      analysis: `The object is recognized as a ${object}. About ${count} larvae are wriggling at the water surface. This place has already become a mosquito nest.`,
      advice: 'Remove the larvae right away. Pick the action that truly breaks the cycle, not one that only hides the problem.',
    };
  }
  if (finding === 'risky') {
    return {
      headline: 'AT RISK',
      analysis: `The object is recognized as a ${object}. The water is standing and cloudy. No larvae are visible yet, but this place could easily become a mosquito breeding spot.`,
      advice: 'Prevent it before it is too late: clean it or cover it so it does not become a nest.',
    };
  }
  return {
    headline: 'SAFE',
    analysis: `The object is recognized as a ${object}. It is clean and there are no larvae or harmful puddles right now.`,
    advice: 'Keep it that way by checking and doing 3M every week.',
  };
}
