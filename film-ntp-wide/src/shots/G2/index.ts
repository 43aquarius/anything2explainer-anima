import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC05} from './SC05';
import {SC06} from './SC06';
import {SC07} from './SC07';

// 组 G2（第 2 章上：S09–S13，谁有准时间 → 原子钟 → GPS 耳语 → 问服务器）。帧区间严格按 分镜表.md G2 表（相邻镜头首尾相接）。
// SC05 章首承接：SC04 大字对比缩微左下角（本组自绘，nuisance 划除 vs contradiction）；SC06/SC07 各自独立舞台。
// glitch 白名单：SC05/SC06/SC07 全部零 glitch。幕底：点阵波常驻，无需覆写。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC05', from: 971, to: 1172, Comp: SC05}, // 谁有时间（问句 → AtomClock 大立柜 + 轨道描亮 + lab A/B 小钟；慢推 1.06）
  {id: 'SC06', from: 1173, to: 1320, Comp: SC06}, // GPS 耳语（三卫星各带小钟 → 信号弧 draw-on + 信号点循环 → 地面笔记本；推近 1.12 末 key 1270）
  {id: 'SC07', from: 1321, to: 1503, Comp: SC07}, // 问服务器（laptop → time.example ×2 递升链 + 询问信封逐跳 + 末端 ?；慢推 1.05）
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
