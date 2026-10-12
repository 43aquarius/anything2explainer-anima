import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';

// 组 G1（第 1 章：S01–S08，时钟错了 → 石英漂移 → 三例坏事 → 矛盾）。帧区间见 分镜表.md「G1」表。
// SC04 为章末（¶）镜头：停在 925 = C2−54（章节卡 926–970 由 G0 接管；末 8 帧 = 灭光 3 + 淡出 5）。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 351, Comp: SC01},
  {id: 'SC02', from: 352, to: 554, Comp: SC02},
  {id: 'SC03', from: 555, to: 789, Comp: SC03},
  {id: 'SC04', from: 790, to: 925, Comp: SC04},
];
// 幕底不覆写（点阵波常驻）
export const BG_G1: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G1: FootageSpec[] = [];
