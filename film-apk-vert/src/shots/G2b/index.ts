import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC09} from './SC09';
import {SC10} from './SC10';
import {SC11} from './SC11';
import {SC12} from './SC12';

// 组 G2b（安装流水线后半：SC09 优化条 / SC10 沙箱 / SC11 从未解压 / SC12 坐在 /data/app）。
// 分镜表属 G2 章，工程上拆两组并行构建；与 G2（SC05–SC08，止于 1364）首尾相接，G3/SC13 自 1877 起。
export const SHOTS_G2b: ShotDef[] = [
  {id: 'SC09', from: 1365, to: 1505, Comp: SC09},
  {id: 'SC10', from: 1506, to: 1645, Comp: SC10},
  {id: 'SC11', from: 1646, to: 1718, Comp: SC11},
  {id: 'SC12', from: 1719, to: 1876, Comp: SC12},
];
export const BG_G2b: BgSpec[] = [];
export const FOOTAGE_G2b: FootageSpec[] = [];
