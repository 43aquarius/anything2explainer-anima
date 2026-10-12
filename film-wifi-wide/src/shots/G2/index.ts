import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC04} from './SC04';
import {SC05} from './SC05';
import {SC06} from './SC06';

// G2（第 2 章 Taking Turns 上半：S06–S12）——分镜表帧区间，章首镜自章节卡后一帧起（C2=611，卡 558–602），
// 段末 ¶ 镜 SC06 停在章节卡（1299–1343 The Crowd）前一帧 1298。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC04', from: 603, to: 779, Comp: SC04},
  {id: 'SC05', from: 780, to: 1061, Comp: SC05},
  {id: 'SC06', from: 1062, to: 1298, Comp: SC06},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
