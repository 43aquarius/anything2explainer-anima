import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC09} from './SC09';
import {SC10} from './SC10';
import {SC11} from './SC11';
import {SC12} from './SC12';
import {SC13} from './SC13';
// 组 G3（揭秘 → 结尾：SC09–SC13，S10–S15）：镜头表 / 背景覆写 / 实拍层。数组顺序即层序（后者在上）。
// 镜头组件：const N = useCurrentFrame() + F0（F0 = 本镜头 from）；图元 import from '../../ui'，缓动/共用层 from '../../common'。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC09', from: 1397, to: 1588, Comp: SC09},
  {id: 'SC10', from: 1589, to: 1771, Comp: SC10},
  {id: 'SC11', from: 1772, to: 1852, Comp: SC11},
  {id: 'SC12', from: 1853, to: 1988, Comp: SC12},
  {id: 'SC13', from: 1989, to: 2074, Comp: SC13}, // 交付修订：2132→2074 随 TOTAL 缩短
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
