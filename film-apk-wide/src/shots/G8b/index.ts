import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC55} from './SC55';
import {SC56} from './SC56';
import {SC57} from './SC57';
import {SC58} from './SC58';
import {SC59} from './SC59';

// G8b（第 4 章下半 + 片尾：S55–S59，照片回扣 → 1989 之底 → 终端自查 → P, K → ★收束）。
// 帧区间照分镜表：SC55–SC59 首尾相接 8266–8999（G8 的 SC54 末 8265；SC59 为片尾收束·扫光白名单②，不归零）。
export const SHOTS_G8b: ShotDef[] = [
  {id: 'SC55', from: 8266, to: 8409, Comp: SC55},
  {id: 'SC56', from: 8410, to: 8576, Comp: SC56},
  {id: 'SC57', from: 8577, to: 8713, Comp: SC57},
  {id: 'SC58', from: 8714, to: 8839, Comp: SC58},
  {id: 'SC59', from: 8840, to: 8999, Comp: SC59},
];
export const BG_G8b: BgSpec[] = [];
export const FOOTAGE_G8b: FootageSpec[] = [];
