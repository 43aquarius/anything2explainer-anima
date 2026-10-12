import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC11} from './SC11';
import {SC12} from './SC12';
import {SC13} from './SC13';

/** G4（第 4 章上）：SC11 1997 → SC12 工程不停 → SC13 空气在轮流（高光·论点型）。
 *  SC14 金句（2827–2898）由主会话建在 G5/，不在本组。帧区间对齐分镜表：相邻镜头首尾相接。 */
export const SHOTS_G4: ShotDef[] = [
  {id: 'SC11', from: 2242, to: 2485, Comp: SC11},
  {id: 'SC12', from: 2486, to: 2709, Comp: SC12},
  {id: 'SC13', from: 2710, to: 2826, Comp: SC13},
];
/** 幕底 dots 常驻（分镜表全局约束 §11），无覆写。 */
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
