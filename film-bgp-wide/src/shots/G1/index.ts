import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';

// 组 G1（第 1 章：S01–S05，消失之夜 → 不是被黑 → 没有地图）。帧区间见 分镜表.md「G1」表。
// SC03 为章末（¶）镜头：按「章末镜头停在章节卡前一帧」停在 686（章节卡 687–731；离场让位章节卡，
// 分镜表 SC03 行注的「章末到 731」按 TO=686 实现，运镜/离场相应前移，见 BUILD_NOTES.md）。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 317, Comp: SC01},
  {id: 'SC02', from: 318, to: 555, Comp: SC02},
  {id: 'SC03', from: 556, to: 686, Comp: SC03},
];
// 幕底不覆写（点阵波常驻）
export const BG_G1: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G1: FootageSpec[] = [];
