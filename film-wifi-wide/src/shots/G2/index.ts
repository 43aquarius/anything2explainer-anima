import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC04} from './SC04';
import {SC05} from './SC05';
import {SC06} from './SC06';

// 组 G2（第 2 章上：S07–S10，带宽与光速 → 边缘网络 → 最近的货架）。帧区间严格按 分镜表.md G2 表（相邻镜头首尾相接）。
// SC04 章首承接：SC03 城市圈缩微右上角在场（不清场）；SC05 世界图从缩微城市圈放大（跨镜承接件 CityMini，位置共享）；
// SC05/SC06 零 glitch；SC04 唯一 glitch = `≠`（rgbSplit 4，白名单）。幕底：点阵波常驻，无需覆写。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC04', from: 886, to: 1095, Comp: SC04}, // 光速买不到（价签卡 + 光速线撞 c 牌回弹 + faster ≠ shorter）
  {id: 'SC05', from: 1096, to: 1276, Comp: SC05}, // 边缘网络（世界图 + 9×EdgeNode 错峰亮 + 波纹 + 灯轮闪；推近 1.18/33f）
  {id: 'SC06', from: 1277, to: 1418, Comp: SC06}, // 最近的货架（播放键按下 + 货架 slideUp + HeroGlow；推近 1.12/33f）
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
