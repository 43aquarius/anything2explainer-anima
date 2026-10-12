import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';

// 组 G1（第 1 章：S01–S06，周五夜 → 光速数学 → 近处等待）。帧区间见 分镜表.md「G1」表。
// SC03 为章末（¶）镜头：按表头规则「章末镜头停在章节卡前一帧」停在 840（章节卡 841 起）——
// 分镜表 G1 行写作 669–885 与该规则矛盾，按派单 TO=840 实现（详见 BUILD_NOTES.md）。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 356, Comp: SC01},
  {id: 'SC02', from: 357, to: 668, Comp: SC02},
  {id: 'SC03', from: 669, to: 840, Comp: SC03},
];
// 幕底不覆写（点阵波常驻）
export const BG_G1: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G1: FootageSpec[] = [];
