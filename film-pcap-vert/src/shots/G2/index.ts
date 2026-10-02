import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC05} from './SC05';
import {SC06} from './SC06';
import {SC07} from './SC07';
import {SC08} from './SC08';

// 组 G2：在哪抓 + 怎么读（SC05–SC08，S06–S09）。帧区间严格按 分镜表.md G2 表（相邻镜头首尾相接）。
// v2: 主会话补注册（G2 agent 未完成此步即被中断，导致整组渲染为空）。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC05', from: 658, to: 856, Comp: SC05},
  {id: 'SC06', from: 857, to: 1100, Comp: SC06},
  {id: 'SC07', from: 1101, to: 1215, Comp: SC07},
  {id: 'SC08', from: 1216, to: 1396, Comp: SC08},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
