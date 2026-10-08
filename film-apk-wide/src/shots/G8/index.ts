import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC49} from './SC49';
import {SC50} from './SC50';
import {SC51} from './SC51';
import {SC52} from './SC52';
import {SC53} from './SC53';
import {SC54} from './SC54';

// 组 G8（第 4 章上半）：SC49–SC54（7327–8265），与 G7b（SC45–SC48，至 7326）/ G8b（SC55–SC59，自 8266）首尾相接。
export const SHOTS_G8: ShotDef[] = [
  {id: 'SC49', from: 7327, to: 7430, Comp: SC49},
  {id: 'SC50', from: 7431, to: 7616, Comp: SC50},
  {id: 'SC51', from: 7617, to: 7813, Comp: SC51},
  {id: 'SC52', from: 7814, to: 7938, Comp: SC52},
  {id: 'SC53', from: 7939, to: 8055, Comp: SC53},
  {id: 'SC54', from: 8056, to: 8265, Comp: SC54},
];
export const BG_G8: BgSpec[] = [];
export const FOOTAGE_G8: FootageSpec[] = [];
