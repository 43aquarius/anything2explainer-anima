import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';
import {SC05} from './SC05';
// 组 G1（第 1 章上半：S01–S08）：镜头表 / 背景覆写 / 实拍层。数组顺序即层序。
// 帧区间按 分镜表.md 镜头衔接规则（内容镜头 = [首句 from−8, 下镜首句 from−9]，首尾相接）：
//   SC01 78–206（S01 86）｜SC02 207–421（S02 215；S03 段末 ¶ 但为章内段末，不用「末句 to+2」，延到 SC03.from−1=421）
//   SC03 422–623（S04 430）｜SC04 624–949（S05 632；S06 ¶ 同上，延到 SC05.from−1=949）
//   SC05 950–1182（S07 958 + S08 1076；SC06.from−1=1182）。G2 自 SC06（1183）起。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 206, Comp: SC01},
  {id: 'SC02', from: 207, to: 421, Comp: SC02},
  {id: 'SC03', from: 422, to: 623, Comp: SC03},
  {id: 'SC04', from: 624, to: 949, Comp: SC04},
  {id: 'SC05', from: 950, to: 1182, Comp: SC05},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
