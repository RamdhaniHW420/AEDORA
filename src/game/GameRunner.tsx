import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { C, CH, F, G, R, T } from '@/theme';
import { UI } from '@/game/assets';
import { Btn, Icon, Pop } from '@/components/ui';
import { NPC_PREFIX, World, type Interactable } from '@/game/engine/World';
import { NPC_TALKS, type NpcId } from '@/game/data/npcs';
import { SCENES } from '@/game/engine/sceneData';
import { storyFor, type Ctx, type Lines, type Line, type Phase } from '@/game/data/story';
import { PLACE_MAP, placeFor, rollFindings, type SceneId } from '@/game/data/places';
import { avgResults, computeFinal, SCHOOL_PLACES, HOME_PLACES } from '@/game/logic/scoring';
import { DialogBox } from '@/game/ui/DialogBox';
import { TitleCard } from '@/game/ui/TitleCard';
import { SlideBoard } from '@/game/ui/SlideBoard';
import { QuizView } from '@/game/ui/QuizView';
import { MissionFlow } from '@/game/ui/MissionFlow';
import { ReportCard } from '@/game/ui/ReportCard';
import { Ending } from '@/game/ui/Ending';
import { StepComplete } from '@/game/ui/StepComplete';
import { useApp } from '@/store/useApp';
import { playBgm, sfx } from '@/lib/audio';
import { PauseButton, PauseMenu } from '@/game/ui/PauseMenu';
import { useLang, useT } from '@/lib/i18n';
import type { PlaceResult } from '@/lib/types';

const resolve = (l: Lines, c: Ctx): Line[] => (typeof l === 'function' ? l(c) : l);

export function GameRunner({ step, onExit }: { step: number; onExit: () => void }) {
  const lang = useLang((s) => s.lang);
  const story = storyFor(lang);
  const phases: Phase[] = story.STEPS[step];
  const meta = story.STEP_META;
  const metaId = storyFor('id').STEP_META;
  const profile = useApp((s) => s.profile);
  const progress = useApp((s) => s.progress);
  const t = useT();
  const update = useApp((s) => s.update);
  const setActivity = useApp((s) => s.setActivity);

  const [idx, setIdx] = useState(0);
  const [scn, setScn] = useState<{ id: SceneId; spawn: string } | null>(null);
  const [talking, setTalking] = useState(false);
  const [mission, setMission] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState(progress?.quiz.last ?? 0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [paused, setPaused] = useState(false);
  const [chat, setChat] = useState<Line[] | null>(null);
  const chatCount = useRef<Partial<Record<NpcId, number>>>({});
  const [complete, setComplete] = useState<{ score?: number; poin: number; xp: number } | null>(null);
  const start = useRef({ poin: progress?.poin ?? 0, xp: progress?.xp ?? 0 });
  const finished = useRef(false);

  const findings = useMemo(() => {
    const ids = phases.flatMap((p) => (p.t === 'missions' ? p.places : []));
    return rollFindings(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const phase = phases[idx];
  const next = () => setIdx((i) => i + 1);
  const name = profile?.name ?? 'Kawan';

  const ctx = (): Ctx => {
    const p = useApp.getState().progress!;
    return { name, progress: p, quizScore, schoolAvg: avgResults(p.schoolResults, SCHOOL_PLACES), homeAvg: avgResults(p.homeResults, HOME_PLACES) };
  };

  useEffect(() => {
    playBgm('game');
    setActivity(step, `Memulai Bab ${step}: ${metaId[step - 1].title}`);
    return () => playBgm('menu');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fase otomatis
  useEffect(() => {
    if (!phase) return;
    setTalking(false);
    setChat(null);
    setDone([]);
    if (phase.t === 'scene') {
      setScn({ id: phase.scene, spawn: phase.spawn });
      next();
    } else if (phase.t === 'report') {
      const p = useApp.getState().progress!;
      const f = computeFinal(p);
      void update((q) => ({ ...q, final: { score: f.score, grade: f.grade, ending: f.ending, at: Date.now() } }), {
        type: 'ending',
        step: 4,
        title: `Nilai akhir ${f.score} (${f.grade})`,
        detail: `Kuis ${f.quiz}, sekolah ${f.school}, rumah ${f.home}`,
        titleEn: `Final score ${f.score} (${f.grade})`,
        detailEn: `Quiz ${f.quiz}, school ${f.school}, home ${f.home}`,
        points: f.score * 5,
      });
    } else if (phase.t === 'ending') {
      playBgm('end');
    } else if (phase.t === 'finish') {
      if (finished.current) return;
      finished.current = true;
      const p = useApp.getState().progress!;
      const sc = step === 1 ? Math.round((p.quiz.best / 10) * 100) : step === 2 ? avgResults(p.schoolResults, SCHOOL_PLACES) : step === 3 ? avgResults(p.homeResults, HOME_PLACES) : (p.final?.score ?? 0);
      void update(
        (q) => ({
          ...q,
          currentStep: Math.max(q.currentStep, Math.min(4, step + 1)),
          steps: { ...q.steps, [step]: { done: true, score: sc, attempts: (q.steps[step]?.attempts ?? 0) + 1, completedAt: Date.now() } },
          activity: { step, label: `Menyelesaikan Bab ${step}`, at: Date.now() },
        }),
        { type: 'step', step, title: `Bab ${step} selesai: ${metaId[step - 1].title}`, detail: `Skor ${sc}`, titleEn: `Chapter ${step} done: ${storyFor('en').STEP_META[step - 1].title}`, detailEn: `Score ${sc}`, points: metaId[step - 1].reward },
      ).then(() => {
        const q = useApp.getState().progress!;
        setComplete({ score: sc, poin: Math.max(0, q.poin - start.current.poin), xp: Math.max(0, q.xp - start.current.xp) });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (!profile || !progress || !phase) return null;

  // ---- interaktif di dunia ----
  const inter: Record<string, Interactable> = {};
  let targetId: string | null = null;
  let objective = '';
  let hint = '';
  let missionPlaces: string[] = [];
  if (phase.t === 'talk') {
    inter[phase.npc] = { label: phase.label ?? t('interactTalk'), marker: 'exclaim' };
    targetId = phase.npc;
    objective = phase.objective;
  } else if (phase.t === 'exit') {
    inter[phase.id] = { label: t('interactDoor'), marker: 'arrow' };
    targetId = phase.id;
    objective = phase.objective;
  } else if (phase.t === 'missions') {
    missionPlaces = phase.places;
    const nextId = phase.places.find((id) => !done.includes(id));
    if (nextId) {
      const pl = placeFor(nextId, lang)!;
      inter[nextId] = { label: t('interactCheck', { place: pl.name }), marker: 'arrow' };
      targetId = nextId;
      objective = t('hudCheck', { place: pl.name, n: done.length + 1, total: phase.places.length });
      hint = pl.hint;
    }
  }

  // Obrolan NPC tambahan: tidak mengubah fase cerita maupun nilai, hanya memberi petunjuk ringan.
  const openChat = (npc: NpcId) => {
    const talks = NPC_TALKS[lang][npc];
    const n = chatCount.current[npc] ?? 0;
    chatCount.current[npc] = n + 1;
    const first = name.trim().split(/\s+/)[0] || (lang === 'en' ? 'Friend' : 'Kawan');
    setChat(
      talks[n % talks.length].map((txt, i): Line =>
        txt.startsWith('> ') ? { who: 'player', text: txt.slice(2) } : { who: npc, text: txt.replace('{name}', first), mood: i === 0 ? 'happy' : 'neutral' },
      ),
    );
  };

  const onInteract = (id: string) => {
    if (id.startsWith(NPC_PREFIX)) {
      openChat(id.slice(NPC_PREFIX.length) as NpcId);
      return;
    }
    if (phase.t === 'talk' && id === phase.npc) {
      setTalking(true);
    } else if (phase.t === 'exit' && id === phase.id) {
      const cur = scn ? SCENES[scn.id] : null;
      const ex = cur?.exits.find((e) => e.id === id);
      if (ex) {
        sfx('step');
        setScn({ id: ex.to, spawn: ex.spawn });
      }
      next();
    } else if (phase.t === 'missions') {
      if (id === targetId) setMission(id);
    }
  };

  const completeMission = (r: PlaceResult) => {
    const pl = PLACE_MAP[r.placeId];
    const plEn = placeFor(r.placeId, 'en')!;
    // Teks Indonesia tetap menjadi sumber untuk dasbor guru, versi Inggris hanya untuk tampilan siswa.
    const choiceId = PLACE_MAP[r.placeId].choices.find((c) => c.id === r.actionId);
    const choiceEn = plEn.choices.find((c) => c.id === r.actionId);
    const res: PlaceResult = { ...r, actionLabel: choiceId?.label ?? r.actionLabel };
    const key = r.area === 'school' ? 'schoolResults' : 'homeResults';
    void update((q) => ({ ...q, [key]: { ...q[key], [r.placeId]: res } }), {
      type: 'place',
      step,
      title: `${pl.name}: ${r.finding === 'larvae' ? 'jentik ditemukan' : r.finding === 'risky' ? 'berisiko' : 'aman'}`,
      detail: `${res.actionLabel}${r.family ? ' (bersama keluarga)' : ''} - nilai ${r.score}`,
      titleEn: `${plEn.name}: ${r.finding === 'larvae' ? 'larvae found' : r.finding === 'risky' ? 'risky' : 'safe'}`,
      detailEn: `${choiceEn?.label ?? r.actionLabel}${r.family ? ' (with family)' : ''} - score ${r.score}`,
      points: r.score,
    });
    setMission(null);
    const nd = [...done, r.placeId];
    setDone(nd);
    if (phase.t === 'missions' && phase.places.every((id) => nd.includes(id))) {
      // tunda sedikit agar transisi halus
      setTimeout(next, 250);
    }
  };

  const tone = G[CH[step - 1] ?? 'blue'];
  const worldVisible = scn && ['dialog', 'talk', 'exit', 'missions', 'title'].includes(phase.t);
  const frozen = paused || phase.t === 'dialog' || talking || !!chat || !!mission || phase.t === 'title' || phase.t === 'cutscene';
  const showHud = (phase.t === 'talk' || phase.t === 'exit' || phase.t === 'missions') && !talking && !chat && !mission;
  const openPause = () => setPaused(true);

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      {worldVisible && scn ? <World sceneId={scn.id} spawn={scn.spawn} avatar={profile.avatar} interactables={inter} targetId={targetId} frozen={frozen} showDora={step >= 2} onInteract={onInteract} /> : null}

      {showHud ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 40, paddingLeft: 10, paddingRight: 68, gap: 8 }}>
          <Pop>
            <View style={{ backgroundColor: tone.bg, borderRadius: R.md + 2, borderWidth: 3, borderBottomWidth: 6, borderColor: tone.edge, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ fontFamily: F.pixelB, color: tone.text, fontSize: T.cap }}>{t('hudMission')}</Text>
              <Text style={{ fontFamily: F.bodyX, color: tone.text, fontSize: T.body + 1 }}>{objective}</Text>
            </View>
          </Pop>
          {missionPlaces.length ? (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {missionPlaces.map((id) => {
                const ok = done.includes(id);
                return (
                  <View key={id} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: ok ? G.leaf.bg : G.navy.bg, borderWidth: 3, borderColor: ok ? G.leaf.edge : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    {ok ? <Icon name="check" size={16} /> : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: id === targetId ? G.lemon.bg : C.sky }} />}
                  </View>
                );
              })}
            </View>
          ) : null}
          {hint ? <HintCard key={targetId} text={hint} /> : null}
        </View>
      ) : null}

      {phase.t === 'dialog' ? <DialogBox lines={resolve(phase.lines, ctx())} playerName={name} avatar={profile.avatar} onDone={next} /> : null}
      {phase.t === 'talk' && talking ? (
        <DialogBox
          lines={resolve(phase.lines, ctx())}
          playerName={name}
          avatar={profile.avatar}
          onDone={() => {
            setTalking(false);
            next();
          }}
        />
      ) : null}
      {chat ? <DialogBox lines={chat} playerName={name} avatar={profile.avatar} onDone={() => setChat(null)} /> : null}
      {phase.t === 'title' ? <TitleCard title={phase.title} sub={phase.sub} step={step} onDone={next} /> : null}
      {phase.t === 'slides' ? <SlideBoard onDone={next} /> : null}
      {phase.t === 'quiz' ? (
        <QuizView
          onFinish={(score, source) => {
            setQuizScore(score);
            void update((q) => ({ ...q, quiz: { best: Math.max(q.quiz.best, score), last: score, attempts: q.quiz.attempts + 1 } }), {
              type: 'quiz',
              step: 1,
              title: `Kuis selesai: ${score}/10`,
              detail: source === 'ai' ? 'Soal dibuat AI' : 'Soal bank cadangan',
              titleEn: `Quiz finished: ${score}/10`,
              detailEn: source === 'ai' ? 'Questions made by AI' : 'Backup question bank',
              points: score * 10,
            });
            next();
          }}
        />
      ) : null}
      {phase.t === 'cutscene' ? <CutsceneView lines={resolve(phase.lines, ctx())} onDone={next} /> : null}
      {mission && PLACE_MAP[mission] ? (
        <MissionFlow
          key={mission}
          place={placeFor(mission, lang)!}
          finding={findings[mission].finding}
          count={findings[mission].count}
          onComplete={completeMission}
          onCancel={() => setMission(null)}
        />
      ) : null}
      {phase.t === 'report' ? <ReportCard progress={progress} onNext={next} /> : null}
      {phase.t === 'ending' && progress.final ? <Ending kind={progress.final.ending} name={name} score={progress.final.score} grade={progress.final.grade} onDone={next} /> : null}

      {complete ? (
        <StepComplete
          step={step}
          title={meta[step - 1].title}
          score={complete.score}
          gainedPoin={complete.poin}
          gainedXp={complete.xp}
          nextTitle={step < 4 ? t('nextChapter', { n: step + 1, title: meta[step].title }) : undefined}
          onDone={onExit}
        />
      ) : (
        <PauseButton onPress={openPause} />
      )}

      {paused ? (
        <PauseMenu
          onResume={() => setPaused(false)}
          onLeave={() => {
            setPaused(false);
            setConfirmExit(true);
          }}
        />
      ) : null}

      {confirmExit ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 60, backgroundColor: 'rgba(8,28,48,0.72)', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
          <Pop style={{ width: '100%', maxWidth: 420 }}>
            <View accessibilityViewIsModal style={{ backgroundColor: '#fff', borderRadius: R.xl, borderWidth: 4, borderBottomWidth: 8, borderColor: G.sun.edge, padding: 20, gap: 12 }}>
              <Text accessibilityRole="header" style={{ fontFamily: F.pixelB, fontSize: T.title + 2, color: G.sun.deep }}>{t('exitTitle')}</Text>
              <Text style={{ fontFamily: F.body, fontSize: T.body + 1, color: C.navy, lineHeight: 22 }}>{t('exitBody')}</Text>
              <Btn label={t('exitKeep')} tone="leaf" onPress={() => setConfirmExit(false)} />
              <Btn label={t('exitLeave')} tone="white" onPress={onExit} />
            </View>
          </Pop>
        </View>
      ) : null}
    </View>
  );
}

function CutsceneView({ lines, onDone }: { lines: Line[]; onDone: () => void }) {
  const t = useT();
  const [i, setI] = useState(0);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lines[i].text}. ${t('tapWord')}`}
      onPress={() => {
        sfx('tap');
        if (i + 1 >= lines.length) onDone();
        else setI(i + 1);
      }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.navy }}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, top: 50, aspectRatio: 360 / 520 }}>
        <Image source={UI.cut_sunset} resizeMode="stretch" style={{ width: '100%', height: '100%' }} />
      </View>
      <View style={{ position: 'absolute', left: 14, right: 14, bottom: 50, backgroundColor: G.grape.bg, borderRadius: R.lg, borderWidth: 4, borderBottomWidth: 8, borderColor: G.grape.edge, padding: 16 }}>
        <Text style={{ fontFamily: F.body, fontSize: T.lead + 1, lineHeight: 26, color: '#fff', fontStyle: 'italic' }}>{lines[i].text}</Text>
        <Text style={{ alignSelf: 'flex-end', fontFamily: F.pixelB, fontSize: T.cap + 1, color: '#fff', marginTop: 8 }}>{t('tapWord')}</Text>
      </View>
    </Pressable>
  );
}

function HintCard({ text }: { text: string }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setGone(true), 9000);
    return () => clearTimeout(timer);
  }, []);
  if (gone) return null;
  return (
    <Pressable accessibilityRole="button" onPress={() => setGone(true)} style={{ backgroundColor: G.lemon.soft, borderRadius: R.md, padding: 10, borderWidth: 3, borderBottomWidth: 5, borderColor: G.lemon.edge }}>
      <Text style={{ fontFamily: F.bodyB, fontSize: T.cap + 1, lineHeight: 18, color: C.navy }}>{text}</Text>
    </Pressable>
  );
}
