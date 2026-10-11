import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';

// 组 G1（第 1 章上半：S01–S05，咖啡馆 → Firesheep）。帧区间见 分镜表.md「G1」表。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 291, Comp: SC01},
  {id: 'SC02', from: 292, to: 443, Comp: SC02},
  {id: 'SC03', from: 444, to: 601, Comp: SC03},
  {id: 'SC04', from: 602, to: 912, Comp: SC04},
];
// 幕底不覆写（点阵波常驻）
export const BG_G1: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G1: FootageSpec[] = [];
