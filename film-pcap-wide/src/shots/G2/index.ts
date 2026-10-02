import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC08} from './SC08';
import {SC09} from './SC09';
import {SC10} from './SC10';
import {SC11} from './SC11';
import {SC12} from './SC12';

// 组 G2（第 1 章下半：S09–S15，什么是抓包 → 工具）：帧区间严格按 分镜表.md G2 表（相邻镜头首尾相接）。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC08', from: 1228, to: 1425, Comp: SC08}, // 高光时刻·登场型（扫光白名单①）
  {id: 'SC09', from: 1426, to: 1641, Comp: SC09}, // 复印检查站
  {id: 'SC10', from: 1642, to: 2021, Comp: SC10}, // 重播整场对话（段末 ¶）
  {id: 'SC11', from: 2022, to: 2190, Comp: SC11}, // 1988 tcpdump（章内拉远运镜）
  {id: 'SC12', from: 2191, to: 2531, Comp: SC12}, // Ethereal → Wireshark（章末，末 10 帧归零进章节卡）
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
