import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC40} from './SC40';
import {SC41} from './SC41';
import {SC42} from './SC42';
import {SC43} from './SC43';
import {SC44} from './SC44';

// G7（第 3 章下半上半段：S40–S44，★dex2oat 最高潮 → Dalvik 解释器时代 → ART 到来 → 优化条 → 65536 上限）。
// 帧区间照分镜表：SC40–SC44 首尾相接 5824–6748（SC39 末 5823；SC44 段末 ¶+gap15，G7b SC45 自 6749 起新场景）。
export const SHOTS_G7: ShotDef[] = [
  {id: 'SC40', from: 5824, to: 5901, Comp: SC40},
  {id: 'SC41', from: 5902, to: 6049, Comp: SC41},
  {id: 'SC42', from: 6050, to: 6307, Comp: SC42},
  {id: 'SC43', from: 6308, to: 6502, Comp: SC43},
  {id: 'SC44', from: 6503, to: 6748, Comp: SC44},
];
export const BG_G7: BgSpec[] = [];
export const FOOTAGE_G7: FootageSpec[] = [];
