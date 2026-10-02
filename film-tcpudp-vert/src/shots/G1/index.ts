import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';
// 组 G1（钩子 → 包与 IP → TCP 信使登场：S01–S05）：镜头表 / 背景覆写 / 实拍层。数组顺序即层序。
// 帧区间按 分镜表.md（S01/S04 为段末 ¶ → 末句 to+2；段内镜头 = [首句 from−8, 下镜首句 from−9]）：
//   SC01 33–189（S01 41 ¶ → 187+2）｜SC02 210–318（S02 218−8 … SC03 首句 327−9）
//   SC03 319–528（S03 327−8 … S04 434 ¶ → 526+2）｜SC04 549–640（S05 557−8 … SC05/G2 首句 649−9）
// 190–209 与 529–548 为段末停顿（幕底常驻，分镜表设计；SC02 自 210 起、SC04 自 549 起入场）。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 33, to: 209, Comp: SC01},
  {id: 'SC02', from: 210, to: 318, Comp: SC02},
  {id: 'SC03', from: 319, to: 548, Comp: SC03},
  {id: 'SC04', from: 549, to: 640, Comp: SC04},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
