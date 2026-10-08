import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC35} from './SC35';
import {SC36} from './SC36';
import {SC37} from './SC37';
import {SC38} from './SC38';
import {SC39} from './SC39';

// G6（第 3 章中段：S35–S39，钥匙即身份 → 同钥匙更新 → 验签过 → 读面单 → 落位 /data/app）。
// 帧区间照分镜表：SC35–SC39 首尾相接 5058–5823（SC39 段末 = 下一组 SC40 前 9 帧，S39.to+gap 由 SC40 入场衔接）。
export const SHOTS_G6: ShotDef[] = [
  {id: 'SC35', from: 5058, to: 5182, Comp: SC35},
  {id: 'SC36', from: 5183, to: 5328, Comp: SC36},
  {id: 'SC37', from: 5329, to: 5436, Comp: SC37},
  {id: 'SC38', from: 5437, to: 5660, Comp: SC38},
  {id: 'SC39', from: 5661, to: 5823, Comp: SC39},
];
export const BG_G6: BgSpec[] = [];
export const FOOTAGE_G6: FootageSpec[] = [];
