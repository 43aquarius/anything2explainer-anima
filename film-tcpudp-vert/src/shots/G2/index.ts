import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC05} from './SC05';
import {SC06} from './SC06';
import {SC07} from './SC07';
import {SC08} from './SC08';

// 组 G2（握手 → 编号回执 → 翻倍高潮 → UDP 登场：S06–S09）：镜头表 / 背景覆写 / 实拍层。
// 帧区间按 分镜表.md G2 表（SC07 为段末 ¶ 镜头 = S08 末句 to+2）：
//   SC05 641–774（S06 649−8 … SC06 首句 783−9）｜SC06 775–868（S07 783−8 … 末句 866+2）
//   SC07 869–983（S08 877−8 … 末句 981+2 ¶）｜SC08 1016–1101（S09 1024−8 … SC09/G3 首句 1110−9）
// 984–1015 为段末停顿（幕底常驻，分镜表设计；同 G1 的 190–209 / 529–548）。
// SC05→SC06→SC07 首尾相接（to = from−1 ✓）；SC07→SC08 之间的空档为分镜表设计的段末停顿。
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC05', from: 641, to: 774, Comp: SC05},
  {id: 'SC06', from: 775, to: 868, Comp: SC06},
  {id: 'SC07', from: 869, to: 1015, Comp: SC07},
  {id: 'SC08', from: 1016, to: 1101, Comp: SC08},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
