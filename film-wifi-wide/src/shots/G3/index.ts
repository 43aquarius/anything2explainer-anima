import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC07} from './SC07';
import {SC08} from './SC08';
import {SC09} from './SC09';
import {SC10} from './SC10';

// 组 G3（第 3 章：S13–S20，拥挤 → 信道 → 隐藏节点 → 先报名）。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC07', from: 1344, to: 1662, Comp: SC07},
  {id: 'SC08', from: 1663, to: 1793, Comp: SC08},
  {id: 'SC09', from: 1794, to: 1993, Comp: SC09},
  {id: 'SC10', from: 1994, to: 2196, Comp: SC10},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
