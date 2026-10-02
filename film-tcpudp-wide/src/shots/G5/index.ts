import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC22} from './SC22';
import {SC23} from './SC23';
import {SC24} from './SC24';
import {SC25} from './SC25';
// 组 G5（第 3 章上半：SC22–SC25，S36–S42）：明信片登场 → 整个仪式 → 8 字节 4 字段 → 诚实的规范。
// 字幕由共用层渲染。闪烁白名单：SC22 `POSTCARD`（rgbSplit 4）｜SC24 `8 bytes`（rgbSplit 6）；SC23/SC25 零 glitch。
// 本组无扫光（LightSweep/LightBar/StageLine/GhostText 均不 import）。
// 帧区间按分镜表镜头衔接规则（相邻镜头首尾相接，前镜 to = 后镜 from − 1；段中 ¶ 镜头也一样）：
//   SC22 5060–5390 ｜ SC23 5391–5531 ｜ SC24 5532–5730 ｜ SC25 5731–6027（章内末镜，S42.to+2 = 6025+2，
//   其后 6028–6047 为 C3 段末呼吸空白，归幕底/覆盖层管；G6 自 SC26 = 6048 起）。
export const SHOTS_G5: ShotDef[] = [
  {id: 'SC22', from: 5060, to: 5390, Comp: SC22},
  {id: 'SC23', from: 5391, to: 5531, Comp: SC23},
  {id: 'SC24', from: 5532, to: 5730, Comp: SC24},
  {id: 'SC25', from: 5731, to: 6047, Comp: SC25},
];
export const BG_G5: BgSpec[] = [];
export const FOOTAGE_G5: FootageSpec[] = [];
