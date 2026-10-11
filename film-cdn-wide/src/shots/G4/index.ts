import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC09} from './SC09';
import {SC10} from './SC10';
import {SC11} from './SC11';

// 组 G4（第 3 章：S13–S15，缓存命中 → TTL 循环 → 不过洋）。帧区间见 分镜表.md「G4」表。
export const SHOTS_G4: ShotDef[] = [
  {id: 'SC09', from: 1950, to: 2124, Comp: SC09},
  {id: 'SC10', from: 2125, to: 2395, Comp: SC10},
  {id: 'SC11', from: 2396, to: 2678, Comp: SC11},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
