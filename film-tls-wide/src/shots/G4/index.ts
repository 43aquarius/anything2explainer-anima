import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC11} from './SC11';
import {SC12} from './SC12';
// 组 G4（第 2 章下半：S15–S18，封流与噪声 · 流程轨章）。帧区间按分镜表：SC11 2146–2444 / SC12 2445–2673
// （SC12 首帧 = S17.from−8；SC11 末帧 = S17.from−9；章末 ¶ 镜头 SC12 至 S18.to+2 = 2673，章节卡 2674 由覆盖层渲染）。
export const SHOTS_G4: ShotDef[] = [
  {id: 'SC11', from: 2146, to: 2444, Comp: SC11},
  {id: 'SC12', from: 2445, to: 2673, Comp: SC12},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
