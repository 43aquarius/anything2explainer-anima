import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC08} from './SC08';
import {SC09} from './SC09';
import {SC10} from './SC10';

// 组 G3（第 2 章上半：S11–S14，握手 · 流程轨章）。帧区间见 分镜表.md「G3」表。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC08', from: 1538, to: 1668, Comp: SC08},
  {id: 'SC09', from: 1669, to: 1810, Comp: SC09},
  {id: 'SC10', from: 1811, to: 2145, Comp: SC10},
];
// 幕底不覆写（点阵波常驻）
export const BG_G3: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G3: FootageSpec[] = [];
