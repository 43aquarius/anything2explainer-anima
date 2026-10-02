import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC30} from './SC30';
import {SC31} from './SC31';
import {SC32} from './SC32';
import {SC33} from './SC33';
// 组 G7（第 4 章上半：SC30–SC33，S54–S63）：经验法则 → 端口 → QUIC 翻转 → 线上重建一切。
// 字幕由共用层渲染。闪烁白名单：SC32 `HTTP/3`（rgbSplit 6）；SC30/31/33 零 glitch。
// 本组无扫光（LightSweep/LightBar/StageLine/GhostText 均不 import；全片扫光只给 SC10/SC37）。
// 帧区间按分镜表镜头衔接规则（相邻镜头首尾相接，前镜 to = 后镜 from − 1；段中 ¶ 镜头也一样；
// 分镜表原 to 值 7819/8350/8890 为 ¶ 末句 to+2，已延到下镜 from−1 以覆盖段末呼吸空白）：
//   SC30 7487–7839 ｜ SC31 7840–8370 ｜ SC32 8371–8910 ｜ SC33 8911–9180（G8 自 SC34 = 9181 起）。
export const SHOTS_G7: ShotDef[] = [
  {id: 'SC30', from: 7487, to: 7839, Comp: SC30},
  {id: 'SC31', from: 7840, to: 8370, Comp: SC31},
  {id: 'SC32', from: 8371, to: 8910, Comp: SC32},
  {id: 'SC33', from: 8911, to: 9180, Comp: SC33},
];
export const BG_G7: BgSpec[] = [];
export const FOOTAGE_G7: FootageSpec[] = [];
