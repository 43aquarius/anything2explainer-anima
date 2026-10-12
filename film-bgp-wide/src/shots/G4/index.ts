import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC09} from './SC09';
import {SC10} from './SC10';

// G4（第 3 章上：S14–S19，1997 说谎 → 2008 更具体者胜）。帧区间按派单/分镜表 v2：SC09 从章节卡 1887–1931 之后一帧（1932）起。
export const SHOTS_G4: ShotDef[] = [
  {id: 'SC09', from: 1932, to: 2254, Comp: SC09},
  {id: 'SC10', from: 2255, to: 2624, Comp: SC10},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
