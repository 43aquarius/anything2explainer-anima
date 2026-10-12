import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC07} from './SC07';
import {SC08} from './SC08';

// 组 G3（第 2 章下：S11–S12，任播 → DNS 指到边缘）。帧区间见 分镜表.md「G3」表。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC07', from: 1419, to: 1683, Comp: SC07},
  {id: 'SC08', from: 1684, to: 1904, Comp: SC08},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
