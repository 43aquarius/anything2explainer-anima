import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC26} from './SC26';
import {SC27} from './SC27';
import {SC28} from './SC28';
import {SC29} from './SC29';
// 组 G6（第 3 章下半：SC26–SC29，S43–S53）：DNS 一问一答 → 晚到即死 → 游戏同款 → 不是疏忽是诚实。
// 字幕由共用层渲染。闪烁白名单：SC27 `LATE`（rgbSplit 6）；SC26/28/29 零 glitch。
// 本组无扫光（LightSweep/LightBar/StageLine/GhostText 均不 import）。
// 帧区间按派单（相邻镜头首尾相接，前镜 to = 后镜 from − 1；段中 ¶ 镜头也一样；分镜表原 to 值
// 6419/6936/7149 为各段 ¶ 末句 to+2，已延到下镜 from−1 以覆盖段末呼吸空白，同 G5/G7 组内约定）：
//   SC26 6048–6454 ｜ SC27 6455–6956 ｜ SC28 6957–7181 ｜ SC29 7182–7414（章末镜头，S53.to+2 = 7412+2；
//   其后 7415–7467 为 Ch4 章前空白，归幕底/覆盖层管）。
export const SHOTS_G6: ShotDef[] = [
  {id: 'SC26', from: 6048, to: 6454, Comp: SC26},
  {id: 'SC27', from: 6455, to: 6956, Comp: SC27},
  {id: 'SC28', from: 6957, to: 7181, Comp: SC28},
  {id: 'SC29', from: 7182, to: 7414, Comp: SC29},
];
export const BG_G6: BgSpec[] = [];
export const FOOTAGE_G6: FootageSpec[] = [];
