import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';

// G1（钩子 → 改后缀 → 都是 zip → 1989 与 PK）：SC01 78–184 / SC02 185–309 / SC03 310–424 / SC04 425–787
// （SC05 由 G2 组自 788 起接棒；SC04 末 8 帧已归零）
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 184, Comp: SC01},
  {id: 'SC02', from: 185, to: 309, Comp: SC02},
  {id: 'SC03', from: 310, to: 424, Comp: SC03},
  {id: 'SC04', from: 425, to: 787, Comp: SC04},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
