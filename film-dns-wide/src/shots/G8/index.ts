import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC29, SC29_RANGE} from './SC29';
import {SC30, SC30_RANGE} from './SC30';
import {SC31, SC31_RANGE} from './SC31';
import {SC32, SC32_RANGE} from './SC32';
import {SC33, SC33_RANGE} from './SC33';

export const SHOTS_G8: ShotDef[] = [
  {id: 'SC29', from: 7317, to: 7628, Comp: SC29},
  {id: 'SC30', from: 7629, to: 7971, Comp: SC30},
  {id: 'SC31', from: 7972, to: 8203, Comp: SC31},
  {id: 'SC32', from: 8204, to: 8454, Comp: SC32},
  {id: 'SC33', from: 8455, to: 8546, Comp: SC33},
];
export const BG_G8: BgSpec[] = [];
export const FOOTAGE_G8: FootageSpec[] = [];
