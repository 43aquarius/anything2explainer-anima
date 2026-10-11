import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC06, SC06_RANGE} from './SC06';
import {SC07, SC07_RANGE} from './SC07';
import {SC08, SC08_RANGE} from './SC08';

export const SHOTS_G2: ShotDef[] = [
  {id: 'SC06', from: 925, to: 1201, Comp: SC06},
  {id: 'SC07', from: 1202, to: 1399, Comp: SC07},
  {id: 'SC08', from: 1410, to: 1491, Comp: SC08},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
