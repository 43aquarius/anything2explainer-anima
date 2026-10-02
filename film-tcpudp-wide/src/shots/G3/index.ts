import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC11} from './SC11';
import {SC12} from './SC12';
import {SC13} from './SC13';
import {SC14} from './SC14';
import {SC15} from './SC15';
// 组 G3：第 2 章上半（S18–S26：1974 起源 → 三路握手 → 起点对齐 → 编号回执 → 一秒两秒四秒）。
// 帧区间见 分镜表.md：SC11 2222–2509 ｜ SC12 2530–2846 ｜ SC13 2847–2972 ｜ SC14 3005–3165 ｜ SC15 3166–3404。
// 镜头组件：const N = useCurrentFrame() + F0（F0 = 本镜头 from）；图元 import from '../../ui'，缓动/共用层 from '../../common'。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC11', from: 2222, to: 2529, Comp: SC11},
  {id: 'SC12', from: 2530, to: 2846, Comp: SC12},
  {id: 'SC13', from: 2847, to: 3004, Comp: SC13},
  {id: 'SC14', from: 3005, to: 3165, Comp: SC14},
  {id: 'SC15', from: 3166, to: 3424, Comp: SC15},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
