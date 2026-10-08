import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';
import {SC05} from './SC05';
// 组 G1：第 1 章上半（S01–S05，下载现场 → 改后缀魔术 → 打开包裹 → 逐个点名）。帧区间 = 分镜表 G1 表；相邻镜头首尾相接。
// SC01/02/03 下载现场三连（SC02 承接包裹+卡，SC03 卡不清场）；SC04/05 包裹解剖 + 聚焦点名（条目列表跨镜共用）。
// 幕底：点阵波常驻，无需覆写（BG_G1 留空）。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 251, Comp: SC01},
  {id: 'SC02', from: 252, to: 331, Comp: SC02},
  {id: 'SC03', from: 332, to: 445, Comp: SC03},
  {id: 'SC04', from: 446, to: 651, Comp: SC04},
  {id: 'SC05', from: 652, to: 870, Comp: SC05},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
