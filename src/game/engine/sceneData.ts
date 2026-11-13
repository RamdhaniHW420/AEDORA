import raw from '@/game/data/generated/scenes.json';
import type { SceneId } from '@/game/data/places';

export type Dir = 'down' | 'left' | 'right' | 'up';

export interface Hotspot { id: string; x: number; y: number; w: number; h: number; label: string; cx: number; cy: number }
export interface SceneNpc { id: string; sprite: string; x: number; y: number; dir: Dir }
export interface SceneExit { id: string; x: number; y: number; w: number; h: number; to: SceneId; spawn: string; label: string }
export interface SceneData {
  name: SceneId;
  w: number;
  h: number;
  fg: boolean;
  solids: number[][];
  hotspots: Hotspot[];
  npcs: SceneNpc[];
  exits: SceneExit[];
  spawns: Record<string, { x: number; y: number; dir: Dir }>;
}

export const SCENES = raw as unknown as Record<SceneId, SceneData>;
