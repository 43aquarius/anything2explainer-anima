import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC16} from './SC16';
import {SC17} from './SC17';
import {SC18} from './SC18';
import {SC19} from './SC19';
import {SC20} from './SC20';
import {SC21} from './SC21';
// 组 G4（第 2 章下半：SC16–SC21，S27–S35）：重排与缺口 → 窗口 → 拥塞 → 契约与代价 → 照片完美 vs 语音不能拨号。
// 本组零 glitch、零扫光；字幕由共用层渲染。
// 帧区间按 分镜表.md 镜头衔接规则（内容镜头 = [首句 from−8, 下镜首句 from−9]，首尾相接；与 G1 同款约定）：
//   段中 ¶ 镜头（SC16/SC17/SC18/SC20，S27/S28/S30/S32 段末）不用「末句 to+2」截短，延到下镜 from−1；
//   只有 SC21 作为章末镜头用 S35.to+2 = 4999（其后 5000–5052 为 C3 章节卡前的呼吸空白，归覆盖层管）。
//   SC16 3425–3663 ｜ SC17 3664–3897 ｜ SC18 3898–4219 ｜ SC19 4220–4407 ｜ SC20 4408–4648 ｜ SC21 4649–4999。
// 组界：G3 在 SC15（3404，章间空白 3405–3424 由幕底接管）；G5 自 SC22（5060）起承接 C3 章节卡。
export const SHOTS_G4: ShotDef[] = [
  {id: 'SC16', from: 3425, to: 3663, Comp: SC16},
  {id: 'SC17', from: 3664, to: 3897, Comp: SC17},
  {id: 'SC18', from: 3898, to: 4219, Comp: SC18},
  {id: 'SC19', from: 4220, to: 4407, Comp: SC19},
  {id: 'SC20', from: 4408, to: 4648, Comp: SC20},
  {id: 'SC21', from: 4649, to: 4999, Comp: SC21},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
