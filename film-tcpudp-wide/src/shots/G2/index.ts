import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC06} from './SC06';
import {SC07} from './SC07';
import {SC08} from './SC08';
import {SC09} from './SC09';
import {SC10} from './SC10';

// 组 G2（第 1 章下半：SC06–SC10，S09–S17，一无所有 → 设计哲学 → 三种事故 → 两个承诺）。
// 帧区间按 分镜表.md：SC06 1183–1342 / SC07 1363–1549 / SC08 1570–1737 / SC09 1738–1869 / SC10 1890–2146（章末 → C2 章节卡）。
// 组界：G1 在 SC05（末 8 帧已归零，SC06 自 1183 起入场）；G3 自 SC11（2222）起承接章节卡。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC06', from: 1183, to: 1362, Comp: SC06},
  {id: 'SC07', from: 1363, to: 1569, Comp: SC07},
  {id: 'SC08', from: 1570, to: 1737, Comp: SC08},
  {id: 'SC09', from: 1738, to: 1889, Comp: SC09},
  {id: 'SC10', from: 1890, to: 2146, Comp: SC10},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
