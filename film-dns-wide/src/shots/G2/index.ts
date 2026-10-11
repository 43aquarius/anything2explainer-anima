import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC06, SC06_RANGE} from './SC06';
import {SC07, SC07_RANGE} from './SC07';
import {SC08, SC08_RANGE} from './SC08';
import {SC09, SC09_RANGE} from './SC09';

export const SHOTS_G2: ShotDef[] = [
  {id: 'SC06', from: 1023, to: 1299, Comp: SC06},
  {id: 'SC07', from: 1300, to: 1644, Comp: SC07},
  {id: 'SC08', from: 1645, to: 1942, Comp: SC08},
  {id: 'SC09', from: 1943, to: 2212, Comp: SC09},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
