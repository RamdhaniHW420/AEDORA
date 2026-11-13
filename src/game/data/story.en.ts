import type { Line, Phase, Speaker } from './story';
import { NPC_NAME_EN } from './npcs';

export const SPEAKER_NAME_EN: Record<Speaker, string> = {
  teacher: 'Ms. Rani',
  dora: 'Dora',
  ibu: 'Mom',
  ayah: 'Dad',
  adik: 'Bima',
  player: '',
  narrator: '',
  ...NPC_NAME_EN,
};

const t = (text: string, mood: Line['mood'] = 'neutral'): Line => ({ who: 'teacher', text, mood });
const d = (text: string, mood: Line['mood'] = 'neutral'): Line => ({ who: 'dora', text, mood });
const p = (text: string, mood: Line['mood'] = 'neutral'): Line => ({ who: 'player', text, mood });

const first = (name: string) => name.trim().split(/\s+/)[0] || 'Friend';

export const STEP1_EN: Phase[] = [
  { t: 'title', title: 'CHAPTER 1', sub: 'Morning Lesson' },
  { t: 'scene', scene: 'classroom', spawn: 'desk' },
  {
    t: 'dialog',
    lines: (c) => [
      t(`Good morning, class! Oh, ${first(c.name)} is already in their seat. What great energy!`, 'happy'),
      t('Every rainy season, cases of Dengue Hemorrhagic Fever, or DBD, often go up.'),
      t('The good news is that DBD can be prevented, and you will be the heroes who do it!', 'happy'),
    ],
  },
  {
    t: 'talk',
    npc: 'teacher',
    objective: 'Say hi to your classmates, then see Ms. Rani',
    label: 'Talk to Ms. Rani',
    lines: [t('Before we start, did you get to say hi to your classmates? If so, look at the board, please. I will explain the lesson first.')],
  },
  { t: 'slides' },
  {
    t: 'dialog',
    lines: (c) => [
      t('So, did you get it? Now it is time to test what you learned.', 'happy'),
      t('There are 10 quiz questions, and they are different every time you play.'),
      t(`Answer carefully, ${first(c.name)}. Good luck!`, 'happy'),
    ],
  },
  { t: 'quiz' },
  {
    t: 'dialog',
    lines: (c) => {
      const s = c.quizScore;
      const react =
        s >= 9 ? t(`Amazing, ${first(c.name)}! You scored ${s} out of 10. You are ready to be a junior larvae monitor!`, 'happy')
        : s >= 7 ? t(`Great job! ${s} out of 10. Almost perfect.`, 'happy')
        : s >= 5 ? t(`Not bad, ${s} out of 10. Read the lesson again in the Lessons menu.`)
        : t(`That is okay, ${s} out of 10. Learning takes practice. You can retake the quiz any time.`, 'worried');
      return [react, t('Tomorrow we practice for real. See you in Chapter 2!', 'happy')];
    },
  },
  { t: 'finish' },
];

export const STEP2_EN: Phase[] = [
  { t: 'title', title: 'CHAPTER 2', sub: 'Mission at School' },
  { t: 'scene', scene: 'classroom', spawn: 'desk' },
  {
    t: 'dialog',
    lines: (c) => [
      t('Good morning again! Today we practice: checking places at school that could hold standing water.'),
      t('There are 5 places: the bathroom, the fish pond, the plant pots, the drain, and the prayer washing area.'),
      t('You will use the AEDORA app on your phone. Meet Dora, an AI assistant who helps with the analysis.'),
      d(`Hi ${first(c.name)}! I am Dora. Point the camera at an object and I will help spot larvae and standing water.`, 'happy'),
      d('Remember, I only help you recognize things. The decisions and actions are still up to you!'),
      t('Please leave through the classroom door, then check each place one by one. Be careful!'),
    ],
  },
  { t: 'exit', id: 'door', objective: 'Leave the classroom through the door' },
  {
    t: 'dialog',
    lines: [
      d('We are in the school yard! Follow the yellow arrow on the screen.', 'happy'),
      d('We start at the bathroom. Walk with the joystick, then press the action button when you are close.'),
    ],
  },
  { t: 'missions', scene: 'schoolyard', area: 'school', places: ['toilet', 'kolam', 'pot', 'selokan', 'wudhu'] },
  {
    t: 'dialog',
    lines: [d('Every place has been checked! Awesome!', 'happy'), d('Now go back to class and report the results to Ms. Rani.')],
  },
  { t: 'exit', id: 'door', objective: 'Go back to class' },
  {
    t: 'talk', npc: 'teacher', objective: 'Report to Ms. Rani', label: 'Talk',
    lines: (c) => {
      const s = c.schoolAvg;
      const react =
        s >= 85 ? t(`Excellent, ${first(c.name)}! Our school is safer because of you.`, 'happy')
        : s >= 65 ? t('Good. Some actions could be more accurate, but you have learned a lot.')
        : t('Thank you for trying. Remember: larvae must be removed, not ignored. You can replay this mission.', 'worried');
      return [p('Ma\'am, I have checked all five places at school.'), react, t('Homework for you: check your home too. See you in Chapter 3!', 'happy')];
    },
  },
  { t: 'finish' },
];

export const STEP3_EN: Phase[] = [
  { t: 'title', title: 'CHAPTER 3', sub: 'Mission at Home' },
  { t: 'scene', scene: 'classroom', spawn: 'desk' },
  {
    t: 'dialog',
    lines: [
      t('The school is done. Now for the next challenge: your own home.'),
      t('Here is your homework: check the area around your home, inside and outside.'),
      t('Involve your family! The more helpers you have, the faster you will finish.', 'happy'),
    ],
  },
  { t: 'cutscene', lines: (c) => [{ who: 'narrator', text: `After school, ${first(c.name)} hurried home. The sun was getting low, and a special homework was waiting.` }] },
  { t: 'scene', scene: 'home_inside', spawn: 'default' },
  {
    t: 'dialog',
    lines: (c) => [
      { who: 'ibu', text: `Oh, ${first(c.name)} is home! Why so excited?`, mood: 'happy' },
      p('Mom, Ms. Rani gave me homework. I want to check the whole house for larvae!', 'happy'),
      { who: 'ibu', text: 'Wonderful! I will help if you need me. Where do you want to start?', mood: 'happy' },
      d('Let us check inside the house first: the bathtub, the kitchen sink, the flower vase, and the water dispenser.'),
    ],
  },
  { t: 'missions', scene: 'home_inside', area: 'home', places: ['h_bak', 'h_wastafel', 'h_vas', 'h_dispenser'] },
  { t: 'dialog', lines: [d('The inside of the house is done!', 'happy'), d('Now let us go out to the yard. There is a water tank, a drain, pots, a pet bowl, and old items.')] },
  { t: 'exit', id: 'frontdoor', objective: 'Go out through the front door' },
  {
    t: 'dialog',
    lines: (c) => [
      { who: 'ayah', text: `Well, ${first(c.name)}! I heard you are checking for larvae. Bima and I are ready to help.`, mood: 'happy' },
      { who: 'adik', text: 'I want to help too! I brought a brush!', mood: 'happy' },
    ],
  },
  { t: 'missions', scene: 'home_outside', area: 'home', places: ['o_tandon', 'o_selokan', 'o_pot', 'o_hewan', 'o_ban'] },
  {
    t: 'talk', npc: 'ayah', objective: 'Report to Dad', label: 'Talk',
    lines: [
      p('Dad, I have checked every corner of the house!', 'happy'),
      { who: 'ayah', text: 'Great work! If we do 3M together every week, dengue will not have a chance to visit.', mood: 'happy' },
      { who: 'adik', text: 'Let us drain everything again next week!', mood: 'happy' },
      p('You bet! Now I will report to Ms. Rani.', 'happy'),
    ],
  },
  { t: 'finish' },
];

export const STEP4_EN: Phase[] = [
  { t: 'title', title: 'CHAPTER 4', sub: 'Report and Awards' },
  { t: 'scene', scene: 'classroom', spawn: 'desk' },
  {
    t: 'dialog',
    lines: (c) => [
      t(`Good morning, ${first(c.name)}. I have been waiting for your report.`),
      d('I summarized all of your work. Let us hand it to Ms. Rani!', 'happy'),
    ],
  },
  {
    t: 'talk', npc: 'teacher', objective: 'Hand the report to Ms. Rani', label: 'Talk',
    lines: [p('Ms. Rani, here is my complete report.'), t('Thank you. Let us see the results of all your effort.', 'happy')],
  },
  { t: 'report' },
  { t: 'ending' },
  { t: 'finish' },
];

export const STEPS_EN: Record<number, Phase[]> = { 1: STEP1_EN, 2: STEP2_EN, 3: STEP3_EN, 4: STEP4_EN };

export const STEP_META_EN = [
  { n: 1, title: 'Morning Lesson', sub: 'Dengue lesson and a 10-question quiz', reward: 100, mins: 10 },
  { n: 2, title: 'Mission at School', sub: 'Check 5 places at school', reward: 250, mins: 15 },
  { n: 3, title: 'Mission at Home', sub: 'Check your home with your family', reward: 400, mins: 20 },
  { n: 4, title: 'Report and Awards', sub: 'Final score and ending', reward: 500, mins: 8 },
];

export const ENDINGS_EN = {
  a: {
    title: 'A Larvae-Free School and Home',
    lines: (n: string) => [
      `A few weeks go by. The 3M habit that ${n} started spreads across the whole school and home.`,
      'There are no more larvae in the tubs, the pond, or the drains. Your friends join the Friday cleanup every week.',
      'Today the school receives the Larvae-Free School award, and it all began with one small step from you.',
    ],
    quote: 'Preventing dengue starts with us.',
  },
  b: {
    title: 'A New Habit Is Growing',
    lines: (n: string) => [
      `Small changes start to show thanks to ${n}. Tubs are drained more often and the drains are cleaner.`,
      'A few corners still need checking, but you have started and your friends are beginning to follow.',
      'Keep the spirit up, and the Larvae-Free School award is just one step away.',
    ],
    quote: 'Little by little, a hill is built.',
  },
  c: {
    title: 'The Fight Is Not Over',
    lines: (n: string) => [
      'A few larvae are still hiding in the corners that were missed. The mosquitoes have not really left.',
      `But ${n} now knows how. Draining, covering, and recycling can change everything.`,
      'Try again from Chapters 2 and 3, choose the right actions, and unlock the best ending!',
    ],
    quote: 'Fall once, learn a thousand times.',
  },
} as const;
