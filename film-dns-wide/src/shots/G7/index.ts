import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC25, SC25_RANGE} from './SC25';
import {SC26, SC26_RANGE} from './SC26';
import {SC27, SC27_RANGE} from './SC27';
import {SC28, SC28_RANGE} from './SC28';

export const SHOTS_G7: ShotDef[] = [
  {id: 'SC25', from: 6196, to: 6239, Comp: SC25},
  {id: 'SC26', from: 6240, to: 6813, Comp: SC26},
  {id: 'SC27', from: 6814, to: 7085, Comp: SC27},
  {id: 'SC28', from: 7086, to: 7316, Comp: SC28},
];
export const BG_G7: BgSpec[] = [];
export const FOOTAGE_G7: FootageSpec[] = [];
