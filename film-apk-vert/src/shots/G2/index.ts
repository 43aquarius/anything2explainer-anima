import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC05} from './SC05';
import {SC06} from './SC06';
import {SC07} from './SC07';
import {SC08} from './SC08';

// 组 G2（安装流水线上半：SC05 火漆 / SC06 改一字节就死 / SC07 读面单 / SC08 编译）。
// SC09–SC12 由 G2b 组负责（分镜表同属「G2 安装流水线」章，工程上拆两组并行构建）。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC05', from: 788, to: 953, Comp: SC05},
  {id: 'SC06', from: 954, to: 1060, Comp: SC06},
  {id: 'SC07', from: 1061, to: 1243, Comp: SC07},
  {id: 'SC08', from: 1244, to: 1364, Comp: SC08},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
