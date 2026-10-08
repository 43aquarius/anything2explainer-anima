import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC06} from './SC06';
import {SC07} from './SC07';
import {SC08} from './SC08';
import {SC09} from './SC09';
import {SC10} from './SC10';
// 组 G2（第 1 章下半：S06–S10，全都是 zip → 2008 选了 1989 → 两个问题）。相邻镜头首尾相接：
// SC06 清场重开（G1 SC05 于 870 归零）→ SC07 末虚线卡不清场 → SC08 承接揭示 1989 → SC09 双卡对照 → SC10 章末进章节卡。
// 区间对分镜表两处修正见 BUILD_NOTES：SC07 末 1224→1154（SC08 自身区间 1155 起决定边界）、SC10 末 1629→1584（任务指示）。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC06', from: 871, to: 993, Comp: SC06},
  {id: 'SC07', from: 994, to: 1154, Comp: SC07},
  {id: 'SC08', from: 1155, to: 1259, Comp: SC08},
  {id: 'SC09', from: 1260, to: 1425, Comp: SC09},
  {id: 'SC10', from: 1426, to: 1584, Comp: SC10},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
