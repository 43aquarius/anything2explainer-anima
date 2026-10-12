import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC04} from './SC04';
import {SC05} from './SC05';
import {SC06} from './SC06';

// 组 G2（第 2 章上：S06–S10，十万个网络 → AS=外交官 → BGP 递纸条）。帧区间严格按 分镜表.md G2 表（相邻镜头首尾相接）。
// SC04 章首承接：SC03 地图缩微右上角在场（MapMini，屏幕空间）；SC05/SC06 各自独立舞台（段内句间切换按分镜清场）。
// glitch 白名单：SC04 计数(4) / SC05 `a diplomat`(6) / SC06 `BGP`(6)，各 1 处。幕底：点阵波常驻，无需覆写。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC04', from: 732, to: 874, Comp: SC04}, // 十万个网络（地图缩微承接 + 大芯片 → 6×5 芯片海 + ~120,000 橙计数；推近 1.15/33f）
  {id: 'SC05', from: 875, to: 1198, Comp: SC05}, // AS=外交官（特大芯片 + 三类型卡 + 领地象限 + a diplomat 高光词；慢推 1.05）
  {id: 'SC06', from: 1199, to: 1446, Comp: SC06}, // BGP 递纸条（三芯片三角 + BGP 标题 + 纸条弧线飞行复制传下去；推近 1.12/33f）
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
