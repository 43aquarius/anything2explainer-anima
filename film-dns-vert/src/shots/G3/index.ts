import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC09, SC09_RANGE} from './SC09';
import {SC10, SC10_RANGE} from './SC10';
import {SC11, SC11_RANGE} from './SC11';

export const SHOTS_G3: ShotDef[] = [
  {id: 'SC09', from: 1490, to: 1736, Comp: SC09},
  {id: 'SC10', from: 1737, to: 1863, Comp: SC10},
  {id: 'SC11', from: 1864, to: 1956, Comp: SC11},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
