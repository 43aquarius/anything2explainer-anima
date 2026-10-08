import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC26} from './SC26';
import {SC27} from './SC27';
import {SC28} from './SC28';
import {SC29} from './SC29';
import {SC30} from './SC30';
import {SC31} from './SC31';
import {SC32} from './SC32';
import {SC33} from './SC33';
import {SC34} from './SC34';
// G5（第 3 章上半：SC26–SC34，S26–S34）。帧区间照分镜表；相邻镜头首尾相接（3734–5057，G6/SC35 起 5058）。
export const SHOTS_G5: ShotDef[] = [
  {id: 'SC26', from: 3734, to: 3774, Comp: SC26},
  {id: 'SC27', from: 3775, to: 3921, Comp: SC27},
  {id: 'SC28', from: 3922, to: 4031, Comp: SC28},
  {id: 'SC29', from: 4032, to: 4263, Comp: SC29},
  {id: 'SC30', from: 4264, to: 4430, Comp: SC30},
  {id: 'SC31', from: 4431, to: 4617, Comp: SC31},
  {id: 'SC32', from: 4618, to: 4819, Comp: SC32},
  {id: 'SC33', from: 4820, to: 4911, Comp: SC33},
  {id: 'SC34', from: 4912, to: 5057, Comp: SC34},
];
export const BG_G5: BgSpec[] = [];
export const FOOTAGE_G5: FootageSpec[] = [];
